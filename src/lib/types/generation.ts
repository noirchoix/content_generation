import type { BrandProfile } from './brand';
import type { OutputType, Platform } from './platform';

export type GenerationRequest = {
  text: string;
  platform: Platform;
  type: OutputType;
  url?: string;
  brandProfile?: BrandProfile | null;
  variations?: number;
};

export type GeneratedAsset = {
  title: string;
  platform: Platform;
  type: OutputType;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  notes?: string;
};

export type GenerationResponse = {
  assets: GeneratedAsset[];
  usedRag: boolean;
  promptPreview?: string;
  sourceSummary?: string;
};
