// src/hooks/useThemeManager.ts

import { useEffect } from 'react';
import { useSettingsStore } from '@/data/settings.store';

/**
 * Manages theme application based on user preference.
 * Applies 'data-theme' attribute to document root for CSS theming.
 */
export const useThemeManager = () => {
    const theme = useSettingsStore((state) => state.theme);

    useEffect(() => {
        const applyTheme = (isDark: boolean) => {
            if (isDark) {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
        };

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            applyTheme(mediaQuery.matches);

            const handleChange = (e: MediaQueryListEvent) => applyTheme(e.matches);
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            applyTheme(theme === 'dark');
        }
    }, [theme]);
};
