export function normalizeUrl(input: string): string {
  if (typeof input !== 'string' || !input.trim()) {
    throw new Error('A valid URL is required.');
  }

  const trimmed = input.trim();
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error('The supplied URL is malformed.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported.');
  }

  return parsed.toString();
}
