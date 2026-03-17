import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { BrandProfile } from '$lib/types/brand';

const memory = new Map<string, BrandProfile>();
const filePath = path.resolve('static', 'brand-memory.json');

async function readFileStore(): Promise<Record<string, BrandProfile>> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as Record<string, BrandProfile>;
  } catch {
    return {};
  }
}

async function writeFileStore(data: Record<string, BrandProfile>): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Cloudflare / read-only env: silently fall back to memory.
  }
}

export async function saveBrandProfile(profile: BrandProfile): Promise<void> {
  memory.set(profile.brand_name, profile);
  const fileStore = await readFileStore();
  fileStore[profile.brand_name] = profile;
  await writeFileStore(fileStore);
}

export async function getBrandProfiles(): Promise<BrandProfile[]> {
  const fileStore = await readFileStore();
  for (const [key, value] of Object.entries(fileStore)) {
    memory.set(key, value);
  }
  return [...memory.values()];
}

export async function getBrandProfile(brandName: string): Promise<BrandProfile | null> {
  const profiles = await getBrandProfiles();
  return profiles.find((profile) => profile.brand_name === brandName) ?? null;
}
