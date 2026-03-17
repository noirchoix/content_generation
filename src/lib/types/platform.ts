export const SUPPORTED_PLATFORMS = ['instagram', 'linkedin', 'x', 'tiktok'] as const;

export type Platform = (typeof SUPPORTED_PLATFORMS)[number];

export function isPlatform(value: unknown): value is Platform {
  return typeof value === 'string' && SUPPORTED_PLATFORMS.includes(value as Platform);
}
