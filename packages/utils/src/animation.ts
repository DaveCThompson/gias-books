// packages/utils/src/animation.ts

/**
 * Animation easing functions as cubic-bezier arrays for Framer Motion.
 * Values match the CSS variables in design-system/variables.css.
 */
export const EASING = {
    /** Standard ease-out - smooth deceleration */
    out: [0, 0, 0.2, 1] as const,
    /** Ease in-out - smooth acceleration and deceleration */
    inOut: [0.4, 0, 0.2, 1] as const,
    /** Exponential ease-out - dramatic deceleration */
    outExpo: [0.16, 1, 0.3, 1] as const,
} as const;

/**
 * Animation durations in seconds for Framer Motion.
 * Values match the CSS variables in design-system/variables.css.
 */
export const DURATION = {
    /** Fast - 150ms */
    fast: 0.15,
    /** Normal - 300ms */
    normal: 0.3,
    /** Slow - 500ms */
    slow: 0.5,
    /** Morph transition - 400ms */
    morph: 0.4,
    /** Fade transition - 200ms */
    fade: 0.2,
} as const;

export type EasingType = keyof typeof EASING;
export type DurationType = keyof typeof DURATION;
