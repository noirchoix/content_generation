import type { GeneratedAsset } from '$lib/types/generation';
import type { OutputType, Platform } from '$lib/types/platform';

const LEGACY_PLATFORM_HASHTAG_LIMIT: Record<Platform, number> = {
  instagram: 5,
  linkedin: 4,
  x: 2,
  tiktok: 5
};

function between(text: string, label: string): string {
  const pattern = new RegExp(`${label}:\s*([\s\S]*?)(?=\n[A-Z][A-Za-z ]+:|$)`, 'i');
  return text.match(pattern)?.[1]?.trim() ?? '';
}

function normalizeHashtag(value: string): string | null {
  const cleaned = value
    .trim()
    .replace(/^#+/, '')
    .replace(/[^\p{L}\p{N}_-]/gu, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  if (!cleaned || /^\d+$/.test(cleaned)) return null;
  return `#${cleaned}`;
}

function parseLimitedHashtags(value: string, platform: Platform): string[] {
  const limit = LEGACY_PLATFORM_HASHTAG_LIMIT[platform] ?? 5;
  const rawTags = value.match(/#[\p{L}\p{N}_-]+/gu) ?? value.split(/[,\s]+/);
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const raw of rawTags) {
    const tag = normalizeHashtag(raw);
    if (!tag) continue;

    const key = tag.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    tags.push(tag);
    if (tags.length >= limit) break;
  }

  return tags;
}

export function parseGeneratedText(raw: string, platform: Platform, type: OutputType): GeneratedAsset[] {
  const blocks = raw
    .split(/
(?=Asset\s*\d+:|Version\s*\d+:|HOOK:|Title:)/i)
    .map((v) => v.trim())
    .filter(Boolean);

  const normalized = blocks.length ? blocks : [raw];

  return normalized.map((block, index) => ({
    title: between(block, 'Title') || `${platform} ${type} ${index + 1}`,
    platform,
    type,
    hook: between(block, 'Hook') || '',
    body: between(block, 'Body') || block.trim(),
    cta: between(block, 'CTA') || '',
    hashtags: parseLimitedHashtags(between(block, 'Hashtags') || '', platform),
    notes: between(block, 'Notes') || ''
  }));
}
