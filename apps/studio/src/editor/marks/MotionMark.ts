'use client';

import { Mark, mergeAttributes } from '@tiptap/core';
import { MOTION_REGISTRY } from '@gia/schemas';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        motionMark: {
            setMotion: (motionId: string) => ReturnType;
            unsetMotion: () => ReturnType;
        };
    }
}

export const MotionMark = Mark.create({
    name: 'motionMark',

    addAttributes() {
        return {
            motion: {
                default: null,
                parseHTML: (el) => el.getAttribute('data-motion'),
                renderHTML: (attrs) => {
                    if (!attrs.motion) return {};
                    return { 'data-motion': attrs.motion };
                },
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-motion]' }];
    },

    renderHTML({ HTMLAttributes, mark }) {
        const motionId = mark.attrs.motion;
        const motionConfig = motionId && MOTION_REGISTRY[motionId];

        // Build inline styles from registry
        // Note: Animations are typically applied via CSS class, but we can set animation-name inline
        const styleRules: string[] = [];
        if (motionConfig?.animation) {
            styleRules.push(`animation-name: ${motionConfig.animation}`);
            styleRules.push(`animation-duration: ${motionConfig.duration || 'var(--duration-normal)'}`);
            styleRules.push('animation-iteration-count: infinite');
        }

        const style = styleRules.length > 0 ? styleRules.join('; ') : '';

        return ['span', mergeAttributes(HTMLAttributes, { style }), 0];
    },

    addCommands() {
        return {
            setMotion:
                (motionId: string) =>
                    ({ commands }) => {
                        return commands.setMark(this.name, { motion: motionId });
                    },
            unsetMotion:
                () =>
                    ({ commands }) => {
                        return commands.unsetMark(this.name);
                    },
        };
    },
});
