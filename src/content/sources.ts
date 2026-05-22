export type ConfidenceTier = 'confirmed' | 'datamine' | 'inferred' | 'speculation';

export const SOURCES = {
  REVEAL: 'Reveal Stream (official)',
  QA: 'ZiggyD Q&A with Jonathan Rogers & Mark Roberts',
  POE2DB: 'PoE2DB datamine',
  PRESSKIT: 'Official press kit',
  PATCH_NOTES: 'Official Patch Notes 0.5.0',
} as const;

export type Source = typeof SOURCES[keyof typeof SOURCES];

/** A record with structured source attribution for the merge layer. */
export interface Sourced {
  confidence: ConfidenceTier;
  sources?: Source[];
  note?: string;
}

/**
 * Merge precedence: patch-notes-confirmed fields win over datamine.
 * Hand-authored note/confidence overrides always win over machine output.
 */
export const SOURCE_PRECEDENCE = [
  SOURCES.PATCH_NOTES,  // highest
  SOURCES.REVEAL,
  SOURCES.QA,
  SOURCES.PRESSKIT,
  SOURCES.POE2DB,       // lowest
] as const;
