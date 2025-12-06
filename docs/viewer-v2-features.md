# Viewer V2 Features

> **Added:** December 2024  
> **Purpose:** Prepare viewer to consume content from the upcoming Madoodle Studio editor.

---

## 1. Schema Evolution

The content schema (`src/data/types.ts`) was expanded to support new features:

### New Types

```typescript
// Parallax illustration support
export type IllustrationData =
  | string                    // Simple: "/path/to/image.png"
  | { bg?: string; mid?: string; fg?: string };  // Parallax layers

// Visual/Sound effects
export interface EffectData {
  type: 'vfx' | 'sfx';
  name: string;               // 'sparkle', 'whoosh', etc.
  trigger: 'onPageEnter' | 'onPageExit';
}
```

### Updated PageData

```typescript
export interface PageData {
  pageNumber: number;
  text: string;
  illustration?: IllustrationData;  // ← Now supports parallax
  mask?: string;
  narrationUrl?: string;
  mood?: 'calm' | 'tense' | 'joyful';
  effects?: EffectData[];           // ← New
  layout?: 'fullbleed' | 'split' | 'textOnly'; // ← New
}
```

---

## 2. New Components

### ParallaxIllustration
`src/features/BookReader/components/ParallaxIllustration.tsx`

Renders single images or multi-layer parallax illustrations (background, midground, foreground).

### VFXRenderer
`src/features/BookReader/components/VFXRenderer.tsx`

Handles visual effects triggered on page enter/exit:
- **sparkle** - Floating sparkle particles
- **fade** - Smooth fade transition
- **slide** - Sliding overlay effect

### SFXPlayer
`src/features/BookReader/components/SFXPlayer.ts`

Plays sound effects on page events:
- `whoosh`, `chime`, `sparkle`, `bell`
- Audio files expected in `public/audio/sfx/`

---

## 3. Layout Variations

Three page layouts are now supported via the `layout` field:

| Layout | Description |
|--------|-------------|
| `split` | Default - illustration above, text below |
| `fullbleed` | Full-screen illustration with text overlay |
| `textOnly` | Text only, no illustration |

CSS in `Page.module.css` handles each layout.

---

## 4. Validation Updates

The Zod schema (`src/data/schemas/book.schema.mjs`) was updated to validate:
- Union type for `illustration` (string or object)
- `effects` array with type, name, trigger
- `layout` enum

Run `npm run validate` to check content integrity.

---

## 5. Backward Compatibility

All new fields are **optional**. Existing `data.json` files continue to work without modification.

---

## Related Documentation

- [Studio Implementation Plan](./STUDIO-IMPLEMENTATION-PLAN.md) - Full plan for building the companion editor
