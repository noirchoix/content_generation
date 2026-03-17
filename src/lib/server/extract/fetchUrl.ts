const BLOCKED_CONTENT_TYPES = [
  'application/pdf',
  'application/zip',
  'application/octet-stream',
  'image/',
  'audio/',
  'video/'
];

const DEFAULT_TIMEOUT_MS = 20_000;

export async function fetchUrl(
  url: string
): Promise<{ html: string; finalUrl: string; contentType: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch URL. Status: ${res.status} ${res.statusText}`);
    }

    const contentType = String(res.headers.get('content-type') ?? '').toLowerCase();

    if (
      BLOCKED_CONTENT_TYPES.some(
        (blocked) => contentType.startsWith(blocked) || contentType.includes(blocked)
      )
    ) {
      throw new Error(`Unsupported URL content type: ${contentType || 'unknown'}.`);
    }

    const html = await res.text();

    if (!html || !html.trim()) {
      throw new Error('No readable HTML was returned from the supplied URL.');
    }

    return {
      html,
      finalUrl: res.url || url,
      contentType
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`URL fetch timed out after ${DEFAULT_TIMEOUT_MS}ms.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}