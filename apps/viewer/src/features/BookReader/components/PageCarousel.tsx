// src/features/BookReader/components/PageCarousel.tsx

import React, { useMemo, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useGesture } from '@use-gesture/react';
import { PageData } from '@gia/schemas';
import Page from '../Page';
import styles from './PageCarousel.module.css';

// Spring physics for premium page-flip feel
const SPRING_CONFIG = {
    stiffness: 400,
    damping: 40,
    mass: 0.8,
};

// Velocity threshold for swipe detection
const SWIPE_VELOCITY_THRESHOLD = 500;
// Position threshold (fraction of screen width)
const SWIPE_POSITION_THRESHOLD = 0.3;

interface PageCarouselProps {
    pages: PageData[];
    currentPage: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
    onDragProgress?: (progress: number) => void;
}

export interface PageCarouselRef {
    goToPage: (page: number) => void;
}

// Get screen width for calculations
const getScreenWidth = () => typeof window !== 'undefined' ? window.innerWidth : 1000;

export const PageCarousel = forwardRef<PageCarouselRef, PageCarouselProps>(function PageCarouselComponent({
    pages,
    currentPage,
    totalPages,
    onPageChange,
    onDragProgress,
}, ref) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Compute 3-page window: [prev, current, next]
    const pageWindow = useMemo(() => {
        const prevPage = currentPage > 1 ? pages[currentPage - 2] : null;
        const currPage = pages[currentPage - 1];
        const nextPage = currentPage < totalPages ? pages[currentPage] : null;
        return [prevPage, currPage, nextPage];
    }, [currentPage, pages, totalPages]);

    // Motion value for track position (offset from center)
    const x = useMotionValue(0);

    // Spring-animated version of x for smooth transitions
    const springX = useSpring(x, SPRING_CONFIG);

    // Transform for track position: center page is at -100vw (second slot)
    const trackX = useTransform(springX, (val: number) => {
        const screenWidth = getScreenWidth();
        return -screenWidth + val;
    });

    // Report drag progress for mood interpolation
    useEffect(() => {
        if (!onDragProgress) return;

        const unsubscribe = x.on('change', (val: number) => {
            const screenWidth = getScreenWidth();
            const progress = val / screenWidth;
            onDragProgress(progress);
        });

        return () => unsubscribe();
    }, [x, onDragProgress]);

    // Navigate to a specific page
    const goToPage = useCallback((targetPage: number) => {
        if (targetPage < 1 || targetPage > totalPages) return;
        if (targetPage === currentPage) {
            x.set(0);
            return;
        }

        const screenWidth = getScreenWidth();
        const direction = targetPage > currentPage ? -1 : 1;

        // Animate to target position
        x.set(direction * screenWidth);

        // After animation, update page and reset position
        setTimeout(() => {
            onPageChange(targetPage);
            // Jump instantly to 0 for new page context
            springX.jump(0);
            x.set(0);
        }, 300);
    }, [currentPage, totalPages, onPageChange, x, springX]);

    // Expose goToPage via ref
    useImperativeHandle(ref, () => ({
        goToPage,
    }), [goToPage]);

    // Gesture handling
    useGesture(
        {
            onDrag: ({ movement: [mx] }) => {
                // Check boundaries
                const isAtStart = currentPage === 1 && mx > 0;
                const isAtEnd = currentPage === totalPages && mx < 0;

                if (isAtStart || isAtEnd) {
                    // Rubber-band effect
                    x.set(mx * 0.3);
                } else {
                    x.set(mx);
                }
            },
            onDragEnd: ({ movement: [mx], velocity: [vx] }) => {
                const screenWidth = getScreenWidth();
                const position = mx / screenWidth;

                const shouldGoNext =
                    (vx < -SWIPE_VELOCITY_THRESHOLD || position < -SWIPE_POSITION_THRESHOLD) &&
                    currentPage < totalPages;
                const shouldGoPrev =
                    (vx > SWIPE_VELOCITY_THRESHOLD || position > SWIPE_POSITION_THRESHOLD) &&
                    currentPage > 1;

                if (shouldGoNext) {
                    goToPage(currentPage + 1);
                } else if (shouldGoPrev) {
                    goToPage(currentPage - 1);
                } else {
                    x.set(0);
                }
            },
        },
        {
            target: containerRef,
            drag: {
                axis: 'x',
                filterTaps: true,
                threshold: 10,
            },
        }
    );

    return (
        <div ref={containerRef} className={styles.carouselContainer}>
            <motion.div
                className={styles.carouselTrack}
                style={{ x: trackX }}
            >
                <div className={styles.pageSlot}>
                    {pageWindow[0] ? (
                        <Page pageData={pageWindow[0]} isActive={false} />
                    ) : (
                        <div className={styles.emptySlot} />
                    )}
                </div>

                <div className={styles.pageSlot}>
                    {pageWindow[1] && <Page pageData={pageWindow[1]} isActive={true} />}
                </div>

                <div className={styles.pageSlot}>
                    {pageWindow[2] ? (
                        <Page pageData={pageWindow[2]} isActive={false} />
                    ) : (
                        <div className={styles.emptySlot} />
                    )}
                </div>
            </motion.div>
        </div>
    );
});

export default PageCarousel;
