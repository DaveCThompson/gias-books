# Engineering Strategy

## 🧠 Technical Standards

### 1. Performance First
- **Static Export**: The Viewer must be deployable as static HTML/assets for minimal cost and maximum speed.
- **Asset Optimization**: Aggressive image optimization (WebP/AVIF) and audio compression.
- **Bundle Size**: Strict budget on initial load JS.

### 2. Maintenance & Scalability
- **Strict Typing**: TypeScript Strict Mode enabled everywhere.
- **Shared Code**: Logic lives in `packages/`, apps are just shells.
- **Testing**: End-to-end testing for critical reading paths.

### 3. "Premium" as a Default
- If a feature feels "janky", it is a bug.
- Animations must run at 60fps.
- Layout shifts are unacceptable.
