# Idea: Branching Narratives (Micro-Choices)

## Concept
Introduce simple, low-stakes choices that affect the visual outcome of the story without necessarily altering the core plot. This gives children a sense of agency and personalization.

## Implementation Details
-   **Data Structure**: Extend the book JSON schema to support "Choice Points".
    -   Example: `{"type": "choice", "options": [{"label": "Red Hat", "variable": "hatColor", "value": "red"}, ...]}`
-   **Persistence**: Store choices in `zustand` (and potentially `localStorage`) so they persist across page turns and sessions.
-   **Visuals**: Use the stored variables to conditionally render assets (e.g., a sprite with the chosen hat color) or change text (e.g., "The [red] slime...").

## Value Proposition
-   **Agency**: Children feel they are helping tell the story.
-   **Replayability**: Encourages reading the book again to see different outcomes.
