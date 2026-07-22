// Vercel serverless function: public read-only Google reviews for a directory
// listing. The processor detail page calls
//   GET /api/reviews?name=<name>&location=<location>[&placeId=<id>]
//
// Reviews are fetched live from Google (not stored) to stay within the Places
// API terms, and the response is edge-cached briefly to control cost.
//
// Abuse guard: requests must come from a farmshare.co page (Referer check). The
// endpoint is read-only and returns only public Google review text.
//
// Required env: GOOGLE_GEOCODING_API_KEY (Places API enabled on the same key).

interface VercelRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  headers?: Record<string, string | string[] | undefined>;
}
interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

interface RawReview {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string };
  relativePublishTimeDescription?: string;
}
interface RawPlace {
  id?: string;
  rating?: number;
  userRatingCount?: number;
  reviews?: RawReview[];
}

interface OutReview {
  author: string;
  rating: number | null;
  text: string;
  relativeTime: string | null;
}

const REVIEW_FIELD_MASK = 'id,rating,userRatingCount,reviews';

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function allowedReferer(headers: VercelRequest['headers']): boolean {
  const ref = first(headers?.referer) || first(headers?.origin);
  if (!ref) return true; // some privacy settings strip Referer — don't hard-block real users
  try {
    return new URL(ref).hostname.endsWith('farmshare.co');
  } catch {
    return false;
  }
}

async function placeDetails(placeId: string, apiKey: string): Promise<RawPlace | null> {
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': REVIEW_FIELD_MASK },
  });
  if (!res.ok) return null;
  return (await res.json()) as RawPlace;
}

async function placeSearch(query: string, apiKey: string): Promise<RawPlace | null> {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': `places.${REVIEW_FIELD_MASK.split(',').join(',places.')}`,
    },
    body: JSON.stringify({ textQuery: query, regionCode: 'US', maxResultCount: 1 }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { places?: RawPlace[] };
  return data.places?.[0] ?? null;
}

function toOutReviews(place: RawPlace): OutReview[] {
  return (place.reviews ?? [])
    .map((r) => ({
      author: r.authorAttribution?.displayName || 'Google user',
      rating: r.rating ?? null,
      text: (r.text?.text || r.originalText?.text || '').trim(),
      relativeTime: r.relativePublishTimeDescription || null,
    }))
    .filter((r) => r.text);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!allowedReferer(req.headers)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const name = first(req.query?.name)?.trim();
  const location = first(req.query?.location)?.trim();
  const placeId = first(req.query?.placeId)?.trim();
  if (!name && !placeId) {
    res.status(400).json({ error: 'name or placeId is required' });
    return;
  }

  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Reviews are unavailable (server not configured).' });
    return;
  }

  try {
    let place: RawPlace | null = null;
    if (placeId) {
      place = await placeDetails(placeId, apiKey);
    }
    if (!place) {
      const query = [name, location].filter(Boolean).join(' ');
      place = await placeSearch(query, apiKey);
    }

    const reviews = place ? toOutReviews(place) : [];
    // Edge-cache the live result to control API cost.
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
    res.status(200).json({
      rating: place?.rating ?? null,
      userRatingCount: place?.userRatingCount ?? null,
      reviews,
    });
  } catch (e) {
    res.status(502).json({ error: (e as Error).message });
  }
}
