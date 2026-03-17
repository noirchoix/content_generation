import type { ContentFormat } from '$lib/types/content';
import type { Platform } from '$lib/types/platform';
import type { ChatMessage } from '$lib/server/llm/openrouter';
import { FORMAT_GUIDANCE, PLATFORM_GUIDANCE } from '$lib/server/llm/prompts';
import { getSystemPrompt } from '$lib/server/llm/systemPrompt';

type BuildPromptInput = {
  text: string;
  platform: Platform;
  format: ContentFormat;
  brandVoice?: string;
};

export function buildPromptMessages(input: BuildPromptInput): ChatMessage[] {
  const brandVoice = input.brandVoice?.trim()
    ? `Brand voice instructions:\n${input.brandVoice.trim()}`
    : 'Brand voice instructions:\nUse a polished, clear, modern tone appropriate for the selected platform.';

  const userPrompt = [
    `Platform guidance:\n${PLATFORM_GUIDANCE[input.platform]}`,
    `Format guidance:\n${FORMAT_GUIDANCE[input.format]}`,
    brandVoice,
    `Source content:\n${input.text}`,
    `Generate the final content asset for platform "${input.platform}" and format "${input.format}".`
  ].join('\n\n');

  return [
    { role: 'system', content: getSystemPrompt() },
    { role: 'user', content: userPrompt }
  ];
}
