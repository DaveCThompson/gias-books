// src/components/ThemeToggle.tsx
'use client';

import { Sun, Moon } from '@phosphor-icons/react';
import { useThemeManager } from '@/hooks/useThemeManager';
import styles from './ThemeToggle.module.css';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useThemeManager();
    const isDark = theme === 'dark';

    return (
        <button
            className={styles.toggle}
            onClick={toggleTheme}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {isDark ? <Sun weight="duotone" size={20} /> : <Moon weight="duotone" size={20} />}
        </button>
    );
};

