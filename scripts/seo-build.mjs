// Post-build SEO step:
//   1. Generate per-route HTML files in dist/<route>/index.html with route-specific
//      <title>, <meta>, canonical, OG/Twitter, and JSON-LD structured data.
//      Vercel serves these directly when the URL hits, before the SPA fallback.
//   2. Regenerate dist/sitemap.xml + public/sitemap.xml from current processors.json
//      with today's lastmod, including all 50 state pages, every processor page,
//      species sub-routes, and core marketing pages.
//
// Run via `npm run build` → vite build → this script.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distDir = path.resolve(root, 'dist');
const publicDir = path.resolve(root, 'public');

const SITE = 'https://farmshare.co';
const DEFAULT_OG_IMAGE = 'https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content//cattle.webp';

const STATE_NAMES = {
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

const SPECIES = ['beef', 'hog', 'lamb', 'goat', 'bison', 'veal'];

// ---------- helpers ----------
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function stateSlug(stateAbbr) {
  return STATE_NAMES[stateAbbr]?.toLowerCase().replace(/\s+/g, '-');
}

function clip(str, n) {
  if (!str) return str;
  return str.length > n ? str.slice(0, n - 1).trimEnd() + '…' : str;
}

// ---------- collect routes ----------
const processors = JSON.parse(fs.readFileSync(path.join(root, 'src/data/processors.json'), 'utf-8'));
const today = new Date().toISOString().slice(0, 10);

function buildRoutes() {
  const routes = [];

  // Core marketing pages — keep their existing static-tag content (do not overwrite home).
  routes.push({
    path: '/mission',
    title: 'Our Mission | Farmshare',
    description: 'Farmshare exists to help independent custom meat processors run a tighter plant — and to give producers and buyers a way to source local meat without faxing a butcher.',
    priority: 0.8,
  });

  routes.push({
    path: '/features',
    title: 'Features | Farmshare',
    description: 'Online scheduling, digital cut sheets, automated notifications, customer portal, job tracking, and invoicing — built for how an independent meat processor actually runs.',
    priority: 0.8,
  });

  routes.push({
    path: '/find-a-processor',
    title: 'Find a Custom Meat Processor Near You | Farmshare',
    description: 'Browse 894 independent custom meat processors across the US. Book online with the Farmshare network or send a scheduling request to any plant in our directory.',
    priority: 0.9,
    structured: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Custom Meat Processor Directory',
      description: 'Nationwide directory of independent custom meat processors offering online scheduling through Farmshare.',
      numberOfItems: processors.length,
    },
  });

  routes.push({
    path: '/buy-beef',
    title: 'Buy Local Beef — Quarters, Halves, Wholes | Farmshare',
    description: 'Looking to buy a quarter, half, or whole beef? Tell Farmshare what you need and we’ll connect you with a local independent processor and producer to fill your freezer.',
    priority: 0.7,
  });

  routes.push({
    path: '/release-notes',
    title: 'Release Notes | Farmshare',
    description: 'Recent product updates from the Farmshare team — new features, improvements, and fixes for independent meat processors.',
    priority: 0.5,
  });

  // State pages
  const states = [...new Set(processors.map((p) => p.state))].filter((s) => STATE_NAMES[s]);
  for (const stateAbbr of states.sort()) {
    const stateName = STATE_NAMES[stateAbbr];
    const slug = stateSlug(stateAbbr);
    const inState = processors.filter((p) => p.state === stateAbbr);
    if (inState.length === 0) continue;
    const customerCount = inState.filter((p) => p.status === 'customer').length;

    const description = customerCount > 0
      ? `Find ${inState.length} custom meat processor${inState.length !== 1 ? 's' : ''} in ${stateName}, including ${customerCount} on the Farmshare network with online scheduling. Book harvest appointments and submit digital cut sheets.`
      : `Find ${inState.length} custom meat processor${inState.length !== 1 ? 's' : ''} in ${stateName}. Browse independent plants near you — Farmshare connects buyers, producers, and butchers across the state.`;

    routes.push({
      path: `/find-a-processor/${slug}`,
      title: `Custom Meat Processors in ${stateName} | Farmshare`,
      description: clip(description, 300),
      priority: 0.7,
      changefreq: 'weekly',
      structured: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Custom Meat Processors in ${stateName}`,
        description: `Directory of independent custom meat processors in ${stateName} offering online scheduling through Farmshare.`,
        numberOfItems: inState.length,
        itemListElement: inState.slice(0, 50).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'LocalBusiness',
            name: p.name,
            address: {
              '@type': 'PostalAddress',
              addressLocality: p.location.split(',')[0].trim(),
              addressRegion: stateName,
              addressCountry: 'US',
            },
            url: `${SITE}/find-a-processor/${p.slug}`,
          },
        })),
      },
    });
  }

  // Species sub-routes (FindProcessor with species filter applied)
  for (const sp of SPECIES) {
    const display = sp[0].toUpperCase() + sp.slice(1);
    const speciesProcessors = processors.filter((p) => p.species && p.species.includes(display));
    if (speciesProcessors.length === 0) continue;
    routes.push({
      path: `/find-a-processor/species/${sp}`,
      title: `Custom ${display} Processors Near You | Farmshare`,
      description: `Find ${speciesProcessors.length} independent ${display.toLowerCase()} processors across the US on Farmshare. Book online with network plants or send a request to any in our directory.`,
      priority: 0.7,
      changefreq: 'weekly',
    });
  }

  // Processor pages
  for (const p of processors) {
    if (p.businessStatus === 'CLOSED_PERMANENTLY') continue;
    const stateName = STATE_NAMES[p.state] ?? p.state;
    const isCustomer = p.status === 'customer';
    const ctaWord = isCustomer ? 'Book online' : 'Send a scheduling request';
    const speciesText = p.species && p.species.length ? ` Services include ${p.species.join(', ').toLowerCase()} processing.` : '';
    const baseDescription = p.description
      || `${p.name} is a custom meat processor in ${p.location}, ${stateName}.${speciesText} ${ctaWord} through Farmshare.`;

    const localBusiness = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${SITE}/find-a-processor/${p.slug}`,
      name: p.name,
      url: p.website || `${SITE}/find-a-processor/${p.slug}`,
      ...(p.phone ? { telephone: p.phone } : {}),
      ...(p.logo ? { image: p.logo.startsWith('/') ? `${SITE}${p.logo}` : p.logo } : {}),
      address: {
        '@type': 'PostalAddress',
        ...(p.address ? { streetAddress: p.address } : {}),
        addressLocality: p.location.split(',')[0].trim(),
        addressRegion: stateName,
        ...(p.zip ? { postalCode: p.zip } : {}),
        addressCountry: 'US',
      },
      ...(p.lat != null && p.lng != null
        ? { geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng } }
        : {}),
      ...(p.rating
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: p.rating,
              reviewCount: p.userRatingCount || 1,
            },
          }
        : {}),
    };

    routes.push({
      path: `/find-a-processor/${p.slug}`,
      title: `${p.name} — ${p.location} | Custom Meat Processor | Farmshare`,
      description: clip(baseDescription, 300),
      image: p.logo && p.logo.startsWith('http') ? p.logo : null,
      priority: isCustomer ? 0.8 : 0.6,
      changefreq: 'monthly',
      structured: localBusiness,
    });
  }

  return routes;
}

