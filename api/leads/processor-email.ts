// Vercel serverless: look up a processor's email in HubSpot for the lead-router cockpit.
//
// The public directory has no processor emails, but HubSpot does for engaged /
// AAMP-imported processors. This matches the directory listing to a HubSpot company
// (by name, then website domain, then phone), then returns the email of its first
// associated contact. Returns {email:null} whenever there's no confident match —
// the cockpit grays out its "Email processor" button in that case.
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
  // Phone fallback — match last 7 digits against company phone.
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

async function firstContactEmail(token: string, companyId: string): Promise<string | null> {
  const assoc = await hs<{ results?: { toObjectId?: number; id?: string }[] }>(
    token, 'GET', `/crm/v4/objects/companies/${companyId}/associations/contacts?limit=10`,
  );
  const ids = (assoc.results || []).map((a) => String(a.toObjectId ?? a.id ?? '')).filter(Boolean);
  for (const id of ids) {
    const c = await hs<{ properties?: { email?: string } }>(token, 'GET', `/crm/v3/objects/contacts/${id}?properties=email`);
    if (c.properties?.email) return c.properties.email;
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    res.status(200).json({ email: null });
    return;
  }
  try {
    const name = one(req.query?.name);
    const website = one(req.query?.website);
    const phone = one(req.query?.phone);
    if (!name && !website && !phone) {
      res.status(200).json({ email: null });
      return;
    }
    const companyId = await findCompanyId(token, name, website, phone);
    if (!companyId) {
      res.status(200).json({ email: null });
      return;
    }
    const email = await firstContactEmail(token, companyId);
    res.status(200).json({ email });
  } catch (e) {
    // Fail soft — the cockpit just grays out the button.
    res.status(200).json({ email: null, error: e instanceof Error ? e.message : String(e) });
  }
}
