import type { ContentFormat } from '$lib/types/content';
import type { Platform } from '$lib/types/platform';

export const PLATFORM_HASHTAG_LIMIT: Record<Platform, number> = {
  instagram: 5,
  linkedin: 4,
  x: 2,
  tiktok: 5
};

export const PLATFORM_GUIDANCE: Record<Platform, string> = {
  instagram: [
    'Write for Instagram. Make the first sentence visual and emotionally clear.',
    'Use short paragraphs, mobile-friendly line breaks, and reader-facing language.',
    'For captions: lead with a hook, provide one useful insight or story, then close with a simple action.',
    'For carousel outlines: make each slide a clear single idea with a strong first slide and a save/share CTA.',
    `Use no more than ${PLATFORM_HASHTAG_LIMIT.instagram} hashtags.`
  ].join(' '),
  linkedin: [
    'Write for LinkedIn. Prioritize credibility, practical insight, professional relevance, and a clear business lesson.',
    'Avoid corporate filler. Use a strong first line, clean spacing, and a conversational but polished tone.',
    'Do not put external links in the main body unless the source content requires it; suggest link-in-comments in Notes when useful.',
    `Use no more than ${PLATFORM_HASHTAG_LIMIT.linkedin} hashtags.`
  ].join(' '),
  x: [
    'Write for X. Prioritize brevity, speed, sharp phrasing, and repost-friendly lines.',
    'Keep each idea compact. If the format is not a thread, keep the output short enough for a single post when possible.',
    'Avoid long CTAs and avoid hashtag stuffing.',
    `Use no more than ${PLATFORM_HASHTAG_LIMIT.x} hashtags.`
  ].join(' '),
  tiktok: [
    'Write for TikTok. Prioritize spoken-flow writing, a fast first-second hook, and a script-like rhythm.',
    'Use natural words that can be read aloud. Include visual/action cues only when helpful.',
    `Use no more than ${PLATFORM_HASHTAG_LIMIT.tiktok} hashtags.`
  ].join(' ')
};

export const FORMAT_GUIDANCE: Record<ContentFormat, string> = {
  caption: [
    'Produce one strong post caption.',
    'Structure: hook, short context, useful value or story, CTA, hashtags.',
    'Keep the caption publish-ready, not a planning note.'
  ].join(' '),
  carousel: [
    'Produce a carousel-ready outline.',
    'Include a strong cover slide, one idea per slide, and a final CTA slide.',
    'Make the body easy to convert into slides without extra rewriting.'
  ].join(' '),
  'video-script': [
    'Produce a short-form video script.',
    'Structure: 0-2 second hook, setup, value beats, closing CTA.',
    'Use spoken language and keep sentences short.'
  ].join(' '),
  'hook-list': [
    'Produce multiple hook options plus a short usage note.',
    'Make each hook specific, non-generic, and platform-native.',
    'Do not pad with repetitive variations.'
  ].join(' ')
};

export const UNIVERSAL_CONTENT_RULES = [
  'Stay faithful to the source material. Do not invent unsupported facts, numbers, claims, or testimonials.',
  'Lead with audience value, not brand self-promotion.',
  'Use simple, clear English and short paragraphs.',
  'Use line breaks for readability.',
  'Avoid generic motivational filler, vague claims, and AI-sounding phrasing.',
  'Use platform-native structure rather than cross-posting the same post everywhere.',
  'The CTA should match the platform and should not feel forced.',
  'Hashtags must be relevant, deduplicated, and limited to the platform cap.'
];
