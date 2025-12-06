// src/data/useReadingMode.ts

import { useSettingsStore } from './settings.store';

/**
 * A custom hook to access reading mode state and actions.
 * This pattern is useful for creating simple selectors into your store.
 */
export const useReadingMode = () => {
  const { readingMode, toggleReadingMode } = useSettingsStore((state) => ({
    readingMode: state.readingMode,
    toggleReadingMode: state.toggleReadingMode,
  }));

  return { readingMode, toggleReadingMode };
};
