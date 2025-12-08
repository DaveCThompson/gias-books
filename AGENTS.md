# Agent Guidelines for Gia Workspace

Guidelines for AI agents working on the Madoodle monorepo.

---

## Project Purpose

**Madoodle** is a high-craft, mobile-first interactive storybook platform:
- **Viewer** (`apps/viewer`): Next.js 15 Pages Router – renders books for reading  
  *Package name: `gias-books`*
- **Studio** (`apps/studio`): Next.js 15 App Router – WYSIWYG editor for authoring  
  *Package name: `gia-studio`*

---

## Architecture Overview

```
gia-workspace/
├── apps/
│   ├── viewer/       Viewer app (Pages Router, SSG for deploy)
│   └── studio/       Editor app (App Router, TipTap)
└── packages/
    ├── schemas/      @gia/schemas – Zod + TypeScript types
    ├── design-system/ @gia/design-system – Shared CSS tokens
    ├── content/       @gia/content – Book data
    └── utils/         @gia/utils – Shared utilities (cn, EASING, DURATION)

### Key Libraries
- **Framer Motion** (as `motion@^12.0.0`) - Page transitions, gestures
- **@use-gesture/react** - Touch/drag gesture handling
- **Howler.js** - Unified audio playback
- **Radix UI** - Accessible component primitives
    └── ui/            @gia/ui – Shared UI components (Radix + motion)
```

### State Management
- **Zustand** stores in each app's `src/data/` (stores only)
- **Custom hooks** in each app's `src/hooks/` (flat structure)
- **Shared components** in `src/components/` (ErrorBoundary, etc.)
- Use proper selectors: `useStore((s) => s.field)` for reactivity

### Styling
- See **[STYLING-GUIDE.md](./STYLING-GUIDE.md)** for the complete styling guide
- **CSS Modules** – co-located `*.module.css` per component
- **oklch color space** – all colors via semantic variables
- **`cn()` utility** – import from `@gia/utils` for conditional classes
- **Phosphor Icons** – use `@phosphor-icons/react`, never emojis
- **Semantic tokens** – `--fg-secondary` for buttons, `--fg-tertiary` for chevrons

---

## Critical Rules

### ❌ Never Do

1. **Hardcode colors** – Always use `var(--color-*)` tokens
2. **Create app-level lockfiles** – Only root `package-lock.json`
3. **Use deprecated turbo config** – Use `"tasks"` not `"pipeline"`
4. **Use FlatCompat with eslint-config-next** – Causes circular reference errors
5. **Use primitive color vars in components** – Use semantic vars (e.g., `--color-expressive-bully` not `--color-expressive-red`)
6. **Create duplicate utility files** – Use `@gia/utils` for shared code
7. **Put hooks in `/data` folder** – `/data` is for Zustand stores only; hooks go in `/hooks`

### ✅ Always Do

1. **Run `npm run lint`** after significant changes
2. **Use ESLint 9 native flat config** in `eslint.config.mjs`
3. **Handle `null` returns** from async data fetching
4. **Use `'use client'`** for interactive components in App Router
5. **Keep shared dependencies aligned** – both apps should use same versions
6. **Check contrast** – primary buttons need white text (`--color-neutral-000`) on blue bg
7. **Import types from `@gia/schemas`** – not local type files
8. **Prefix unused params with `_`** – eslint ignores `_prefixed` vars

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `packages/schemas/src/index.ts` | Canonical types (BookData, PageData) |
| `packages/design-system/variables.css` | Design tokens (SOURCE OF TRUTH) |
| `packages/utils/src/index.ts` | Shared utilities (`cn()`, `EASING`, `DURATION`) |
| `apps/viewer/src/hooks/useNarration.ts` | Unified audio hook (Howler-based, with error handling) |
| `apps/viewer/src/hooks/useThemeManager.ts` | Theme management (data-theme attribute) |
| `apps/viewer/src/components/ErrorBoundary.tsx` | Error boundary with retry fallback UI |
| `apps/viewer/src/data/constants.ts` | Navigation, VFX, and audio timing constants |
| `apps/studio/src/utils/dslConverter.ts` | DSL ↔ HTML for TipTap |
| `apps/studio/src/utils/fileIO.ts` | Book CRUD via API |
| `apps/studio/src/components/Preview/PagePreview.tsx` | WYSIWYG page preview (mood, mask, text) |
| `apps/studio/src/components/Preview/ExpressiveTextPreview.tsx` | DSL text parser for preview |
| `apps/viewer/src/features/BookReader/InteractiveText.tsx` | DSL text parser for viewer |
| `apps/studio/src/editor/marks/TextColorMark.ts` | TipTap mark for foreground color |
| `apps/studio/src/editor/marks/TextBgColorMark.ts` | TipTap mark for background color |
| `apps/studio/src/hooks/useToolbarState.ts` | Reactive toolbar state from editor selection |
| `apps/studio/src/components/Editor/ColorDropdown.tsx` | Notion-style color picker dropdown |
| `apps/viewer/src/features/BookReader/components/PageCarousel.tsx` | 3-page carousel with spring physics |
| `apps/viewer/src/features/BookReader/BookReader.tsx` | Main reader component |

---

## Content Schema

