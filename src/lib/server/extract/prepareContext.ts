import { cleanText } from '$lib/helpers/cleanText';
import { chunkText } from '$lib/helpers/chunkText';
import { splitTextWithLangChain } from '$lib/server/langchain/splitter';

type PrepareContextOptions = {
  title?: string;
  maxChunks?: number;
};

export async function prepareContext(
  text: string,
  options: PrepareContextOptions = {}
): Promise<string> {
  const cleaned = cleanText(text, { preserveParagraphs: true, maxLength: 60_000 });
  if (!cleaned) return '';

  let chunks = await splitTextWithLangChain(cleaned, {}, { chunkSize: 1800, chunkOverlap: 250 });

  if (chunks.length === 0) {
    chunks = chunkText(cleaned, { chunkSize: 1800, overlap: 250 }).map((chunk) => chunk.content);
  }

  const selected = chunks.slice(0, options.maxChunks ?? 5);

  if (options.title?.trim()) {
    return `Source title: ${options.title.trim()}\n\n${selected.join('\n\n')}`;
  }

  return selected.join('\n\n');
}
