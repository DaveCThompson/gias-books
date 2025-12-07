import { Editor } from '@tiptap/react';
import { useMemo } from 'react';

export type MarkState = 'off' | 'on' | 'mixed';

interface ToolbarState {
    bold: MarkState;
    italic: MarkState;
    underline: MarkState;
    currentSize: string | null;
    currentEmotion: string | null;
}

/**
 * Hook to compute reactive toolbar state from editor selection.
 * Handles mixed selections (e.g., partially bold text).
 */
export function useToolbarState(editor: Editor | null): ToolbarState {
    return useMemo(() => {
        if (!editor) {
            return {
                bold: 'off',
                italic: 'off',
                underline: 'off',
                currentSize: null,
                currentEmotion: null,
            };
        }

        const { from, to } = editor.state.selection;
        const marks = ['bold', 'italic', 'underline'] as const;

        // Check each mark for mixed state
        const markStates = marks.reduce((acc, mark) => {
            let hasActive = false;
            let hasInactive = false;

            editor.state.doc.nodesBetween(from, to, (node) => {
                if (node.isText) {
                    if (node.marks.some((m) => m.type.name === mark)) {
                        hasActive = true;
                    } else {
                        hasInactive = true;
                    }
                }
            });

            acc[mark] = hasActive && hasInactive ? 'mixed' : hasActive ? 'on' : 'off';
            return acc;
        }, {} as Record<typeof marks[number], MarkState>);

        // Get current size (from first text node with size mark)
        let currentSize: string | null = null;
        editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.isText && !currentSize) {
                const sizeMark = node.marks.find((m) => m.type.name === 'textSize');
                if (sizeMark) {
                    currentSize = sizeMark.attrs.size;
                }
            }
        });

        // Get current emotion (from first text node with expressive mark)
        let currentEmotion: string | null = null;
        editor.state.doc.nodesBetween(from, to, (node) => {
            if (node.isText && !currentEmotion) {
                const expressiveMark = node.marks.find((m) => m.type.name === 'expressive');
                if (expressiveMark) {
                    currentEmotion = expressiveMark.attrs.style;
                }
            }
        });

        return {
            ...markStates,
            currentSize: currentSize || 'regular',
            currentEmotion,
        };
    }, [editor]);
}
