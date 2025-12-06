// src/features/BookReader/BookReader.tsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { useSettingsStore } from '@/data/settings.store';
import { useProgressStore } from '@/data/progress.store';
import { useNarration } from '@/hooks/useNarration';
import { useAccessibilityNavigation } from '@/hooks/useAccessibilityNavigation';
import { BookData } from '@gia/schemas';
import NarrationControls from './components/NarrationControls';
import Navigation from './components/Navigation';
import { DesktopClickZones } from './components/DesktopClickZones';
import PageCarousel, { PageCarouselRef } from './components/PageCarousel';
import styles from './BookReader.module.css';

// Map mood names to CSS variable names
const moodToCssVar: Record<string, string> = {
  whimsical: 'var(--gradient-whimsical)',
  calm: 'var(--gradient-calm)',
  playful: 'var(--gradient-playful)',
  mysterious: 'var(--gradient-mysterious)',
  adventurous: 'var(--gradient-adventurous)',
  cozy: 'var(--gradient-cozy)',
  dreamy: 'var(--gradient-dreamy)',
  spooky: 'var(--gradient-spooky)',
  tense: 'var(--gradient-tense)',
  joyful: 'var(--gradient-joyful)',
};

const getGradient = (mood: string) => moodToCssVar[mood] || moodToCssVar.calm;

interface BookReaderProps {
  bookData: BookData;
  currentPage: number;
}

const BookReader: React.FC<BookReaderProps> = ({ bookData, currentPage: initialPage }) => {
  const router = useRouter();
  const { readingMode } = useSettingsStore();
  const { getLastReadPage, setLastReadPage } = useProgressStore();
  const carouselRef = useRef<PageCarouselRef>(null);

  // Optimistic State: Manage page locally for instant feedback
  const [internalPage, setInternalPage] = useState(initialPage);

  // Sync internal state if props change (e.g. browser back button or deep link)
  useEffect(() => {
    if (initialPage !== internalPage) {
      setInternalPage(initialPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPage]);

  const activePage = bookData.pages[internalPage - 1];
  const totalPages = bookData.pages.length;

  // Audio Hook
  useNarration({
    src: activePage?.narrationUrl,
    isPlaying: readingMode === 'narrated',
    onEnd: () => { },
    onError: (error) => console.warn('Narration error:', error.message),
  });

  // Page change handler for carousel
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    setInternalPage(newPage);
    setLastReadPage(bookData.slug, newPage);
    router.push(`/${bookData.slug}/${newPage}`, undefined, { shallow: true });
  }, [totalPages, bookData.slug, router, setLastReadPage]);

  // Navigation handlers for click zones and keyboard
  const handlePrev = useCallback(() => {
    if (internalPage > 1) {
      // Try to use carousel's goToPage for animation
      if (carouselRef.current?.goToPage) {
        carouselRef.current.goToPage(internalPage - 1);
      } else {
        handlePageChange(internalPage - 1);
      }
    }
  }, [internalPage, handlePageChange]);

  const handleNext = useCallback(() => {
    if (internalPage < totalPages) {
      if (carouselRef.current?.goToPage) {
        carouselRef.current.goToPage(internalPage + 1);
      } else {
        handlePageChange(internalPage + 1);
      }
    }
  }, [internalPage, totalPages, handlePageChange]);

  // A11y Hook (Keyboard + Screen Reader)
  const { a11yStatus } = useAccessibilityNavigation({
    currentPage: internalPage,
    totalPages,
    onPrev: handlePrev,
    onNext: handleNext,
  });

  // Play/Pause Toggle
  const handlePlayPause = useCallback(() => {
    useSettingsStore.getState().toggleReadingMode();
  }, []);

  // Restore last read page on mount
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current) {
      if (initialPage === 1) {
        const lastRead = getLastReadPage(bookData.slug);
        if (lastRead && lastRead !== 1) {
          setInternalPage(lastRead);
          router.replace(`/${bookData.slug}/${lastRead}`, undefined, { shallow: true });
        }
      }
      hasInitialized.current = true;
    }
  }, [bookData.slug, initialPage, getLastReadPage, router]);

  // Calculate mood for background - just use current page's mood
  // The CSS transition handles smooth blending
  const currMood = activePage?.mood || 'calm';

  return (
    <div className={styles.bookReaderContainer}>
      {/* Single mood gradient layer with CSS transition */}
      <div
        className={styles.moodLayer}
        style={{ background: getGradient(currMood) }}
      />

      {a11yStatus}

      <Navigation
        currentPage={internalPage}
        totalPages={totalPages}
        onPrev={handlePrev}
        onNext={handleNext}
        onPlayPause={handlePlayPause}
        isPlaying={readingMode === 'narrated'}
        hasNarration={!!activePage?.narrationUrl}
      />

      <DesktopClickZones
        onPrev={handlePrev}
        onNext={handleNext}
        canPrev={internalPage > 1}
        canNext={internalPage < totalPages}
      />

      {/* Page Carousel - handles gestures and animations */}
      <PageCarousel
        ref={carouselRef}
        pages={bookData.pages}
        currentPage={internalPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <NarrationControls />
    </div>
  );
};

export default BookReader;
