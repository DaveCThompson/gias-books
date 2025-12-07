import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        textSize: {
            setTextSize: (size: string) => ReturnType;
            unsetTextSize: () => ReturnType;
        };
    }
}

export const SizeMark = Mark.create({
    name: 'textSize',

    addAttributes() {
        return {
            size: {
                default: 'regular',
                parseHTML: (el) => el.getAttribute('data-size') || 'regular',
                renderHTML: (attrs) =>
                    attrs.size && attrs.size !== 'regular'
                        ? { 'data-size': attrs.size }
                        : {},
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-size]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setTextSize:
                (size: string) =>
                    ({ commands }) => {
                        return commands.setMark(this.name, { size });
                    },
            unsetTextSize:
                () =>
                    ({ commands }) => {
                        return commands.unsetMark(this.name);
                    },
        };
    },
});
