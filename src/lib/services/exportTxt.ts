import type { GeneratedAsset } from '$lib/types/generation';

export function buildTxtPack(assets: GeneratedAsset[]): string {
  return assets
    .map(
      (asset, index) => `ASSET ${index + 1}\nTitle: ${asset.title}\nPlatform: ${asset.platform}\nType: ${asset.type}\n\nHook:\n${asset.hook}\n\nBody:\n${asset.body}\n\nCTA:\n${asset.cta}\n\nHashtags:\n${asset.hashtags.join(' ')}\n\nNotes:\n${asset.notes ?? ''}`
    )
    .join('\n\n------------------------------\n\n');
}
