'use client';

import { Editor } from '@tiptap/react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@gia/utils';
import styles from './EmotionDropdown.module.css';

interface EmotionDropdownProps {
    editor: Editor;
    currentEmotion: string | null;
}

const EMOTION_OPTIONS = [
    { value: 'handwritten', label: 'Handwritten', icon: '✍️' },
    { value: 'shout', label: 'Shout', icon: '📢' },
    { value: 'bully', label: 'Bully', icon: '💢' },
    { value: 'whisper', label: 'Whisper', icon: '🤫' },
];

export function EmotionDropdown({ editor, currentEmotion }: EmotionDropdownProps) {
    const handleEmotionSelect = (emotion: string) => {
        editor.chain().focus().setExpressive(emotion).run();
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
                    ✨
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
                    {EMOTION_OPTIONS.map((option) => (
                        <div
                            key={option.value}
                            className={cn(
                                styles.option,
                                currentEmotion === option.value && styles.active
                            )}
                            onClick={() => handleEmotionSelect(option.value)}
                        >
                            <span className={styles.icon}>{option.icon}</span>
                            <span className={styles.label}>{option.label}</span>
                            {currentEmotion === option.value && (
                                <span className={styles.checkmark}>✓</span>
                            )}
                        </div>
                    ))}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
