'use client';

import { Editor } from '@tiptap/react';
import * as Popover from '@radix-ui/react-popover';
import { Check, Sparkle } from '@phosphor-icons/react';
import { EFFECT_REGISTRY } from '@gia/schemas';
import { cn } from '@gia/utils';
import styles from './EffectDropdown.module.css';

interface EffectDropdownProps {
    editor: Editor;
    currentEffect: string | null;
}

// Effect display names for UI
const EFFECT_LABELS: Record<string, string> = {
    none: 'None',
    shadow: 'Shadow',
    'shadow-hard': 'Hard Shadow',
    glow: 'Glow (Gold)',
    'glow-blue': 'Glow (Blue)',
    'glow-green': 'Glow (Green)',
    outline: 'Outline',
    'outline-thick': 'Thick Outline',
};

export function EffectDropdown({ editor, currentEffect }: EffectDropdownProps) {
    const handleEffectSelect = (effectId: string) => {
        if (effectId === 'none') {
            // Clear effect
            editor.chain().focus().unsetEffect().run();
        } else {
            // Apply effect via EffectMark
            editor.chain().focus().setEffect(effectId).run();
        }
    };

    const handleClear = () => {
        editor.chain().focus().unsetEffect().run();
    };


    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button
                    className={cn(styles.trigger, currentEffect && currentEffect !== 'none' && styles.active)}
                    title="Text Effect"
                >
                    <Sparkle size={16} />
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
                        <span className={styles.headerTitle}>Effect</span>
                        {currentEffect && currentEffect !== 'none' && (
                            <button className={styles.clearButton} onClick={handleClear}>
                                Clear
                            </button>
                        )}
                    </div>
                    {Object.entries(EFFECT_REGISTRY).map(([effectId, config]) => (
                        <div
                            key={effectId}
                            className={cn(
                                styles.option,
                                currentEffect === effectId && styles.active
                            )}
                            style={{
                                textShadow: config.textShadow,
                                WebkitTextStroke: config.WebkitTextStroke,
                            }}
                            onClick={() => handleEffectSelect(effectId)}
                        >
                            <span className={styles.label}>
                                {EFFECT_LABELS[effectId] || effectId}
                            </span>
                            {currentEffect === effectId && (
                                <Check size={14} className={styles.checkmark} />
                            )}
                        </div>
                    ))}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
