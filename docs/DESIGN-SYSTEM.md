# Madoodle Design System and Styling Guide

This document defines the **styling architecture, token system, and UI principles** for the Gia Workspace.

---

## 🏗 Architecture Overview

The styling system is decoupled and layered:

```
packages/design-system/
├── index.css           ← Entry point (imports all below)
├── fonts.css           ← Google Fonts imports (Inter, Outfit, etc.)
├── reset.css           ← CSS Modern Reset
├── variables.css       ← Design tokens (SOURCE OF TRUTH)
└── typography.css      ← Base typography
```

### App Integration

- **Viewer (`apps/viewer`)**: Imports `@gia/design-system` in `src/styles/index.css`.
- **Studio (`apps/studio`)**: Imports `@gia/design-system` in `src/app/globals.css`.

---

## 🎨 Token Architecture

We use a **Three-Tier Token System** to ensure maintainability and theming support.

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

### Core Semantic Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--bg-primary` | White | Neutral-900 | Main page background |
| `--bg-secondary` | Neutral-050 | Neutral-800 | Cards, sidebars |
| `--fg-primary` | Neutral-900 | Neutral-100 | Body text, headings |
| `--fg-secondary` | Neutral-600 | Neutral-400 | Subtitles, captions |
| `--fg-brand` | Brand-600 | Brand-400 | Active states, links |
| `--border-primary` | Neutral-200 | Neutral-700 | Standard borders |

> **Rule**: Always use semantic tokens (`--bg-primary`). Never hardcode hex values or use raw primitives.

---

## 🌈 The named Color System (OKLCH)

We use **OKLCH** colors for all specific hues to ensure perceptual uniformity and wide-gamut support.

| Hue | Foreground Token | Background Token |
|-----|------------------|------------------|
| Red | `--color-red` | `--color-bg-red` |
| Orange | `--color-orange` | `--color-bg-orange` |
| Green | `--color-green` | `--color-bg-green` |
| Blue | `--color-blue` | `--color-bg-blue` |
| Purple | `--color-purple` | `--color-bg-purple` |
| Pink | `--color-pink` | `--color-bg-pink` |

> These tokens automatically adapt lightness for Dark Mode.

---

## 📐 UI Principles

### 1. Concentric Radii
When nesting rounded elements, use the formula: `Outer Radius = Inner Radius + Padding`.

```css
/* Example: Toolbar */
.toolbar {
    padding: 6px;
    border-radius: 12px;  /* 6px (child) + 6px (padding) */
}
.button {
    border-radius: 6px;
}
```

### 2. Icons
Use **Phosphor Icons** (`@phosphor-icons/react`). Never use emojis for UI elements.
- **Sizes**: 16px (standard), 20px (large), 14px (subtle).

### 3. Motion
Use spring-based physics for "feel" animations, and standard eases for UI transitions.

```css
/* CSS Variables */
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--duration-normal: 300ms;
```

---

## ✍️ Text Styling System

The text engine supports complex expressivity through a registry pattern.

### 1. DSL Format
The custom markup language for our books:
`[style font="handwritten" effect="glow" motion="bounce"]Text[/style]`

### 2. Registries (`@gia/schemas`)

*   **Font Registry**: `body`, `display`, `handwritten`, `fredoka`, `playpen`
*   **Effect Registry**: `shadow`, `glow`, `outline`
*   **Motion Registry**: `bounce`, `wiggle`, `shake`, `shimmer`

---

## 🛠 Developer Workflow

1.  **New Components**: Create a `.module.css` file next to your component.
2.  **Dark Mode**: Most tokens adapt automatically. For specific overrides, use `:global([data-theme='dark'])`.
3.  **Classes**: Use the `cn()` utility to combine module classes.

```tsx
import { cn } from '@gia/utils';
import styles from './Card.module.css';

export function Card({ className }) {
  return <div className={cn(styles.card, className)} />
}
```
