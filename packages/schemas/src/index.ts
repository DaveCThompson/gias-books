import { z } from 'zod';

// Parallax support: single string OR layered object
export type IllustrationData =
    | string
    | { bg?: string; mid?: string; fg?: string };

// VFX/SFX effect
export interface EffectData {
    type: 'vfx' | 'sfx';
    name: string;
    trigger: 'onPageEnter' | 'onPageExit';
}

export interface PageData {
    pageNumber: number;
    text: string;
    illustration?: IllustrationData;
    mask?: string;
    narrationUrl?: string;
    mood?: 'calm' | 'tense' | 'joyful';
    effects?: EffectData[];
    layout?: 'fullbleed' | 'split' | 'textOnly';
    animateText?: boolean;
}

export interface BookData {
    slug: string;
    title: string;
    author: string;
    pages: PageData[];
}

// Zod schemas for validation
const IllustrationSchema = z.union([
    z.string(),
    z.object({
        bg: z.string().optional(),
        mid: z.string().optional(),
        fg: z.string().optional(),
    }),
]);

const EffectSchema = z.object({
    type: z.enum(['vfx', 'sfx']),
    name: z.string(),
    trigger: z.enum(['onPageEnter', 'onPageExit']),
});

export const PageSchema = z.object({
    pageNumber: z.number().int().positive(),
    text: z.string().min(1),
    illustration: IllustrationSchema.optional(),
    mask: z.string().optional(),
    narrationUrl: z.string().optional(),
    mood: z.enum(['calm', 'tense', 'joyful']).optional(),
    effects: z.array(EffectSchema).optional(),
    layout: z.enum(['fullbleed', 'split', 'textOnly']).optional(),
    animateText: z.boolean().optional(),
});

export const BookSchema = z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    author: z.string().min(1),
    pages: z.array(PageSchema).min(1),
});

// ============================================================================
// ATOMIC REGISTRIES - Decoupled Styling (PRD-003)
// ============================================================================

/** Font Configuration */
export interface FontConfig {
    family: string;
    settings?: string; // font-variation-settings
}

/** Color Configuration */
export type ColorConfig = string; // CSS variable reference

/** Motion/Animation Configuration */
export interface MotionConfig {
    animation: string;     // animation-name
    duration?: string;     // duration (defaults to --duration-normal)
}

/** Size Configuration */
export const EXPRESSIVE_SIZES = ['small', 'regular', 'large', 'giant', 'massive'] as const;
export type ExpressiveSize = typeof EXPRESSIVE_SIZES[number];

/** ─── FONT REGISTRY ─── */
export const FONT_REGISTRY: Record<string, FontConfig> = {
    body: { family: 'var(--font-body)' },
    display: { family: 'var(--font-display)', settings: '"wght" 600' },
    handwritten: { family: 'var(--font-handwritten)' },
    fredoka: { family: 'var(--font-fredoka)', settings: '"wght" 600' },
    playpen: { family: 'var(--font-playpen)', settings: '"wght" 600' },
    roboto: { family: 'var(--font-roboto-flex)', settings: '"wght" 700' },
};

/** ─── COLOR REGISTRY ─── */
export const COLOR_REGISTRY: Record<string, ColorConfig> = {
    // Named Colors (from PRD-001)
    red: 'var(--color-red)',
    orange: 'var(--color-orange)',
    amber: 'var(--color-amber)',
    green: 'var(--color-green)',
    cyan: 'var(--color-cyan)',
    blue: 'var(--color-blue)',
    purple: 'var(--color-purple)',
    pink: 'var(--color-pink)',

    // Semantic aliases
    primary: 'var(--fg-primary)',
    brand: 'var(--fg-brand)',

    // Expressive emotion colors (for legacy support)
    'emotion-happy': 'var(--fg-expressive-happy)',
    'emotion-sad': 'var(--fg-expressive-sad)',
    'emotion-shout': 'var(--fg-expressive-shout)',
    'emotion-angry': 'var(--fg-expressive-angry)',
    'emotion-nervous': 'var(--fg-expressive-nervous)',
    'emotion-spooky': 'var(--fg-expressive-spooky)',
    'emotion-silly': 'var(--fg-expressive-silly)',
    'emotion-brave': 'var(--fg-expressive-brave)',
    'emotion-whisper': 'var(--fg-expressive-whisper)',
    'emotion-magical': 'var(--fg-expressive-magical)',
    'emotion-grumpy': 'var(--fg-expressive-grumpy)',
    'emotion-dreamy': 'var(--fg-expressive-dreamy)',
};

