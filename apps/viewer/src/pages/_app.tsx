// src/pages/_app.tsx

import type { AppProps } from 'next/app';
import '@/styles/index.css';
import { useThemeManager } from '@/hooks/useThemeManager';

export default function App({ Component, pageProps }: AppProps) {
    // Apply theme based on user preference or system setting
    useThemeManager();

    return <Component {...pageProps} />;
}

