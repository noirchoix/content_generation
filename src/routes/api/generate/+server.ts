import { cleanText } from '$lib/helpers/cleanText';
import { formatGeneratedOutput } from '$lib/helpers/formatOutput';
import { validateGeneratePayload, ValidationError } from '$lib/helpers/validateInput';
import { generateContent } from '$lib/server/llm/openrouter';
import { fetchUrl } from '$lib/server/extract/fetchUrl';
import { extractArticle } from '$lib/server/extract/extractArticle';
import { prepareContext } from '$lib/server/extract/prepareContext';
import { fetchReadableUrl } from '$lib/server/extract/fetchReadableUrl';

function encode(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST({ request }) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          encoder.encode(encode('status', { message: 'Validating request...' }))
        );

        const rawPayload = await request.json();
        const payload = validateGeneratePayload(rawPayload);

        let sourceText = '';
        let sourceType: 'text' | 'url' = 'text';
        let sourceUrl: string | undefined;

        const cleanedInputText = cleanText(payload.text ?? '', {
          preserveParagraphs: true,
          maxLength: 40_000
        });

        // SOURCE OF TRUTH:
        // If editor text exists, use it first.
        if (cleanedInputText.length >= 100) {
          sourceText = cleanedInputText;
          sourceType = 'text';
          sourceUrl = payload.url;

          controller.enqueue(
            encoder.encode(
              encode('status', { message: 'Using editor content for generation...' })
            )
          );
        } else if (payload.url) {
          sourceType = 'url';
          sourceUrl = payload.url;

          controller.enqueue(
            encoder.encode(encode('status', { message: 'Fetching article...' }))
          );

          try {
            const fetched = await fetchUrl(payload.url);

            controller.enqueue(
              encoder.encode(encode('status', { message: 'Extracting readable text...' }))
            );

            const article = extractArticle(fetched.html, fetched.finalUrl);

            controller.enqueue(
              encoder.encode(encode('status', { message: 'Preparing context...' }))
            );

            sourceText = await prepareContext(article.text, {
              title: article.title,
              maxChunks: 5
            });
          } catch (primaryError) {
            console.warn('[api/generate] direct URL extraction failed, using readable fallback');
            console.warn(primaryError instanceof Error ? primaryError.message : primaryError);

            controller.enqueue(
              encoder.encode(
                encode('status', { message: 'Direct fetch failed, using readable fallback...' })
              )
            );

            const readable = await fetchReadableUrl(payload.url);
            sourceText = cleanText(readable.text, {
              preserveParagraphs: true,
              maxLength: 40_000
            });
          }
        } else {
          throw new ValidationError('No usable content provided.', [
            'Provide source text or a URL.'
          ]);
        }

        controller.enqueue(
          encoder.encode(encode('status', { message: 'Generating content...' }))
        );

        const llmResult = await generateContent({
          ...payload,
          text: sourceText
        });

        const output = formatGeneratedOutput(
          llmResult.content,
          payload.platform,
          payload.format,
          sourceType,
          sourceUrl
        );

        const textToStream = [
          `Title: ${output.title}`,
          `Hook: ${output.hook ?? ''}`,
          `Body: ${output.body}`,
          `CTA: ${output.cta ?? ''}`,
          `Hashtags: ${(output.hashtags ?? []).join(', ')}`,
          `Notes: ${output.notes ?? ''}`
        ].join('\n');

        controller.enqueue(
          encoder.encode(encode('status', { message: 'Streaming result...' }))
        );

        const chunkSize = 120;
        for (let i = 0; i < textToStream.length; i += chunkSize) {
          const chunk = textToStream.slice(i, i + chunkSize);
          controller.enqueue(encoder.encode(encode('chunk', { text: chunk })));
          await new Promise((resolve) => setTimeout(resolve, 18));
        }

        controller.enqueue(
          encoder.encode(
            encode('done', {
              output,
              meta: {
                provider: llmResult.provider,
                model: llmResult.model,
                inputLength: sourceText.length,
                generatedAt: new Date().toISOString(),
                sourceType
              }
            })
          )
        );

        controller.close();
      } catch (error) {
        console.error('[api/generate] failed');
        console.error(error);

        const message =
          error instanceof ValidationError
            ? `${error.message} ${error.details.join(' ')}`
            : error instanceof Error
              ? error.message
              : 'Unknown error';

        controller.enqueue(encoder.encode(encode('error', { message })));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}