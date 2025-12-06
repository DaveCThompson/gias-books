import React, { useRef } from 'react';
import { useGesture } from '@use-gesture/react';
import { useRouter } from 'next/router';
import styles from './GestureCanvas.module.css';

interface GestureCanvasProps {
    children: React.ReactNode;
    isFirstPage: boolean;
    isLastPage: boolean;
}

export const GestureCanvas: React.FC<GestureCanvasProps> = ({
    children,
    isFirstPage: _isFirstPage,
    isLastPage: _isLastPage,
}) => {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    useGesture(
        {
            onDrag: ({ movement: [mx, my], cancel }) => {
                // Vertical Pull Down (Exit)
                // Threshold: 100px down
                if (my > 100 && Math.abs(my) > Math.abs(mx)) {
                    router.push('/');
                    cancel();
                }
            },
            // Pinch to Zoom (Future proofing, currently just logs or could scale)
            // onPinch: ({ offset: [d, a] }) => { ... }
        },
        {
            target: containerRef,
            drag: {
                filterTaps: true, // Crucial: Don't trigger on clicks/taps
                threshold: 10,    // Ignore small jitters
            },
        }
    );

    return (
        <div ref={containerRef} className={styles.gestureCanvas}>
            {children}
        </div>
    );
};
