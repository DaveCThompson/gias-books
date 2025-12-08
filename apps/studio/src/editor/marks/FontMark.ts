'use client';

import { Mark, mergeAttributes } from '@tiptap/core';
import { FONT_REGISTRY } from '@gia/schemas';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fontMark: {
            setFont: (fontId: string) => ReturnType;
            unsetFont: () => ReturnType;
        };
    }
}

export const FontMark = Mark.create({
    name: 'fontMark',

    addAttributes() {
        return {
            font: {
                default: null,
                parseHTML: (el) => el.getAttribute('data-font'),
                renderHTML: (attrs) => {
                    if (!attrs.font) return {};
                    return { 'data-font': attrs.font };
                },
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-font]' }];
    },

    renderHTML({ HTMLAttributes, mark }) {
        const fontId = mark.attrs.font;
        const fontConfig = fontId && FONT_REGISTRY[fontId];

        // Build inline styles from registry
        const styleRules: string[] = [];
        if (fontConfig?.family) {
            styleRules.push(`font-family: ${fontConfig.family}`);
        }
        if (fontConfig?.settings) {
            styleRules.push(`font-variation-settings: ${fontConfig.settings}`);
        }

        const style = styleRules.length > 0 ? styleRules.join('; ') : '';

        return ['span', mergeAttributes(HTMLAttributes, { style }), 0];
    },

    addCommands() {
        return {
            setFont:
                (fontId: string) =>
                    ({ commands }) => {
                        return commands.setMark(this.name, { font: fontId });
                    },
            unsetFont:
                () =>
                    ({ commands }) => {
                        return commands.unsetMark(this.name);
                    },
        };
    },
});
