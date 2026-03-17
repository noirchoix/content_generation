import type { Platform } from '$lib/types/platform';

export const PLATFORM_OPTIONS: Array<{
  value: Platform;
  label: string;
  description: string;
}> = [
  {
    value: 'instagram',
    label: 'Instagram',
    description: 'Visual-first captions with strong hooks and clean hashtag packaging.'
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
    description: 'Professional insight-led posts with stronger business framing.'
  },
  {
    value: 'x',
    label: 'X',
    description: 'Shorter, sharper, high-velocity copy designed for quick engagement.'
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    description: 'Short-form spoken copy and script-oriented structure.'
  }
];
