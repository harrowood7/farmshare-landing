// Vercel serverless function: route a buyer/producer lead into HubSpot.
//
// On POST, finds-or-creates the matched processor (company) and the buyer
// (contact), then creates a round-robin follow-up TASK for Henry or Wyatt,
// associated to both. Called by the /admin/leads cockpit "Route" button.
//
// Required env var (server-side):
//   HUBSPOT_PRIVATE_APP_TOKEN   private app token with crm.objects
//                               companies/contacts/tasks read+write

interface VercelRequest {
  method?: string;
  body?: unknown;
}
interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (key: string, value: string) => void;
}

// HubSpot owner IDs (from search_owners). Round-robin handled by the caller.
const OWNERS: Record<string, string> = {
  Henry: '206382699',
  Wyatt: '89744104',
};

const HS = 'https://api.hubapi.com';

// task -> company / contact association type IDs (HUBSPOT_DEFINED)
const TASK_TO_COMPANY = 192;
const TASK_TO_CONTACT = 204;

interface LeadPayload {
  name?: string;
  email?: string;
  phone?: string;
  zip?: string;
  species?: string;
  cut_type?: string;
  timing?: string;
  notes?: string;
  lead_type?: string;
}
interface ProcessorPayload {
  slug: string;
  name: string;
  location?: string;
  phone?: string;
  website?: string;
  status?: string;
}

async function hs<T = any>(token: string, method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${HS}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HubSpot ${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return (text ? JSON.parse(text) : {}) as T;
}

async function findOrCreateCompany(token: string, p: ProcessorPayload): Promise<string> {
  const found = await hs<{ results?: { id: string }[] }>(token, 'POST', '/crm/v3/objects/companies/search', {
    filterGroups: [{ filters: [{ propertyName: 'name', operator: 'EQ', value: p.name }] }],
    properties: ['name'],
    limit: 1,
  });
  if (found.results && found.results.length) return found.results[0].id;

  const props: Record<string, string> = { name: p.name, lifecyclestage: 'lead' };
  if (p.website) props.domain = p.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (p.phone) props.phone = p.phone;
  if (p.location) {
    const [city, state] = String(p.location).split(',').map((s) => s.trim());
    if (city) props.city = city;
    if (state) props.state = state;
  }
  const created = await hs<{ id: string }>(token, 'POST', '/crm/v3/objects/companies', { properties: props });
  return created.id;
}

async function findOrCreateContact(token: string, lead: LeadPayload): Promise<string> {
  if (lead.email) {
    const found = await hs<{ results?: { id: string }[] }>(token, 'POST', '/crm/v3/objects/contacts/search', {
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: lead.email }] }],
      properties: ['email'],
      limit: 1,
    });
    if (found.results && found.results.length) return found.results[0].id;
  }
  const parts = String(lead.name || '').trim().split(/\s+/);
  const props: Record<string, string> = {};
  if (parts[0]) props.firstname = parts[0];
  if (parts.length > 1) props.lastname = parts.slice(1).join(' ');
  if (lead.email) props.email = lead.email;
  if (lead.phone) props.phone = lead.phone;
  const created = await hs<{ id: string }>(token, 'POST', '/crm/v3/objects/contacts', { properties: props });
  return created.id;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    res.status(500).json({ error: 'HUBSPOT_PRIVATE_APP_TOKEN not set' });
    return;
  }
  try {
    const { lead, processor, assignee } = (req.body || {}) as {
      lead?: LeadPayload;
      processor?: ProcessorPayload;
      assignee?: string;
    };
    if (!lead || !processor) {
      res.status(400).json({ error: 'lead and processor are required' });
      return;
    }
    const ownerId = OWNERS[assignee || ''] || OWNERS.Henry;
    const type = lead.lead_type === 'producer' ? 'producer' : 'buyer';

    const companyId = await findOrCreateCompany(token, processor);
    const contactId = await findOrCreateContact(token, lead);

    const subject = `Route ${type} lead: ${lead.name || '(lead)'} → ${processor.name}`;
    const body = [
      `${type === 'producer' ? 'Producer' : 'Buyer'}: ${lead.name || ''} (${lead.email || ''} ${lead.phone || ''})`,
      `Looking for: ${(lead.cut_type || '').trim()} ${(lead.species || '').trim()}`.trim(),
      `Zip: ${lead.zip || ''}   Timing: ${lead.timing || ''}`,
      lead.notes ? `Notes: ${lead.notes}` : '',
      `Matched: ${processor.name}${processor.location ? ` (${processor.location})` : ''} — ${processor.status || ''}`,
      processor.phone ? `Processor phone: ${processor.phone}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const due = Date.now() + 24 * 60 * 60 * 1000;
    const task = await hs<{ id: string }>(token, 'POST', '/crm/v3/objects/tasks', {
      properties: {
        hs_task_subject: subject,
        hs_task_body: body,
        hs_task_status: 'NOT_STARTED',
        hs_task_priority: 'HIGH',
        hs_timestamp: String(due),
        hubspot_owner_id: ownerId,
      },
      associations: [
        { to: { id: companyId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: TASK_TO_COMPANY }] },
        { to: { id: contactId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: TASK_TO_CONTACT }] },
      ],
    });

    res.status(200).json({ ok: true, companyId, contactId, taskId: task.id, ownerId, assignee: assignee || 'Henry' });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
}
