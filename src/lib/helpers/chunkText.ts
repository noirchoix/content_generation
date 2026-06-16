export type TextChunk = {
  index: number;
  content: string;
  start: number;
  end: number;
};

export function chunkText(
  text: string,
  options: { chunkSize?: number; overlap?: number } = {}
): TextChunk[] {
  const chunkSize = Math.max(200, options.chunkSize ?? 1800);
  const overlap = Math.max(0, Math.min(chunkSize - 50, options.overlap ?? 250));

  if (!text.trim()) return [];

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(text.length, start + chunkSize);
    const slice = text.slice(start, end).trim();

    if (slice) {
      chunks.push({ index, content: slice, start, end });
      index += 1;
    }

    if (end >= text.length) break;
    start = end - overlap;
  }

  return chunks;
}
