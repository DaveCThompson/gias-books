# Idea: Parallax 2.5D Scenes

## Concept
Transform static book illustrations into multi-plane 2.5D scenes that shift subtly with device motion (mobile) or mouse position (desktop), adding cinematic depth and immersion.

## Implementation Details
-   **Layering**: Illustrations must be separated into at least 3 layers: Foreground, Midground, Background.
-   **Input Mapping**:
    -   **Mobile**: Use `DeviceOrientationEvent` (gyroscope) to map tilt to layer offset.
    -   **Desktop**: Map mouse coordinates relative to the window center to layer offset.
-   **Performance**: Use CSS `transform: translate3d()` for hardware-accelerated movement. Avoid heavy JS calculations on every frame; use `requestAnimationFrame`.
-   **Fallback**: Graceful degradation to static images if sensors are unavailable or user prefers reduced motion.

## Value Proposition
-   **Immersion**: Makes the story world feel "real" and alive.
-   **Differentiation**: Sets Madoodle apart from standard e-book readers.
