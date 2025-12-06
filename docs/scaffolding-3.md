# PRD-03: The Immersive Audio and Learning Layer

**Goal:** To add the final layers of interactivity and immersion to the book. This PRD focuses on implementing the audio narration system and the interactive vocabulary tooltips.

---

### 1. User Story

> As a user, I want to enable a "Read to Me" mode to hear narration, and tap on special words to learn their meaning, so I can have a fully immersive and educational experience.

### 2. Acceptance Criteria

1.  **Mode Selection:** A clear UI control (e.g., a toggle switch) must be present to switch between "Read to Me" and "I'll Read" modes.
2.  **State Persistence:** The user's chosen mode must be saved using `Zustand`'s persistence middleware and automatically applied on their next visit.
3.  **Audio Playback:** In "Read to Me" mode, the correct narration audio file for the currently visible page must play automatically. Navigating to a new page should stop the previous audio and start the new one.
4.  **Audio Controls:** Basic UI controls (e.g., a global play/pause button) must be available to the user.
5.  **Interactive Tooltips:** Tapping on a word styled with the `<expressive>` tag must trigger a tooltip (using Radix UI) that displays the word's definition from the `data.json` file.

### 3. Technical Implementation Plan

-   **State Management:**
    -   Implement the `Zustand` store in `src/data/store/settings.ts`. It will manage a `readingMode` state (`'narrated'` or `'selfRead'`) and use the `persist` middleware.
-   **Audio:**
    -   Create the `useAudioPlayer` custom hook in `src/data/hooks/`. This hook will encapsulate all `Howler.js` logic for playing, pausing, and managing audio tracks.
    -   The `BookReader.tsx` component will use this hook. It will also subscribe to the Zustand store to know when to play audio and will listen for Swiper's `slideChange` event to trigger the correct narration for the new page.
-   **UI Components:**
    -   Create the `NarrationControls.tsx` component inside the `BookReader` feature. It will contain the mode toggle and play/pause buttons. This component will read from and write to the Zustand store to control the application's audio state.
-   **Interactivity (Modification of `Page.tsx`):**
    -   Integrate `@radix-ui/react-tooltip` into the `features/BookReader/Page.tsx` component.
    -   The `html-react-parser` logic will be updated. The `replace` function will now wrap `<expressive>` tags in a `<Tooltip.Root>` and `<Tooltip.Trigger>`. It will also render a `<Tooltip.Content>` component containing the definition, which will be added to the `data.json` file.