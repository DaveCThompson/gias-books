'use client';

import { Editor } from '@tiptap/react';
import * as Popover from '@radix-ui/react-popover';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Eraser } from '@phosphor-icons/react';
import { useToolbarState, MarkState } from '@/hooks/useToolbarState';
import { useSelectionCoords } from '@/hooks/useSelectionCoords';
import { SizeDropdown } from './SizeDropdown';
import { EmotionDropdown } from './EmotionDropdown';
import { cn } from '@gia/utils';
import styles from './EditorBubbleMenu.module.css';

interface EditorBubbleMenuProps {
    editor: Editor;
    onInteractiveClick: () => void;
}

interface FormatButtonProps {
    mark: 'bold' | 'italic' | 'underline';
    icon: string;
    state: MarkState;
    onClick: () => void;
}

function FormatButton({ mark, icon, state, onClick }: FormatButtonProps) {
    return (
        <button
            className={cn(
                styles.button,
                state === 'on' && styles.active,
                state === 'mixed' && styles.mixed
            )}
            onClick={onClick}
            title={mark.charAt(0).toUpperCase() + mark.slice(1)}
        >
            {icon}
        </button>
    );
}

// Animation configuration
const menuAnimation = {
    initial: { opacity: 0, y: 8, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 8, scale: 0.95 },
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] as const }, // ease-out-expo
};

export function EditorBubbleMenu({ editor, onInteractiveClick }: EditorBubbleMenuProps) {
    const toolbarState = useToolbarState(editor);
    const selectionCoords = useSelectionCoords(editor);

    const hasSelection = selectionCoords !== null;

    return (
        <Popover.Root open={hasSelection}>
            {/* Virtual anchor at selection position */}
            <Popover.Anchor
                className={styles.anchor}
                style={
                    selectionCoords
                        ? {
                            position: 'fixed',
                            left: selectionCoords.x + selectionCoords.width / 2,
                            top: selectionCoords.y,
                            width: 1,
                            height: 1,
                            pointerEvents: 'none',
                        }
                        : { display: 'none' }
                }
            />
            <AnimatePresence>
                {hasSelection && (
                    <Popover.Portal forceMount>
                        <Popover.Content
                            asChild
                            side="top"
                            sideOffset={10}
                            align="center"
                            onOpenAutoFocus={(e) => e.preventDefault()}
                            onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                            <motion.div
                                className={styles.bubbleMenu}
                                {...menuAnimation}
                            >
                                {/* Group 1: Formatting toggles */}
                                <div className={styles.group}>
                                    <FormatButton
                                        mark="bold"
                                        icon="B"
                                        state={toolbarState.bold}
                                        onClick={() => editor.chain().focus().toggleBold().run()}
                                    />
                                    <FormatButton
                                        mark="italic"
                                        icon="I"
                                        state={toolbarState.italic}
                                        onClick={() => editor.chain().focus().toggleItalic().run()}
                                    />
                                    <FormatButton
                                        mark="underline"
                                        icon="U"
                                        state={toolbarState.underline}
                                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                                    />
                                </div>

                                <div className={styles.divider} />

                                {/* Group 2: Size dropdown */}
                                <SizeDropdown editor={editor} currentSize={toolbarState.currentSize || 'regular'} />

                                <div className={styles.divider} />

                                {/* Group 3: Emotion dropdown */}
                                <EmotionDropdown editor={editor} currentEmotion={toolbarState.currentEmotion} />

                                <div className={styles.divider} />

                                {/* Group 4: Actions */}
                                <button
                                    className={styles.button}
                                    onClick={onInteractiveClick}
                                    title="Interactive"
                                >
                                    <BookOpen size={16} />
                                </button>
                                <button
                                    className={styles.button}
                                    onClick={() => editor.chain().focus().unsetAllMarks().run()}
                                    title="Clear formatting"
                                >
                                    <Eraser size={16} />
                                </button>
                            </motion.div>
                        </Popover.Content>
                    </Popover.Portal>
                )}
            </AnimatePresence>
        </Popover.Root>
    );
}
