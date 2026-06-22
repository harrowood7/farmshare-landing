// Vercel serverless: resolve a directory processor to its HubSpot company record
// and return the URL to open it. Find-or-creates the company so cold directory
// processors you call become tracked prospects in HubSpot automatically.
//
// The lead router is the system of record for lead status; HubSpot is just where
// you make/log the call. This endpoint is the jump-off.
//
// Env: HUBSPOT_PRIVATE_APP_TOKEN

interface VercelRequest {
  method?: string;
  query?: Record<string, string | string[]>;
}
interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (key: string, value: string) => void;
}

const HS = 'https://api.hubapi.com';
const PORTAL_ID = '22360577';
const recordUrl = (companyId: string) => `https://app.hubspot.com/contacts/${PORTAL_ID}/record/0-2/${companyId}`;

async function hs<T = any>(token: string, method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${HS}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HubSpot ${method} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  return (text ? JSON.parse(text) : {}) as T;
}

function one(v?: string | string[]): string {
  return (Array.isArray(v) ? v[0] : v || '').trim();
}
function domainOf(website: string): string {
  return website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').trim().toLowerCase();
}

async function findCompanyId(token: string, name: string, website: string, phone: string): Promise<string | null> {
  const filters: { propertyName: string; operator: string; value: string }[] = [];
  if (name) filters.push({ propertyName: 'name', operator: 'EQ', value: name });
  const dom = website ? domainOf(website) : '';
  if (dom) filters.push({ propertyName: 'domain', operator: 'EQ', value: dom });
  for (const f of filters) {
    const r = await hs<{ results?: { id: string }[] }>(token, 'POST', '/crm/v3/objects/companies/search', {
      filterGroups: [{ filters: [f] }],
      properties: ['name'],
      limit: 1,
    });
    if (r.results && r.results.length) return r.results[0].id;
  }
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length >= 7) {
    const r = await hs<{ results?: { id: string; properties?: { phone?: string } }[] }>(
      token, 'POST', '/crm/v3/objects/companies/search',
      { query: phone, properties: ['name', 'phone'], limit: 5 },
    );
    const hit = (r.results || []).find((c) => (c.properties?.phone || '').replace(/\D/g, '').includes(digits.slice(-7)));
    if (hit) return hit.id;
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    res.status(500).json({ error: 'HUBSPOT_PRIVATE_APP_TOKEN not set' });
    return;
  }
  try {
    const name = one(req.query?.name);
    const website = one(req.query?.website);
    const phone = one(req.query?.phone);
    if (!name) {
      res.status(400).json({ error: 'name required' });
      return;
    }

    let companyId = await findCompanyId(token, name, website, phone);
    if (!companyId) {
      const props: Record<string, string> = { name, lifecyclestage: 'lead' };
      if (website) props.domain = domainOf(website);
      if (phone) props.phone = phone;
      const created = await hs<{ id: string }>(token, 'POST', '/crm/v3/objects/companies', { properties: props });
      companyId = created.id;
    }

    res.status(200).json({ url: recordUrl(companyId), companyId });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
}
