// Shared processor directory data — used across FindProcessor, ProcessorDetail, and StatePage
// Source: src/data/processors.json (345 processors — 27 customers + 318 prospects)

import processorsData from './processors.json';

export type ProcessorStatus = 'customer' | 'prospect';

export interface Processor {
  name: string;
  location: string;
  state: string;
  species: string[];
  logo: string | null;
  slug: string;
  status: ProcessorStatus;
  address?: string;
  zip?: string;
  phone?: string;
  website?: string;
  description?: string;
  lat?: number;
  lng?: number;
  /** Slug used by partners.farmshare.co. Differs from `slug` when the landing
   *  directory and partner admin disagree on casing, punctuation, or city. */
  partnerSlug?: string;
  /** Multi-facility customers have more than one scheduling page
   *  (e.g. separate USDA + Custom plants). If set, takes precedence over
   *  `partnerSlug` when rendering scheduling CTAs. */
  partnerFacilities?: PartnerFacility[];
  // Fields pulled from Places API (New) — populated for ~880 of 895 records.
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  /** Human-readable weekday hours, one string per day (Mon-Sun). */
  hours?: string[];
  /** Short Google-written description. Present on ~1% of records. */
  editorialSummary?: string;
  businessStatus?: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  /** Raw Google Places type tags (e.g. 'butcher_shop', 'meat_store'). */
  placeTypes?: string[];
}

export interface PartnerFacility {
  slug: string;
  label: string;
}

export const processors: Processor[] = processorsData as Processor[];

/** Returns the primary partner slug (first facility if multi, otherwise `partnerSlug`). */
export function partnerSlugFor(p: Processor): string {
  if (p.partnerFacilities && p.partnerFacilities.length > 0) {
    return p.partnerFacilities[0].slug;
  }
  return p.partnerSlug ?? p.slug;
}

/** Returns every facility this processor offers scheduling at. One entry for
 *  single-facility customers; two or more for multi-facility (e.g. Weimer). */
export function partnerFacilitiesFor(p: Processor): PartnerFacility[] {
  if (p.partnerFacilities && p.partnerFacilities.length > 0) return p.partnerFacilities;
  const slug = p.partnerSlug ?? p.slug;
  return [{ slug, label: '' }];
}

// State abbreviation to full name lookup — all 50 states + DC
export const stateNames: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

// Reverse lookup: full name (lowercase) -> abbreviation
export const stateAbbreviations: Record<string, string> = Object.fromEntries(
  Object.entries(stateNames).map(([abbr, name]) => [name.toLowerCase(), abbr])
);

// State slug to abbreviation (e.g., "north-dakota" -> "ND")
export const stateSlugToAbbr: Record<string, string> = Object.fromEntries(
  Object.entries(stateNames).map(([abbr, name]) => [name.toLowerCase().replace(/\s+/g, '-'), abbr])
);
