# SPEC-architecture: Technical Architecture

## 🏗 High-Level Architecture

### Technology Stack
- **Monorepo**: Turborepo managing `viewer` (consumer) and `studio` (creator).
- **Framework**: Next.js 15.
    - `apps/viewer`: Pages Router (SSG focused, optimized for static export).
    - `apps/studio`: App Router (Client-heavy, WYSIWYG editor).
- **State Management**: Zustand.
    - Chosen for its atomic updates and transient state performance (critical for animations).
    - Flat store structure in `src/data/stores`.

### Workspace Structure
```
gia-workspace/
├── apps/
│   ├── viewer/       # The Reader Experience
│   └── studio/       # The Authoring Experience
├── packages/
│   ├── schemas/      # Shared Zod definitions (Single Source of Truth)
│   ├── design-system/# CSS tokens, fonts, resets
│   ├── content/      # Book JSON data and assets
│   └── utils/        # Shared pure functions (cn, math, etc.)
```

### Build & Deploy
- **Viewer**: Deploys as a static export (`output: 'export'`) to hosts like GitHub Pages.
- **Asset Pipeline**: Assets are co-located in `@gia/content` and synced to `public/` during build.
