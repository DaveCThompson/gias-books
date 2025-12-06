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
});

export const BookSchema = z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    author: z.string().min(1),
    pages: z.array(PageSchema).min(1),
});
