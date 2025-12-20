# SPEC-rendering: Rendering Engine & UX

## 🎨 Visual Pipeline

### 1. View Transitions
We use the **View Transitions API** to create app-like continuity between pages.
- **Mechanism**: The browser captures a snapshot of the old state and cross-fades to the new state.
- **Enhancement**: We use custom CSS animations during the transition to slide pages (`::view-transition-group`).

### 2. The VFX Layer
A dedicated `<canvas>` or overlay layer sits atop the content for atmospheric effects.
- **Particle Systems**: Rain, snow, confetti, floating dust.
- **Performance**: Rendered independently of the DOM layout cycle.
- **Scope**: Global (app-wide) or Local (page-specific).

### 3. Gesture System
Natural touch interaction is primary.
- **Library**: `@use-gesture/react`.
- **Interactions**:
    - **Swipe**: Turn pages (Elastic banding effect on edges).
    - **Tap**: Reveal controls or trigger interactive words.
    - **Long Press**: Debug or save state (context dependent).

### 4. Layout Engine
- **Responsiveness**:
    - **Mobile**: Stacked layout (Image top, Text bottom) or info-sheet overlay.
    - **Desktop**: Split-screen (Book spread view).
- **Scaling**: Fluid typography and spacing using `clamp()` and container queries.
