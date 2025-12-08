'use client';

import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        textColor: {
            setTextColor: (color: string) => ReturnType;
            unsetTextColor: () => ReturnType;
        };
    }
}

export const TextColorMark = Mark.create({
    name: 'textColor',

    addAttributes() {
        return {
            color: {
                default: null,
                parseHTML: (el) => el.getAttribute('data-color'),
                renderHTML: (attrs) => {
                    if (!attrs.color) return {};
                    return { 'data-color': attrs.color };
                },
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-color]' }];
    },

    renderHTML({ HTMLAttributes, mark }) {
        const color = mark.attrs.color;
        const style = color && color !== 'default'
            ? `color: var(--color-${color});`
            : '';

        return ['span', mergeAttributes(HTMLAttributes, { style }), 0];
    },

    addCommands() {
        return {
            setTextColor:
                (color: string) =>
                    ({ commands }) => {
                        return commands.setMark(this.name, { color });
                    },
            unsetTextColor:
                () =>
                    ({ commands }) => {
                        return commands.unsetMark(this.name);
                    },
        };
    },
});


