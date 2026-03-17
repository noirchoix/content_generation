export function chunkText(text: string, chunkSize = 900, overlap = 120): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end).trim());
    if (end === text.length) break;
    start = end - overlap;
  }

  return chunks.filter(Boolean);
}
