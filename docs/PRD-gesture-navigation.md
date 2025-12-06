# PRD: Gesture-Driven Navigation

## 1. Overview
Replace rigid button-based navigation with fluid, physics-based gestures. The interface should feel like a physical object that responds to touch, momentum, and intention.

## 2. Core Gestures

### 2.1. The "Lobby" Swipe (Dismissal)
*   **Context**: The "Book Lobby" modal is open.
*   **Action**: User swipes **DOWN** on the cover image or header.
*   **Behavior**:
    *   **Tracking**: The modal follows the finger 1:1.
    *   **Resistance**: As the user drags further, apply "rubber-banding" resistance.
    *   **Release**:
        *   If velocity > threshold OR drag distance > 30%: The modal dismisses (morphs back to the grid).
        *   Otherwise: It springs back to the open position.
*   **Visuals**: The background backdrop opacity interpolates from 1.0 -> 0.0 as the user drags.

### 2.2. Page Turning (Drag & Snap)
*   **Context**: Reading a book.
*   **Action**: User drags **LEFT** or **RIGHT**.
*   **Behavior**:
    *   **Tracking**: The current page slides with the finger.
    *   **Peeking**: The next/prev page is visible underneath.
    *   **Snap**: On release, snap to the next page or bounce back based on velocity/distance.
*   **Physics**: Use a spring configuration with high stiffness and moderate damping for a "crisp" paper feel.

## 3. Technical Requirements

### 3.1. Gesture Engine
*   **Library**: `@use-gesture/react` (already installed).
*   **Configuration**:
    *   `rubberband: true` (for over-drag feel).
    *   `filterTaps: true` (to distinguish clicks from drags).

### 3.2. Animation Engine
*   **Library**: `framer-motion` (already installed).
*   **Integration**: Map gesture `movement` values directly to `motion.div` `x` or `y` transforms.
*   **Performance**: Use `useMotionValue` and `useTransform` to animate outside the React render loop (critical for 60fps).

## 4. Accessibility Fallbacks
*   Gestures must be paired with visible, clickable alternatives for users with motor impairments or non-touch devices.
*   **Lobby**: A visible "Close" (X) button in the top right.
*   **Reader**: Visible "Next/Prev" arrow zones (or buttons) for mouse users.
