import { json } from '@sveltejs/kit';
import type { GeneratedAsset } from '$lib/types/content';

function buildTxt(output: GeneratedAsset): string {
  const hashtags = output.hashtags?.join(' ') ?? '';

  return [
    `Title: ${output.title}`,
    `Platform: ${output.platform}`,
    `Format: ${output.format}`,
    '',
    `Hook: ${output.hook ?? ''}`,
    '',
    'Body:',
    output.body,
    '',
    `CTA: ${output.cta ?? ''}`,
    '',
    `Hashtags: ${hashtags}`,
    '',
    `Notes: ${output.notes ?? ''}`,
    output.sourceUrl ? `Source URL: ${output.sourceUrl}` : ''
  ]
    .filter(Boolean)
    .join('\n');
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const output = body?.output as GeneratedAsset | undefined;

    if (!output || typeof output !== 'object') {
      return json({ ok: false, error: 'A generated output payload is required.' }, { status: 400 });
    }

    return new Response(buildTxt(output), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="content-pack.txt"'
      }
    });
  } catch (error) {
    return json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Download failed.'
      },
      { status: 500 }
    );
  }
}
