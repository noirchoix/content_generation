import type { Platform } from '$lib/types/platform';

export const SUPPORTED_CONTENT_FORMATS = [
  'caption',
  'carousel',
  'video-script',
  'hook-list'
] as const;

export type ContentFormat = (typeof SUPPORTED_CONTENT_FORMATS)[number];

export function isContentFormat(value: unknown): value is ContentFormat {
  return typeof value === 'string' && SUPPORTED_CONTENT_FORMATS.includes(value as ContentFormat);
}

export type GeneratePayload = {
  text?: string;
  url?: string;
  platform: Platform;
  format: ContentFormat;
  brandVoice?: string;
};

export type GeneratedAsset = {
  title: string;
  platform: Platform;
  format: ContentFormat;
  hook?: string;
  body: string;
  cta?: string;
  hashtags?: string[];
  notes?: string;
  raw?: string;
  sourceType?: 'text' | 'url';
  sourceUrl?: string;
};

export type GenerateSuccessResponse = {
  ok: true;
  output: GeneratedAsset;
  meta: {
    model: string;
    inputLength: number;
    generatedAt: string;
    sourceType: 'text' | 'url';
  };
};

export type GenerateErrorResponse = {
  ok: false;
  error: string;
  details?: string[];
};
