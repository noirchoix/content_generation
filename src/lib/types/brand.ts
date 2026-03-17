export type BrandVoiceInput = {
  tone?: string;
  targetAudience?: string;
  contentPillars?: string[];
  forbiddenPhrases?: string[];
  styleRules?: string[];
  ctaStyle?: string;
};

export function isBrandVoiceInput(value: unknown): value is BrandVoiceInput {
  return !!value && typeof value === 'object';
}
