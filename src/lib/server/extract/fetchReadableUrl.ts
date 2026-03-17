const DEFAULT_TIMEOUT_MS = 20_000;

export async function fetchReadableUrl(
  url: string
): Promise<{ text: string; finalUrl: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const normalized = url.replace(/^https?:\/\//, '');
    const readerUrl = `https://r.jina.ai/http://${normalized}`;

    const res = await fetch(readerUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'text/plain, text/markdown;q=0.9, */*;q=0.8'
      }
    });

    if (!res.ok) {
      throw new Error(`Readable fetch failed: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();

    if (!text || !text.trim()) {
      throw new Error('Readable fetch returned empty text.');
    }

    return {
      text: text.trim(),
      finalUrl: readerUrl
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Readable fetch timed out after ${DEFAULT_TIMEOUT_MS}ms.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}