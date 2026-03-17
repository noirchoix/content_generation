export function htmlToArticleText(html: string): string {
  const withoutScript = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');

  const text = withoutScript
    .replace(/<main[\s\S]*?>/i, ' ')
    .replace(/<\/main>/i, ' ')
    .replace(/<article[\s\S]*?>/gi, ' ')
    .replace(/<\/article>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}
