// src/features/BookReader/Page.tsx

import React, { useEffect } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { PageData } from '@gia/schemas';
import { InteractiveText } from './InteractiveText';
import { ParallaxIllustration } from './components/ParallaxIllustration';
import { VFXRenderer } from './components/VFXRenderer';
import { playSFXFromEffects } from './components/SFXPlayer';
import { cn } from '@gia/utils';
import styles from './Page.module.css';

interface PageProps {
  pageData: PageData;
  isActive: boolean;
}

const Page: React.FC<PageProps> = ({ pageData, isActive }) => {
  // Play SFX effects on page enter/exit
  useEffect(() => {
    if (isActive) {
      playSFXFromEffects(pageData.effects, 'onPageEnter');
    }
    return () => {
      if (isActive) {
        playSFXFromEffects(pageData.effects, 'onPageExit');
      }
    };
  }, [isActive, pageData.effects]);

  // Determine layout class
  const layoutClass = {
    fullbleed: styles.layoutFullbleed,
    split: styles.layoutSplit,
    textOnly: styles.layoutTextOnly,
  }[pageData.layout ?? 'split'];

  return (
    <Tooltip.Provider delayDuration={100}>
      <div className={cn(styles.pageContainer, layoutClass)}>
        {/* VFX Effects Layer */}
        <VFXRenderer
          effects={pageData.effects}
          trigger="onPageEnter"
          isActive={isActive}
        />

        {/* Illustration (supports both string and parallax object) */}
        {pageData.illustration && (
          <div className={styles.imageContainer}>
            <ParallaxIllustration
              illustration={pageData.illustration}
              mask={pageData.mask}
              pageNumber={pageData.pageNumber}
            />
          </div>
        )}

        {/* Text Content */}
        <p className={styles.text}>
          <InteractiveText text={pageData.text} />
        </p>
      </div>
    </Tooltip.Provider>
  );
};

export default Page;
