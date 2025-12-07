'use client';

import { useState } from 'react';
import { useBookStore } from '@/data/stores/bookStore';
import type { PageData } from '@gia/schemas';
import { AssetPicker, AssetType } from './AssetPicker';
import styles from './Inspector.module.css';

export function Inspector() {
    const currentPageIndex = useBookStore((state) => state.currentPageIndex);
    const book = useBookStore((state) => state.book);
    const updatePage = useBookStore((state) => state.updatePage);
    const page = book?.pages[currentPageIndex] ?? null;

    const [activeAssetPicker, setActiveAssetPicker] = useState<AssetType | null>(null);

    if (!page || !book) return null;

    const handleChange = (field: keyof PageData, value: string) => {
        updatePage({ [field]: value || undefined });
    };

    const handleAssetSelect = (field: keyof PageData) => (path: string | undefined) => {
        updatePage({ [field]: path });
        setActiveAssetPicker(null);
    };

    const getAssetDisplay = (value: string | undefined) => {
        if (!value) return 'None';
        return value.split('/').pop() || value;
    };

    return (
        <>
            <aside className={styles.inspector}>
                <h2>Page Settings</h2>

                <div className={styles.field}>
                    <label>Mood</label>
                    <select
                        value={page.mood || ''}
                        onChange={(e) => handleChange('mood', e.target.value)}
                    >
                        <option value="">None</option>
                        <option value="calm">🌿 Calm</option>
                        <option value="tense">⚡ Tense</option>
                        <option value="joyful">✨ Joyful</option>
                    </select>
                </div>

                <div className={styles.field}>
                    <label>Layout</label>
                    <select
                        value={page.layout || ''}
                        onChange={(e) => handleChange('layout', e.target.value)}
                    >
                        <option value="">Default</option>
                        <option value="fullbleed">Full Bleed</option>
                        <option value="split">Split</option>
                        <option value="textOnly">Text Only</option>
                    </select>
                </div>

                <div className={styles.field}>
                    <label htmlFor="animateText">Animate Text</label>
                    <div className={styles.toggleRow}>
                        <input
                            type="checkbox"
                            id="animateText"
                            checked={page.animateText !== false}
                            onChange={(e) => updatePage({ animateText: e.target.checked })}
                        />
                        <span className={styles.hint}>Enable expressive text animations</span>
                    </div>
                </div>

                <div className={styles.field}>
                    <label>Illustration</label>
                    <button
                        className={styles.assetButton}
                        onClick={() => setActiveAssetPicker('illustration')}
                    >
                        🖼️ {getAssetDisplay(typeof page.illustration === 'string' ? page.illustration : undefined)}
                    </button>
                </div>

                <div className={styles.field}>
                    <label>Mask</label>
                    <button
                        className={styles.assetButton}
                        onClick={() => setActiveAssetPicker('mask')}
                    >
                        🎭 {getAssetDisplay(page.mask)}
                    </button>
                </div>

                <div className={styles.field}>
                    <label>Narration</label>
                    <button
                        className={styles.assetButton}
                        onClick={() => setActiveAssetPicker('narration')}
                    >
                        🔊 {getAssetDisplay(page.narrationUrl)}
                    </button>
                </div>
            </aside>

            {activeAssetPicker && (
                <AssetPicker
                    bookSlug={book.slug}
                    assetType={activeAssetPicker}
                    currentValue={
                        activeAssetPicker === 'illustration'
                            ? (typeof page.illustration === 'string' ? page.illustration : undefined)
                            : activeAssetPicker === 'mask'
                                ? page.mask
                                : page.narrationUrl
                    }
                    onSelect={handleAssetSelect(
                        activeAssetPicker === 'illustration'
                            ? 'illustration'
                            : activeAssetPicker === 'mask'
                                ? 'mask'
                                : 'narrationUrl'
                    )}
                    onClose={() => setActiveAssetPicker(null)}
                />
            )}
        </>
    );
}
