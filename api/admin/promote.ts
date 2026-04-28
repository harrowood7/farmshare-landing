// Vercel serverless function: admin write actions for the processor directory.
//
// Supports two modes:
//   - mode: 'promote'  → flip an existing prospect to customer, edit fields
//   - mode: 'create'   → add a brand-new customer record
//
// Optional logo file upload is committed alongside the JSON change in a single
// commit via the GitHub Git Data API (refs/commits/trees/blobs).
//
// Required env vars (server-side):
//   ADMIN_PASSWORD              shared with editors
//   GITHUB_TOKEN                fine-grained PAT, Contents R+W on this repo
//   GITHUB_OWNER                e.g. "harrowood7"
//   GITHUB_REPO                 e.g. "farmshare-landing"
//   GITHUB_BRANCH               defaults to "main"
//   GOOGLE_GEOCODING_API_KEY    Google Geocoding API key (only needed for 'create' mode)

interface PartnerFacility {
  slug: string;
  label: string;
}

type Species = 'Beef' | 'Bison' | 'Goat' | 'Hog' | 'Lamb' | 'Veal';

interface PromoteBody {
  mode: 'promote';
  password: string;
  slug: string;                          // existing prospect slug
  partnerSlug?: string;
  partnerFacilities?: PartnerFacility[];
  species?: Species[];
  website?: string | null;
  name?: string;
  phone?: string | null;
  address?: string | null;
  description?: string | null;
  logo?: { dataUrl: string; filename: string } | null; // null clears, undefined keeps
}

interface CreateBody {
  mode: 'create';
  password: string;
  name: string;
  street: string;
  city: string;
  state: string;     // 2-letter abbreviation
  zip: string;
  phone?: string;
  website?: string;
  species: Species[];
  partnerSlug: string;
  partnerFacilities?: PartnerFacility[];
  description?: string;
  logo?: { dataUrl: string; filename: string } | null;
}

type Body = PromoteBody | CreateBody;

interface VercelRequest {
  method?: string;
  body?: unknown;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

function slugify(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extFromFilename(filename: string): string {
  const m = filename.toLowerCase().match(/\.(png|jpg|jpeg|svg|webp|gif)$/);
  return m ? m[1] : 'png';
}

function decodeDataUrl(dataUrl: string): { buffer: Buffer; mime: string } {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error('Invalid data URL');
  return { mime: m[1], buffer: Buffer.from(m[2], 'base64') };
}

interface GhFileChange {
  path: string;
  contentBase64: string; // raw base64 of file contents (not a data URL)
  encoding: 'base64';
}

async function ghFetch(token: string, path: string, init?: RequestInit) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function commitMultiFile(opts: {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  message: string;
  files: GhFileChange[];
}): Promise<{ commitUrl: string; commitSha: string }> {
  const { token, owner, repo, branch, message, files } = opts;
  const base = `/repos/${owner}/${repo}`;

  // 1. Get current ref (head SHA)
  const ref = (await ghFetch(token, `${base}/git/refs/heads/${branch}`)) as { object: { sha: string } };
  const headSha = ref.object.sha;

  // 2. Get base tree SHA from that commit
  const headCommit = (await ghFetch(token, `${base}/git/commits/${headSha}`)) as { tree: { sha: string } };
  const baseTreeSha = headCommit.tree.sha;

  // 3. Create a blob for each file
  const blobs = await Promise.all(
    files.map(async (f) => {
      const blob = (await ghFetch(token, `${base}/git/blobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: f.contentBase64, encoding: 'base64' }),
      })) as { sha: string };
      return { path: f.path, sha: blob.sha };
    })
  );

  // 4. Create a tree referencing those blobs on top of the base tree
  const tree = (await ghFetch(token, `${base}/git/trees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: blobs.map((b) => ({ path: b.path, mode: '100644', type: 'blob', sha: b.sha })),
    }),
  })) as { sha: string };

  // 5. Create a commit pointing at the new tree
  const commit = (await ghFetch(token, `${base}/git/commits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, tree: tree.sha, parents: [headSha] }),
  })) as { sha: string; html_url: string };

  // 6. Update the ref to the new commit
  await ghFetch(token, `${base}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });

  return { commitUrl: commit.html_url, commitSha: commit.sha };
}

async function readProcessorsJson(opts: {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}): Promise<Record<string, unknown>[]> {
  const file = (await ghFetch(
    opts.token,
    `/repos/${opts.owner}/${opts.repo}/contents/src/data/processors.json?ref=${opts.branch}`
  )) as { content: string };
  return JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8'));
}

async function geocode(address: string, apiKey: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as { results: { geometry: { location: { lat: number; lng: number } } }[]; status: string };
  if (json.status !== 'OK' || !json.results.length) return null;
  return json.results[0].geometry.location;
}

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const githubToken = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!adminPassword || !githubToken || !owner || !repo) {
    res.status(500).json({ error: 'Server is missing required env vars (ADMIN_PASSWORD, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO).' });
    return;
  }

