// Validate every geocoded lat/lng by reverse-geocoding it and comparing
// the returned state + locality against what's in the record. Flag any
// mismatches and try to re-geocode them with a tighter query.
//
// Usage: node scripts/validate-geocoding.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../src/data/processors.json');
const REVIEW_PATH = path.resolve(__dirname, '../geocoding-validation.csv');

const envText = await fs.readFile(path.resolve(__dirname, '../.env'), 'utf8');
const envMap = Object.fromEntries(
  envText.split('\n').filter(Boolean).map((l) => l.split('=')).map(([k, ...v]) => [k?.trim(), v.join('=').trim()])
);
const KEY = envMap.VITE_GOOGLE_MAPS_API_KEY;
if (!KEY) { console.error('Missing VITE_GOOGLE_MAPS_API_KEY'); process.exit(1); }

async function reverseGeocode(lat, lng) {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('latlng', `${lat},${lng}`);
  url.searchParams.set('key', KEY);
  const res = await fetch(url);
  const json = await res.json();
  if (json.status !== 'OK' || !json.results?.length) return null;
  const r = json.results[0];
  const comp = (t) => r.address_components?.find((c) => c.types.includes(t));
  return {
    state: comp('administrative_area_level_1')?.short_name ?? null,
    country: comp('country')?.short_name ?? null,
    locality: comp('locality')?.long_name ?? comp('administrative_area_level_3')?.long_name ?? null,
    formatted: r.formatted_address,
  };
}

async function forwardGeocode(query) {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', query);
  url.searchParams.set('region', 'us');
  url.searchParams.set('key', KEY);
  const res = await fetch(url);
  const json = await res.json();
  if (json.status !== 'OK' || !json.results?.length) return null;
  const r = json.results[0];
  const comp = (t) => r.address_components?.find((c) => c.types.includes(t));
  return {
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
    state: comp('administrative_area_level_1')?.short_name ?? null,
    country: comp('country')?.short_name ?? null,
  };
}

function sanitize(s) { return String(s ?? '').replace(/"/g, '""'); }

const processors = JSON.parse(await fs.readFile(DATA_PATH, 'utf8'));
console.log(`Validating ${processors.length} processors…`);

const review = [];
review.push(['slug', 'name', 'issue', 'state', 'reverse_state', 'reverse_locality', 'action', 'new_lat', 'new_lng'].map((c) => `"${c}"`).join(','));

let ok = 0;
let fixed = 0;
let flagged = 0;
let noCoords = 0;

for (let i = 0; i < processors.length; i++) {
  const p = processors[i];
  if (typeof p.lat !== 'number' || typeof p.lng !== 'number') {
    noCoords++;
    continue;
  }

  const rev = await reverseGeocode(p.lat, p.lng);
  await new Promise((r) => setTimeout(r, 15));

  if (!rev || rev.country !== 'US') {
    flagged++;
    review.push([p.slug, sanitize(p.name), 'NOT_IN_US', p.state, rev?.state ?? '', rev?.locality ?? '', 'NONE', p.lat, p.lng].map((v) => `"${v}"`).join(','));
    continue;
  }

  if (rev.state === p.state) {
    ok++;
    continue;
  }

  // Mismatch — try to repair by forward-geocoding with the processor's state.
  // Preference: "<city>, <state> <zip>" → "<zip>" → just "<city>, <state>".
  let newPos = null;
  const attempts = [];
  const city = (p.location || '').split(',')[0].trim();
  if (city && p.state && p.zip) attempts.push(`${city}, ${p.state} ${p.zip}, USA`);
  if (city && p.state) attempts.push(`${city}, ${p.state}, USA`);
  if (p.zip) attempts.push(`${p.zip}, USA`);

  for (const q of attempts) {
    const fresh = await forwardGeocode(q);
    await new Promise((r) => setTimeout(r, 15));
    if (fresh && fresh.country === 'US' && fresh.state === p.state) {
      newPos = fresh;
      break;
    }
  }

  if (newPos) {
    p.lat = newPos.lat;
    p.lng = newPos.lng;
    fixed++;
    review.push([p.slug, sanitize(p.name), 'STATE_MISMATCH', p.state, rev.state ?? '', rev.locality ?? '', 'REPAIRED', p.lat, p.lng].map((v) => `"${v}"`).join(','));
  } else {
    flagged++;
    review.push([p.slug, sanitize(p.name), 'STATE_MISMATCH', p.state, rev.state ?? '', rev.locality ?? '', 'NEEDS_MANUAL', p.lat, p.lng].map((v) => `"${v}"`).join(','));
  }

  if ((i + 1) % 25 === 0) {
    console.log(`  ${i + 1}/${processors.length} — ${ok} ok, ${fixed} repaired, ${flagged} needs-manual`);
    await fs.writeFile(DATA_PATH, JSON.stringify(processors, null, 2));
    await fs.writeFile(REVIEW_PATH, review.join('\n'));
  }
}

await fs.writeFile(DATA_PATH, JSON.stringify(processors, null, 2));
await fs.writeFile(REVIEW_PATH, review.join('\n'));

console.log(`\nDone.`);
console.log(`  ${ok} in the right state`);
console.log(`  ${fixed} mismatched and auto-repaired`);
console.log(`  ${flagged} still flagged — needs manual review`);
console.log(`  ${noCoords} without coords (can't validate)`);
console.log(`\nFull report: ${REVIEW_PATH}`);
