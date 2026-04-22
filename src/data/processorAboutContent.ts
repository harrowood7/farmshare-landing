// Processor About Content — rich descriptions keyed by slug
// Source: src/data/processorAboutContent.json (294 entries)

import content from './processorAboutContent.json';

export interface ProcessorAboutContent {
  about: string;
  established?: string;
  owners?: string;
  certifications?: string[];
  highlights?: string[];
  website?: string;
  source?: string;
}

export const processorAboutContent: Record<string, ProcessorAboutContent> =
  content as Record<string, ProcessorAboutContent>;
