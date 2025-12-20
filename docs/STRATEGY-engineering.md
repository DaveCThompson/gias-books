# STRATEGY-engineering: Technical Strategy

## 🧠 Engineering Standards

### 1. Performance First
- **Static Export**: The Viewer must be deployable as static HTML/assets for minimal cost and maximum speed.
- **Asset Optimization**: Aggressive image optimization (WebP/AVIF) and audio compression.
- **Bundle Size**: Strict budget on initial load JS. Avoid heavy client-side libraries unless essential.

### 2. Maintenance & Scalability
- **Strict Typing**: TypeScript Strict Mode enabled everywhere. No `any`.
- **Shared Code**: Logic lives in `packages/`, apps are just shells/consumers.
- **Testing**: End-to-end testing (Playwright) for critical reading paths.

### 3. "Premium" as a Default
- **60 FPS or Bust**: Animations must run at 60fps (use transforms/opacity).
- **No Layout Shifts**: Dimensions must be reserved for images/media (CLS score of 0).
- **Jank Free**: If a feature feels "janky" or unresponsive, it is a critical bug.
