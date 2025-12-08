# PRD 003: Decoupled Styling Architecture

**Status**: ✅ **COMPLETED** (2025-12-07)

## 1. Overview
A strategic refactor of the "Expressive Text" system to move from rigid, pre-bundled "Emotions" (e.g., `happy` = font A + color B + anim C) to a **composable atomic system**. This empowers authors with consistent, granular control over Font, Color, and Motion independently, while leveraging the robust "Named Color" system established in PRD-001.

## 2. Problem & Goals
### Problem
*   **Combinatorial Rigidity**: Creating a "Happy" style in Blue requires defining a new `happy-blue` emotion in the schema.
*   **Leakage of CSS**: Studio relies on hardcoded CSS classes (`.mood-calm`), making the renderer fragile and hard to sync with Viewer.
*   **Inconsistent Tooling**: Authors cannot simply "make this text bigger" or "make this text wiggle" without specific pre-defined combinations.

### Goals
*   **Atomic Composability**: Enable `Font` + `Color` + `Motion` + `Size` to be mixed freely.
*   **Type Safety**: Ensure all composed styles are validated against centralized Registries (schema-backed).
*   **Visual Excellence**: Maintain the high-fidelity rendering (text shadows, variable font settings) while increasing flexibility.
*   **Backward Compatibility**: Zero regression for existing content using legacy `[expressive:emotion]` tags.

## 3. Options Analysis (Vetting)

We evaluated three architectural approaches to solving the Decoupled Styling problem.

### Option A: Open CSS Properties (The "Chaos" Option)
*   **Concept**: Allow authors to write raw CSS. e.g., `[style css="color: red; font-family: 'Gochi Hand'"]`.
*   **Pros**: Infinite flexibility. Zero schema maintenance.
*   **Cons**: Breaks design system. Non-portable (web vs native). Security risk. No validation.
*   **Verdict**: ❌ **REJECTED** - Too fragile and violates "High-Craft" constraint.

### Option B: Utility-Class Composition (The "Tailwind" Option)
*   **Concept**: Use a string of utility classes. e.g., `[style class="text-red-500 font-handwritten animate-bounce"]`.
*   **Pros**: Familiar to devs. Easy to parse.
*   **Cons**: Tight coupling to CSS implementation details. Hard to enforce semantic constraints (e.g., ensuring only *semantic* colors are used).
*   **Verdict**: ❌ **REJECTED** - Leaks implementation details into content storage.

### Option C: Registry-Backed Atoms (The "Semantic" Option)
*   **Concept**: Define strict Registries (`FONTS`, `COLORS`, `EFFECTS`) in strict code/schema. Content references *IDs* from these registries. e.g., `[style font="handwritten" color="red" effect="bounce"]`.
*   **Pros**:
    *   **Source of Truth**: Registries are the single point of definition.
    *   **Type Safety**: `z.enum(FONTS.keys)` ensures only valid fonts exist in DB.
    *   **Design Integrity**: Authors can only use "approved" combinations.
    *   **Portable**: IDs are abstract; implementation can change (CSS vs Canvas).
*   **Verdict**: ✅ **SELECTED** - Best balance of flexibility and structure.

## 4. UX/UI Specification

### Studio Toolbar Experience
The Studio will implement a "Smart Toolbar" that appears when text is selected.

```mermaid
graph TD
    A[Select Text] --> B{Bubble Menu Appears}
    B --> C[Font Picker]
    B --> D[Color Picker]
    B --> E[Motion Picker]
    B --> F[Size Slider]
    
    C --> C1[Handwritten]
    C --> C2[Display]
    C --> C3[Serif]
    
    D --> D1[Semantic Palette (Red, Blue...)]
    D --> D2[Theme Preview]
    
    E --> E1[Animations (Bounce, Shake...)]
```

### ASCII Mockups

**1. Floating Bubble Menu** (Contextual)
```text
+--------------------------------------------------+
|  [ Font v ]  [ Color v ]  [ Motion v ]  [ B I U ] |
+--------------------------------------------------+
```

**2. Color Picker (Popover)**
Leverages PRD-001 Named Colors.
```text
+------------------------+
|  Text Color            |
|                        |
|  [R] [O] [Y] [G] [C]   |  <-- Swatches (Red, Orange, Yellow...)
|  [B] [P] [Pi] [Gr]     |
|                        |
|  Current: Blue-500     |
+------------------------+
```

**3. Preview in Editor**
```text
This is [ Handwritting | Red | Bounce ] text inside normal paragraph.
         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
         Rendered with live CSS vars
```

## 5. Architecture & Implementation Plan

### Data Schema (`@gia/schemas`)

We will introduce **Registries** to replace the monolithic `EMOTION_STYLES`.

```typescript
// 1. Registry Definitions
export const FONT_REGISTRY = {
  handwritten: { family: 'var(--font-handwritten)', settings: '...' },
  display:     { family: 'var(--font-display)',     settings: '"wght" 700' },
  // ...
};

export const COLOR_REGISTRY = {
  // Reference PRD-001 Named Colors
  red:    'var(--color-red)',
  blue:   'var(--color-blue)',
  primary:'var(--fg-primary)',
  // ...
};

export const MOTION_REGISTRY = {
  bounce: { animation: 'bounce', duration: 'var(--duration-normal)' },
  shout:  { animation: 'shake',  duration: 'var(--duration-fast)' },
  // ...
};

// 2. DSL Format
// New: [style font="display" color="red" motion="bounce"]Text[/style]
// Legacy: [expressive:happy] -> Maps to -> font="display" color="orange" motion="bounce"
```

