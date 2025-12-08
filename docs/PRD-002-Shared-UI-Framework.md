# PRD 002: Shared UI Framework

**Status**: ⚠️ **IN PROGRESS** (2025-12-07) - Package Built, Migration Pending

## 1. Overview
Creation of a dedicated workspace package (`packages/ui`) to house high-quality, accessible React components built on Radix Primitives. This centralizes UI logic, enforces consistent styling, and eliminates ad-hoc component implementations in Studio and Viewer.

**Current State**: `@gia/ui` package implemented with Tooltip, Dialog, and Popover components. Package dependency added to Studio and Viewer. Component migrations deferred.

## 2. Problem & Goals
### Problem
*   **Duplication**: Modals and Tooltips are implemented differently in Studio and Viewer.
*   **Accessibility gaps**: Custom implementations (e.g., Studio's `InteractiveModal`) may miss focus trapping or ARIA attributes.
*   **Inconsistency**: Z-index wars and varying animation curves across the apps.

### Goals
*   **Centralization**: One source of truth for "atoms" (Dialog, Tooltip, Popover, Dropdown).
*   **Accessibility**: Native keyboard support and screen reader compliance via Radix.
*   **Consistency**: Shared animation tokens (`motion` v12) and visual styling.

## 3. Scope & Key Initiatives
### In Scope (Completed)
*   ✅ Scaffolding `packages/ui` with TypeScript.
*   ✅ Implementing:
    *   `Tooltip` (Global)
    *   `Dialog` (Modal)
    *   `Popover`
*   ⏸️ `DropdownMenu` - Deferred
*   ⏸️ Replacing existing ad-hoc components in Studio and Viewer - Deferred

### Out of Scope
*   Complex organisms (e.g., File Picker, Rich Text Editor).
*   Form primitives (Input, Checkbox) – defer to later.

## 4. UX/UI Specification & Wireframes

### Global Tooltip
Standardized appearance for all tooltips.

```
+--------------------------------+
|  [ Button ]                    |
+-------^------------------------+
        |
  +-----+------------------+
  |  Tooltip Label         | <-- var(--bg-inverse), var(--fg-inverse)
  |  (Shortcut: Ctrl+S)    | <-- var(--font-size-xs)
  +------------------------+
    Shadow: var(--shadow-sm)
    Anim: Slide up + Fade
```

### Dialog (Modal)
Standardized backdrop and content area.

```
[ Backdrop (Overlay) ] .......................... var(--bg-overlay)
+---------------------------------------------+
|  [ Title ]                          [ X ]   | <-- var(--fg-secondary)
|                                             |
|  Dialog Content Area                        | <-- var(--bg-primary)
|  ...                                        |
|                                             |
|  [ Cancel ] [ Confirm ]                     |
+---------------------------------------------+
   Shadow: var(--shadow-modal)
   Radius: 16px (--radius-lg)
```

## 5. Architecture & Implementation Plan
### Package Structure
*   **Name**: `@gia/ui`
*   **Tech**: React, Radix UI, Motion (v12).
*   **Styles**: CSS Modules (importing from `@gia/design-system`).

### Integration
1.  **Studio**:
    *   Toolbar buttons → `Tooltip` ⏸️
    *   Confirms → `Dialog` ⏸️
    *   Asset pickers → `Popover` ⏸️
2.  **Viewer**:
    *   Settings → `Dialog` ⏸️
    *   Bubble Menu → `Popover` ⏸️

## 6. File Manifest

### `packages/ui/`
*   ✅ `[NEW]` `package.json`: Dependencies.
*   ✅ `[NEW]` `src/components/Tooltip/`: Implementation.
*   ✅ `[NEW]` `src/components/Dialog/`: Implementation.
*   ✅ `[NEW]` `src/components/Popover/`: Implementation.
*   ⏸️ `[NEW]` `src/components/Dropdown/`: Deferred.

### `apps/studio/`
*   ✅ `[MODIFIED]` `package.json`: Added `@gia/ui` dependency.
*   ⏸️ `[MODIFIED]` `src/components/Editor/TextEditor.tsx`: Adopt `Tooltip`.
*   ⏸️ `[DELETE]` `src/components/Editor/InteractiveModal.tsx`.
*   ⏸️ `[DELETE]` `src/components/Sidebar/DeleteConfirmModal.tsx`.
*   ⏸️ `[MODIFIED]`: Consumers of deleted modals updated to import from `@gia/ui`.

### `apps/viewer/`
*   ✅ `[MODIFIED]` `package.json`: Added `@gia/ui` dependency.
*   ⏸️ `[MODIFIED]` `src/features/BookReader/InteractiveText.tsx`: Adopt `Tooltip`.
*   ⏸️ `[MODIFIED]` `src/features/BookLobby/BookLobbyModal.tsx`: Migrate to `Dialog`.

## 7. Unintended Consequences Check
*   ✅ **Verified**: `Dialog` z-index (1000/1001) below `PageCarousel`. Portals isolate gestures.
*   ✅ **Verified**: Theme inheritance works (data-theme on `<html>`).

## 8. Risks & Mitigations
*   **Risk**: Radix styles conflict with existing global CSS reset.
    *   **Mitigation**: ✅ Scoped component styles using CSS Modules.
*   **Risk**: Bundle size increase.
    *   **Mitigation**: ✅ Tree-shakeable via standard ES module exports.

## 9. Definition of Done
*   ✅ `npm run build` passes for `@gia/ui`.
*   ⏸️ All identified Studio and Viewer components replaced.
*   ⏸️ Accessibility check (Tab navigation loops correctly in Modals).
*   ⏸️ Tooltips appear on hover/focus in both apps.

## 10. Implementation Notes (2025-12-07)

### What Was Built
- **Package**: `@gia/ui` created with proper TypeScript, CSS Module support
- **Components**: Tooltip, Dialog, Popover all implemented with:
  - Radix UI primitives for accessibility
  - Motion v12 animations (`motion/react`)
  - Design system tokens (`--bg-*`, `--fg-*`, `--shadow-*`)
- **Dependencies**: Added to both Studio and Viewer `package.json`

### What Remains
- **TooltipProvider** needs to wrap app roots (`apps/studio/src/app/layout.tsx`, `apps/viewer/src/pages/_app.tsx`)
- **Studio migrations**: `InteractiveModal.tsx` and `DeleteConfirmModal.tsx` → `@gia/ui/Dialog`
- **Viewer migrations**: Local Radix imports → `@gia/ui` equivalents
- **DropdownMenu**: Component not yet implemented (can be added later)

### For Next Agent (PRD-003)
All design system tokens (`@gia/design-system`) are available for use. The `@gia/ui` components already consume design tokens via CSS Modules. PRD-003 work on expressive text styling can proceed independently.
