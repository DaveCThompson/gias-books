'use client';

import { Editor } from '@tiptap/react';
import { useToolbarState, MarkState } from '@/hooks/useToolbarState';
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

export function EditorBubbleMenu({ editor, onInteractiveClick }: EditorBubbleMenuProps) {
    const toolbarState = useToolbarState(editor);

    // Don't render if no selection
    if (!editor || editor.state.selection.empty) {
        return null;
    }

    return (
        <div className={styles.bubbleMenu}>
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
                📖
            </button>
            <button
                className={styles.button}
                onClick={() => editor.chain().focus().unsetAllMarks().run()}
                title="Clear formatting"
            >
                ⊘
            </button>
        </div>
    );
}