### Rendering Pipeline

1.  **Studio Converter**:
    *   Parses `[style ...]` attributes.
    *   Validation: Checks attributes against Registries.
2.  **InteractiveText (Viewer)** & **ExpressiveTextPreview (Studio)**:
    *   Accepts `StyleProps` (font, color, motion).
    *   Resolves props to CSS Variables via Registries.
    *   Applies inline styles:
        ```jsx
        <span style={{
           fontFamily: fonts[id].family,
           color: colors[id],
           animation: motions[id].animation
        }}>
        ```

### Styling Strategy
*   **CSS Variables**: All values (`--color-red`, `--font-display`) originate from `@gia/design-system`.
*   **Scoped Animations**: Animations defined in `global.css` or `animations.module.css`.

## 6. Migration Strategy (Hardware)
We will maintain the `[expressive:emotion]` syntax forever as a "Preset".

1.  **Legacy Mapper**:
    *   `getStyle(emotionId)` function returns `{ font, color, motion }`.
    *   `happy` -> `{ font: 'display', color: 'orange', motion: 'bounce' }`.
2.  **Unified Renderer**:
    *   The renderer only understands atoms. Legacy tags are converted at parse time (runtime).

## 7. Risks & Mitigations
*   **Risk**: Performance overhead of looking up styles for every span.
    *   *Mitigation*: Registries are static const objects. Lookup is O(1).
*   **Risk**: "Frankenstein" styles (users creating ugly combinations).
    *   *Mitigation*: We act as "Curators". Authors can only pick from *good* named colors and *tuned* fonts. No raw hex codes allowed.

## 8. Implementation Summary (2025-12-07)

### What Was Built

#### Atomic Registries ([packages/schemas/src/index.ts](file:///c:/Users/dthompson/Documents/GIA_CODE/gia-workspace/packages/schemas/src/index.ts))
- **`FONT_REGISTRY`**: 6 fonts (body, display, handwritten, fredoka, playpen, roboto)
- **`COLOR_REGISTRY`**: 8 Named Colors + semantic aliases + emotion colors
- **`MOTION_REGISTRY`**: 8 animations (bounce, shake, wiggle, sway, shimmer, flicker, clench, shout)
- **`resolveStyle()`**: Unified helper supporting both legacy emotions and new atomic attributes

#### DSL Updates ([apps/studio/src/utils/dslConverter.ts](file:///c:/Users/dthompson/Documents/GIA_CODE/gia-workspace/apps/studio/src/utils/dslConverter.ts))
- **New Syntax**: `[style font="X" color="Y" motion="Z"]content[/style]`
- **Legacy Support**: `[expressive:emotion]` still works (backward compatible)
- **Bidirectional**: Both `dslToHtml()` and `htmlToDsl()` handle new and legacy syntax

#### Renderers Updated
- **Viewer** ([InteractiveText.tsx](file:///c:/Users/dthompson/Documents/GIA_CODE/gia-workspace/apps/viewer/src/features/BookReader/InteractiveText.tsx)): Added `case 'style'`, refactored `case 'expressive'` to use `resolveStyle()`
- **Studio** ([ExpressiveTextPreview.tsx](file:///c:/Users/dthompson/Documents/GIA_CODE/gia-workspace/apps/studio/src/components/Preview/ExpressiveTextPreview.tsx)): Mirrored Viewer changes for preview

#### CSS Cleanup ([apps/studio/src/components/Editor/TextEditor.module.css](file:///c:/Users/dthompson/Documents/GIA_CODE/gia-workspace/apps/studio/src/components/Editor/TextEditor.module.css))
- Removed hardcoded emotion selectors (`.editor :global([data-expressive][data-style="handwritten"])`, etc.)
- All styling now dynamic via inline styles from `resolveStyle()`

### Verification Status
- ✅ **Lint**: Passed (0 errors)
- ✅ **Build**: Successful
- ⏸️ **Manual Testing**: Pending user verification in browser

### Definition of Done
- ✅ Atomic registries implemented
- ✅ DSL converter supports new syntax
- ✅ Both renderers use `resolveStyle()`
- ✅ Hardcoded CSS removed
- ✅ Backward compatibility maintained
- ⏸️ Legacy content validation (requires manual testing)
- ⏸️ New syntax validation (requires manual testing)

## 9. Context for PRD-004 (Infrastructure Unification)

### Available Resources
PRD-004 can now leverage the following from PRD-003:

**Atomic Registries** (Type-safe, centralized):
- `FONT_REGISTRY` - All font configurations
- `COLOR_REGISTRY` - Named Colors mapped to design system tokens
- `MOTION_REGISTRY` - Animation configurations

**Design System Integration**:
- All colors reference PRD-001 Named Colors (`var(--color-red)`, etc.)
- All fonts reference design system font tokens (`var(--font-handwritten)`, etc.)
- All animations use design system timing (`var(--duration-fast)`, etc.)

**Unified Rendering**:
- `resolveStyle()` function abstracts styling resolution
- Both legacy and new content paths converge to same rendering logic
- Inline styles ensure consistency across apps

### Integration Points for PRD-004
When unifying Studio and Viewer infrastructure, consider:
1. **Shared Schemas**: `@gia/schemas` now exports registries usable by both apps
2. **Consistent Styling**: Both apps use identical `resolveStyle()` logic
3. **Motion Library**: If PRD-004 standardizes on `motion` (v12), animation names in `MOTION_REGISTRY` are already abstracted from implementation
