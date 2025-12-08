'use client';

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';

/**
 * SelectionExtension
 *
 * Provides improved double-click word selection behavior:
 * - Selects only the word characters, excluding trailing whitespace.
 */
export const SelectionExtension = Extension.create({
    name: 'selectionExtension',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('selectionExtension'),
                props: {
                    handleDoubleClick(view, pos, event) {
                        // Prevent default browser double-click selection
                        event.preventDefault();

                        const { state } = view;
                        const { doc } = state;

                        // Find the word boundaries at the clicked position
                        const $pos = doc.resolve(pos);
                        const textBefore = $pos.parent.textBetween(
                            0,
                            $pos.parentOffset,
                            undefined,
                            '\ufffc'
                        );
                        const textAfter = $pos.parent.textBetween(
                            $pos.parentOffset,
                            $pos.parent.content.size,
                            undefined,
                            '\ufffc'
                        );

                        // Match word characters before cursor
                        const wordBefore = textBefore.match(/[\w]+$/);
                        // Match word characters after cursor (no trailing space)
                        const wordAfter = textAfter.match(/^[\w]+/);

                        if (!wordBefore && !wordAfter) {
                            // Not on a word, let default behavior occur
                            return false;
                        }

                        const startOffset =
                            $pos.parentOffset - (wordBefore ? wordBefore[0].length : 0);
                        const endOffset =
                            $pos.parentOffset + (wordAfter ? wordAfter[0].length : 0);

                        // Convert parent offsets to document positions
                        const start = $pos.start() + startOffset;
                        const end = $pos.start() + endOffset;

                        // Create and dispatch the new selection
                        const tr = state.tr.setSelection(
                            TextSelection.create(doc, start, end)
                        );
                        view.dispatch(tr);

                        return true; // Handled
                    },
                },
            }),
        ];
    },
});
