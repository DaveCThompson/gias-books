// src/features/BookReader/components/Navigation.tsx

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Gear, Play, Pause, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { SettingsDialog } from './SettingsDialog';
import { cn } from '@gia/utils';
import styles from './Navigation.module.css';

interface NavigationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  isPlaying: boolean;
  hasNarration: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onPlayPause,
  isPlaying,
  hasNarration,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div className={styles.navContainer}>
        <div className={styles.leftControls}>
          <Link href="/" className={styles.logoLink} aria-label="Return to Library">
            <Image src="/madoodle-logo.svg" alt="Madoodle Logo" width={100} height={24} />
          </Link>
        </div>

        <div className={styles.pageInfo}>
          <button
            onClick={onPlayPause}
            disabled={!hasNarration}
            className={cn(styles.playButton, !hasNarration && styles.disabled)}
            aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
          >
            {isPlaying ? <Pause weight="duotone" size={20} /> : <Play weight="duotone" size={20} />}
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className={styles.rightControls}>
          <button
            onClick={onPrev}
            disabled={currentPage === 1}
            className={cn(styles.navButton, currentPage === 1 && styles.disabled)}
            aria-label="Previous page"
          >
            <CaretLeft weight="duotone" size={18} />
            <span>Prev</span>
          </button>
          <button
            onClick={onNext}
            disabled={currentPage === totalPages}
            className={cn(styles.navButton, currentPage === totalPages && styles.disabled)}
            aria-label="Next page"
          >
            <span>Next</span>
            <CaretRight weight="duotone" size={18} />
          </button>
          <button
            className={styles.settingsButton}
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
          >
            <Gear weight="duotone" size={22} />
          </button>
        </div>
      </div>
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
};

export default Navigation;
