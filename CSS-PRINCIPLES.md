# CSS Principles for Gia Workspace

This document defines the **styling architecture** shared between Viewer and Studio applications.

---

## Architecture Overview

```
packages/design-system/
├── index.css           ← Entry point (imports all below)
├── fonts.css           ← Google Fonts imports
├── reset.css           ← CSS reset
├── variables.css       ← Design tokens (SOURCE OF TRUTH)
└── typography.css      ← Base typography

apps/viewer/
├── src/styles/
│   └── index.css       ← Imports @gia/design-system + view transitions
└── src/features/**/*.module.css

apps/studio/
├── src/app/globals.css ← Imports @gia/design-system + Studio aliases
└── src/components/**/*.module.css
```

---

## Token Architecture

### Three-Tier System

```
┌─────────────────────────────────────────────────────────────────────┐
│  PRIMITIVES         → Raw OKLCH values (never use in components)   │
│  --primitive-*         e.g., --primitive-neutral-500               │
├─────────────────────────────────────────────────────────────────────┤
│  SEMANTIC TOKENS    → Role-based, theme-aware (USE THESE)          │
│  --bg-*, --fg-*        e.g., --bg-primary, --fg-secondary          │
│  --border-*, --shadow-*                                             │
├─────────────────────────────────────────────────────────────────────┤
│  BACKWARD-COMPAT    → Legacy aliases for migration                 │
│  --color-*             e.g., --color-background → --bg-primary     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Semantic Token Naming

### Convention

```
--<category>-<role>[-<variant>][-<state>]
```

| Category | Purpose | Examples |
|----------|---------|----------|
| `--bg-` | Backgrounds | `--bg-primary`, `--bg-brand-faint` |
| `--fg-` | Foreground (text/icons) | `--fg-primary`, `--fg-alert` |
| `--border-` | Border colors | `--border-primary-hover` |
| `--shadow-` | Box shadows | `--shadow-lg`, `--shadow-card` |

### Common Tokens

```css
/* ✅ CORRECT - Use semantic tokens */
.card {
  background: var(--bg-secondary);
  color: var(--fg-primary);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-card);
}
.card:hover {
  background: var(--bg-secondary-hover);
  box-shadow: var(--shadow-card-hover);
}

/* ❌ WRONG - Never use primitives directly */
.card {
  background: var(--primitive-neutral-050);
  color: oklch(15% 0 0);
}
```

---

## OKLCH Color Space

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

---

## Theming System

### Two-Axis Themes

| Attribute | Values | Purpose |
|-----------|--------|---------|
| `data-theme` | `light`, `dark` | Appearance (lightness) |
| `data-vibrancy` | `minimal`, `standard`, `high-contrast` | Color intensity |

```html
<!-- Default: light + standard -->
<html data-theme="light" data-vibrancy="standard">

<!-- Dark minimal -->
<html data-theme="dark" data-vibrancy="minimal">

<!-- Light high-contrast (accessibility) -->
<html data-theme="light" data-vibrancy="high-contrast">
```

### Vibrancy Effects

| Vibrancy | Effect |
|----------|--------|
| `minimal` | 50% chroma, softer shadows, calmer feel |
| `standard` | Full vibrancy (default) |
| `high-contrast` | 120% chroma, stronger borders, accessibility |

### Managing Theme in JS

```typescript
// Set theme
document.documentElement.dataset.theme = 'dark';
document.documentElement.dataset.vibrancy = 'minimal';

// Read theme
const isDark = document.documentElement.dataset.theme === 'dark';
```

---

## Primitive Color Ramps

Extended fidelity at light and dark ends:

```css
/* Light end (extra fidelity for surfaces) */
--primitive-neutral-000: oklch(100% 0 0);   /* pure white */
--primitive-neutral-025: oklch(98.5% 0 0);  /* barely off-white */
--primitive-neutral-050: oklch(97% 0 0);    /* subtle off-white */
--primitive-neutral-075: oklch(95% 0 0);    /* light surface */
--primitive-neutral-100: oklch(92% 0 0);    /* surface hover */
--primitive-neutral-150: oklch(88% 0 0);    /* pressed/active */

