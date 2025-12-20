# Project Strategy & Roadmap

## 🎯 Strategic Goals

### Phase 1: Foundation (Current)
*Establish the core reader experience.*
- ✅ **Robust DSL**: Stable text formatting and styling engine.
- ✅ **Design System**: Unified token architecture (OKLCH).
- ✅ **Component Library**: Reusable UI primitives.
- 🚧 **Accessibility**: High contrast, screen reader compatibility (WIP).

### Phase 2: Interactivity (Next)
*Deepen the engagement.*
- **Interactive Words**: Tooltips and "easter egg" interactions within the text.
- **Branching Narratives**: Simple "Choose Your Own Adventure" mechanics.
- **Canvas VFX**: Particle systems for weather (rain, snow, confetti).

### Phase 3: Authoring Experience
*Democratize creation.*
- **Studio Polish**: stabilizing the WYSIWYG editor.
- **Asset Management**: Drag-and-drop asset pipeline.
- **Preview Parity**: 1:1 match between Editor and Viewer.

---

## 🧠 Technical Strategy

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
