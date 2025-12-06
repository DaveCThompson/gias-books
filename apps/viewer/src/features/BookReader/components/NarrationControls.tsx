// src/features/BookReader/NarrationControls.tsx

import React from 'react';
import { useSettingsStore } from '@/data/settings.store';
import styles from './NarrationControls.module.css';

const NarrationControls = () => {
  const { readingMode, toggleReadingMode } = useSettingsStore();

  return (
    <div className={styles.controlsContainer}>
      <button onClick={toggleReadingMode} className={styles.toggleButton}>
        {readingMode === 'narrated' ? 'Switch to "I\'ll Read"' : 'Switch to "Read to Me"'}
      </button>
    </div>
  );
};

export default NarrationControls;
