# Idea: Smart Audio Preloading

## Concept
Implement a "Just-In-Time" (JIT) asset loading strategy to ensure instant page turns without audio lag, while keeping memory usage low.

## Implementation Details
-   **Lookahead Loading**: When the user is on Page `N`, automatically begin loading audio assets for Page `N+1` (and potentially `N-1` for backward navigation).
-   **Garbage Collection**: Automatically unload audio assets for pages outside a "safe window" (e.g., `N-2` and `N+2`) to free up memory.
-   **State Machine Integration**: The preloader should listen to the Story Engine state to prioritize assets based on likely next actions.

## Value Proposition
-   **Performance**: Eliminates "buffering" pauses when turning pages.
-   **Stability**: Prevents memory crashes on low-end devices by not keeping the entire book's audio in memory.
