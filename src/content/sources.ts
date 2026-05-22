export type ConfidenceTier = 'confirmed' | 'datamine' | 'inferred' | 'speculation';

export const SOURCES = {
  REVEAL: 'Reveal Stream (official)',
  QA: 'ZiggyD Q&A with Jonathan Rogers & Mark Roberts',
  POE2DB: 'PoE2DB datamine',
  PRESSKIT: 'Official press kit',
} as const;

export type Source = typeof SOURCES[keyof typeof SOURCES];
