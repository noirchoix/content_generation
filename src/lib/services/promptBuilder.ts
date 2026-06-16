import type { BrandProfile } from '$lib/types/brand';
import type { OutputType, Platform } from '$lib/types/platform';

const HASHTAG_LIMIT: Record<Platform, number> = {
  instagram: 5,
  linkedin: 4,
  x: 2,
  tiktok: 5
};

const PLATFORM_RULES: Record<Platform, string[]> = {
  instagram: [
    'Use a visual, emotionally clear first line.',
    'Write in short mobile-friendly paragraphs.',
    'CTA can ask readers to save, share, comment, or visit bio.',
    'Keep hashtags focused and capped.'
  ],
  linkedin: [
    'Lead with a professional pain point, insight, lesson, or contrarian observation.',
    'Avoid corporate filler and generic motivation.',
    'Use line breaks for dwell time and readability.',
    'Suggest link-in-comments in Notes when relevant instead of placing links in the body.'
  ],
  x: [
    'Make the copy brief and sharp.',
    'One main idea only unless the requested type is a thread/hook list.',
    'Avoid long CTAs and hashtag stuffing.'
  ],
  tiktok: [
    'Write in a natural spoken rhythm.',
    'Start with a first-second hook.',
    'Include visual/action beats when useful.'
  ]
};

export function buildPrompt(args: {
  text: string;
  platform: Platform;
  type: OutputType;
  brandProfile?: BrandProfile | null;
  sourceSummary?: string;
  variations?: number;
}): string {
  const { text, platform, type, brandProfile, sourceSummary, variations = 3 } = args;
  const hashtagLimit = HASHTAG_LIMIT[platform] ?? 5;

  const brandBlock = brandProfile
    ? `
BRAND PROFILE
- Brand name: ${brandProfile.brand_name}
- Tone: ${brandProfile.tone}
- Target audience: ${brandProfile.target_audience}
- Content pillars: ${brandProfile.content_pillars.join(', ')}
- Forbidden phrases: ${brandProfile.forbidden_phrases.join(', ')}
- Style rules: ${brandProfile.style_rules.join(', ')}
- CTA style: ${brandProfile.cta_style}
`
    : '';

  const sourceBlock = sourceSummary ? `
RETRIEVED CONTEXT
${sourceSummary}
` : '';

  return `You are a senior social media content strategist.
Create ${variations} strong ${platform} ${type} outputs from the source content.

Platform rules:
- ${PLATFORM_RULES[platform].join('
- ')}

Universal rules:
- Stay faithful to the source. Do not invent facts, numbers, testimonials, or claims.
- Make the post useful to the reader before it becomes promotional.
- Use clear English, short paragraphs, and platform-native structure.
- Avoid generic filler, AI-sounding phrases, and excessive emojis.
- Return a consistent structure for each asset.
- Hashtags must be relevant, deduplicated, and limited to ${hashtagLimit} maximum.
- Put hashtags only in the Hashtags field.
- Output labels exactly as: Title, Hook, Body, CTA, Hashtags, Notes.
- Separate assets clearly using "Asset 1:", "Asset 2:", etc.
${brandBlock}
${sourceBlock}
SOURCE CONTENT
${text}`;
}
