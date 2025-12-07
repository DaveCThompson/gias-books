'use client';

import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [activeEmotion, setActiveEmotion] = useState<string | null>(null);
    const [activeSize, setActiveSize] = useState<ExpressiveSize>('regular');
    const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<ExpressiveSize>('regular');

    // Sync state with editor selection
    useEffect(() => {
        if (!editor) return;

        const updateState = () => {
            const attributes = editor.getAttributes('expressive');
            const emotion = attributes.style || null;
            const size = attributes.size || 'regular';

            setActiveEmotion(emotion);
            setActiveSize(size);

            // If not open, sync selection state to active state so it's ready when opened
            if (!isOpen) {
                setSelectedEmotion(emotion);
                setSelectedSize(size);
            }
        };

        editor.on('selectionUpdate', updateState);
        editor.on('update', updateState);
        updateState();

        return () => {
            editor.off('selectionUpdate', updateState);
            editor.off('update', updateState);
        };
    }, [editor, isOpen]);

    const handleApply = () => {
        if (selectedEmotion) {
            editor.chain().focus().setExpressive(selectedEmotion, selectedSize).run();
        }
        setIsOpen(false);
    };

    const handleClear = () => {
        editor.chain().focus().unsetExpressive().run();
        setIsOpen(false);
        setSelectedEmotion(null);
        setSelectedSize('regular');
    };

    // Get preview style for emotion button
    const getPreviewStyle = (emotionId: string): React.CSSProperties => {
        const style = getEmotionStyle(emotionId);
        return {
            fontFamily: style.fontFamily,
            color: style.color || 'var(--color-text)',
            ...(style.textShadow ? { textShadow: style.textShadow } : {}),
            ...(style.transform ? { transform: style.transform } : {}),
        };
    };

    // Get active emotion label for trigger button
    const activeLabel = activeEmotion
        ? EMOTION_STYLES.find(e => e.id === activeEmotion)?.label
        : null;

    return (
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
                <button
                    className={cn(
                        styles.trigger,
                        (isOpen || activeEmotion) && styles.triggerActive
                    )}
                    disabled={disabled}
                    title={disabled ? 'Select text first' : 'Add expressive styling'}
                >
                    {activeEmotion ? (
                        <span className={styles.triggerContent}>
                            <span className={styles.triggerIcon}>✨</span>
                            <span className={styles.triggerLabel}>{activeLabel}</span>
                            {activeSize !== 'regular' && (
                                <span className={styles.triggerBadge}>{activeSize === 'massive' ? 'XXL' : activeSize === 'giant' ? 'XL' : activeSize === 'large' ? 'L' : activeSize === 'small' ? 'S' : ''}</span>
                            )}
                        </span>
                    ) : (
                        '✨ Expressive'
                    )}
                </button>
            </Popover.Trigger>

            <AnimatePresence>
                {isOpen && (
                    <Popover.Portal forceMount>
                        <Popover.Content asChild sideOffset={8} align="start" side="bottom">
                            <motion.div
                                className={styles.popover}
                                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                            >
                                <div className={styles.section}>
                                    <div className={styles.headerRow}>
                                        <div className={styles.sectionTitle}>Emotion</div>
                                        {selectedEmotion && (
                                            <button className={styles.clearLink} onClick={handleClear}>
                                                Clear Formatting
                                            </button>
                                        )}
                                    </div>
                                    <div className={styles.emotionGrid}>
                                        {EMOTIONS.map((emotion, index) => (
                                            <motion.button
                                                key={emotion.id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                                className={cn(
                                                    styles.emotionButton,
                                                    selectedEmotion === emotion.id && styles.emotionButtonActive
                                                )}
                                                onClick={() => setSelectedEmotion(emotion.id)}
                                                style={getPreviewStyle(emotion.id)}
                                                title={emotion.label}
                                            >
                                                {emotion.label}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <div className={styles.sectionTitle}>Size</div>
                                    <div className={styles.sizeControl}>
                                        {EXPRESSIVE_SIZES.map((size) => (
                                            <button
                                                key={size}
                                                className={cn(
                                                    styles.sizeSegment,
                                                    selectedSize === size && styles.sizeSegmentActive
                                                )}
                                                onClick={() => setSelectedSize(size)}
                                                title={size.charAt(0).toUpperCase() + size.slice(1)}
                                            >
                                                <span style={{ fontSize: getSizeScale(size) }}>A</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className={styles.sizeLabels}>
                                        <span>Small</span>
                                        <span>Regular</span>
                                        <span>Large</span>
                                        <span>Giant</span>
                                        <span>Massive</span>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        className={styles.cancelButton}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={styles.applyButton}
                                        onClick={handleApply}
                                        disabled={!selectedEmotion}
                                    >
                                        Apply Style
                                    </button>
                                </div>
                                <Popover.Arrow className={styles.arrow} />
                            </motion.div>
                        </Popover.Content>
                    </Popover.Portal>
                )}
            </AnimatePresence>
        </Popover.Root>
    );
}
