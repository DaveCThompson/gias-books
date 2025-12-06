// src/hooks/useThemeManager.ts
'use client';

import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('madoodle-studio-theme') as Theme | null;
    return saved || 'light';
};

export const useThemeManager = () => {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

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

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('madoodle-studio-theme', next);
            return next;
        });
    }, []);

    return { theme, setTheme, toggleTheme };
};
