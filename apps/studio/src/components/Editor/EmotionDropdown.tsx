'use client';

import { Editor } from '@tiptap/react';
import * as Popover from '@radix-ui/react-popover';
import { Check } from '@phosphor-icons/react';
import { EMOTION_STYLES } from '@gia/schemas';
import { cn } from '@gia/utils';
import styles from './EmotionDropdown.module.css';

interface EmotionDropdownProps {
    editor: Editor;
    currentEmotion: string | null;
}

export function EmotionDropdown({ editor, currentEmotion }: EmotionDropdownProps) {
    const handleEmotionSelect = (emotion: string) => {
        if (emotion === 'normal') {
            editor.chain().focus().unsetExpressive().run();
        } else {
            editor.chain().focus().setExpressive(emotion).run();
        }
    };

    const handleClear = () => {
        editor.chain().focus().unsetExpressive().run();
    };

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button
                    className={cn(styles.trigger, currentEmotion && styles.active)}
                    title="Text emotion"
                >
                    <span className={styles.triggerLabel}>Style</span>
                    <svg className={styles.chevron} width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className={styles.content} sideOffset={8} align="start">
                    <div className={styles.header}>
                        <span className={styles.headerTitle}>Emotion</span>
                        {currentEmotion && (
                            <button className={styles.clearButton} onClick={handleClear}>
                                Clear
                            </button>
                        )}
                    </div>
                    {EMOTION_STYLES.map((option) => (
                        <div
                            key={option.id}
                            className={cn(
                                styles.option,
                                currentEmotion === option.id && styles.active
                            )}
                            onClick={() => handleEmotionSelect(option.id)}
                        >
                            <span className={styles.label}>{option.label}</span>
                            {currentEmotion === option.id && (
                                <Check size={14} className={styles.checkmark} />
                            )}
                        </div>
                    ))}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
