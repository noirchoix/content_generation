const WINDOWS_LINE_ENDINGS_REGEX = /\r\n/g;
const NON_BREAKING_SPACE_REGEX = /\u00A0/g;
const DUPLICATE_SPACES_REGEX = /[ \t]{2,}/g;
const DUPLICATE_NEWLINES_REGEX = /\n{3,}/g;
const HTML_COMMENT_REGEX = /<!--([\s\S]*?)-->/g;
const SPACE_AROUND_NEWLINES_REGEX = / *\n */g;
const ZERO_WIDTH_REGEX = /[\u200B-\u200D\uFEFF]/g;

export type CleanTextOptions = {
  preserveParagraphs?: boolean;
  maxLength?: number;
};

export function cleanText(input: string, options: CleanTextOptions = {}): string {
  if (typeof input !== 'string') return '';

  const { preserveParagraphs = true, maxLength } = options;

  let text = input;
  text = text.replace(WINDOWS_LINE_ENDINGS_REGEX, '\n');
  text = text.replace(NON_BREAKING_SPACE_REGEX, ' ');
  text = text.replace(HTML_COMMENT_REGEX, ' ');
  text = text.replace(ZERO_WIDTH_REGEX, '');
  text = text
    .split('\n')
    .map((line) => line.replace(DUPLICATE_SPACES_REGEX, ' ').trimEnd())
    .join('\n')
    .replace(SPACE_AROUND_NEWLINES_REGEX, '\n');

  text = preserveParagraphs
    ? text.replace(DUPLICATE_NEWLINES_REGEX, '\n\n').trim()
    : text.replace(/\s+/g, ' ').trim();

  if (typeof maxLength === 'number' && maxLength > 0 && text.length > maxLength) {
    text = text.slice(0, maxLength).trim();
  }

  return text;
}
