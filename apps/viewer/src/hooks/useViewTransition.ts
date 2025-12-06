// src/hooks/useViewTransition.ts
// Hook for View Transitions API navigation

import { useRouter } from 'next/router';
import { useCallback } from 'react';

interface ViewTransitionRouter {
    navigateWithTransition: (url: string) => void;
}

/**
 * Hook that provides navigation with View Transitions API support.
 * Falls back to regular navigation if View Transitions are not supported.
 */
export function useViewTransitionRouter(): ViewTransitionRouter {
    const router = useRouter();

    const navigateWithTransition = useCallback((url: string) => {
        // Check if View Transitions API is supported
        if (typeof document !== 'undefined' && 'startViewTransition' in document) {
            document.startViewTransition(() => {
                return router.push(url);
            });
        } else {
            // Fallback to regular navigation
            router.push(url);
        }
    }, [router]);

    return {
        navigateWithTransition,
    };
}