```typescript
// packages/schemas/src/index.ts
type IllustrationData = string | { bg?: string; mid?: string; fg?: string };

interface PageData {
  pageNumber: number;
  text: string;
  illustration?: IllustrationData;
  mood?: 'calm' | 'whimsical' | 'playful' | 'mysterious' | 'adventurous' | 'cozy' | 'dreamy' | 'spooky' | 'tense' | 'joyful';
  effects?: EffectData[];
  layout?: 'fullbleed' | 'split' | 'textOnly';
}

interface BookData {
  slug: string;
  title: string;
  author: string;
  pages: PageData[];
}
```

### DSL Format (Critical)

Text content uses a custom DSL for formatting:

```
# Standard formatting
[b]bold[/b]  [i]italic[/i]  [u]underline[/u]  [s]strike[/s]  [code]code[/code]

# NEW: Atomic style syntax (composable attributes)
[style font="handwritten" color="red" bgcolor="yellow" size="large"]styled text[/style]

# Available attributes:
#   font: normal, handwritten, cute, bully, shout, spooky, angry
#   color: default, red, orange, green, blue, purple, pink, grey, brown
#   bgcolor: default, red, orange, green, blue, purple, pink, grey, brown, yellow
#   size: small, regular, large, giant, massive

# LEGACY: Expressive styles (still supported)
[expressive:handwritten]styled text[/expressive]
[expressive:shout]LOUD TEXT[/expressive]

# Interactive words (with tooltip)
[interactive:tooltip text]word[/interactive]
```

> **Important**: Interactive words display tooltips on click/hover. They do NOT trigger navigation.

**Nested tags ARE supported**: `[b][u]bold underline[/u][/b]`

**Viewer** parses via `InteractiveText.tsx` (recursive parser).
**Studio** preview uses `ExpressiveTextPreview.tsx` (recursive parser).
**Converter** `dslConverter.ts` handles TipTap HTML ↔ DSL.

### Size Tags

Standalone size styling (without expressive emotion):

```
[size:large]big text[/size]
[size:small]tiny text[/size]
```

Available sizes: `small`, `regular`, `large`, `giant`, `massive`

### IllustrationData Handling

`IllustrationData` can be a string OR object. Always extract appropriately:

```typescript
// ✅ Correct - handle both formats
const coverImage = typeof illustration === 'string' 
  ? illustration 
  : illustration?.bg || illustration?.mid || illustration?.fg;

// ❌ Wrong - will fail TypeScript with Image component
<Image src={illustration} />  // Type error if object
```

---

## Common Pitfalls & Fixes

### 1. ESLint 9 Configuration

Use native flat config, NOT FlatCompat with eslint-config-next:

```javascript
// ✅ eslint.config.mjs
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    rules: { ...nextPlugin.configs.recommended.rules },
  }
);
```

### 2. TipTap SSR (App Router)

```typescript
const editor = useEditor({
  immediatelyRender: false,  // ← Required for Next.js SSR
  extensions: [...],
});
```

### 3. DSL Converter Patterns

The DSL format must match between content files and the converter:

```typescript
// Content uses: [expressive:STYLE]text[/expressive]
// NOT: [STYLE]text[/STYLE]

// dslToHtml must output BOTH attributes for CSS targeting:
`<span data-expressive data-style="${style}">${content}</span>`
```

### 4. Color Contrast

Primary buttons need sufficient contrast:

```css
/* ✅ CORRECT - white on blue */
.button.active {
  background: var(--color-primary);        /* L=55% blue */
  color: var(--color-neutral-000);         /* L=100% white */
}

/* ❌ WRONG - dark on blue = poor contrast */
.button.active {
  color: var(--color-button-text);         /* L=25% = fails WCAG */
}
```

### 5. View Transitions API

Types are now available in TypeScript 5.4+ – remove outdated @ts-expect-error:

```typescript
// ✅ Current (types available)
document.startViewTransition(() => router.push(url));
```

### 6. TipTap Editor State Reactivity

When reading editor state (selection, marks, etc.), subscribe to editor events:

```typescript
// ✅ CORRECT - useEffect with event subscriptions
useEffect(() => {
    if (!editor) return;
    
    const updateState = () => {
        // Read from editor.state here
    };
    
    editor.on('transaction', updateState);
    editor.on('selectionUpdate', updateState);
    
    return () => {
        editor.off('transaction', updateState);
        editor.off('selectionUpdate', updateState);
    };
}, [editor]);

// ❌ WRONG - useMemo with [editor] dependency doesn't update on selection changes
const state = useMemo(() => computeState(editor), [editor]);
```

---

## Monorepo Workflow

### Adding a New Package

```bash
mkdir packages/new-package
cd packages/new-package
npm init -y
# Update name to "@gia/new-package"
```

Remember to:
1. Export types/functions from `src/index.ts`
2. Add build script if using TypeScript
3. Reference via `"@gia/new-package": "*"` in consuming apps

### Shared Styles

Import design-system package in app entry CSS:

```css
/* apps/viewer/src/styles/index.css */
@import '@gia/design-system';
```

---

## Testing Workflow

1. Run `npm run lint` – catches TypeScript and style issues
2. Run `npm run build` – validates production builds
3. Test viewer: `npm run dev --workspace=gias-books`
4. Test studio: `npm run dev --workspace=gia-studio` (auto-uses port 3001)
5. Verify content renders correctly in both apps

---

## Deployment Notes

### Viewer Static Export

For GitHub Pages, set environment variable:

```powershell
$env:DEPLOY_TARGET='github-pages'
npm run build
```

This enables `output: 'export'` and sets `basePath: '/gias-books'`.
