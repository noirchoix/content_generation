import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import * as cheerio from 'cheerio';
import { extractPlainText } from '$lib/helpers/extractPlainText';
import { cleanText } from '$lib/helpers/cleanText';

export type ExtractedArticle = {
  title?: string;
  text: string;
  excerpt?: string;
};

function stripHtmlFallback(html: string): string {
  return cleanText(
    html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gis, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gis, ' ')
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gis, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gis, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#39;/gi, "'")
      .replace(/&quot;/gi, '"'),
    { preserveParagraphs: false, maxLength: 60_000 }
  );
}

export function extractArticle(html: string, url: string): ExtractedArticle {
  if (!html || !html.trim()) {
    throw new Error('No HTML content was provided for article extraction.');
  }

  let readabilityTitle: string | undefined;
  let readabilityExcerpt: string | undefined;
  let readabilityText = '';

  try {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    readabilityTitle = article?.title?.trim() || undefined;
    readabilityExcerpt = article?.excerpt?.trim() || undefined;
    readabilityText = cleanText(article?.textContent || '', {
      preserveParagraphs: true,
      maxLength: 60_000
    });
  } catch {
    // fall through to cheerio/manual extraction
  }

  if (readabilityText && readabilityText.length >= 200) {
    return {
      title: readabilityTitle,
      excerpt: readabilityExcerpt,
      text: readabilityText
    };
  }

  const $ = cheerio.load(html);

  const title =
    readabilityTitle ||
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('meta[name="twitter:title"]').attr('content')?.trim() ||
    $('title').first().text().trim() ||
    undefined;

  const excerpt =
    readabilityExcerpt ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[name="twitter:description"]').attr('content')?.trim() ||
    undefined;

  const candidateBlocks = [
    $('article').text(),
    $('main').text(),
    $('[role="main"]').text(),
    $('.article').text(),
    $('.post').text(),
    $('.entry-content').text(),
    $('.content').text(),
    $('body').text()
  ];

  const candidate = candidateBlocks
    .map((value) => cleanText(extractPlainText(value), { preserveParagraphs: true, maxLength: 60_000 }))
    .find((value) => value.trim().length >= 200);

  if (candidate) {
    return {
      title,
      excerpt,
      text: candidate
    };
  }

  const fallback = stripHtmlFallback(html);

  if (fallback && fallback.length >= 100) {
    return {
      title: title || 'Extracted content',
      excerpt,
      text: fallback
    };
  }

  throw new Error('Unable to extract readable article text from the supplied URL.');
}