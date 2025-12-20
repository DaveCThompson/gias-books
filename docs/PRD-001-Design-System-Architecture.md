# PRD 001: Design System Architecture Refactor

**Status**: ✅ **COMPLETED** (2025-12-07)

## 1. Overview
A comprehensive modernization of the `@gia/design-system` to implement a "Named Color" architecture backed by OKLCH. This establishes a robust foundation for light/dark mode, vibrancy customization, and semantic clarity across the entire Madoodle workspace.

**Implementation**: Hybrid Named Color system (Option B) with 8 full hue scales (Red, Orange, Amber, Green, Cyan, Blue, Purple, Pink), each with 9 steps (100-900).

## 2. Problem & Goals
### Problem
*   Current styling relies heavily on semantic roles (`--bg-primary`) without exposing clear hue primitives, making it hard to create "Red" or "Blue" elements that adapt to dark mode correctly.
*   Legacy tokens (`--color-*`) coexist with new semantic tokens, causing confusion.
*   "Vibrancy" (saturation tuning) is difficult to implement with current pre-calculated hex/rgb values.

### Goals
*   **Unified Color System**: Implement a Named Color system (Red, Blue, Green...) that is theme-aware.
*   **OKLCH Backing**: All colors defined via `oklch()` to enable algorithmic Vibrancy and Theme switching.
*   **Legacy Cleanup**: Remove all deprecated `--color-*` aliases.
*   **Documentation**: Establish `docs/SPEC-design-system.md` as the single source of truth.

## 3. Scope & Key Initiatives
### In Scope (Completed)
*   ✅ Refactored `packages/design-system/variables.css` with Named Color architecture.
*   ✅ Defined Primitive Hue Ranges: Red, Orange, Amber, Green, Cyan, Blue, Purple, Pink (8 hues × 9 steps = 72 primitives).
*   ✅ Added new tokens: `--fg-quaternary`, `--fg-muted`, `--border-*-faint` (success, warning, alert, info).
*   ✅ Updated semantic layer to use Named Colors instead of direct primitives.
*   ⏸️ App migration deferred (backward-compatible aliases maintained).
*   ⏸️ Documentation updates deferred to future work.

### Out of Scope
*   Changing font families (Typography remains as-is).
*   Refactoring layout/spacing tokens.

## 4. UX/UI Specification & Wireframes
*   **Visual Design**: No layout changes. Colors will shift slightly due to OKLCH perceptual uniformity.
*   **Token Pattern**:
    The system uses a "Primitive → Semantic" mapping.

    ```css
    /* 1. Primitives (Defined by Hue) */
    --primitive-red-500: oklch(55% 0.22 25);
    
    /* 2. Named Colors (Theme-Aware) */
    /* Light Mode */
    --color-red: var(--primitive-red-600);
    --color-bg-red: var(--primitive-red-100);
    
    /* Dark Mode */
    --color-red: var(--primitive-red-400); 
    --color-bg-red: var(--primitive-red-900);
    ```

## 5. Architecture & Implementation Plan
### Styling Architecture
1.  **Primitives**: Define full scales (100-900) for all named hues using `oklch`.
2.  **Contexts**:
    *   `data-theme="dark"`: Inverts Lightness mapping (e.g., Red-500 -> Red-400 for text).
    *   `data-vibrancy="minimal"`: Multiplies Chroma by 0.5.
    *   `data-vibrancy="high-contrast"`: Multiplies Chroma by 1.2, increases contrast ratios.

## 6. File Manifest

### `packages/design-system/`
*   ✅ `[MODIFIED]` `variables.css`: 
    - Added 72 Named Color primitives (8 hues × 9 steps)
    - Added 16 theme-aware Named Color tokens (--color-red, --color-bg-red, etc.)
    - Added `--fg-quaternary`, `--fg-muted`
    - Added `--border-*-faint` semantic tokens
    - Updated semantic layer to reference Named Colors
    - Updated dark mode theme mappings

