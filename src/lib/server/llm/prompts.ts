import type { ContentFormat } from '$lib/types/content';
import type { Platform } from '$lib/types/platform';

export const PLATFORM_GUIDANCE: Record<Platform, string> = {
  instagram:
    'Write for Instagram. Prioritize a compelling hook, concise readability, emotional clarity, and relevant hashtags.',
  linkedin:
    'Write for LinkedIn. Prioritize credibility, insight, business relevance, and a polished professional tone.',
  x:
    'Write for X. Prioritize brevity, velocity, sharper phrasing, and repost-friendly lines.',
  tiktok:
    'Write for TikTok. Prioritize spoken-flow writing, fast attention capture, and script-like rhythm.'
};

export const FORMAT_GUIDANCE: Record<ContentFormat, string> = {
  caption: 'Produce one strong caption with hook, body, CTA, and hashtags.',
  carousel:
    'Produce a carousel-ready outline. The body should summarize the slide flow clearly enough to turn into slides.',
  'video-script':
    'Produce a short-form video script that reads naturally when spoken aloud.',
  'hook-list':
    'Produce a hook-led deliverable. Include multiple hooks in the body while preserving the required response structure.'
};
