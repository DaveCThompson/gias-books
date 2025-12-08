'use client';

import { Editor } from '@tiptap/react';
import * as Popover from '@radix-ui/react-popover';
import { Check, TextAa, HighlighterCircle } from '@phosphor-icons/react';
import { cn } from '@gia/utils';
import styles from './ColorDropdown.module.css';

interface ColorDropdownProps {
    editor: Editor;
    mode: 'fg' | 'bg';
    currentColor: string | null;
}

// Colors in order: default, grey, brown, orange, yellow | green, blue, purple, pink, red
const COLOR_OPTIONS = [
    { value: 'default', label: 'Default' },
    { value: 'grey', label: 'Grey' },
    { value: 'brown', label: 'Brown' },
    { value: 'orange', label: 'Orange' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' },
    { value: 'purple', label: 'Purple' },
    { value: 'pink', label: 'Pink' },
    { value: 'red', label: 'Red' },
];

export function ColorDropdown({ editor, mode, currentColor }: ColorDropdownProps) {
    const handleColorSelect = (color: string) => {
        if (mode === 'fg') {
            if (color === 'default') {
                editor.chain().focus().unsetTextColor().run();
            } else {
                editor.chain().focus().setTextColor(color).run();
            }
        } else {
            if (color === 'default') {
                editor.chain().focus().unsetTextBgColor().run();
            } else {
                editor.chain().focus().setTextBgColor(color).run();
            }
        }
    };

    const Icon = mode === 'fg' ? TextAa : HighlighterCircle;
    const title = mode === 'fg' ? 'Text color' : 'Background color';
    const headerTitle = mode === 'fg' ? 'Text Color' : 'Background';
    const isActive = currentColor && currentColor !== 'default';

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button
                    className={cn(styles.trigger, isActive && styles.active)}
                    title={title}
                >
                    <Icon size={16} />
                    {isActive && (
                        <span
                            className={styles.colorIndicator}
                            style={{
                                backgroundColor: mode === 'fg'
                                    ? `var(--color-${currentColor})`
                                    : `var(--color-bg-${currentColor})`
                            }}
                        />
                    )}
                    <svg className={styles.chevron} width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className={styles.content} sideOffset={8} align="start">
                    <div className={styles.header}>
                        <span className={styles.headerTitle}>{headerTitle}</span>
                    </div>
                    <div className={styles.grid}>
                        {COLOR_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                className={cn(
                                    styles.swatch,
                                    currentColor === option.value && styles.active
                                )}
                                onClick={() => handleColorSelect(option.value)}
                                title={option.label}
                            >
                                <span
                                    className={styles.swatchColor}
                                    style={{
                                        backgroundColor: option.value === 'default'
                                            ? 'transparent'
                                            : mode === 'fg'
                                                ? `var(--color-${option.value})`
                                                : `var(--color-bg-${option.value})`,
                                        border: option.value === 'default' ? '1px dashed var(--border-primary)' : 'none',
                                    }}
                                >
                                    {mode === 'fg' && option.value !== 'default' && (
                                        <span className={styles.swatchLetter}>A</span>
                                    )}
                                </span>
                                {currentColor === option.value && (
                                    <Check size={10} className={styles.checkmark} />
                                )}
                            </button>
                        ))}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
