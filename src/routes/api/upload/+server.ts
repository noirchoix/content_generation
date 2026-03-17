import { json } from '@sveltejs/kit';
import { cleanText } from '$lib/helpers/cleanText';
import { extractPlainText } from '$lib/helpers/extractPlainText';

const TEXT_LIKE_TYPES = new Set([
  'text/plain',
  'text/markdown',
  'text/html',
  'application/json',
  'text/csv'
]);

export async function POST({ request }) {
  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return json({ ok: false, error: 'No file was uploaded.' }, { status: 400 });
    }

    const isTextLike =
      TEXT_LIKE_TYPES.has(file.type) || /\.(txt|md|html|json|csv)$/i.test(file.name);

    if (!isTextLike) {
      return json(
        {
          ok: false,
          error: 'Only text-like files are supported in this version. Use TXT, MD, HTML, JSON, or CSV.'
        },
        { status: 415 }
      );
    }

    const raw = await file.text();
    const text =
      file.type === 'text/html' || /\.html?$/i.test(file.name)
        ? extractPlainText(raw)
        : cleanText(raw, { preserveParagraphs: true, maxLength: 50_000 });

    return json({
      ok: true,
      fileName: file.name,
      text
    });
  } catch (error) {
    return json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Upload failed.'
      },
      { status: 500 }
    );
  }
}
