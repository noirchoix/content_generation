import { isContentFormat, type GeneratePayload } from '$lib/types/content';
import { isPlatform } from '$lib/types/platform';
import { normalizeUrl } from '$lib/helpers/normalizeUrl';

export class ValidationError extends Error {
  readonly details: string[];

  constructor(message: string, details: string[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

const MAX_TEXT_LENGTH = 50_000;
const MAX_BRAND_VOICE_LENGTH = 4_000;
const MIN_TEXT_LENGTH = 20;

export function validateGeneratePayload(payload: unknown): GeneratePayload {
  if (!payload || typeof payload !== 'object') {
    throw new ValidationError('Invalid request body.', ['Request body must be a JSON object.']);
  }

  const candidate = payload as Partial<GeneratePayload>;
  const details: string[] = [];

  if (!isPlatform(candidate.platform)) {
    details.push('platform must be one of: instagram, linkedin, x, tiktok.');
  }

  if (!isContentFormat(candidate.format)) {
    details.push('format must be one of: caption, carousel, video-script, hook-list.');
  }

  const text = typeof candidate.text === 'string' ? candidate.text.trim() : '';
  const url = typeof candidate.url === 'string' ? candidate.url.trim() : '';

  if (!text && !url) {
    details.push('Provide either text or a URL.');
  }

  if (text) {
    if (text.length < MIN_TEXT_LENGTH) {
      details.push(`text must be at least ${MIN_TEXT_LENGTH} characters long.`);
    }
    if (text.length > MAX_TEXT_LENGTH) {
      details.push(`text must not exceed ${MAX_TEXT_LENGTH} characters.`);
    }
  }

  let normalizedUrl: string | undefined;
  if (url) {
    try {
      normalizedUrl = normalizeUrl(url);
    } catch (error) {
      details.push(error instanceof Error ? error.message : 'URL validation failed.');
    }
  }

  let brandVoice: string | undefined;
  if (candidate.brandVoice !== undefined) {
    if (typeof candidate.brandVoice !== 'string') {
      details.push('brandVoice must be a string when provided.');
    } else {
      brandVoice = candidate.brandVoice.trim();
      if (brandVoice.length > MAX_BRAND_VOICE_LENGTH) {
        details.push(`brandVoice must not exceed ${MAX_BRAND_VOICE_LENGTH} characters.`);
      }
    }
  }

  if (details.length > 0) {
    throw new ValidationError('Invalid generate payload.', details);
  }

  return {
    text: text || undefined,
    url: normalizedUrl,
    platform: candidate.platform!,
    format: candidate.format!,
    brandVoice
  };
}
