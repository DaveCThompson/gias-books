'use client';

import { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';

export interface SelectionCoords {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Hook to track the bounding rect of the current text selection.
 * Returns null when no text is selected.
 */
export function useSelectionCoords(editor: Editor | null): SelectionCoords | null {
    const [coords, setCoords] = useState<SelectionCoords | null>(null);

    const updateCoords = useCallback(() => {
        if (!editor || editor.state.selection.empty) {
            setCoords(null);
            return;
        }

        // Get the DOM selection
        const { view } = editor;
        const { from, to } = editor.state.selection;

        // Get the bounding rect of the selection
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);

        // Calculate bounding box (handle multi-line selections)
        const rect = {
            x: Math.min(start.left, end.left),
            y: Math.min(start.top, end.top),
            width: Math.abs(end.left - start.left) || 100, // Fallback width
            height: Math.abs(end.bottom - start.top),
        };

        setCoords(rect);
    }, [editor]);

    useEffect(() => {
        if (!editor) return;

        // Update on selection change
        editor.on('selectionUpdate', updateCoords);
        editor.on('transaction', updateCoords);

        // Initial update
        updateCoords();

        return () => {
            editor.off('selectionUpdate', updateCoords);
            editor.off('transaction', updateCoords);
        };
    }, [editor, updateCoords]);

    return coords;
}
