/**
 * Lead-router engine — pure, testable functions that turn a buyer/producer
 * lead into a ranked shortlist of processors from the live find-a-processor
 * directory. Ported from Wyatt's prototype and typed to the real Processor.
 *
 * No network calls here. Geocoding happens in ./geocode and is passed in via
 * lead.lat / lead.lng. The cockpit (pages/AdminLeads) composes the two.
 */
import { processors, type Processor } from '../data/processors';

export type LeadType = 'buyer' | 'producer';

export interface Lead {
  name?: string;
  email?: string;
  phone?: string;
  zip?: string;
  species?: string;
  cut_type?: string;
  head_count?: string;
  processor_slug?: string; // set when the lead came through a specific plant's page
  timing?: string;
  notes?: string;
  // enrichment (from ./geocode)
  lat?: number | null;
  lng?: number | null;
  country?: string | null;
}

export interface RankWeights {
  /** Existing customers are treated as this many miles closer than prospects. */
  customerCreditMiles: number;
  /** Beyond this radius the top match is flagged as "no nearby match". */
  maxMiles: number;
}

export const DEFAULT_WEIGHTS: RankWeights = { customerCreditMiles: 15, maxMiles: 60 };

/** Processor slugs that have asked NOT to receive routed leads. */
export const SUPPRESSION: string[] = [];

export interface RankedProcessor extends Processor {
  distanceMi: number;
  /** true when this customer outranks a strictly-closer prospect (credit applied). */
  boosted?: boolean;
  /** true when the lead named this exact plant and we pinned it to the top. */
  intended?: boolean;
}

export interface RankResult {
  top: RankedProcessor[];
  flags: string[];
}

const R_MILES = 3958.8;

export function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** First token of a species string, lowercased ("Beef, Hog" -> "beef"). */
export function normSpecies(s?: string): string {
  return String(s || '').trim().toLowerCase().split(/[\s,/]+/)[0];
}

/** A lead with a head count or a named plant is a producer; otherwise a buyer. */
export function inferLeadType(lead: Lead): LeadType {
  return lead.head_count || lead.processor_slug ? 'producer' : 'buyer';
}

export function rankProcessors(lead: Lead, weights: RankWeights = DEFAULT_WEIGHTS): RankResult {
  const flags: string[] = [];
  if (lead.lat == null || lead.lng == null) return { top: [], flags: ['needs_manual_geocode'] };
  if (lead.country && lead.country !== 'US') flags.push('out_of_footprint');

  const species = normSpecies(lead.species);
  const cands: RankedProcessor[] = processors
    .filter((p) => p.lat != null && p.lng != null)
    .filter((p) => !SUPPRESSION.includes(p.slug))
    .filter((p) => !species || p.species.some((s) => s.toLowerCase().includes(species)))
    .map((p) => ({ ...p, distanceMi: haversineMiles(lead.lat!, lead.lng!, p.lat!, p.lng!) }));

  const adj = (p: RankedProcessor) => p.distanceMi - (p.status === 'customer' ? weights.customerCreditMiles : 0);
  cands.sort((a, b) => adj(a) - adj(b));

  // Pin a named target plant to the top if the lead specified one.
  if (lead.processor_slug) {
    const i = cands.findIndex((c) => c.slug === lead.processor_slug);
    if (i > 0) {
      const [t] = cands.splice(i, 1);
      cands.unshift({ ...t, intended: true });
    }
  }

  const top = cands.slice(0, 5);
  if (top.length === 0) flags.push('no_species_match');
  else if (top[0].distanceMi > weights.maxMiles) flags.push('no_nearby_match');

  // Flag customers that beat a strictly-closer prospect (the credit did the work).
  const closestProspect = Math.min(
    ...cands.filter((c) => c.status === 'prospect').map((c) => c.distanceMi),
    Infinity,
  );
  top.forEach((p) => {
    if (p.status === 'customer' && p.distanceMi > closestProspect) p.boosted = true;
  });

  if (/not sure/i.test(lead.cut_type || '') || /explor|not sure/i.test(lead.timing || '')) {
    flags.push('low_intent');
  }

  return { top, flags };
}

/** Round-robins routed leads between Henry and Wyatt. */
export function nextAssignee(routedCount: number): 'Henry' | 'Wyatt' {
  return (['Wyatt', 'Henry'] as const)[routedCount % 2];
}

const dirUrl = (slug: string) => `https://www.farmshare.co/find-a-processor/${slug}`;

/** Drafts the "no strings, warm intro" routing message for a chosen processor. */
export function buildRoutingDraft(lead: Lead, top: RankedProcessor | undefined, type: LeadType): string {
  if (!top) return '';
  const link = top.website || dirUrl(top.slug);
  const contact = `${lead.email || ''} ${lead.phone || ''}`.trim();
  if (type === 'producer') {
    return `Subject: A producer near you needs processing

Hi ${top.name} team,

We've got a producer in your area looking to get animals processed and wanted to connect you directly. No strings, just a warm intro.

Producer: ${lead.name || '(name)'}
Contact: ${contact}
Animals: ${lead.head_count || '(head count)'} ${lead.species || ''}
Timing: ${lead.timing || 'flexible'}
Notes: ${lead.notes || 'none'}

If you can take this on, reach out to them directly. More on us: ${link}

Thanks,
Farmshare`;
  }
  return `Subject: We have a buyer near you

Hi ${top.name} team,

A buyer about ${Math.round(top.distanceMi)} miles from you is looking for ${lead.cut_type || 'a'} ${lead.species || 'beef'} and we wanted to connect you directly. No strings, just a warm intro.

Buyer: ${lead.name || '(name)'}
Contact: ${contact}
Looking for: ${lead.cut_type || 'Not sure'} ${lead.species || 'beef'}
Timing: ${lead.timing || 'flexible'}
Notes: ${lead.notes || 'none'}

If you have availability, reach out to them directly. More on us: ${link}

Thanks,
Farmshare`;
}

export const FLAG_TEXT: Record<string, string> = {
  out_of_footprint: 'Out of footprint. Nearest US processor shown for a human to decide.',
  no_nearby_match: 'No processor within range. Nearest shown — log and let a human decide.',
  needs_manual_geocode: 'Zip not recognized. Flag for manual geocode.',
  no_species_match: 'No processor handles this species.',
  low_intent: 'Low intent (Not sure / Just exploring). Route anyway, mark low.',
};
