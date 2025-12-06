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

  /* Expressive primitives */
  --color-expressive-red: oklch(55% 0.2 20);
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

  /* Expressive text */
  --color-expressive-handwritten: var(--color-interactive);
  --color-expressive-bully: var(--color-expressive-red);
}

:root[data-theme='dark'] {
  /* Dark theme overrides */
  --color-background: var(--color-neutral-900);
  --color-text: var(--color-neutral-100);
  --color-surface: var(--color-neutral-800);
  --color-interactive: var(--color-brand-400);

  /* Expressive text (dark mode) */
  --color-expressive-bully: oklch(65% 0.18 20);
}
```

---

### 4. Contrast Guidelines

Ensure sufficient contrast between background and foreground:

| Pairing | Minimum ΔL | Example |
|---------|------------|---------|
| Primary button | 40%+ | Blue bg (L=55%) + White text (L=100%) ✅ |
| Surface text | 60%+ | Surface (L=97%) + Text (L=15%) ✅ |
| Subtle text | 50%+ | Background (L=100%) + Subtle (L=35%) ✅ |

**Common mistake:**
```css
/* ❌ WRONG - dark text on blue = poor contrast */
.button.active {
  background: var(--color-primary);        /* L=55% */
  color: var(--color-button-text);         /* L=25% → ΔL=30% FAILS */
}

/* ✅ CORRECT - white text on blue */
.button.active {
  background: var(--color-primary);
  color: var(--color-neutral-000);         /* L=100% → ΔL=45% */
}
```

---

### 5. Expressive Text Tokens

For styled text in stories (handwritten, shout, bully):

| Style | Font | Color Variable | Effect |
|-------|------|----------------|--------|
| `handwritten` | `--font-handwritten` | `--color-expressive-handwritten` | Cursive blue |
| `shout` | `--font-display` | (inherit) | Bold, larger |
| `bully` | `--font-display` | `--color-expressive-bully` | Bold, italic, red |

**Always use semantic variables**, not primitives:
```css
/* ✅ CORRECT */
.expressiveBully { color: var(--color-expressive-bully); }

/* ❌ WRONG - primitive won't adapt to dark mode */
.expressiveBully { color: var(--color-expressive-red); }
```

---

### 6. Dark Mode via `data-theme`

Theme is controlled by `data-theme` attribute on `<html>`:

```html
<html data-theme="dark">  <!-- dark mode -->
<html>                    <!-- light mode (default) -->
```

**Managed by `useThemeManager` hook** (located in `src/hooks/`):
- Reads preference from localStorage
- Falls back to system preference
- Sets attribute on document element

---

### 7. CSS Modules (Component Scoping)

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

### 8. Conditional Classes with `cn()`

Use the `cn()` utility from `@gia/utils` for conditional classes:

```tsx
import { cn } from '@gia/utils';
import styles from './Button.module.css';

<button className={cn(
  styles.button,
  isActive && styles.active,
  variant === 'primary' && styles.primary
)} />
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

### 9. Animation Tokens

Animation durations and easings are defined as CSS custom properties:

```css
:root {
  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  
  /* Easings */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

For JavaScript/Framer Motion, import from `@gia/utils`:

```typescript
import { EASING, DURATION } from '@gia/utils';

// Use in motion components
transition={{ duration: DURATION.normal, ease: EASING.outExpo }}
```

---

### 10. Accessibility Utilities

The design system includes a `.sr-only` class for screen-reader-only content:

```css
/* In reset.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Inline Code Styling

For `[code]text[/code]` DSL tags, use the `.inlineCode` pattern:

```css
.inlineCode {
  font-family: var(--font-mono, monospace);
  font-size: 0.9em;
  background: var(--color-surface);
  padding: 0.1em 0.3em;
  border-radius: 3px;
}
```

This styling is used in both `ExpressiveTextPreview.tsx` (Studio) and `InteractiveText.tsx` (Viewer).

## Common Patterns

### Focus Ring Safe Zone

Containers with `overflow: hidden` need padding for focus rings:

```css
.container {
  overflow: hidden;
  padding: 2px;  /* Safe zone for focus outlines */
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
2. Use only semantic variables from design-system
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
| **Semantic tokens** | Future-proof, dark mode "just works" |
