import React from 'react';
import { cn } from '@gia/utils';
import styles from './DesktopClickZones.module.css';

interface DesktopClickZonesProps {
    onPrev: () => void;
    onNext: () => void;
    canPrev: boolean;
    canNext: boolean;
}

export const DesktopClickZones: React.FC<DesktopClickZonesProps> = ({
    onPrev,
    onNext,
    canPrev,
    canNext,
}) => {
    return (
        <>
            {/* Left Zone (Prev) */}
            <button
                className={cn(styles.zone, styles.leftZone, !canPrev && styles.disabled)}
                onClick={onPrev}
                disabled={!canPrev}
                aria-label="Previous Page"
                tabIndex={-1} // We have keyboard nav elsewhere, this is purely for mouse
            >
                <div className={styles.indicator}>
                    <span className={styles.arrow}>&larr;</span>
                </div>
            </button>

            {/* Right Zone (Next) */}
            <button
                className={cn(styles.zone, styles.rightZone, !canNext && styles.disabled)}
                onClick={onNext}
                disabled={!canNext}
                aria-label="Next Page"
                tabIndex={-1}
            >
                <div className={styles.indicator}>
                    <span className={styles.arrow}>&rarr;</span>
                </div>
            </button>
        </>
    );
};
