'use client';

import { Editor } from '@tiptap/react';
import * as Popover from '@radix-ui/react-popover';
import { Check, Play } from '@phosphor-icons/react';
import { MOTION_REGISTRY } from '@gia/schemas';
import { cn } from '@gia/utils';
import styles from './AnimationDropdown.module.css';

interface AnimationDropdownProps {
    editor: Editor;
    currentAnimation: string | null;
}

// Animation display names for UI
const ANIMATION_LABELS: Record<string, string> = {
    bounce: 'Bounce',
    shake: 'Shake',
    wiggle: 'Wiggle',
    sway: 'Sway',
    shimmer: 'Shimmer',
    flicker: 'Flicker',
    clench: 'Clench',
    shout: 'Shout',
};

export function AnimationDropdown({ editor, currentAnimation }: AnimationDropdownProps) {
    const handleAnimationSelect = (animationId: string) => {
        // Apply animation via MotionMark
        editor.chain().focus().setMotion(animationId).run();
    };

    const handleClear = () => {
        editor.chain().focus().unsetMotion().run();
    };


    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button
                    className={cn(styles.trigger, currentAnimation && styles.active)}
                    title="Animation"
                >
                    <Play size={16} />
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
                        <span className={styles.headerTitle}>Animation</span>
                        {currentAnimation && (
                            <button className={styles.clearButton} onClick={handleClear}>
                                Clear
                            </button>
                        )}
                    </div>
                    {Object.entries(MOTION_REGISTRY).map(([animationId, config]) => (
                        <div
                            key={animationId}
                            className={cn(
                                styles.option,
                                currentAnimation === animationId && styles.active
                            )}
                            style={{
                                // Apply animation on hover via CSS class
                            }}
                            data-animation={config.animation}
                            onClick={() => handleAnimationSelect(animationId)}
                        >
                            <span className={styles.label}>
                                {ANIMATION_LABELS[animationId] || animationId}
                            </span>
                            {currentAnimation === animationId && (
                                <Check size={14} className={styles.checkmark} />
                            )}
                        </div>
                    ))}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
