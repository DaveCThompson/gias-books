import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        interactive: {
            setInteractive: (tooltip: string) => ReturnType;
            unsetInteractive: () => ReturnType;
        };
    }
}

export const InteractiveMark = Mark.create({
    name: 'interactive',

    addAttributes() {
        return {
            tooltip: {
                default: null,
                parseHTML: (el) => el.getAttribute('data-tooltip'),
                renderHTML: (attrs) => ({ 'data-tooltip': attrs.tooltip }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-interactive]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes({ 'data-interactive': 'true' }, HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setInteractive:
                (tooltip: string) =>
                    ({ commands }) => {
                        return commands.setMark(this.name, { tooltip });
                    },
            unsetInteractive:
                () =>
                    ({ commands }) => {
                        return commands.unsetMark(this.name);
                    },
        };
    },
});
