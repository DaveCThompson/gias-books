# Styling Guide

This document defines the **styling architecture and UI design principles** for the Gia Workspace.

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
| `--fg-` | Foreground (text/icons) | `--fg-primary`, `--fg-secondary`, `--fg-tertiary` |
| `--border-` | Border colors | `--border-primary-hover` |
| `--shadow-` | Box shadows | `--shadow-lg`, `--shadow-card` |

### Foreground Token Hierarchy

| Token | Purpose | Usage |
|-------|---------|-------|
| `--fg-primary` | Primary text | Headings, body text |
| `--fg-secondary` | Secondary text | Toolbar buttons, dropdown triggers |
| `--fg-tertiary` | Tertiary text | Chevrons, subtle icons |
| `--fg-brand` | Brand accent | Active states, links |

```css
/* ✅ CORRECT - Use semantic tokens */
.button {
  color: var(--fg-secondary);  /* Default state */
}
.button.active {
  color: var(--fg-brand);      /* Active state */
}
.chevron {
  color: var(--fg-tertiary);   /* Subtle icon */
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

---

## UI Component Patterns

### Concentric Radii Standard

When creating UI components that wrap child elements (toolbars, button groups, popovers), follow these optical design principles:

**Formula**: `Container Radius = Button Radius + Padding`

```css
/* ✅ CORRECT - Concentric radii */
.bubbleMenu {
    padding: 6px;          /* P = 6px */
    border-radius: 12px;   /* R(6) + P(6) = 12px */
}

.button {
    border-radius: 6px;    /* R = 6px */
}
```

| Button Radius | Padding | Container Radius | Use Case |
|---------------|---------|------------------|----------|
| 3px | 4px | 7px | Compact toolbars |
| 4px | 6px | 10px | Standard buttons |
| 6px | 6px | 12px | Touch-friendly UI |
| 8px | 10px | 18px | Prominent CTAs |

> [!IMPORTANT]
> Always add a CSS comment documenting the calculation: `/* 6px button + 6px padding = 12px */`

---

### Icons

**Rule**: Use Phosphor Icons (`@phosphor-icons/react`) for all UI icons. **Never use emojis.**

```tsx
// ✅ CORRECT - Phosphor icon
import { BookOpen, Eraser, Sparkle, Check } from '@phosphor-icons/react';
<BookOpen size={16} />

// ❌ INCORRECT - Emoji
<span>📖</span>
```

**Standard icon sizes**:
| Context | Size |
|---------|------|
| Toolbar buttons | 16px |
| Menu items | 16px |
| Inline indicators | 14px |
| Large actions | 20px |

---

### Dropdown Chevrons

**Rule**: All dropdown triggers must include an SVG chevron that animates on hover.

**Chevron markup**:
```tsx
<svg className={styles.chevron} width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</svg>
```

**Hover animation** (CSS):
```css
.chevron {
    color: var(--fg-tertiary);
    transition: transform 100ms ease, stroke-width 100ms ease;
}

.trigger:hover .chevron {
    transform: translateY(1px);
    stroke-width: 2;
}
```

---

## Animation Tokens

### CSS Tokens

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

### Framer Motion Standard

```tsx
import { EASING, DURATION } from '@gia/utils';

// Popover/menu entrance
const menuAnimation = {
    initial: { opacity: 0, y: 8, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 8, scale: 0.95 },
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] as const },
};
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

> [!NOTE]
> Use new semantic tokens for new code. Legacy aliases exist for migration only.

---

## Adding New Tokens

1. Add primitive to `packages/design-system/variables.css`
2. Add semantic mapping for both light and dark themes
3. Add vibrancy overrides if needed (minimal/high-contrast)
4. Document in this file
5. Use in components via `var(--token-name)`