/** ─── MOTION REGISTRY ─── */
export const MOTION_REGISTRY: Record<string, MotionConfig> = {
    bounce: { animation: 'bounce', duration: 'var(--duration-normal)' },
    shake: { animation: 'shake', duration: 'var(--duration-fast)' },
    wiggle: { animation: 'wiggle', duration: 'var(--duration-normal)' },
    sway: { animation: 'sway', duration: 'var(--duration-slow)' },
    shimmer: { animation: 'shimmer', duration: 'var(--duration-slow)' },
    flicker: { animation: 'flicker', duration: 'var(--duration-normal)' },
    clench: { animation: 'clench', duration: 'var(--duration-fast)' },
    shout: { animation: 'shout', duration: 'var(--duration-fast)' },
};

// ============================================================================
// LEGACY EMOTION PRESETS (Backward Compatibility)
// ============================================================================

/** Style configuration for an emotion (legacy format) */
export interface EmotionStyle {
    id: string;
    label: string;
    fontFamily: string;
    fontVariationSettings?: string;
    color?: string;
    animation?: string;
    textShadow?: string;
    transform?: string;
}

/**
 * Master configuration for all expressive text emotions.
 * This is the single source of truth used by both Studio and Viewer.
 */
export const EMOTION_STYLES: EmotionStyle[] = [
    // Core emotions
    { id: 'normal', label: 'Normal', fontFamily: 'var(--font-body)' },
    { id: 'happy', label: 'Happy', fontFamily: 'var(--font-fredoka)', fontVariationSettings: '"wght" 600', animation: 'bounce' },
    { id: 'sad', label: 'Sad', fontFamily: 'var(--font-body)', fontVariationSettings: '"wght" 300' },
    {
        id: 'shout',
        label: 'SHOUT',
        fontFamily: 'var(--font-fredoka)',
        fontVariationSettings: '"wght" 700',
        animation: 'shout',
        textShadow: '2px 2px 0px rgba(0,0,0,0.2)'
    },
    { id: 'angry', label: 'Angry', fontFamily: 'var(--font-roboto-flex)', fontVariationSettings: '"wght" 800, "wdth" 90', color: 'var(--fg-expressive-angry)', animation: 'clench' },
    { id: 'nervous', label: 'Nervous', fontFamily: 'var(--font-playpen)', animation: 'wiggle' },
    { id: 'whisper', label: 'whisper', fontFamily: 'var(--font-body)', fontVariationSettings: '"wght" 300' },
    { id: 'silly', label: 'Silly', fontFamily: 'var(--font-playpen)', fontVariationSettings: '"wght" 600', animation: 'bounce' },
    {
        id: 'spooky',
        label: 'Spooky',
        fontFamily: 'var(--font-fredoka)',
        color: 'var(--fg-expressive-spooky)',
        animation: 'flicker',
        textShadow: '0 0 8px rgba(100, 255, 100, 0.6)'
    },
    {
        id: 'magical',
        label: '✨Magic✨',
        fontFamily: 'var(--font-body)',
        color: 'var(--fg-expressive-magical)',
        animation: 'shimmer',
        textShadow: '0 0 10px gold, 0 0 20px purple'
    },
    { id: 'brave', label: 'Brave', fontFamily: 'var(--font-roboto-flex)', fontVariationSettings: '"wght" 700' },
    { id: 'grumpy', label: 'Grumpy', fontFamily: 'var(--font-roboto-flex)', fontVariationSettings: '"wght" 600, "wdth" 90' },
    {
        id: 'dreamy',
        label: 'Dreamy',
        fontFamily: 'var(--font-body)',
        color: 'var(--fg-expressive-dreamy)',
        animation: 'sway',
        textShadow: '0 0 4px rgba(255, 255, 255, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.1)'
    },
    // Legacy styles (maintained for backward compatibility)
    { id: 'handwritten', label: 'Handwritten', fontFamily: 'var(--font-handwritten)', color: 'var(--color-interactive)' },
    {
        id: 'bully',
        label: 'Bully',
        fontFamily: 'var(--font-display)',
        fontVariationSettings: '"wght" 700',
        color: 'var(--fg-expressive-angry)',
        transform: 'skew(-5deg) scale(1.05)',
        textShadow: '1px 1px 0px black'
    },
];

