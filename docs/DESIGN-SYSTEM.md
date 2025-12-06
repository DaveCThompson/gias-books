# Madoodle Design System

This document defines the **shared styling architecture** between the Viewer (`gias-books`) and Studio (`gias-books-studio`) applications.

---

## Architecture Overview

```
gias-books/                    ← SOURCE OF TRUTH (Viewer)
├── src/styles/
│   ├── variables.css          ← Design tokens (synced to Studio)
│   ├── reset.css
│   ├── typography.css
│   └── index.css              ← Global imports
└── src/features/**/*.module.css  ← Component styles

gias-books-studio/             ← CONSUMER (Studio)
├── src/styles/
│   └── variables.css          ← Symlink → ../gias-books/src/styles/variables.css
└── src/app/globals.css        ← Studio-specific globals
```

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
.card { background: oklch(94% 0 0); }  /* Hard-coded oklch is also wrong */
```

### 3. Dark Mode via `data-theme`

Theme is applied by toggling `data-theme="dark"` on `<html>`:

```css
:root { --color-bg: oklch(98% 0 0); }
:root[data-theme='dark'] { --color-bg: oklch(15% 0 0); }
```

Managed in code by `useThemeManager` hook (each app has its own).

### 4. Global + Local Styling

| Scope | Location | Purpose |
|-------|----------|---------|
| **Global** | `variables.css` | Design tokens, shared across apps |
| **Global** | `reset.css`, `typography.css` | Base styles, fonts |
| **Local** | `*.module.css` | Component-specific styles |

---

## Design Tokens (variables.css)

### Neutrals (Lightness ramp)

| Token | Light L | Dark L |
|-------|---------|--------|
| `--color-neutral-000` | 100% | - |
| `--color-neutral-050` | 97% | - |
| `--color-neutral-100` | 92% | - |
| `--color-neutral-800` | 25% | - |
| `--color-neutral-950` | 10% | - |

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

## Symlink Setup (Option B)

### Windows (PowerShell Admin Required)

```powershell
# 1. Open PowerShell as Administrator
# 2. Navigate to studio project
cd C:\Users\...\gias-books-studio

# 3. Create styles directory if needed
mkdir src\styles 2>$null

# 4. Create symlink
cmd /c mklink src\styles\variables.css "..\..\gias-books\src\styles\variables.css"
```

**Note:** Windows requires admin privileges for `mklink`. Developer Mode can bypass this.

### macOS/Linux

```bash
cd gias-books-studio
mkdir -p src/styles
ln -s ../../gias-books/src/styles/variables.css src/styles/variables.css
```

### Verify Sync

```bash
node scripts/verify-style-sync.js
```

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
import { cn } from '@/lib/utils';

<button className={cn(styles.button, isActive && styles.active)} />
```

### Dark Mode in Components

For theme-specific animations or complex logic, use `:global()`:

```css
:global([data-theme='dark']) .card {
    box-shadow: var(--shadow-card-dark);
}
```

---

## Why This Architecture?

| Choice | Alternatives Considered | Rationale |
|--------|------------------------|-----------|
| **oklch** | HSL, hex | Perceptual uniformity, wide gamut, easy L-shifting for themes |
| **CSS Variables** | CSS-in-JS, Tailwind | Zero runtime, SSR-safe, debuggable |
| **CSS Modules** | Styled-components, Tailwind | Scoping without runtime, IDE support, familiar CSS |
| **Symlink sync** | npm package, copy script | Minimal tooling, instant sync, already using for books/ |
| **data-theme attribute** | class toggle, media query | Works with SSR, explicit control, no flash |

---

## Adding New Components

1. Create `ComponentName.module.css` next to component
2. Use only semantic variables from `variables.css`
3. Add dark mode overrides if needed (rare – most should "just work")
4. Use `cn()` for conditional classes
