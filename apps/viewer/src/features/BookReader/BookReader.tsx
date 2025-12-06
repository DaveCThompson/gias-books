// src/features/BookReader/BookReader.tsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import { useSettingsStore } from '@/data/settings.store';
import { useProgressStore } from '@/data/progress.store';
import { useNarration } from '@/hooks/useNarration';
import { useAccessibilityNavigation } from '@/hooks/useAccessibilityNavigation';
import { BookData } from '@gia/schemas';
import Page from './Page';
import NarrationControls from './components/NarrationControls';
import Navigation from './components/Navigation';
import { GestureCanvas } from './components/GestureCanvas';
import { DesktopClickZones } from './components/DesktopClickZones';
import styles from './BookReader.module.css';

interface BookReaderProps {
  bookData: BookData;
  currentPage: number;
}

const BookReader: React.FC<BookReaderProps> = ({ bookData, currentPage: initialPage }) => {
  const router = useRouter();
  const { readingMode } = useSettingsStore();
  const { getLastReadPage, setLastReadPage } = useProgressStore();

  // Optimistic State: Manage page locally for instant feedback
  const [internalPage, setInternalPage] = useState(initialPage);
  const [direction, setDirection] = useState(0);
  const lastActionTime = useRef(0);

  // Sync internal state if props change (e.g. browser back button or deep link)
  useEffect(() => {
    const timeSinceLastAction = Date.now() - lastActionTime.current;
    if (timeSinceLastAction > 2000 && initialPage !== internalPage) {
      setInternalPage(initialPage);
    }
  }, [initialPage, internalPage]);

  const activePage = bookData.pages[internalPage - 1];
  const totalPages = bookData.pages.length;

  // Audio Hook - using consolidated useNarration
  const { hasError: _audioError, errorMessage: _audioErrorMessage } = useNarration({
    src: activePage?.narrationUrl,
    isPlaying: readingMode === 'narrated',
    onEnd: () => {
      // Auto-advance logic could go here if desired
    },
    onError: (error) => {
      console.warn('Narration error:', error.message);
    },
  });

  // Navigation Handlers
  const handlePrev = useCallback(() => {
    if (internalPage > 1) {
      lastActionTime.current = Date.now();
      setDirection(-1);
      const newPage = internalPage - 1;

      // Optimistic Update
      setInternalPage(newPage);
      setLastReadPage(bookData.slug, newPage);

      // Router update (shallow)
      router.replace(`/${bookData.slug}/${newPage}`, undefined, { shallow: true });
    }
  }, [internalPage, bookData.slug, router, setLastReadPage]);

  const handleNext = useCallback(() => {
    if (internalPage < totalPages) {
      lastActionTime.current = Date.now();
      setDirection(1);
      const newPage = internalPage + 1;

      // Optimistic Update
      setInternalPage(newPage);
      setLastReadPage(bookData.slug, newPage);

      // Router update (shallow)
      router.replace(`/${bookData.slug}/${newPage}`, undefined, { shallow: true });
    }
  }, [internalPage, totalPages, bookData.slug, router, setLastReadPage]);

  // A11y Hook (Keyboard + Screen Reader)
  const { a11yStatus, containerRef } = useAccessibilityNavigation({
    currentPage: internalPage,
    totalPages,
    onPrev: handlePrev,
    onNext: handleNext,
  });

  // Play/Pause Toggle
  const handlePlayPause = useCallback(() => {
    if (readingMode === 'narrated') {
      useSettingsStore.getState().toggleReadingMode();
    } else {
      useSettingsStore.getState().toggleReadingMode();
    }
  }, [readingMode]);

  // Restore last read page on mount
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current) {
      const lastRead = getLastReadPage(bookData.slug);
      if (lastRead && lastRead !== initialPage) {
        setInternalPage(lastRead);
        router.replace(`/${bookData.slug}/${lastRead}`, undefined, { shallow: true });
      }
      hasInitialized.current = true;
    }
  }, [bookData.slug, initialPage, getLastReadPage, router]);

  // Framer Motion Variants
  // Fix: Entering page has higher z-index and exiting page fades out
  // to prevent text stacking during transitions
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 1,
      zIndex: 2, // Higher z-index for entering page (slides on top)
      scale: 1,
    }),
    center: {
      x: 0,
      opacity: 1,
      zIndex: 1, // Normal z-index when centered
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0, // Fade out to prevent text stacking
      zIndex: 0, // Lower z-index for exiting page (goes behind)
      scale: 0.95,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  // --- Mood Interpolation Logic ---
  const x = useMotionValue(0);
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const dragRange = screenWidth / 2;

  // Determine moods
  const currMood = activePage.mood || 'calm';
  const prevPage = internalPage > 1 ? bookData.pages[internalPage - 2] : null;
  const nextPage = internalPage < totalPages ? bookData.pages[internalPage] : null;

  const prevMood = prevPage?.mood || currMood;
  const nextMood = nextPage?.mood || currMood;

  // Transform x to opacity
  const opacityNext = useTransform(x, [0, -dragRange], [0, 1]);
  const opacityPrev = useTransform(x, [0, dragRange], [0, 1]);
  const opacityCurr = useTransform(x, [-dragRange, 0, dragRange], [0, 1, 0]);

  // Reset x on page change
  useEffect(() => {
    x.set(0);
  }, [internalPage, x]);

  const getGradient = (mood: string) => `var(--gradient-${mood})`;

  return (
    <div
      className={styles.bookReaderContainer}
      data-mood={currMood}
      ref={containerRef}
      tabIndex={-1}
    >
      {/* Mood Layers */}
      <motion.div
        className={styles.moodLayer}
        style={{ background: getGradient(currMood), opacity: opacityCurr }}
      />
      {prevPage && (
        <motion.div
          className={styles.moodLayer}
          style={{ background: getGradient(prevMood), opacity: opacityPrev }}
        />
      )}
      {nextPage && (
        <motion.div
          className={styles.moodLayer}
          style={{ background: getGradient(nextMood), opacity: opacityNext }}
        />
      )}

      {a11yStatus}

      <Navigation
        currentPage={internalPage}
        totalPages={totalPages}
        onPrev={handlePrev}
        onNext={handleNext}
        onPlayPause={handlePlayPause}
        isPlaying={readingMode === 'narrated'}
        hasNarration={!!activePage.narrationUrl}
      />

      <DesktopClickZones
        onPrev={handlePrev}
        onNext={handleNext}
        canPrev={internalPage > 1}
        canNext={internalPage < totalPages}
      />

      <GestureCanvas
        isFirstPage={internalPage === 1}
        isLastPage={internalPage === totalPages}
      >
        <AnimatePresence
          initial={false}
          custom={direction}
          mode="popLayout"
        >
          <motion.div
            key={internalPage}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            style={{ x }}
            className={styles.pageWrapper}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                handleNext();
              } else if (swipe > swipeConfidenceThreshold) {
                handlePrev();
              }
            }}
          >
            <Page pageData={activePage} isActive={true} />
          </motion.div>
        </AnimatePresence>
      </GestureCanvas>

      <NarrationControls />
    </div>
  );
};

export default BookReader;
