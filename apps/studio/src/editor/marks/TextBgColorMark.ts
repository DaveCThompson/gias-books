'use client';

import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        textBgColor: {
            setTextBgColor: (color: string) => ReturnType;
            unsetTextBgColor: () => ReturnType;
        };
    }
}

export const TextBgColorMark = Mark.create({
    name: 'textBgColor',

    addAttributes() {
        return {
            bgcolor: {
                default: null,
                parseHTML: (el) => el.getAttribute('data-bgcolor'),
                renderHTML: (attrs) => {
                    if (!attrs.bgcolor) return {};
                    return { 'data-bgcolor': attrs.bgcolor };
                },
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-bgcolor]' }];
    },

    renderHTML({ HTMLAttributes, mark }) {
        const bgcolor = mark.attrs.bgcolor;
        const style = bgcolor && bgcolor !== 'default'
            ? `background-color: var(--color-bg-${bgcolor}); padding: 0.1em 0.3em; border-radius: 0.25em;`
            : '';

        return ['span', mergeAttributes(HTMLAttributes, { style }), 0];
    },

    addCommands() {
        return {
            setTextBgColor:
                (color: string) =>
                    ({ commands }) => {
                        return commands.setMark(this.name, { bgcolor: color });
                    },
            unsetTextBgColor:
                () =>
                    ({ commands }) => {
                        return commands.unsetMark(this.name);
                    },
        };
    },
});


