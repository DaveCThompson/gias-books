# CSS Principles for Gia Workspace

This document defines the **styling architecture** shared between Viewer and Studio applications.

---

## Architecture Overview

```
packages/design-system/
└── variables.css       ← SOURCE OF TRUTH (design tokens)

apps/viewer/
├── src/styles/
│   ├── globals.css     ← Imports variables, reset, typography
│   └── index.css
└── src/features/**/*.module.css

apps/studio/
├── src/app/globals.css ← Imports shared variables
└── src/components/**/*.module.css
```

---

## Core Principles

### 1. OKLCH Color Space

All colors use `oklch(L C H / alpha)` format:

| Component | Range | Purpose |
|-----------|-------|---------|
| **L** (Lightness) | 0-100% | Theme switching (light: 85-100%, dark: 10-38%) |
| **C** (Chroma) | 0-0.4 | Color saturation (0 = gray) |
| **H** (Hue) | 0-360 | Color angle (220=blue, 25=red, 95=yellow) |

**Why oklch?**
- **Perceptual uniformity** – L changes linearly as perceived brightness
- **Wide gamut** – P3 display support
- **Easy theming** – Shift L for dark mode, H for brand variants

```css
/* Light mode: high L */
--gradient-calm: linear-gradient(180deg, oklch(90% 0.03 220) 0%, oklch(85% 0.05 230) 100%);

/* Dark mode: low L */
--gradient-calm: linear-gradient(180deg, oklch(30% 0.03 220) 0%, oklch(25% 0.05 230) 100%);
```

---

### 2. Semantic CSS Variables

**Never use raw values in component styles.** Always reference semantic tokens:

```css
/* ✅ CORRECT */
.card {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-card);
}

/* ❌ WRONG - hardcoded values */
.card {
  background: #f0f0f0;           /* No hex codes */
  color: oklch(15% 0 0);         /* No raw oklch */
  box-shadow: 0 4px 8px black;   /* No inline values */
}
```

---

### 3. Design Token Categories

#### Primitives (raw values)

```css
:root {
  /* Neutrals - lightness ramp */
  --color-neutral-000: oklch(100% 0 0);  /* white */
  --color-neutral-050: oklch(97% 0 0);
  --color-neutral-100: oklch(92% 0 0);
  --color-neutral-800: oklch(25% 0 0);
  --color-neutral-900: oklch(15% 0 0);
  --color-neutral-950: oklch(10% 0 0);   /* near-black */

  /* Brand colors */
  --color-brand-500: oklch(55% 0.23 260);  /* primary blue */
  --color-brand-400: oklch(65% 0.2 255);   /* lighter variant */
}
```

#### Semantic Tokens (mapped by theme)

```css
:root {
  /* Light theme (default) */
  --color-background: var(--color-neutral-000);
  --color-text: var(--color-neutral-900);
  --color-surface: var(--color-neutral-050);
  --color-interactive: var(--color-brand-500);
}

:root[data-theme='dark'] {
  /* Dark theme overrides */
  --color-background: var(--color-neutral-900);
  --color-text: var(--color-neutral-100);
  --color-surface: var(--color-neutral-800);
  --color-interactive: var(--color-brand-400);
}
```

---

### 4. Dark Mode via `data-theme`

Theme is controlled by `data-theme` attribute on `<html>`:

```html
<html data-theme="dark">  <!-- dark mode -->
<html>                    <!-- light mode (default) -->
```

**Managed by `useThemeManager` hook** in each app:
- Reads preference from localStorage
- Falls back to system preference
- Sets attribute on document element

---

### 5. CSS Modules (Component Scoping)

Every component MUST have a co-located module file:

```
Button/
├── Button.tsx
└── Button.module.css
```

**Benefits:**
- Class names are automatically scoped (no collisions)
- IDE support (autocomplete, go-to-definition)
- Standard CSS syntax (no learning curve)

---

### 6. Conditional Classes with `cn()`

Use the `cn()` utility (wraps `clsx`) for conditional classes:

```tsx
import { cn } from '@/utils/cn';
import styles from './Button.module.css';

<button className={cn(
  styles.button,
  isActive && styles.active,
  variant === 'primary' && styles.primary
)} />
```

**Implementation:**
```typescript
// src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
```

---

## Mood Gradients

Page backgrounds use mood-specific gradients:

| Mood | Hue | Light L | Dark L |
|------|-----|---------|--------|
| `calm` | 220-230 (blue) | 85-90% | 25-30% |
| `tense` | 25-30 (red) | 75-85% | 28-35% |
| `joyful` | 85-95 (yellow) | 88-92% | 32-38% |

```css
:root {
  --gradient-calm: linear-gradient(180deg, oklch(90% 0.03 220) 0%, oklch(85% 0.05 230) 100%);
  --gradient-tense: linear-gradient(180deg, oklch(85% 0.1 30) 0%, oklch(75% 0.15 25) 100%);
  --gradient-joyful: linear-gradient(180deg, oklch(92% 0.1 95) 0%, oklch(88% 0.12 85) 100%);
}
```

---

## Common Patterns

### Focus Ring Safe Zone

Containers with `overflow: hidden` need padding for focus rings:

```css
.container {
  overflow: hidden;
  padding: 2px;  /* Safe zone for focus outlines */
}
```

### Component Dimension Variables

Components can expose their dimensions as CSS variables:

```css
.header {
  --header-height: 60px;
  height: var(--header-height);
}

/* Other components can reference */
.content {
  padding-top: var(--header-height);
}
```

### Theme-Specific Overrides in Modules

Use `:global()` selector for theme-specific styling within CSS Modules:

```css
.card {
  background: var(--color-surface);
}

:global([data-theme='dark']) .card {
  /* Dark-mode specific adjustments beyond variable changes */
  border: 1px solid var(--color-neutral-700);
}
```

---

## Adding New Styles

### Component Styles

1. Create `ComponentName.module.css` next to component
2. Use only semantic variables from `variables.css`
3. Import and use with `styles.className`
4. Add dark mode overrides only if needed (most "just work")

### New Design Tokens

1. Add primitive to `packages/design-system/variables.css`
2. Add semantic mapping for both light and dark themes
3. Document the token's purpose
4. Use in components via `var(--token-name)`

---

## Why This Architecture?

| Choice | Rationale |
|--------|-----------|
| **oklch** | Perceptual uniformity, wide gamut, easy L-shifting for themes |
| **CSS Variables** | Zero runtime, SSR-safe, browser devtools support |
| **CSS Modules** | Scoping without runtime, familiar CSS syntax |
| **Shared package** | Single source of truth, npm versioning |
| **data-theme attribute** | SSR-compatible, no FOUC, explicit control |
