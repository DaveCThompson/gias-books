# Rendering Engine Specification

## 🎨 The Rendering Engine

### VFX Layer
- Canvas-based effects (rain, snow, particles) overlaid on the DOM.
- Controlled by the "Mood" system defined in page data.
- Optimized for performance (requestAnimationFrame, offscreen canvas where applicable).

### Gesture System
- Uses `@use-gesture/react` for natural touch interactions.
- Core gestures: Swipe to turn page, long-press for interactions, pinch-zoom (where allowed).

### View Transitions
- Mobile-app-like navigation fluidity using the View Transitions API.
- Semantic transitions based on navigation direction (forward/backward).
