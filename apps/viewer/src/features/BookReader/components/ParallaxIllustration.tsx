// src/features/BookReader/components/ParallaxIllustration.tsx

import React from 'react';
import Image from 'next/image';
import type { IllustrationData } from '@gia/schemas';
import styles from './ParallaxIllustration.module.css';

interface ParallaxIllustrationProps {
    illustration: IllustrationData;
    mask?: string;
    pageNumber: number;
    /** Whether this is the current visible page (affects loading priority) */
    isCurrentPage?: boolean;
}

// Simple shimmer placeholder as data URL
const SHIMMER_DATA_URL =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+';

/**
 * Renders either a simple illustration or a parallax layered illustration.
 * Supports both string (single image) and object (bg/mid/fg layers) formats.
 * Uses blur placeholder for smooth loading experience.
 */
export function ParallaxIllustration({
    illustration,
    mask,
    pageNumber,
    isCurrentPage = true,
}: ParallaxIllustrationProps) {
    const maskStyle = mask
        ? {
            maskImage: `url(${mask})`,
            WebkitMaskImage: `url(${mask})`,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
        }
        : {};

    // Simple string illustration (backward compatible)
    if (typeof illustration === 'string') {
        return (
            <div className={styles.simpleContainer} style={maskStyle}>
                <Image
                    src={illustration}
                    alt={`Illustration for page ${pageNumber}`}
                    fill
                    className={styles.simpleImage}
                    priority={isCurrentPage}
                    placeholder="blur"
                    blurDataURL={SHIMMER_DATA_URL}
                />
            </div>
        );
    }

    // Parallax layered illustration
    const { bg, mid, fg } = illustration;

    return (
        <div className={styles.parallaxContainer} style={maskStyle}>
            {bg && (
                <Image
                    src={bg}
                    alt={`Background layer for page ${pageNumber}`}
                    fill
                    className={styles.layerBg}
                    priority={isCurrentPage}
                    placeholder="blur"
                    blurDataURL={SHIMMER_DATA_URL}
                />
            )}
            {mid && (
                <Image
                    src={mid}
                    alt={`Midground layer for page ${pageNumber}`}
                    fill
                    className={styles.layerMid}
                    priority={isCurrentPage}
                    placeholder="blur"
                    blurDataURL={SHIMMER_DATA_URL}
                />
            )}
            {fg && (
                <Image
                    src={fg}
                    alt={`Foreground layer for page ${pageNumber}`}
                    fill
                    className={styles.layerFg}
                    priority={isCurrentPage}
                    placeholder="blur"
                    blurDataURL={SHIMMER_DATA_URL}
                />
            )}
        </div>
    );
}

