import { json } from '@sveltejs/kit';
import fs from 'node:fs/promises';
import path from 'node:path';
import { cleanText } from '$lib/helpers/cleanText';

const STORE_PATH = path.resolve('static/brand-memory.json');

type StoredBrandMemory = {
  brand_name: string;
  voice: string;
};

async function readStore(): Promise<StoredBrandMemory[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const items = await readStore();
  return json({ ok: true, items });
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const brandName = cleanText(String(body?.brand_name ?? ''), {
      preserveParagraphs: false,
      maxLength: 120
    });
    const voice = cleanText(String(body?.voice ?? ''), {
      preserveParagraphs: true,
      maxLength: 2000
    });

    if (!brandName || !voice) {
      return json({ ok: false, error: 'brand_name and voice are required.' }, { status: 400 });
    }

    const items = await readStore();
    const next = [
      ...items.filter((item) => item.brand_name !== brandName),
      { brand_name: brandName, voice }
    ];

    await fs.writeFile(STORE_PATH, JSON.stringify(next, null, 2), 'utf8');

    return json({ ok: true, items: next });
  } catch (error) {
    return json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Brand memory update failed.'
      },
      { status: 500 }
    );
  }
}
