'use client';

import { Editor } from '@tiptap/react';
import * as Popover from '@radix-ui/react-popover';
import { Check, TextAa } from '@phosphor-icons/react';
import { FONT_REGISTRY } from '@gia/schemas';
import { cn } from '@gia/utils';
import styles from './FontDropdown.module.css';

interface FontDropdownProps {
    editor: Editor;
    currentFont: string | null;
}

// Font display names for UI
const FONT_LABELS: Record<string, string> = {
    body: 'Body',
    display: 'Display',
    handwritten: 'Handwritten',
    fredoka: 'Fredoka',
    playpen: 'Playpen',
    roboto: 'Roboto',
};

export function FontDropdown({ editor, currentFont }: FontDropdownProps) {
    const handleFontSelect = (fontId: string) => {
        if (fontId === 'body') {
            // Clear font styling
            editor.chain().focus().unsetFont().run();
        } else {
            // Apply font via FontMark
            editor.chain().focus().setFont(fontId).run();
        }
    };

    const handleClear = () => {
        editor.chain().focus().unsetFont().run();
    };


    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button
                    className={cn(styles.trigger, currentFont && styles.active)}
                    title="Font"
                >
                    <TextAa size={16} />
                    <svg
                        className={styles.chevron}
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                    >
                        <path
                            d="M2 3.5L5 6.5L8 3.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className={styles.content} sideOffset={8} align="start">
                    <div className={styles.header}>
                        <span className={styles.headerTitle}>Font</span>
                        {currentFont && (
                            <button className={styles.clearButton} onClick={handleClear}>
                                Clear
                            </button>
                        )}
                    </div>
                    {Object.entries(FONT_REGISTRY).map(([fontId, config]) => (
                        <div
                            key={fontId}
                            className={cn(
                                styles.option,
                                currentFont === fontId && styles.active
                            )}
                            style={{
                                fontFamily: config.family,
                                fontVariationSettings: config.settings,
                            }}
                            onClick={() => handleFontSelect(fontId)}
                        >
                            <span className={styles.label}>
                                {FONT_LABELS[fontId] || fontId}
                            </span>
                            {currentFont === fontId && (
                                <Check size={14} className={styles.checkmark} />
                            )}
                        </div>
                    ))}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
