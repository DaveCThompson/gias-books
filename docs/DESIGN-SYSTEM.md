# Madoodle Design System

This document defines the **shared styling architecture** for the monorepo.

> **See also:** [CSS-PRINCIPLES.md](../CSS-PRINCIPLES.md) for the complete styling specification.

---

## Architecture Overview

```
gia-workspace/
├── packages/design-system/
│   └── variables.css          ← Shared design tokens
├── apps/viewer/
│   └── src/styles/
│       ├── globals.css        ← Viewer-specific globals
│       └── *.module.css       ← Component styles
└── apps/studio/
    └── src/styles/
        ├── globals.css        ← Studio-specific globals
        └── *.module.css       ← Component styles
```

Both apps import `@gia/design-system` for shared tokens.

---

## Core Principles

### 1. OKLCH Color Space

All colors use `oklch(L C H / alpha)` for:
- **Perceptual uniformity** – L (lightness) changes linearly
- **Wide gamut** – P3 display support where available
- **Easy theming** – Shift L for dark mode, H for brand variants

```css
/* Light: L = 85-92%, Dark: L = 25-38% */
--gradient-calm: linear-gradient(180deg, oklch(90% 0.03 220) 0%, oklch(85% 0.05 230) 100%);
```

### 2. Semantic CSS Variables

Never use raw values in component styles. Use semantic tokens:

```css
/* ✅ Correct */
.card { background: var(--color-surface); }

/* ❌ Never */
.card { background: #f0f0f0; }
.card { background: oklch(94% 0 0); }
```

### 3. Dark Mode via `data-theme`

Theme is applied by toggling `data-theme="dark"` on `<html>`:

```css
:root { --color-bg: oklch(98% 0 0); }
:root[data-theme='dark'] { --color-bg: oklch(15% 0 0); }
```

---

## Design Tokens

### Semantic Mappings

| Token | Light | Dark |
|-------|-------|------|
| `--color-background` | neutral-000 | neutral-900 |
| `--color-text` | neutral-900 | neutral-100 |
| `--color-surface` | neutral-050 | neutral-800 |
| `--color-interactive` | brand-500 | brand-400 |

### Mood Gradients

| Mood | Hue (H) | Light L | Dark L |
|------|---------|---------|--------|
| `calm` | 220-230 (blue) | 85-90% | 25-30% |
| `tense` | 25-30 (red) | 75-85% | 28-35% |
| `joyful` | 85-95 (yellow) | 88-92% | 32-38% |

---

## Component Styling Rules

### CSS Modules

Every component MUST have a co-located `*.module.css`:

```
Button/
├── Button.tsx
└── Button.module.css
```

### Conditional Classes

Use `cn()` utility (wrapping `clsx`) for conditional classes:

```tsx
import { cn } from '@/utils/cn';

<button className={cn(styles.button, isActive && styles.active)} />
```

### Dark Mode in Components

For theme-specific styles, use `:global()`:

```css
:global([data-theme='dark']) .card {
    box-shadow: var(--shadow-card-dark);
}
```

---

## Adding New Components

1. Create `ComponentName.module.css` next to component
2. Use only semantic variables from `@gia/design-system`
3. Add dark mode overrides if needed (rare – most should "just work")
4. Use `cn()` for conditional classes
