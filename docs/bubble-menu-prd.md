# Bubble Menu PRD

## Overview

Implementation of a selection-based bubble menu for the Studio text editor using Radix Popover with virtual anchor positioning and Framer Motion animations.

## Goals

1. Bubble menu appears at selection position when text is selected
2. Toolbar simplified to only Undo/Redo
3. Premium entrance/exit animations via Framer Motion
4. Consistent accessibility patterns (Radix throughout)

## Architecture

### Approach: Radix Popover + Virtual Anchor

| Component | Technology |
|-----------|------------|
| Positioning | Radix Popover with virtual anchor at selection coords |
| Animation | Framer Motion `AnimatePresence` |
| Content | Existing format buttons + Radix dropdowns |

### Why Not TipTap BubbleMenu

TipTap's BubbleMenu uses Tippy.js internally which:
- Conflicts with nested Radix portals (z-index issues)
- Has separate focus management that fights with Radix
- Limited animation control (CSS-only)

## Components

### New: `useSelectionCoords` Hook

```ts
// src/hooks/useSelectionCoords.ts
// Returns { x, y, width, height } for anchor positioning
```

### Modified: `EditorBubbleMenu.tsx`

- Wrap in `Radix Popover.Root` with open state
- Virtual anchor positioned at selection
- Framer Motion entrance/exit animations

### Modified: `TextEditor.tsx`

- Remove: B/I/U, Interactive, Clear buttons
- Keep: Undo (↶), Redo (↷)

## Verification

- [ ] Bubble menu appears at selection
- [ ] Smooth animation on entrance/exit
- [ ] Dropdowns work inside menu
- [ ] Toolbar shows only Undo/Redo
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
