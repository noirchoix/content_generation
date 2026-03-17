export function cleanText(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/[\t ]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function truncateText(text: string, max = 16000): string {
  return text.length <= max ? text : `${text.slice(0, max)}\n\n[Truncated for MVP processing]`;
}
