import type { BrandProfile } from '$lib/types/brand';
import type { OutputType, Platform } from '$lib/types/platform';

export function buildPrompt(args: {
  text: string;
  platform: Platform;
  type: OutputType;
  brandProfile?: BrandProfile | null;
  sourceSummary?: string;
  variations?: number;
}): string {
  const { text, platform, type, brandProfile, sourceSummary, variations = 3 } = args;

  const brandBlock = brandProfile
    ? `\nBRAND PROFILE\n- Brand name: ${brandProfile.brand_name}\n- Tone: ${brandProfile.tone}\n- Target audience: ${brandProfile.target_audience}\n- Content pillars: ${brandProfile.content_pillars.join(', ')}\n- Forbidden phrases: ${brandProfile.forbidden_phrases.join(', ')}\n- Style rules: ${brandProfile.style_rules.join(', ')}\n- CTA style: ${brandProfile.cta_style}\n`
    : '';

  const sourceBlock = sourceSummary ? `\nRETRIEVED CONTEXT\n${sourceSummary}\n` : '';

  return `You are an expert social media content strategist.
Create ${variations} strong ${platform} ${type} outputs from the source content.

Rules:
- Keep it practical and publish-ready.
- Avoid generic filler.
- Respect the requested platform.
- Return a consistent structure for each asset.
- Use real hashtags only when appropriate.
- Output labels exactly as: Title, Hook, Body, CTA, Hashtags, Notes.
- Separate assets clearly using "Asset 1:", "Asset 2:", etc.
${brandBlock}
${sourceBlock}
SOURCE CONTENT
${text}`;
}
