'use client';

import { PageData } from '@gia/schemas';
import { ExpressiveTextPreview } from './ExpressiveTextPreview';
import styles from './PagePreview.module.css';

interface PagePreviewProps {
    page: PageData;
    getAssetUrl: (path: string) => string;
}

/**
 * PagePreview renders a page in a viewer-like layout for the Studio editor.
 * Mirrors the Viewer's Page.tsx structure: mood gradient background, masked image, text.
 */
export function PagePreview({ page, getAssetUrl }: PagePreviewProps) {
    const mood = page.mood || 'calm';

    // Extract illustration URL (handle string or object format)
    const illustrationUrl = typeof page.illustration === 'string'
        ? page.illustration
        : page.illustration?.bg || page.illustration?.mid || page.illustration?.fg;

    // Apply mask if present
    const maskStyle = page.mask
        ? {
            maskImage: `url(${getAssetUrl(page.mask)})`,
            WebkitMaskImage: `url(${getAssetUrl(page.mask)})`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
        }
        : {};

    return (
        <div className={styles.previewContainer} data-mood={mood}>
            {/* Mood gradient background layer */}
            <div className={styles.moodLayer} />

            {/* Illustration with optional mask */}
            {illustrationUrl && (
                <div className={styles.illustrationContainer} style={maskStyle}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={getAssetUrl(illustrationUrl)}
                        alt={`Illustration for page ${page.pageNumber}`}
                        className={styles.illustration}
                    />
                </div>
            )}

            {/* Text preview with expressive styling */}
            <div className={styles.textContainer}>
                <p className={styles.text}>
                    <ExpressiveTextPreview text={page.text} />
                </p>
            </div>
        </div>
    );
}

