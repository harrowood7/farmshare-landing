// Geocoding script (v3) — smarter query ordering and state validation.
//
// Strategy per processor:
//   1. Build candidate queries in order of preference:
//      a. Full address + ZIP   — if address looks like a real street (has digits)
//      b. "City, ST" + ZIP
//      c. ZIP alone
//      d. "City, ST"
//      e. Address alone (last-resort; catches PO-box-in-different-state cases)
//   2. For each, geocode; accept the first result whose state matches the
//      processor's current state field (if set) — this catches PO-box-in-CA
//      style errors and prefers the in-state match.
//   3. If no query matches the expected state but we have a US result,
//      trust the geocoder and log a state fix.
//
// Usage: node scripts/geocode-processors.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../src/data/processors.json');
const REVIEW_PATH = path.resolve(__dirname, '../geocoding-review.csv');

const envText = await fs.readFile(path.resolve(__dirname, '../.env'), 'utf8');
const envMap = Object.fromEntries(
  envText.split('\n').filter(Boolean).map((l) => l.split('=')).map(([k, ...v]) => [k?.trim(), v.join('=').trim()])
);
const KEY = envMap.VITE_GOOGLE_MAPS_API_KEY;
if (!KEY) {
  console.error('Missing VITE_GOOGLE_MAPS_API_KEY in .env');
  process.exit(1);
}

async function geocode(query) {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', query);
  url.searchParams.set('region', 'us');
  url.searchParams.set('key', KEY);
  const res = await fetch(url);
  const json = await res.json();
  if (json.status === 'OK' && json.results?.[0]) {
    const r = json.results[0];
    const stateComp = r.address_components?.find((c) => c.types.includes('administrative_area_level_1'));
    const countryComp = r.address_components?.find((c) => c.types.includes('country'));
    const typeTag = r.types?.[0] ?? '';
    return {
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
      state: stateComp?.short_name ?? null,
      country: countryComp?.short_name ?? null,
      formatted: r.formatted_address,
      locType: typeTag, // rooftop, street_address, postal_code, locality, etc.
    };
  }
  return null;
}

function normalizeAddress(s) {
  // Some records have "118 Grizzly Ln.Madisonburg, PA 16852" (missing space).
  // Insert a comma where a lowercase letter is directly followed by an uppercase.
  return String(s ?? '').replace(/([a-z])([A-Z])/g, '$1, $2');
}

function hasStreetNumber(address) {
  return /\b\d{2,}\b/.test(address ?? '') && !/^p\.?\s*o\.?\s*box/i.test(address ?? '');
}

function sanitize(s) {
  return String(s ?? '').replace(/"/g, '""');
}

const processors = JSON.parse(await fs.readFile(DATA_PATH, 'utf8'));
console.log(`Loaded ${processors.length} processors`);

const review = [];
review.push(['slug', 'name', 'issue', 'original_state', 'new_state', 'location', 'zip', 'address', 'resolved_formatted'].map((c) => `"${c}"`).join(','));

let hit = 0;
let miss = 0;
let stateFixes = 0;
let fallbackUsed = 0;

for (let i = 0; i < processors.length; i++) {
  const p = processors[i];

  delete p.lat;
  delete p.lng;

  const addrClean = normalizeAddress(p.address);
  const hasUsableStreet = hasStreetNumber(addrClean);
  const cityState = p.location; // e.g. "Morgan, UT"

  const queries = [];
  if (hasUsableStreet && p.zip) queries.push(`${addrClean}, ${p.zip}, USA`);
  if (hasUsableStreet) queries.push(`${addrClean}, USA`);
  if (cityState && p.zip) queries.push(`${cityState}, ${p.zip}, USA`);
  if (p.zip) queries.push(`${p.zip}, USA`);
  if (cityState) queries.push(`${cityState}, USA`);
  if (!hasUsableStreet && p.address) queries.push(`${addrClean}, USA`);

  let chosen = null;
  let chosenQuery = null;
  let firstUsResult = null;
  let firstUsQuery = null;

  for (const q of queries) {
    const result = await geocode(q);
    await new Promise((r) => setTimeout(r, 15));
    if (!result || result.country !== 'US') continue;
    if (!firstUsResult) {
      firstUsResult = result;
      firstUsQuery = q;
    }
    // Prefer a result whose state matches the processor's current state,
    // which avoids PO-box-in-different-state artifacts.
    if (p.state && result.state === p.state) {
      chosen = result;
      chosenQuery = q;
      break;
    }
  }

  if (!chosen && firstUsResult) {
    chosen = firstUsResult;
    chosenQuery = firstUsQuery;
    fallbackUsed++;
  }

  if (!chosen) {
    miss++;
    review.push([p.slug, sanitize(p.name), 'NO_GEOCODE', p.state, '', sanitize(p.location), p.zip ?? '', sanitize(p.address ?? ''), ''].map((v) => `"${v}"`).join(','));
    continue;
  }

  p.lat = chosen.lat;
  p.lng = chosen.lng;

  if (chosen.state && chosen.state !== p.state) {
    stateFixes++;
    review.push([
      p.slug,
      sanitize(p.name),
      'STATE_FIXED',
      p.state,
      chosen.state,
      sanitize(p.location),
      p.zip ?? '',
      sanitize(p.address ?? ''),
      sanitize(chosen.formatted),
    ].map((v) => `"${v}"`).join(','));
    p.state = chosen.state;
    if (typeof p.location === 'string') {
      p.location = p.location.replace(/,\s*[A-Z]{2}\s*$/, `, ${chosen.state}`);
    }
  }

  hit++;

  if ((i + 1) % 25 === 0) {
    console.log(`  ${i + 1}/${processors.length} — ${hit} hits, ${miss} misses, ${stateFixes} state fixes, ${fallbackUsed} fallbacks`);
    await fs.writeFile(DATA_PATH, JSON.stringify(processors, null, 2));
    await fs.writeFile(REVIEW_PATH, review.join('\n'));
  }
  await new Promise((r) => setTimeout(r, 15));
}

await fs.writeFile(DATA_PATH, JSON.stringify(processors, null, 2));
await fs.writeFile(REVIEW_PATH, review.join('\n'));

console.log(`\nDone.`);
console.log(`  ${hit} geocoded`);
console.log(`  ${miss} failed`);
console.log(`  ${stateFixes} state fields corrected from Google`);
console.log(`  ${fallbackUsed} used a cross-state fallback (likely suspicious — see review CSV)`);
console.log(`\nReview CSV written to ${REVIEW_PATH}`);
