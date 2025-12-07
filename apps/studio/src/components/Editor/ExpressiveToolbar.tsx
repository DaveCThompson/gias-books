'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { EMOTION_STYLES, EXPRESSIVE_SIZES, getEmotionStyle, getSizeScale } from '@gia/schemas';
import type { ExpressiveSize } from '@gia/schemas';
import { cn } from '@gia/utils';
import styles from './ExpressiveToolbar.module.css';

interface ExpressiveToolbarProps {
    editor: Editor;
    disabled?: boolean;
}

// Filter out 'normal' as it's the default/clear option
const EMOTIONS = EMOTION_STYLES.filter(e => e.id !== 'normal');

export function ExpressiveToolbar({ editor, disabled = false }: ExpressiveToolbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<ExpressiveSize>('regular');

    const handleEmotionSelect = (emotionId: string) => {
        setSelectedEmotion(emotionId);
    };

    const handleSizeSelect = (size: ExpressiveSize) => {
        setSelectedSize(size);
    };

    const handleApply = () => {
        if (selectedEmotion) {
            editor.chain().focus().setExpressive(selectedEmotion, selectedSize).run();
        }
        setIsOpen(false);
        setSelectedEmotion(null);
        setSelectedSize('regular');
    };

    const handleClear = () => {
        editor.chain().focus().unsetExpressive().run();
        setIsOpen(false);
        setSelectedEmotion(null);
        setSelectedSize('regular');
    };

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    // Get preview style for emotion button
    const getPreviewStyle = (emotionId: string): React.CSSProperties => {
        const style = getEmotionStyle(emotionId);
        return {
            fontFamily: style.fontFamily,
            color: style.color || 'inherit',
        };
    };

    return (
        <div className={styles.container}>
            <button
                className={cn(styles.trigger, isOpen && styles.triggerActive)}
                onClick={handleToggle}
                disabled={disabled}
                title={disabled ? 'Select text first' : 'Add expressive styling'}
            >
                ✨ Expressive
            </button>

            {isOpen && (
                <div className={styles.popover}>
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Emotion</div>
                        <div className={styles.emotionGrid}>
                            {EMOTIONS.map((emotion) => (
                                <button
                                    key={emotion.id}
                                    className={cn(
                                        styles.emotionButton,
                                        selectedEmotion === emotion.id && styles.emotionButtonActive
                                    )}
                                    onClick={() => handleEmotionSelect(emotion.id)}
                                    style={getPreviewStyle(emotion.id)}
                                    title={emotion.id}
                                >
                                    {emotion.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Size</div>
                        <div className={styles.sizeRow}>
                            {EXPRESSIVE_SIZES.map((size) => (
                                <button
                                    key={size}
                                    className={cn(
                                        styles.sizeButton,
                                        selectedSize === size && styles.sizeButtonActive
                                    )}
                                    onClick={() => handleSizeSelect(size)}
                                    style={{ fontSize: getSizeScale(size) }}
                                >
                                    A
                                </button>
                            ))}
                        </div>
                        <div className={styles.sizeLabels}>
                            <span>S</span>
                            <span>M</span>
                            <span>L</span>
                            <span>XL</span>
                            <span>XXL</span>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.clearButton}
                            onClick={handleClear}
                        >
                            Clear
                        </button>
                        <button
                            className={styles.applyButton}
                            onClick={handleApply}
                            disabled={!selectedEmotion}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