/** Scale factors for each text size */
export const SIZE_SCALES: Record<ExpressiveSize, string> = {
    small: '0.85em',
    regular: '1em',
    large: '1.3em',
    giant: '1.8em',
    massive: '2.5em',
};

/**
 * Get the style configuration for an emotion (legacy).
 * Falls back to 'normal' if emotion not found.
 */
export function getEmotionStyle(id: string): EmotionStyle {
    return EMOTION_STYLES.find(e => e.id === id) || EMOTION_STYLES[0];
}

// ============================================================================
// UNIFIED STYLE RESOLVER
// ============================================================================

/** Composable style attributes (new format) */
export interface StyleAttributes {
    font?: string;
    color?: string;
    motion?: string;
    size?: ExpressiveSize;
}

/** Resolved CSS properties ready for inline styles */
export interface ResolvedStyle {
    fontFamily?: string;
    fontVariationSettings?: string;
    color?: string;
    animation?: string;
    animationDuration?: string;
    textShadow?: string;
    transform?: string;
    fontSize?: string;
}

/**
 * Resolve style attributes to CSS properties.
 * Supports both legacy emotions and new atomic attributes.
 * 
 * @param attrs - Either a legacy emotion ID or atomic style attributes
 * @returns CSS properties ready for inline styles
 */
export function resolveStyle(attrs: string | StyleAttributes): ResolvedStyle {
    // Legacy: emotion ID string
    if (typeof attrs === 'string') {
        const emotion = getEmotionStyle(attrs);
        return {
            fontFamily: emotion.fontFamily,
            fontVariationSettings: emotion.fontVariationSettings,
            color: emotion.color,
            animation: emotion.animation,
            textShadow: emotion.textShadow,
            transform: emotion.transform,
        };
    }

    // New: atomic attributes
    const resolved: ResolvedStyle = {};

    if (attrs.font && FONT_REGISTRY[attrs.font]) {
        const font = FONT_REGISTRY[attrs.font];
        resolved.fontFamily = font.family;
        resolved.fontVariationSettings = font.settings;
    }

    if (attrs.color && COLOR_REGISTRY[attrs.color]) {
        resolved.color = COLOR_REGISTRY[attrs.color];
    }

    if (attrs.motion && MOTION_REGISTRY[attrs.motion]) {
        const motion = MOTION_REGISTRY[attrs.motion];
        resolved.animation = motion.animation;
        resolved.animationDuration = motion.duration;
    }

    if (attrs.size) {
        resolved.fontSize = getSizeScale(attrs.size);
    }

    return resolved;
}

/**
 * Get the CSS font-size value for a size name.
 * Falls back to 'regular' (1em) if size not found.
 */
export function getSizeScale(size: string): string {
    return SIZE_SCALES[size as ExpressiveSize] || SIZE_SCALES.regular;
}
