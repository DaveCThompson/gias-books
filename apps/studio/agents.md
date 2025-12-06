# Agent Guidelines for GIA Studio

This document provides context and guidelines for AI agents working on this codebase.

> **Part of the [gia-workspace](../../README.md) monorepo**

---

## Project Purpose

**GIA Studio** is a WYSIWYG editor for creating interactive children's storybooks. It outputs `data.json` files consumed by the companion viewer app at `apps/viewer/`.

---

## Architecture Overview

### State Management
- **Zustand** store at `src/data/stores/bookStore.ts`
- Single source of truth for book data, current page, dirty state
- No Redux, no complex action patterns

### Rich Text Editing
- **TipTap** with custom marks for DSL tags
- Custom marks: `ExpressiveMark`, `InteractiveMark`
- DSL converter: `src/utils/dslConverter.ts`

### Shared Packages
- `@gia/schemas` - Zod validation schemas
- `@gia/content` - Book data (data.json + assets)
- `@gia/design-system` - Shared CSS variables

---

## Key Files

| File | Purpose |
|------|---------|
| `src/data/stores/bookStore.ts` | Zustand store (book state) |
| `src/utils/dslConverter.ts` | DSL ↔ HTML conversion |
| `src/editor/marks/*.ts` | TipTap custom marks |
| `src/components/Editor/TextEditor.tsx` | Main rich text editor |
| `src/components/Editor/EditorShell.tsx` | Editor layout wrapper |

---

## Coding Standards

### Patterns to Follow
- Use Zustand selectors: `useBookStore((s) => s.field)`
- CSS Modules for component styles
- `cn()` utility for conditional classes
- Zod for all validation

### SSR Considerations
- TipTap requires `immediatelyRender: false` for Next.js
- Use `'use client'` directive for interactive components
- `suppressHydrationWarning` on body for font classes

---

## Styling Architecture

See **[../../CSS-PRINCIPLES.md](../../CSS-PRINCIPLES.md)** for the complete design system spec.

### Core Principles
- **oklch color space** – All colors defined in `oklch(L C H / alpha)` format
- **Semantic CSS variables** – Never hardcode colors; use `--color-*` tokens
- **Dark mode via `data-theme`** – Managed by `useThemeManager` hook
- **CSS Modules** – Every component has co-located `*.module.css`
- **`cn()` utility** – Use for conditional classes (wraps `clsx`)

---

## Common Tasks

### Adding a new expressive style
1. Add style name to `EXPRESSIVE_STYLES` in `TextEditor.tsx`
2. Add CSS rule in `TextEditor.module.css` for `.editor :global([data-style="..."])`
3. Update DSL converter if needed

### Adding a new page field
1. Update schema in `packages/schemas/src/index.ts`
2. Add Zod validation
3. Update `Inspector.tsx` with UI control
4. Ensure viewer also supports the field

---

## Testing Workflow

1. Run `npm run dev` from monorepo root (starts both apps)
2. Edit content in Studio at `http://localhost:3001`
3. Verify changes render in Viewer at `http://localhost:3000`
4. Run `npm run lint` before committing

---

## API Routes for Assets

Assets are served via API routes:

| Route | Purpose |
|-------|---------|
| `/api/static/[slug]/assets/[file]` | Serve book assets (images, audio) |
| `/api/assets/[slug]` | List assets for a book |
| `/api/upload` | Upload new assets |

---

## Common Pitfalls

### Zustand Reactivity
Use proper selectors for reactive updates:
```tsx
// ❌ Won't update when currentPageIndex changes
const page = book.pages[useBookStore.getState().currentPageIndex];

// ✅ Proper reactive subscription
const currentPageIndex = useBookStore((s) => s.currentPageIndex);
const page = book.pages[currentPageIndex];
```

### TipTap SSR
Always set `immediatelyRender: false` in useEditor config:
```typescript
const editor = useEditor({
    immediatelyRender: false,  // ← Required for SSR
    extensions: [...],
});
```

---

## Related Documentation

- [Root AGENTS.md](../../AGENTS.md) - Monorepo-wide agent guidelines
- [CSS-PRINCIPLES.md](../../CSS-PRINCIPLES.md) - Styling architecture
- [Root README](../../README.md) - Monorepo overview
