import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        expressive: {
            setExpressive: (style: string, size?: string) => ReturnType;
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
        return [{ tag: 'span[data-expressive]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes({ 'data-expressive': 'true' }, HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setExpressive:
                (style: string, size: string = 'regular') =>
                    ({ commands }) => {
                        return commands.setMark(this.name, { style, size });
                    },
            unsetExpressive:
                () =>
                    ({ commands }) => {
                        return commands.unsetMark(this.name);
                    },
        };
    },
});
