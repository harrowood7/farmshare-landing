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
}

export const processors: Processor[] = processorsData as Processor[];

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