// ---------- HTML rewriter ----------
function customizeHtml(template, route) {
  const url = `${SITE}${route.path}`;
  let html = template;

  const replacements = [
    [/<title>[^<]*<\/title>/, `<title>${escapeHtml(route.title)}</title>`],
    [/<meta name="title" content="[^"]*"\s*\/?>/i, `<meta name="title" content="${escapeHtml(route.title)}" />`],
    [/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(route.description)}" />`],
    [/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${url}" />`],
    [/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(route.title)}" />`],
    [/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(route.description)}" />`],
    [/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${url}" />`],
    [/<meta property="twitter:title" content="[^"]*"\s*\/?>/i, `<meta property="twitter:title" content="${escapeHtml(route.title)}" />`],
    [/<meta property="twitter:description" content="[^"]*"\s*\/?>/i, `<meta property="twitter:description" content="${escapeHtml(route.description)}" />`],
    [/<meta property="twitter:url" content="[^"]*"\s*\/?>/i, `<meta property="twitter:url" content="${url}" />`],
  ];

  for (const [re, val] of replacements) {
    html = html.replace(re, val);
  }

  // Optional: override og/twitter image if processor has a remote logo
  if (route.image) {
    html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${escapeHtml(route.image)}" />`);
    html = html.replace(/<meta property="twitter:image" content="[^"]*"\s*\/?>/i, `<meta property="twitter:image" content="${escapeHtml(route.image)}" />`);
  }

  // Inject route-specific JSON-LD before </head>. Keep existing <script type="application/ld+json"> for Organization/SoftwareApplication intact.
  if (route.structured) {
    const ldJson = JSON.stringify(route.structured).replace(/</g, '\\u003c');
    html = html.replace('</head>', `    <script type="application/ld+json">${ldJson}</script>\n  </head>`);
  }

  return html;
}

// ---------- writers ----------
function writePrerenderedRoute(template, route) {
  const html = customizeHtml(template, route);
  const outDir = path.join(distDir, route.path);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
}

function writeSitemap(routes) {
  const urls = [
    { loc: SITE + '/', lastmod: today, changefreq: 'weekly', priority: 1.0 },
    ...routes.map((r) => ({
      loc: SITE + r.path,
      lastmod: today,
      changefreq: r.changefreq || 'monthly',
      priority: r.priority ?? 0.5,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml);
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
  return urls.length;
}

// ---------- main ----------
function main() {
  if (!fs.existsSync(distDir)) {
    console.error('seo-build: dist/ does not exist; run `vite build` first.');
    process.exit(1);
  }

  const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
  const routes = buildRoutes();

  // Prerender. Skip "/" since dist/index.html is already the home page.
  let written = 0;
  for (const route of routes) {
    if (route.path === '/' || !route.path) continue;
    writePrerenderedRoute(template, route);
    written++;
  }

  const totalSitemap = writeSitemap(routes);
  console.log(`seo-build: wrote ${written} prerendered routes + sitemap.xml (${totalSitemap} URLs)`);
}

main();
