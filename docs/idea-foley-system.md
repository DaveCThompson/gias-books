# Idea: "Foley" System (Organic UI Sounds)

## Concept
Replace repetitive, static UI sound effects with a system that randomizes pitch and sample variations to create a more organic, "tactile" feel.

## Implementation Details
-   **Asset Bank**: For common actions (e.g., "Page Turn", "Button Click"), record 3-5 slight variations.
-   **Randomization Logic**:
    -   **Sample Selection**: Randomly pick one of the variations on each trigger.
    -   **Pitch Shift**: Apply a subtle random pitch shift (e.g., +/- 5 cents) using the Web Audio API (or `howler.js` rate).
    -   **Volume**: Subtle volume randomization.
-   **Integration**: Wrap this logic in a `useFoley(soundId)` hook.

## Value Proposition
-   **Polish**: Eliminates the "robotic" feel of standard UI sounds.
-   **Comfort**: Reduces audio fatigue during long reading sessions.
