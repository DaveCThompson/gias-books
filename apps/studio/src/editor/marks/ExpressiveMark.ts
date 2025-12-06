import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        expressive: {
            setExpressive: (style: string) => ReturnType;
            unsetExpressive: () => ReturnType;
        };
    }
}

export const ExpressiveMark = Mark.create({
    name: 'expressive',

    addAttributes() {
        return {
            style: {
                default: null,
                parseHTML: (el) => el.getAttribute('data-style'),
                renderHTML: (attrs) => ({ 'data-style': attrs.style }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-expressive]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes({ 'data-expressive': 'true' }, HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setExpressive:
                (style: string) =>
                    ({ commands }) => {
                        return commands.setMark(this.name, { style });
                    },
            unsetExpressive:
                () =>
                    ({ commands }) => {
                        return commands.unsetMark(this.name);
                    },
        };
    },
});
