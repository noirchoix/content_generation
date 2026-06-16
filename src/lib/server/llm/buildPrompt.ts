import type { ContentFormat } from '$lib/types/content';
import type { Platform } from '$lib/types/platform';
import type { ChatMessage } from '$lib/server/llm/openrouter';
import {
  FORMAT_GUIDANCE,
  PLATFORM_GUIDANCE,
  PLATFORM_HASHTAG_LIMIT,
  UNIVERSAL_CONTENT_RULES
} from '$lib/server/llm/prompts';
import { getSystemPrompt } from '$lib/server/llm/systemPrompt';

type BuildPromptInput = {
  text: string;
  platform: Platform;
  format: ContentFormat;
  brandVoice?: string;
};

const PLATFORM_CONTEXT: Record<Platform, string> = {
  instagram:
    'Instagram success usually depends on a strong first line, scannable caption structure, visual imagination, saves/shares, and a small relevant hashtag set.',
  linkedin:
    'LinkedIn success usually depends on professional relevance, credibility, a strong hook before the fold, insight density, and discussion-worthy CTAs.',
  x:
    'X success usually depends on concise phrasing, immediacy, one clear idea, reply/repost potential, and minimal hashtag use.',
  tiktok:
    'TikTok success usually depends on a first-second pattern interrupt, natural spoken rhythm, visual beats, and a simple follow/comment CTA.'
};

export function buildPromptMessages(input: BuildPromptInput): ChatMessage[] {
  const brandVoice = input.brandVoice?.trim()
    ? `Brand voice instructions:\n${input.brandVoice.trim()}`
    : `Brand voice instructions:\nUse a polished, clear, modern tone appropriate for the selected platform.`;

  const hashtagLimit = PLATFORM_HASHTAG_LIMIT[input.platform];

  const userPrompt = [
    `Platform: ${input.platform}`,
    `Content format: ${input.format}`,
    `Platform context:\n${PLATFORM_CONTEXT[input.platform]}`,
    `Platform guidance:\n${PLATFORM_GUIDANCE[input.platform]}`,
    `Format guidance:\n${FORMAT_GUIDANCE[input.format]}`,
    `Universal content rules:\n- ${UNIVERSAL_CONTENT_RULES.join('\n- ')}`,
    brandVoice,
    [
      'Hashtag rules:',
      `- Use at most ${hashtagLimit} hashtags.`,
      '- Do not create long hashtag chains.',
      '- Use hashtags only in the Hashtags field.',
      '- Keep hashtags short, relevant, and deduplicated.',
      '- If hashtags are not useful for the platform/content, use fewer than the maximum.'
    ].join('\n'),
    [
      'Output quality checks:',
      '- The first line must create curiosity, value, or professional relevance.',
      '- The body must be directly derived from the source.',
      '- The CTA must invite a realistic next action.',
      '- Notes should explain posting usage briefly, not repeat the post.'
    ].join('\n'),
    `Source content:\n${input.text}`,
    `Generate the final content asset for platform "${input.platform}" and format "${input.format}".`
  ].join('\n\n');

  return [
    { role: 'system', content: getSystemPrompt() },
    { role: 'user', content: userPrompt }
  ];
}