/* Mid-range */
--primitive-neutral-200 through --primitive-neutral-700

/* Dark end (extra fidelity for dark mode) */
--primitive-neutral-750: oklch(30% 0 0);
--primitive-neutral-800: oklch(25% 0 0);
--primitive-neutral-850: oklch(20% 0 0);
--primitive-neutral-900: oklch(15% 0 0);
--primitive-neutral-925: oklch(12% 0 0);
--primitive-neutral-950: oklch(8% 0 0);
--primitive-neutral-975: oklch(5% 0 0);
```

---

## Status Colors

| Status | Semantic Token | Usage |
|--------|----------------|-------|
| Success | `--fg-success`, `--bg-success-faint` | Positive feedback |
| Warning | `--fg-warning`, `--bg-warning-faint` | Caution states |
| Alert | `--fg-alert`, `--bg-alert-faint` | Errors, destructive |
| Info | `--fg-info`, `--bg-info-faint` | Informational |

```css
.success-message {
  background: var(--bg-success-faint);
  color: var(--fg-success);
  border: 1px solid var(--border-success);
}
```

---

## Interactive States

Each semantic token has explicit hover/pressed variants:

```css
/* Base → Hover → Pressed */
--bg-primary         → --bg-primary-hover      → --bg-primary-pressed
--bg-secondary       → --bg-secondary-hover    → --bg-secondary-pressed
--bg-brand-primary   → --bg-brand-primary-hover
--border-primary     → --border-primary-hover
--fg-link            → --fg-link-hover
```

---

## Mood Gradients

Page backgrounds use mood-specific gradients:

| Mood | Hue | Light L | Dark L |
|------|-----|---------|--------|
| `calm` | 200-220 (blue) | 85-90% | 25-30% |
| `whimsical` | 280-320 (purple/pink) | 75-85% | 22-30% |
| `playful` | 50-80 (yellow/orange) | 82-88% | 28-35% |
| `mysterious` | 260-280 (deep purple) | 40-50% | 12-18% |
| `joyful` | 85-95 (yellow) | 88-92% | 26-32% |

```tsx
const getGradient = (mood: string) => `var(--gradient-${mood})`;
```

---

## Expressive Text Tokens

For styled story text:

| Style | Font | Color Variable |
|-------|------|----------------|
| `handwritten` | `--font-handwritten` | `--color-expressive-handwritten` |
| `shout` | `--font-display` | (inherit) |
| `bully` | `--font-display` | `--color-expressive-bully` |

---

## Animation Tokens

```css
/* Durations */
--duration-fast:    150ms;
--duration-normal:  300ms;
--duration-slow:    500ms;

/* Easings */
--ease-out:      cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1);
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
```

For JavaScript/Framer Motion, import from `@gia/utils`:
```typescript
import { EASING, DURATION } from '@gia/utils';
```

---

## CSS Modules

Every component has a co-located module:

```
Button/
├── Button.tsx
└── Button.module.css
```

Use `cn()` utility for conditional classes:
```tsx
import { cn } from '@gia/utils';
import styles from './Button.module.css';

<button className={cn(
  styles.button,
  isActive && styles.active
)} />
```

---

## Backward Compatibility

Legacy token names map to new semantic tokens:

| Old Token | New Token |
|-----------|-----------|
| `--color-background` | `--bg-primary` |
| `--color-surface` | `--bg-secondary` |
| `--color-text` | `--fg-primary` |
| `--color-text-subtle` | `--fg-secondary` |
| `--color-interactive` | `--fg-brand` |
| `--color-border` | `--border-primary` |
| `--color-danger` | `--fg-alert` |
| `--color-success` | `--fg-success` |

> [!NOTE]
> Use new semantic tokens for new code. Legacy aliases exist for migration only.

---

## Adding New Tokens

1. Add primitive to `packages/design-system/variables.css`
2. Add semantic mapping for both light and dark themes
3. Add vibrancy overrides if needed (minimal/high-contrast)
4. Document in this file
5. Use in components via `var(--token-name)`
