import { Editor } from '@tiptap/react';
import { useState, useEffect } from 'react';

export type MarkState = 'off' | 'on' | 'mixed';

interface ToolbarState {
    bold: MarkState;
    italic: MarkState;
    underline: MarkState;
    currentSize: string | null;
    currentFont: string | null;
    currentEffect: string | null;
    currentMotion: string | null;
    currentColor: string | null;
    currentBgColor: string | null;
}

const defaultState: ToolbarState = {
    bold: 'off',
    italic: 'off',
    underline: 'off',
    currentSize: null,
    currentFont: null,
    currentEffect: null,
    currentMotion: null,
    currentColor: null,
    currentBgColor: null,
};

function computeToolbarState(editor: Editor): ToolbarState {
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

    // Get current size
    let currentSize: string | null = null;
    editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.isText && !currentSize) {
            const sizeMark = node.marks.find((m) => m.type.name === 'textSize');
            if (sizeMark) {
                currentSize = sizeMark.attrs.size;
            }
        }
    });

    // Get current font
    let currentFont: string | null = null;
    editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.isText && !currentFont) {
            const fontMark = node.marks.find((m) => m.type.name === 'fontMark');
            if (fontMark) {
                currentFont = fontMark.attrs.font;
            }
        }
    });

    // Get current effect
    let currentEffect: string | null = null;
    editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.isText && !currentEffect) {
            const effectMark = node.marks.find((m) => m.type.name === 'effectMark');
            if (effectMark) {
                currentEffect = effectMark.attrs.effect;
            }
        }
    });

    // Get current motion
    let currentMotion: string | null = null;
    editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.isText && !currentMotion) {
            const motionMark = node.marks.find((m) => m.type.name === 'motionMark');
            if (motionMark) {
                currentMotion = motionMark.attrs.motion;
            }
        }
    });

    // Get current text color
    let currentColor: string | null = null;
    editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.isText && !currentColor) {
            const colorMark = node.marks.find((m) => m.type.name === 'textColor');
            if (colorMark) {
                currentColor = colorMark.attrs.color;
            }
        }
    });

    // Get current background color
    let currentBgColor: string | null = null;
    editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.isText && !currentBgColor) {
            const bgColorMark = node.marks.find((m) => m.type.name === 'textBgColor');
            if (bgColorMark) {
                currentBgColor = bgColorMark.attrs.bgcolor;
            }
        }
    });

    return {
        ...markStates,
        currentSize: currentSize || 'regular',
        currentFont,
        currentEffect,
        currentMotion,
        currentColor,
        currentBgColor,
    };
}

/**
 * Hook to compute reactive toolbar state from editor selection.
 * Uses useState + useEffect with editor event subscriptions.
 */
export function useToolbarState(editor: Editor | null): ToolbarState {
    const [state, setState] = useState<ToolbarState>(defaultState);

    useEffect(() => {
        if (!editor) {
            setState(defaultState);
            return;
        }

        const updateState = () => {
            setState(computeToolbarState(editor));
        };

        // Initial state
        updateState();

        // Subscribe to editor events
        editor.on('transaction', updateState);
        editor.on('selectionUpdate', updateState);

        return () => {
            editor.off('transaction', updateState);
            editor.off('selectionUpdate', updateState);
        };
    }, [editor]);

    return state;
}
