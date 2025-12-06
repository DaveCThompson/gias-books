// src/data/stores/settings.store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ReadingMode = 'narrated' | 'selfRead';
export type ThemePreference = 'system' | 'light' | 'dark';

interface SettingsState {
  readingMode: ReadingMode;
  toggleReadingMode: () => void;
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      readingMode: 'selfRead',
      toggleReadingMode: () =>
        set((state) => ({
          readingMode:
            state.readingMode === 'narrated' ? 'selfRead' : 'narrated',
        })),
      theme: 'system',
      setTheme: (newTheme) => set({ theme: newTheme }),
    }),
    {
      name: 'gia-t-books-settings',
    }
  )
);
