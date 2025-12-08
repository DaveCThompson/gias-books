# PRD 003: Decoupled Styling Architecture

## 1. Overview
Refactoring the "Expressive Text" system from rigid, bundled "Emotions" (e.g., `happy` = font A + color B + anim C) to a composable system of independent attributes (Font, Color, Effect). This gives authors consistent granular control while maintaining the implementation of high-craft rendering.

## 2. Problem & Goals
### Problem
*   **Rigidity**: To change the color of "Shout" text, a new Emotion must be defined in the schema.
*   **Combinatorial Explosion**: "Happy Red", "Happy Blue", "Happy Big" would require separate definitions.
*   **Legacy Debt**: Current implementation relies on hardcoded CSS classes (`.mood-calm`) in Studio, limiting flexibility.

### Goals
*   **Composability**: Authors can mix and match Fonts, Colors, and Effects.
*   **Schema Clarity**: Explicit lists of supported Fonts, Colors (semantic), and Animation Effects.
*   **Backward Compatibility**: Support legacy `[expressive:emotion]` tags by mapping them to the new primitives internally.

## 3. Scope & Key Initiatives
### In Scope
*   Refactoring `@gia/schemas` to export `FONTS`, `COLORS`, `EFFECTS` dictionaries.
*   Updating `PageData` schema to validate against these lists.
*   Updating DSL Converter (`studio`) to handle `[style ...]` tags.
*   Updating Renderer (`viewer`) to compose styles dynamically.

### Out of Scope
*   Adding new font files (using existing loaded fonts).
*   Complex text layout engines (maintaining basic flow).

## 4. UX/UI Specification & Wireframes

### DSL Format
**New Format**:
`[style font="handwritten" color="red" effect="bounce"]content[/style]`

**Legacy Format (Supported)**:
`[expressive:happy]content[/expressive]` → Internally resolves to: `font="fredoka" color="orange" effect="bounce"`

### Rendering Logic
Components will lookup attributes in the Central Registry (`@gia/schemas`).

```typescript
// @gia/schemas/src/registries.ts
export const FONTS = {
  handwritten: { family: 'Gochi Hand', varSettings: '...' },
  display:     { family: 'Fredoka',    varSettings: '...' },
  // ...
}

export const EFFECTS = {
  bounce:  { animationName: 'bounce', duration: 'var(--duration-normal)' },
  shimmer: { animationName: 'shimmer', duration: 'var(--duration-slow)' },
  // ...
}
```

## 5. Architecture & Implementation Plan
### Data Flow
1.  **Schema**: Defined in `@gia/schemas`.
2.  **Authoring**: Studio creates DSL strings.
3.  **Storage**: Saved as raw text in `data.json`.
4.  **Presentation**: Viewer parses DSL → React Nodes → Applies inline styles/classes.

### Implementation
1.  **Schema Refactor**: Break `EMOTION_STYLES` into atomic dictionaries.
2.  **Studio Converter**: Update regex to parse generic `[style]` tags with attributes.
3.  **Viewer Component**: `InteractiveText.tsx` refactored to:
    *   Parse attributes.
    *   Look up Font config.
    *   Look up Color config (mapped to CSS var).
    *   Look up Effect config (mapped to CSS class/animation).

## 6. File Manifest

### `packages/schemas/`
*   `[MODIFIED]` `src/index.ts`: Export `FONTS`, `COLORS` (list), `EFFECTS`.
*   `[NEW]` `src/legacy-mapper.ts`: Logic to map old emotions to new atoms.

### `apps/studio/`
*   `[MODIFIED]` `src/utils/dslConverter.ts`: New regex support.
*   `[MODIFIED]` `src/components/Editor/TextEditor.module.css`: Remove hardcoded emotion classes.

### `apps/viewer/`
*   `[MODIFIED]` `src/features/BookReader/InteractiveText.tsx`: Update render logic.

## 7. Unintended Consequences Check
*   **Check**: Existing books with `[expressive:...]` tags must still render perfectly.
    *   *Validation*: Create a regression test page with all legacy emotions.

## 8. Risks & Mitigations
*   **Risk**: DSL parsing performance on long text blocks.
    *   **Mitigation**: Regex is fast, but ensure we don't nest too deeply. Limit nesting depth if needed.
*   **Risk**: CSS specificity wars with inline styles.
    *   **Mitigation**: Inline styles for Font/Color should override class-based defaults.

## 9. Definition of Done
*   [ ] `npm run validate` passes with new schemas.
*   [ ] Legacy content renders identical to before.
*   [ ] New `[style]` tags render correctly in Studio and Viewer.
*   [ ] No TypeScript errors in schema usage.
