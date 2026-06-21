/**
 * Client-side ZIP -> { lat, lng, country } via Google Geocoding, using the same
 * VITE_GOOGLE_MAPS_API_KEY the directory map already uses. In-memory cached per
 * session so the cockpit doesn't re-bill the same zip on every render.
 */
const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export interface GeoResult {
  lat: number;
  lng: number;
  country: string | null;
}

const cache = new Map<string, GeoResult | null>();

export async function geocodeZip(zip?: string | null): Promise<GeoResult | null> {
  if (!zip) return null;
  const key = String(zip).trim();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key)!;
  if (!KEY) {
    console.warn('VITE_GOOGLE_MAPS_API_KEY missing — cannot geocode.');
    return null;
  }
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      key,
    )}&key=${KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const r = data.results?.[0];
    if (!r) {
      cache.set(key, null);
      return null;
    }
    const country =
      (r.address_components || []).find((c: { types: string[]; short_name: string }) =>
        c.types.includes('country'),
      )?.short_name ?? null;
    const out: GeoResult = { lat: r.geometry.location.lat, lng: r.geometry.location.lng, country };
    cache.set(key, out);
    return out;
  } catch (e) {
    console.error('geocodeZip failed:', e);
    return null;
  }
}
