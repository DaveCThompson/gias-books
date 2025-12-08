'use client';

import { Mark, mergeAttributes } from '@tiptap/core';
import { EFFECT_REGISTRY } from '@gia/schemas';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        effectMark: {
            setEffect: (effectId: string) => ReturnType;
            unsetEffect: () => ReturnType;
        };
    }
}

export const EffectMark = Mark.create({
    name: 'effectMark',

    addAttributes() {
        return {
            effect: {
                default: null,
                parseHTML: (el) => el.getAttribute('data-effect'),
                renderHTML: (attrs) => {
                    if (!attrs.effect) return {};
                    return { 'data-effect': attrs.effect };
                },
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-effect]' }];
    },

    renderHTML({ HTMLAttributes, mark }) {
        const effectId = mark.attrs.effect;
        const effectConfig = effectId && EFFECT_REGISTRY[effectId];

        // Build inline styles from registry
        const styleRules: string[] = [];
        if (effectConfig?.textShadow) {
            styleRules.push(`text-shadow: ${effectConfig.textShadow}`);
        }
        if (effectConfig?.WebkitTextStroke) {
            styleRules.push(`-webkit-text-stroke: ${effectConfig.WebkitTextStroke}`);
        }
        if (effectConfig?.filter) {
            styleRules.push(`filter: ${effectConfig.filter}`);
        }

        const style = styleRules.length > 0 ? styleRules.join('; ') : '';

        return ['span', mergeAttributes(HTMLAttributes, { style }), 0];
    },

    addCommands() {
        return {
            setEffect:
                (effectId: string) =>
                    ({ commands }) => {
                        return commands.setMark(this.name, { effect: effectId });
                    },
            unsetEffect:
                () =>
                    ({ commands }) => {
                        return commands.unsetMark(this.name);
                    },
        };
    },
});
