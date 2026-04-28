// Vercel serverless function: promote a prospect → customer in src/data/processors.json
// via the GitHub Contents API. Requires server-side env vars:
//   ADMIN_PASSWORD   — shared with editors (Wyatt, Henry)
//   GITHUB_TOKEN     — fine-grained PAT with repo:contents:write on this repo
//   GITHUB_OWNER     — e.g. "harrowood7"
//   GITHUB_REPO      — e.g. "farmshare-landing"
//   GITHUB_BRANCH    — defaults to "main"

interface PartnerFacility {
  slug: string;
  label: string;
}

interface PromoteRequest {
  password: string;
  slug: string;
  partnerSlug?: string;
  partnerFacilities?: PartnerFacility[];
  logo?: string | null;
  description?: string | null;
}

interface VercelRequest {
  method?: string;
  body?: unknown;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

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
    res.status(500).json({ error: 'Server is missing one or more required env vars (ADMIN_PASSWORD, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO).' });
    return;
  }

  let body: PromoteRequest;
  try {
    body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as PromoteRequest;
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  if (!body || body.password !== adminPassword) {
    res.status(401).json({ error: 'Wrong password' });
    return;
  }

  if (!body.slug) {
    res.status(400).json({ error: 'slug is required' });
    return;
  }

  const path = 'src/data/processors.json';
  const ghBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const ghHeaders = {
    Authorization: `token ${githubToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // 1. Fetch current file
  const getRes = await fetch(`${ghBase}?ref=${branch}`, { headers: ghHeaders });
  if (!getRes.ok) {
    const text = await getRes.text();
    res.status(502).json({ error: `GitHub GET failed: ${getRes.status} ${text}` });
    return;
  }
  const file = (await getRes.json()) as { content: string; sha: string; encoding: string };
  const decoded = Buffer.from(file.content, 'base64').toString('utf-8');
  let records: Record<string, unknown>[];
  try {
    records = JSON.parse(decoded);
  } catch (e) {
    res.status(500).json({ error: `processors.json parse failed: ${(e as Error).message}` });
    return;
  }

  // 2. Apply mutation
  const target = records.find((r) => r.slug === body.slug);
  if (!target) {
    res.status(404).json({ error: `Slug not found: ${body.slug}` });
    return;
  }

  target.status = 'customer';

  if (body.partnerFacilities && body.partnerFacilities.length > 0) {
    target.partnerFacilities = body.partnerFacilities.filter((f) => f.slug);
    delete target.partnerSlug;
  } else if (body.partnerSlug) {
    target.partnerSlug = body.partnerSlug;
    delete target.partnerFacilities;
  }

  if (body.logo !== undefined) {
    target.logo = body.logo || null;
  }
  if (body.description !== undefined) {
    target.description = body.description || undefined;
    if (!target.description) delete target.description;
  }

  // 3. Commit
  const newContent = Buffer.from(JSON.stringify(records, null, 2) + '\n', 'utf-8').toString('base64');
  const commitMessage = `Promote ${body.slug} to customer (admin)`;
  const putRes = await fetch(ghBase, {
    method: 'PUT',
    headers: { ...ghHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: commitMessage,
      content: newContent,
      sha: file.sha,
      branch,
    }),
  });
  if (!putRes.ok) {
    const text = await putRes.text();
    res.status(502).json({ error: `GitHub PUT failed: ${putRes.status} ${text}` });
    return;
  }

  const putBody = (await putRes.json()) as { commit: { html_url: string; sha: string } };
  res.status(200).json({
    success: true,
    commitUrl: putBody.commit.html_url,
    commitSha: putBody.commit.sha,
    message: 'Promotion committed. Vercel rebuild typically completes in 1–2 minutes.',
  });
}
