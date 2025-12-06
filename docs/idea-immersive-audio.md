# Idea: Immersive Audio Simulation ("The Mix")

## Concept
Move beyond simple "play/stop" audio to a dynamic, studio-quality mixing environment running in the browser. The audio should "breathe" and react to the UI state, creating a sense of physical space.

## Core Features

### 1. Dynamic Mixing Graph (The "Mixer")
Instead of playing sounds directly, all audio is routed through a graph of **Buses**:
*   **Music Bus**: Background music loops.
*   **SFX Bus**: UI sounds (clicks, swipes) and diegetic sounds (footsteps).
*   **Voice Bus**: Narration.
*   **Master Bus**: Final output (limiter/compressor).

### 2. Auto-Ducking (Sidechain Compression)
*   **Behavior**: When the **Voice Bus** detects signal (narration starts), the **Music Bus** volume automatically lowers (e.g., from 100% to 30%) over a smooth curve (300ms attack).
*   **Why**: Ensures clarity of narration without losing the emotional impact of the music.

### 3. Environmental Filtering (The "Muffle" Effect)
*   **Behavior**: When a modal opens (e.g., Settings, Book Lobby) or the user pauses the story, a **Low-Pass Filter (LPF)** is applied to the Music and SFX buses.
*   **Effect**: The audio sounds "muffled" or "underwater," simulating the user stepping "out" of the story world into the UI layer.
*   **Why**: cognitively separates the "Story" context from the "App" context.

### 4. Spatial Panning
*   **Behavior**: Sounds are panned left/right based on their visual position on screen.
*   **Example**: If a dog barks on the left page, the sound comes from the left speaker/earbud.

## Technical Implementation
*   **Library**: `howler.js` (for reliable playback) + `Web Audio API` (for the effects graph).
*   **State**: `useAudioMixer` hook that exposes the buses and effects nodes.
