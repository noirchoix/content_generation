import type { GeneratedAsset } from '$lib/types/generation';
import type { OutputType, Platform } from '$lib/types/platform';

function between(text: string, label: string): string {
  const pattern = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z][A-Za-z ]+:|$)`, 'i');
  return text.match(pattern)?.[1]?.trim() ?? '';
}

export function parseGeneratedText(raw: string, platform: Platform, type: OutputType): GeneratedAsset[] {
  const blocks = raw
    .split(/\n(?=Asset\s*\d+:|Version\s*\d+:|HOOK:|Title:)/i)
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
    hashtags: (between(block, 'Hashtags') || '')
      .split(/[,\s]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.startsWith('#')),
    notes: between(block, 'Notes') || ''
  }));
}
