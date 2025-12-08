'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { FontMark } from '@/editor/marks/FontMark';
import { EffectMark } from '@/editor/marks/EffectMark';
import { MotionMark } from '@/editor/marks/MotionMark';
import { InteractiveMark } from '@/editor/marks/InteractiveMark';
import { SizeMark } from '@/editor/marks/SizeMark';
import { TextColorMark } from '@/editor/marks/TextColorMark';
import { TextBgColorMark } from '@/editor/marks/TextBgColorMark';
import { SelectionExtension } from '@/editor/extensions/SelectionExtension';
import { dslToHtml, htmlToDsl } from '@/utils/dslConverter';
import { useBookStore } from '@/data/stores/bookStore';
import { useEffect, useState } from 'react';
import { InteractiveModal } from './InteractiveModal';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { cn } from '@gia/utils';
import styles from './TextEditor.module.css';



export function TextEditor() {
    const currentPageIndex = useBookStore((state) => state.currentPageIndex);
    const book = useBookStore((state) => state.book);
    const updatePage = useBookStore((state) => state.updatePage);
    const page = book?.pages[currentPageIndex] ?? null;

    const [showInteractiveModal, setShowInteractiveModal] = useState(false);
    const [selectedText, setSelectedText] = useState('');


    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ heading: false }),
            Underline, // Keep for DSL support
            FontMark,
            EffectMark,
            MotionMark,
            InteractiveMark,
            SizeMark,
            TextColorMark,
            TextBgColorMark,
            SelectionExtension,
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
        if (!editor || editor.state.selection.empty) {
            return; // No text selected
        }
        // Capture the selected text for preview
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, '');
        setSelectedText(text);
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
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                    >
                        ↶ Undo
                    </button>
                    <button
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo (Ctrl+Y)"
                    >
                        ↷ Redo
                    </button>
                </div>

                <EditorContent editor={editor} className={styles.editor} />

                <EditorBubbleMenu
                    editor={editor}
                    onInteractiveClick={handleInteractiveClick}
                />

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
                    selectedText={selectedText}
                    onConfirm={handleInteractiveConfirm}
                    onCancel={() => setShowInteractiveModal(false)}
                />
            )}

        </>
    );
}
