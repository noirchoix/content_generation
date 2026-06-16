import type { BrandProfile } from '$lib/types/brand';

export const defaultBrandProfiles: BrandProfile[] = [
  {
    brand_name: 'Default Agency Voice',
    tone: 'Clear, confident, practical',
    target_audience: 'Founders and marketing teams',
    content_pillars: ['growth', 'strategy', 'content operations'],
    forbidden_phrases: ['game changer', 'synergy'],
    style_rules: ['Use strong hooks', 'Keep paragraphs short', 'Avoid robotic filler'],
    cta_style: 'Direct but not pushy'
  }
];
