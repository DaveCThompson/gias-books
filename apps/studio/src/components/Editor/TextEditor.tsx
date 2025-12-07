'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { ExpressiveMark } from '@/editor/marks/ExpressiveMark';
import { InteractiveMark } from '@/editor/marks/InteractiveMark';
import { dslToHtml, htmlToDsl } from '@/utils/dslConverter';
import { useBookStore } from '@/data/stores/bookStore';
import { useEffect, useState } from 'react';
import { InteractiveModal } from './InteractiveModal';
import { ExpressiveToolbar } from './ExpressiveToolbar';
import { cn } from '@gia/utils';
import styles from './TextEditor.module.css';

export function TextEditor() {
    const currentPageIndex = useBookStore((state) => state.currentPageIndex);
    const book = useBookStore((state) => state.book);
    const updatePage = useBookStore((state) => state.updatePage);
    const page = book?.pages[currentPageIndex] ?? null;

    const [showInteractiveModal, setShowInteractiveModal] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ heading: false }),
            Underline,
            ExpressiveMark,
            InteractiveMark,
        ],
        content: page ? dslToHtml(page.text) : '',
        onUpdate: ({ editor }) => {
            const dsl = htmlToDsl(editor.getHTML());
            updatePage({ text: dsl });
        },
    });

    // Update editor when page changes
    useEffect(() => {
        if (editor && page) {
            const currentHtml = editor.getHTML();
            const newHtml = dslToHtml(page.text);
            if (currentHtml !== newHtml) {
                editor.commands.setContent(newHtml);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, page?.pageNumber]);

    const handleInteractiveClick = () => {
        if (editor?.state.selection.empty) {
            return; // No text selected
        }
        setShowInteractiveModal(true);
    };

    const handleInteractiveConfirm = (tooltip: string) => {
        editor?.chain().focus().setInteractive(tooltip).run();
        setShowInteractiveModal(false);
    };

    if (!editor || !page) return null;

    // Mood class for visual preview
    const moodClass = page.mood ? styles[`mood-${page.mood}`] : '';

    return (
        <>
            <div className={cn(styles.container, moodClass)}>
                <div className={styles.toolbar}>
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? styles.active : ''}
                    >
                        B
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? styles.active : ''}
                    >
                        I
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={editor.isActive('underline') ? styles.active : ''}
                    >
                        U
                    </button>

                    <span className={styles.divider} />

                    <button
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                    >
                        ↶
                    </button>
                    <button
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo (Ctrl+Y)"
                    >
                        ↷
                    </button>

                    <span className={styles.divider} />

                    <ExpressiveToolbar
                        editor={editor}
                        disabled={editor.state.selection.empty}
                    />

                    <button
                        onClick={handleInteractiveClick}
                        disabled={editor.state.selection.empty}
                        title="Select text first"
                    >
                        📖 Interactive
                    </button>

                    <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>
                        Clear
                    </button>
                </div>

                <EditorContent editor={editor} className={styles.editor} />

                {page.mood && (
                    <div className={styles.moodBadge}>
                        {page.mood === 'calm' && '🌿'}
                        {page.mood === 'tense' && '⚡'}
                        {page.mood === 'joyful' && '✨'}
                        {' '}{page.mood}
                    </div>
                )}
            </div>

            {showInteractiveModal && (
                <InteractiveModal
                    initialText=""
                    onConfirm={handleInteractiveConfirm}
                    onCancel={() => setShowInteractiveModal(false)}
                />
            )}
        </>
    );
}
