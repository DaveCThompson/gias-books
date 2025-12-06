// src/data/stores/progress.store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Stores a map of { bookSlug: lastReadPageNumber }
type ProgressStateMap = {
  [slug: string]: number;
};

interface ProgressState {
  progress: ProgressStateMap;
  getLastReadPage: (slug: string) => number | undefined;
  setLastReadPage: (slug: string, pageNumber: number) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},
      getLastReadPage: (slug) => {
        return get().progress[slug];
      },
      setLastReadPage: (slug, pageNumber) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [slug]: pageNumber,
          },
        }));
      },
    }),
    {
      name: 'gia-t-books-progress',
    }
  )
);
