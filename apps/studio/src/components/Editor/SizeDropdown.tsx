'use client';

import { Editor } from '@tiptap/react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@gia/utils';
import styles from './SizeDropdown.module.css';

interface SizeDropdownProps {
    editor: Editor;
    currentSize: string;
}

const SIZE_OPTIONS = [
    { value: 'small', label: 'Small' },
    { value: 'regular', label: 'Regular' },
    { value: 'large', label: 'Large' },
    { value: 'giant', label: 'Giant' },
    { value: 'massive', label: 'Massive' },
];

export function SizeDropdown({ editor, currentSize }: SizeDropdownProps) {
    const handleSizeSelect = (size: string) => {
        if (size === 'regular') {
            editor.chain().focus().unsetTextSize().run();
        } else {
            editor.chain().focus().setTextSize(size).run();
        }
    };

    const currentLabel = SIZE_OPTIONS.find(o => o.value === currentSize)?.label || 'Regular';

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button
                    className={cn(styles.trigger, currentSize !== 'regular' && styles.active)}
                    title="Text size"
                >
                    <span className={styles.triggerLabel}>{currentLabel}</span>
                    <svg className={styles.chevron} width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className={styles.content} sideOffset={8} align="start">
                    <div className={styles.header}>
                        <span className={styles.headerTitle}>Size</span>
                    </div>
                    {SIZE_OPTIONS.map((option) => (
                        <div
                            key={option.value}
                            className={cn(
                                styles.option,
                                styles[`size-${option.value}`],
                                currentSize === option.value && styles.active
                            )}
                            onClick={() => handleSizeSelect(option.value)}
                        >
                            <span>{option.label}</span>
                            {currentSize === option.value && (
                                <span className={styles.checkmark}>✓</span>
                            )}
                        </div>
                    ))}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