  let body: Body;
  try {
    body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Body;
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  if (!body || body.password !== adminPassword) {
    res.status(401).json({ error: 'Wrong password' });
    return;
  }

  try {
    if (body.mode === 'promote') {
      const result = await handlePromote(body, { token: githubToken, owner, repo, branch });
      res.status(200).json({ success: true, ...result });
    } else if (body.mode === 'create') {
      const result = await handleCreate(body, { token: githubToken, owner, repo, branch });
      res.status(200).json({ success: true, ...result });
    } else {
      res.status(400).json({ error: 'Invalid mode (must be "promote" or "create")' });
    }
  } catch (e) {
    res.status(502).json({ error: (e as Error).message });
  }
}

async function handlePromote(
  body: PromoteBody,
  gh: { token: string; owner: string; repo: string; branch: string }
) {
  if (!body.slug) throw new Error('slug is required');

  const records = await readProcessorsJson(gh);
  const target = records.find((r) => r.slug === body.slug) as Record<string, unknown> | undefined;
  if (!target) throw new Error(`Slug not found: ${body.slug}`);

  target.status = 'customer';

  if (body.partnerFacilities && body.partnerFacilities.length > 0) {
    target.partnerFacilities = body.partnerFacilities.filter((f) => f.slug.trim());
    delete target.partnerSlug;
  } else if (body.partnerSlug) {
    target.partnerSlug = body.partnerSlug.trim();
    delete target.partnerFacilities;
  }

  if (body.species && body.species.length) target.species = body.species;
  if (body.name) target.name = body.name.trim();
  if (body.website !== undefined) {
    target.website = body.website ? body.website.trim() : undefined;
    if (!target.website) delete target.website;
  }
  if (body.phone !== undefined) {
    target.phone = body.phone ? body.phone.trim() : undefined;
    if (!target.phone) delete target.phone;
  }
  if (body.address !== undefined) {
    target.address = body.address ? body.address.trim() : undefined;
    if (!target.address) delete target.address;
  }
  if (body.description !== undefined) {
    target.description = body.description ? body.description.trim() : undefined;
    if (!target.description) delete target.description;
  }

  const files: GhFileChange[] = [];
  let logoSummary = '';
  if (body.logo === null) {
    target.logo = null;
    logoSummary = ' (logo cleared)';
  } else if (body.logo) {
    const { buffer } = decodeDataUrl(body.logo.dataUrl);
    const ext = extFromFilename(body.logo.filename);
    const logoPath = `public/logos/${body.slug}.${ext}`;
    target.logo = `/logos/${body.slug}.${ext}`;
    files.push({ path: logoPath, encoding: 'base64', contentBase64: buffer.toString('base64') });
    logoSummary = ` (+ logo)`;
  }

  files.push({
    path: 'src/data/processors.json',
    encoding: 'base64',
    contentBase64: Buffer.from(JSON.stringify(records, null, 2) + '\n', 'utf-8').toString('base64'),
  });

  return commitMultiFile({
    ...gh,
    message: `Promote ${body.slug} to customer (admin)${logoSummary}`,
    files,
  });
}

async function handleCreate(
  body: CreateBody,
  gh: { token: string; owner: string; repo: string; branch: string }
) {
  if (!body.name || !body.street || !body.city || !body.state || !body.zip) {
    throw new Error('name, street, city, state, zip are all required');
  }
  if (!body.species || body.species.length === 0) throw new Error('At least one species is required');
  if (!body.partnerSlug) throw new Error('partnerSlug is required');

  const stateAbbr = body.state.toUpperCase().trim();
  if (!STATE_NAMES[stateAbbr]) throw new Error(`Unknown state abbreviation: ${stateAbbr}`);

  const records = await readProcessorsJson(gh);
  const slug = slugify(body.name, body.city, stateAbbr);
  if (records.some((r) => r.slug === slug)) {
    throw new Error(`A record with slug "${slug}" already exists. Use Promote mode instead.`);
  }

  // Geocode the address
  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
  let lat: number | undefined;
  let lng: number | undefined;
  let geocodeWarning: string | undefined;
  if (apiKey) {
    const fullAddress = `${body.street}, ${body.city}, ${stateAbbr} ${body.zip}`;
    const geo = await geocode(fullAddress, apiKey);
    if (geo) {
      lat = geo.lat;
      lng = geo.lng;
    } else {
      geocodeWarning = 'Geocoding failed; record saved without lat/lng (will not appear on the map).';
    }
  } else {
    geocodeWarning = 'GOOGLE_GEOCODING_API_KEY not set; record saved without lat/lng.';
  }

  const newRecord: Record<string, unknown> = {
    name: body.name.trim(),
    location: `${body.city.trim()}, ${stateAbbr}`,
    state: stateAbbr,
    species: body.species,
    logo: null,
    slug,
    status: 'customer',
    address: body.street.trim(),
    zip: body.zip.trim(),
  };
  if (body.phone) newRecord.phone = body.phone.trim();
  if (body.website) newRecord.website = body.website.trim();
  if (body.description) newRecord.description = body.description.trim();
  if (lat != null) newRecord.lat = lat;
  if (lng != null) newRecord.lng = lng;
  if (body.partnerFacilities && body.partnerFacilities.length > 0) {
    newRecord.partnerFacilities = body.partnerFacilities.filter((f) => f.slug.trim());
  } else {
    newRecord.partnerSlug = body.partnerSlug.trim();
  }

  const files: GhFileChange[] = [];
  if (body.logo) {
    const { buffer } = decodeDataUrl(body.logo.dataUrl);
    const ext = extFromFilename(body.logo.filename);
    newRecord.logo = `/logos/${slug}.${ext}`;
    files.push({
      path: `public/logos/${slug}.${ext}`,
      encoding: 'base64',
      contentBase64: buffer.toString('base64'),
    });
  }

  records.push(newRecord);
  files.push({
    path: 'src/data/processors.json',
    encoding: 'base64',
    contentBase64: Buffer.from(JSON.stringify(records, null, 2) + '\n', 'utf-8').toString('base64'),
  });

  const commit = await commitMultiFile({
    ...gh,
    message: `Add new customer ${slug} (admin)${body.logo ? ' (+ logo)' : ''}`,
    files,
  });

  return { ...commit, slug, geocodeWarning };
}
