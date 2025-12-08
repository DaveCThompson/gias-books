# PRD 002: Shared UI Framework

## 1. Overview
Creation of a dedicated workspace package (`packages/ui`) to house high-quality, accessible React components built on Radix Primitives. This centralizes UI logic, enforces consistent styling, and eliminates ad-hoc component implementations in Studio and Viewer.

## 2. Problem & Goals
### Problem
*   **Duplication**: Modals and Tooltips are implemented differently in Studio and Viewer.
*   **Accessibility gaps**: Custom implementations (e.g., Studio's `InteractiveModal`) may miss focus trapping or ARIA attributes.
*   **Inconsistency**: Z-index wars and varying animation curves across the apps.

### Goals
*   **Centralization**: One source of truth for "atoms" (Dialog, Tooltip, Popover, Dropdown).
*   **Accessibility**: Native keyboard support and screen reader compliance via Radix.
*   **Consistency**: Shared animation tokens (`framer-motion`) and visual styling.

## 3. Scope & Key Initiatives
### In Scope
*   Scaffolding `packages/ui` with TypeScript and Tsup/Rollup (or just direct export).
*   Implementing:
    *   `Tooltip` (Global)
    *   `Dialog` (Modal)
    *   `DropdownMenu`
    *   `Popover`
*   Replacing existing ad-hoc components in Studio and Viewer.

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
|  Dialog Content Area                        | <-- var(--bg-surface)
|  ...                                        |
|                                             |
|  [ Cancel ] [ Confirm ]                     |
+---------------------------------------------+
   Shadow: var(--shadow-modal)
   Radius: var(--radius-lg)
```

## 5. Architecture & Implementation Plan
### Package Structure
*   **Name**: `@gia/ui`
*   **Tech**: React, Radix UI, Framer Motion (v12).
*   **Styles**: CSS Modules (importing from `@gia/design-system`).

### Integration
1.  **Studio**:
    *   Toolbar buttons → `Tooltip`
    *   confirms → `Dialog`
    *   Asset pickers → `Popover`
2.  **Viewer**:
    *   Settings → `Dialog`
    *   Bubble Menu → `Popover`

## 6. File Manifest

### `packages/ui/`
*   `[NEW]` `package.json`: Dependencies.
*   `[NEW]` `src/components/Tooltip/`: Implementation.
*   `[NEW]` `src/components/Dialog/`: Implementation.
*   `[NEW]` `src/components/Popover/`: Implementation.
*   `[NEW]` `src/components/Dropdown/`: Implementation.

### `apps/studio/`
*   `[MODIFIED]` `src/components/Editor/TextEditor.tsx`: Adopt `Tooltip`.
*   `[DELETE]` `src/components/Editor/InteractiveModal.tsx`.
*   `[DELETE]` `src/components/Sidebar/DeleteConfirmModal.tsx`.
*   `[MODIFIED]`: Consumers of deleted modals updated to import from `@gia/ui`.

### `apps/viewer/`
*   `[MODIFIED]` `src/features/BookReader/InteractiveText.tsx`: Adopt `Tooltip`.
*   `[MODIFIED]` `src/features/BookLobby/BookLobbyModal.tsx`: Migrate to `Dialog`.

## 7. Unintended Consequences Check
*   **Check**: `Dialog` z-indexes must compete correctly with `PageCarousel` (which has high z-index).
*   **Check**: `Tooltip` collisions with mobile touch targets.

## 8. Risks & Mitigations
*   **Risk**: Radix styles conflict with existing global CSS reset.
    *   **Mitigation**: Scope component styles strictly using CSS Modules.
*   **Risk**: Bundle size increase.
    *   **Mitigation**: `packages/ui` should be tree-shakeable.

## 9. Definition of Done
*   [ ] `npm run build` passes for `@gia/ui`.
*   [ ] All identified Studio and Viewer components replaced.
*   [ ] Accessibility check (Tab navigation loops correctly in Modals).
*   [ ] Tooltips appear on hover/focus in both apps.
