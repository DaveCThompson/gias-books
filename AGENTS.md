# Agent Guidelines for Gia Workspace

Guidelines for AI agents working on the Madoodle monorepo.

---

## Project Purpose

**Madoodle** is a high-craft, mobile-first interactive storybook platform:
- **Viewer** (`apps/viewer`): Next.js 15 Pages Router – renders books for reading
- **Studio** (`apps/studio`): Next.js 16 App Router – WYSIWYG editor for authoring

---

## Architecture Overview

```
gia-workspace/
├── apps/
│   ├── viewer/       Viewer app (Pages Router, SSG for deploy)
│   └── studio/       Editor app (App Router, TipTap)
└── packages/
    ├── schemas/      @gia/schemas – Zod + TypeScript types
    ├── design-system/ @gia/design-system – Shared CSS
    └── content/       @gia/content – Book data
```

### State Management
- **Zustand** stores in each app's `src/data/stores/`
- Use proper selectors: `useStore((s) => s.field)` for reactivity

### Styling
- See **[CSS-PRINCIPLES.md](./CSS-PRINCIPLES.md)** for the complete styling guide
- **CSS Modules** – co-located `*.module.css` per component
- **oklch color space** – all colors via semantic variables
- **`cn()` utility** – use for conditional classes (wraps `clsx`)

---

## Critical Rules

### ❌ Never Do

1. **Hardcode colors** – Always use `var(--color-*)` tokens
2. **Create app-level lockfiles** – Only root `package-lock.json`
3. **Use deprecated turbo config** – Use `"tasks"` not `"pipeline"`
4. **Use FlatCompat with eslint-config-next** – Causes circular reference errors

### ✅ Always Do

1. **Run `npm run lint`** after significant changes
2. **Use ESLint 9 native flat config** in `eslint.config.mjs`
3. **Handle `null` returns** from async data fetching
4. **Use `'use client'`** for interactive components in App Router
5. **Keep shared dependencies aligned** – both apps should use same versions of `react`, `next`, `eslint`, etc.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `packages/schemas/src/index.ts` | Canonical types (BookData, PageData) |
| `packages/design-system/variables.css` | Design tokens (SOURCE OF TRUTH) |
| `apps/studio/src/utils/fileIO.ts` | Book CRUD via API |
| `apps/studio/src/utils/dslConverter.ts` | DSL ↔ HTML for TipTap |
| `apps/viewer/src/data/types.ts` | Viewer-side type re-exports |

---

## Content Schema

```typescript
// packages/schemas/src/index.ts
type IllustrationData = string | { bg?: string; mid?: string; fg?: string };

interface PageData {
  pageNumber: number;
  text: string;
  illustration?: IllustrationData;
  mood?: 'calm' | 'tense' | 'joyful';
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

### 3. API Result Types

Return result objects from async operations for proper error handling:

```typescript
// ✅ Good - explicit result type
interface SaveResult { success: boolean; error?: string; }
async function saveBook(book: BookData): Promise<SaveResult> { ... }

// ❌ Bad - throws make error handling harder
async function saveBook(book: BookData): Promise<void> { throw new Error('...'); }
```

### 4. View Transitions API

Types are now available in TypeScript 5.4+ – remove outdated @ts-expect-error:

```typescript
// ✅ Current (types available)
document.startViewTransition(() => router.push(url));

// ❌ Outdated - causes lint error
// @ts-expect-error - View Transitions API types not in standard lib
document.startViewTransition(...);
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

Import from design-system package in app CSS:

```css
/* apps/viewer/src/styles/globals.css */
@import '@gia/design-system/variables.css';
```

---

## Testing Workflow

1. Run `npm run lint` – catches TypeScript and style issues
2. Run `npm run build` – validates production builds
3. Test viewer: `cd apps/viewer && npm run dev`
4. Test studio: `$env:PORT='3001'; cd apps/studio; npm run dev`
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

### Why Not NODE_ENV?

`NODE_ENV=production` is always set during `next build`, so using it for deploy decisions would fail builds that use `getServerSideProps`. The explicit `DEPLOY_TARGET` variable provides proper control.
