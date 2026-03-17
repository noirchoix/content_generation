import { json } from '@sveltejs/kit';
import { normalizeUrl } from '$lib/helpers/normalizeUrl';
import { cleanText } from '$lib/helpers/cleanText';
import { fetchUrl } from '$lib/server/extract/fetchUrl';
import { extractArticle } from '$lib/server/extract/extractArticle';
import { prepareContext } from '$lib/server/extract/prepareContext';
import { fetchReadableUrl } from '$lib/server/extract/fetchReadableUrl';

export async function POST({ request }) {
  try {
    const body = await request.json();
    const url = normalizeUrl(String(body?.url ?? ''));

    console.log('[api/scrape] incoming url:', url);

    let title: string | undefined;
    let excerpt: string | undefined;
    let text = '';
    let extractionMode: 'direct' | 'readable-fallback' = 'direct';

    try {
      const fetched = await fetchUrl(url);

      console.log('[api/scrape] fetched:', {
        finalUrl: fetched.finalUrl,
        contentType: fetched.contentType,
        htmlLength: fetched.html.length,
        htmlSnippet: fetched.html.slice(0, 300)
      });

      const article = extractArticle(fetched.html, fetched.finalUrl);

      title = article.title;
      excerpt = article.excerpt;
      text = article.text;

      console.log('[api/scrape] direct extraction succeeded:', {
        title,
        textLength: text.length
      });
    } catch (primaryError) {
      extractionMode = 'readable-fallback';

      console.warn('[api/scrape] direct fetch/extraction failed, switching to readable fallback');
      console.warn(primaryError instanceof Error ? primaryError.message : primaryError);

      const readable = await fetchReadableUrl(url);

      text = cleanText(readable.text, {
        preserveParagraphs: true,
        maxLength: 60_000
      });

      title = title || 'Extracted article';

      console.log('[api/scrape] readable fallback succeeded:', {
        finalUrl: readable.finalUrl,
        textLength: text.length,
        textSnippet: text.slice(0, 300)
      });
    }

    const prepared = await prepareContext(text, {
      title,
      maxChunks: 5
    });

    console.log('[api/scrape] prepared:', {
      extractionMode,
      preparedLength: prepared.length,
      preparedSnippet: prepared.slice(0, 300)
    });

    if (!prepared || prepared.trim().length < 100) {
      return json(
        {
          ok: false,
          error: 'Could not extract readable content from this URL.',
          fallback: extractionMode === 'readable-fallback'
        },
        { status: 400 }
      );
    }

    return json({
      ok: true,
      url,
      title,
      excerpt,
      text: prepared,
      extractionMode
    });
  } catch (error) {
    console.error('[api/scrape] failed');
    console.error(error);

    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    }

    return json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Scrape failed.'
      },
      { status: 400 }
    );
  }
}