// src/data/constants.ts
// Static book data imports from shared @gia/content package

import { BookData } from '@gia/schemas';

// Import book data from shared content package
// Note: Using require for JSON to avoid TypeScript module resolution issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const slimeyData = require('@gia/content/slimey/data.json');

// This map centralizes all book data, making it easy to add new books.
// The key is the book's slug, which is used in the URL.
export const bookDataMap: { [key: string]: BookData } = {
  slimey: slimeyData as BookData,
};

// We can also export an array of all books for easier mapping in UI components.
export const allBooks: BookData[] = Object.values(bookDataMap);

/**
 * Navigation and gesture thresholds
 */
export const NAVIGATION = {
  /** Swipe power threshold for page navigation */
  SWIPE_THRESHOLD: 10000,
  /** Vertical drag distance to trigger exit (px) */
  EXIT_THRESHOLD: 100,
} as const;

/**
 * VFX configuration
 */
export const VFX = {
  /** Number of sparkle particles to render */
  SPARKLE_COUNT: 12,
} as const;

/**
 * Audio fade durations (ms)
 */
export const AUDIO = {
  FADE_IN_MS: 500,
  FADE_OUT_MS: 300,
  /** Delay before starting fade-in after play */
  FADE_START_DELAY_MS: 50,
} as const;
