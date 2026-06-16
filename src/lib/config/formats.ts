import type { ContentFormat } from '$lib/types/content';

export const FORMAT_OPTIONS: Array<{
  value: ContentFormat;
  label: string;
  description: string;
}> = [
  {
    value: 'caption',
    label: 'Caption',
    description: 'One strong post caption with hook, body, CTA, and hashtags.'
  },
  {
    value: 'carousel',
    label: 'Carousel',
    description: 'A carousel outline that can be converted into slides.'
  },
  {
    value: 'video-script',
    label: 'Video Script',
    description: 'A short-form spoken script for reels, shorts, or TikTok.'
  },
  {
    value: 'hook-list',
    label: 'Hook List',
    description: 'A set of hooks with compact supporting copy.'
  }
];
