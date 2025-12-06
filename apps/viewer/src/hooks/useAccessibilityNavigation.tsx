import React, { useEffect, useRef } from 'react';

interface UseA11yNavigationProps {
    currentPage: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
}

export const useAccessibilityNavigation = ({
    currentPage,
    totalPages,
    onPrev,
    onNext,
}: UseA11yNavigationProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Focus management: Focus the container when the page changes (if it's not already focused)
    // This ensures screen readers announce the new content or at least the container context
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, [currentPage]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                onPrev();
            } else if (e.key === 'ArrowRight') {
                onNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onPrev, onNext]);

    return {
        containerRef,
        // Helper to render the live region
        a11yStatus: (
            <div
                className="sr-only"
                aria-live="polite"
                aria-atomic="true"
            >
                Page {currentPage} of {totalPages}
            </div>
        ),
    };
};
