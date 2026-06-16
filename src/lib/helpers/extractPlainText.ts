import { cleanText } from '$lib/helpers/cleanText';

export function extractPlainText(input: string): string {
  if (typeof input !== 'string') return '';

  const stripped = input
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  return cleanText(stripped, { preserveParagraphs: true });
}
