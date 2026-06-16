import type { ContentFormat, GeneratedAsset } from '$lib/types/content';
import type { Platform } from '$lib/types/platform';
import { PLATFORM_HASHTAG_LIMIT } from '$lib/server/llm/prompts';

type OutputFieldKey = 'title' | 'hook' | 'body' | 'cta' | 'hashtags' | 'notes';

const FIELD_LABEL_MAP: Record<string, OutputFieldKey> = {
  title: 'title',
  hook: 'hook',
  body: 'body',
  caption: 'body',
  content: 'body',
  cta: 'cta',
  'call to action': 'cta',
  hashtags: 'hashtags',
  tags: 'hashtags',
  notes: 'notes',
  note: 'notes'
};

function normalizeLabel(label: string): OutputFieldKey | null {
  const cleaned = label
    .toLowerCase()
    .replace(/[*#:`-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return FIELD_LABEL_MAP[cleaned] ?? null;
}

function normalizeHashtag(value: string): string | null {
  const cleaned = value
    .trim()
    .replace(/^#+/, '')
    .replace(/[^\p{L}\p{N}_-]/gu, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  if (!cleaned || /^\d+$/.test(cleaned)) return null;
  return `#${cleaned}`;
}

function parseHashtags(value: string, platform: Platform): string[] {
  if (!value.trim()) return [];

  const limit = PLATFORM_HASHTAG_LIMIT[platform] ?? 5;
  const rawTags = value.match(/#[\p{L}\p{N}_-]+/gu) ?? value.split(/[,\s]+/);
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const raw of rawTags) {
    const normalized = normalizeHashtag(raw);
    if (!normalized) continue;

    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    tags.push(normalized);

    if (tags.length >= limit) break;
  }

  return tags;
}

function splitTrailingHashtagBlock(body: string): { body: string; hashtagText: string } {
  const lines = body.split('\n');
  const collected: string[] = [];

  while (lines.length > 0) {
    const last = lines[lines.length - 1].trim();

    if (!last) {
      lines.pop();
      continue;
    }

    const onlyTags = /^(#[\p{L}\p{N}_-]+[\s,]*)+$/u.test(last);
    const labelledTags = /^hashtags?\s*:/i.test(last);

    if (!onlyTags && !labelledTags) break;

    collected.unshift(last.replace(/^hashtags?\s*:/i, '').trim());
    lines.pop();
  }

  return {
    body: lines.join('\n').trim(),
    hashtagText: collected.join(', ')
  };
}

export function formatGeneratedOutput(
  raw: string,
  platform: Platform,
  format: ContentFormat,
  sourceType?: 'text' | 'url',
  sourceUrl?: string
): GeneratedAsset {
  const safeRaw = typeof raw === 'string' ? raw.trim() : '';

  const fields: Record<OutputFieldKey, string[]> = {
    title: [],
    hook: [],
    body: [],
    cta: [],
    hashtags: [],
    notes: []
  };

  let currentField: OutputFieldKey | null = null;

  const lines = safeRaw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of lines) {
    const matched = line.match(/^([A-Za-z\s]+)\s*:\s*(.*)$/);

    if (matched) {
      const [, rawLabel, rawValue] = matched;
      const normalizedField = normalizeLabel(rawLabel);

      if (normalizedField) {
        currentField = normalizedField;

        if (rawValue?.trim()) {
          fields[normalizedField].push(rawValue.trim());
        }

        continue;
      }
    }

    if (!matched && currentField === null && line.toLowerCase().startsWith('cta')) {
      currentField = 'cta';
      continue;
    }

    if (currentField) {
      fields[currentField].push(line);
    } else {
      fields.body.push(line);
    }
  }

  const title = fields.title.join(' ').trim() || `${platform} ${format}`;
  const hook = fields.hook.join(' ').trim() || undefined;
  const rawBody = fields.body.join('\n\n').trim() || safeRaw || 'No content generated.';

  const { body: bodyWithoutTrailingTags, hashtagText: trailingHashtags } =
    splitTrailingHashtagBlock(rawBody);

  const body = bodyWithoutTrailingTags || rawBody;
  const cta = fields.cta.join(' ').trim() || undefined;

  const hashtags = parseHashtags(
    [fields.hashtags.join(', '), trailingHashtags].filter(Boolean).join(', '),
    platform
  );

  const notesParts = [...fields.notes];

  if (sourceType) {
    notesParts.push(`Source type: ${sourceType}`);
  }

  if (sourceUrl) {
    notesParts.push(`Source URL: ${sourceUrl}`);
  }

  const notes = notesParts.join(' | ').trim() || undefined;

  return {
    title,
    platform,
    format,
    hook,
    body,
    cta,
    hashtags,
    notes
  };
}