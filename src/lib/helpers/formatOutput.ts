import type { ContentFormat, GeneratedAsset } from '$lib/types/content';
import type { Platform } from '$lib/types/platform';

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

function parseHashtags(value: string): string[] {
  if (!value.trim()) return [];

  return value
    .split(/[,\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const cleaned = item.replace(/^#+/, '').trim();
      return cleaned ? `#${cleaned}` : '';
    })
    .filter(Boolean);
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
  const body = fields.body.join('\n\n').trim() || safeRaw || 'No content generated.';
  const cta = fields.cta.join(' ').trim() || undefined;
  const hashtags = parseHashtags(fields.hashtags.join(', ').trim());
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