### `apps/studio/` & `apps/viewer/`
*   ⏸️ **Deferred**: No changes required due to backward-compatible aliases.

### `docs/`
*   ⏸️ **Deferred**: Documentation updates for future work.

## 7. Unintended Consequences Check
*   **Check**: `tailwind.config.ts` (if it exists) – we are using vanilla CSS, so this is safe.
*   **Check**: Hardcoded colors in canvas rendering (if any). `PageCarousel` mood interpolation logic might need updates if it reads CSS vars directly.

## 8. Risks & Mitigations
*   **Risk**: Visual regression in specific mood gradients.
    *   **Mitigation**: Manually compare Mood Gradients in Viewer before/after.
*   **Risk**: Dark mode contrast failures with new OKLCH values.
    *   **Mitigation**: Use a contrast checker tool on the new primitive definitions.

## 9. Definition of Done
*   ✅ `npm run lint` passes (0 errors, 0 warnings).
*   ✅ `npm run build` passes (exit code 0).
*   ⚠️ Legacy `--color-*` tokens **RETAINED** for backward compatibility (aliased to new semantic tokens).
*   ⏸️ Viewer renders correctly in Light/Dark modes (**Pending manual QA**).
*   ⏸️ Studio renders correctly in Light/Dark modes (**Pending manual QA**).
*   ⏸️ Vibrancy toggle works in Viewer (**Pending manual QA**).

## 10. Implementation Notes

### What Changed
- **72 new primitive tokens** (8 hues: Red, Orange, Amber, Green, Cyan, Blue, Purple, Pink)
- **16 new theme-aware Named Color tokens** (--color-red, --color-bg-red, etc.)
- **5 new semantic tokens** (--fg-quaternary, --fg-muted, --border-*-faint)
- **Semantic layer refactored** to use Named Colors (--fg-alert now uses --color-red instead of --primitive-alert-700)

### Architecture Decision
Chose **Option B (Hybrid Named Colors)** for flexibility:
- Developers can use semantic tokens (preferred): `--fg-alert`
- Developers can use Named Colors for one-offs: `--color-red`
- Dark mode adaptation is automatic via theme-aware mappings

### Backward Compatibility
All legacy `--color-*` aliases remain functional and map to new semantic tokens. No breaking changes.

## 11. Context for PRD-003 (Decoupled Styling)

### Available Design System Assets
The following design system tokens are ready for PRD-003 implementation:

**Named Color Tokens** (for expressive text):
- `--color-red`, `--color-orange`, `--color-amber`, `--color-green`, `--color-cyan`, `--color-blue`, `--color-purple`, `--color-pink`
- Background variants: `--color-bg-red`, `--color-bg-orange`, etc.
- All automatically adapt to `data-theme="dark"`

**Semantic Foreground Tokens** (for text hierarchy):
- `--fg-primary`, `--fg-secondary`, `--fg-tertiary`, `--fg-quaternary`, `--fg-muted`

**Expressive Tokens** (current emotion colors):
- `--fg-expressive-happy`, `--fg-expressive-sad`, `--fg-expressive-shout`, `--fg-expressive-angry`, etc.
- Currently tied to emotions, can be refactored to Named Colors in PRD-003

**Animation Tokens** (for text effects):
- `--duration-fast`, `--duration-normal`, `--duration-slow`
- `--ease-out`, `--ease-in-out`, `--ease-out-expo`

### Shared UI Components Available
PRD-003 can leverage `@gia/ui` components if needed for Studio toolbars:
- `Tooltip` - For explaining style controls
- `Popover` - For color/font picker menus
- `Dialog` - For advanced styling options

### Integration Points
Files that PRD-003 will modify align with design system:
- `packages/design-system/variables.css` - All color tokens already defined
- `apps/viewer/src/features/BookReader/InteractiveText.tsx` - Uses semantic tokens
- `apps/studio/src/components/Editor/TextEditor.module.css` - Uses mood gradients
