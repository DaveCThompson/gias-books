# PRD 004: Infrastructure Unification

## 1. Overview
Standardization of core libraries across the monorepo to ensure stability, reduce bundle size, and simplify developer onboarding. The primary focus is unifying Animation libraries (`motion`) and Type safety (`zod`).

## 2. Problem & Goals
### Problem
*   **Version Mismatch**: Studio uses `framer-motion` (v12 renamed to `motion`), Viewer uses `motion`. This causes confusion and potential behavior differences.
*   **Dependency Drift**: Some packages might be using older versions of React or Typescript utilities.

### Goals
*   **Single Dependency Version**: All apps use `motion` (v12+).
*   **Clean Dependency Tree**: Remove unused or duplicate packages (e.g., `clsx` vs `classnames` - we strictly use `clsx` via `@gia/utils`).

## 3. Scope & Key Initiatives
### In Scope
*   Migrating `apps/studio` from `framer-motion` to `motion`.
*   Verifying `next` version parity (15.1.0).
*   Auditing `package.json` in root and apps for discrepancies.

### Out of Scope
*   Upgrading Next.js to major versions beyond 15.1.x.
*   Changing build tools (Turbo remains).

## 4. UX/UI Specification & Wireframes
N/A (Invisible Infrastructure)

## 5. Architecture & Implementation Plan
### Migration Steps
1.  **Uninstall**: Remove `framer-motion` from Studio.
2.  **Install**: Add `motion` to Studio.
3.  **Refactor**: Global search/replace imports:
    *   `import { ... } from 'framer-motion'` -> `import { ... } from 'motion/react'`
    *   *Note*: `motion` packages imports slightly differently (e.g., `motion/react` vs `motion/react-client` for SSR safety). We must verify this against v12 docs.

## 6. File Manifest

### `apps/studio/`
*   `[MODIFIED]` `package.json`: Dependency updates.
*   `[MODIFIED]` `src/**/*.tsx`: Import path updates.

### `package.json` (Root)
*   `[REFERENCE]` Check for hoisted dependencies.

## 7. Unintended Consequences Check
*   **Check**: "Motion" v12 has some breaking changes vs v10/11.
    *   *Verify*: `AnimatePresence` and `layoutId` transitions in Studio (e.g., Page List, Asset Picker).
*   **Check**: SSR compatibility (Next.js App Router). `motion` v12 is optimized for this but requires correct imports (`motion/react` vs `framer-motion`).

## 8. Risks & Mitigations
*   **Risk**: Broken animations in Studio.
    *   **Mitigation**: Visual check of all drag-and-drop and hover effects.

## 9. Definition of Done
*   [ ] `npm run build` passes for the entire workspace.
*   [ ] No `framer-motion` in any `package.json` or lockfile.
*   [ ] Studio and Viewer run simultaneously without conflict.
