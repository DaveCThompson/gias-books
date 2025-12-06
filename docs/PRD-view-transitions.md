# PRD: Seamless "Portal" Transitions

## 1. Overview
Create a seamless, "magical" transition where the book cover in the library grid morphs into the "Book Lobby" modal. This eliminates the harsh context switch of standard page navigation and reinforces the physical metaphor of "picking up" a book.

**Reference Inspiration**: [YouTube: Smooth Card Expansion](https://www.youtube.com/watch?v=nZtg-xzhy0g)

## 2. User Stories
*   **As a user**, when I tap a book cover, I want it to expand fluidly to fill the screen so that I feel like I'm entering that specific story world.
*   **As a user**, when I swipe down or close the lobby, I want the book to shrink back to its exact place on the shelf so that I maintain my spatial orientation.
*   **As a user**, if I refresh the page while in the lobby, I want to see the full lobby page without broken layouts.

## 3. Technical Implementation

### 3.1. Core Technology: View Transitions API
We will use the native `document.startViewTransition` API. This allows the browser to capture a snapshot of the "Old" state (Grid) and the "New" state (Modal) and interpolate between them.

### 3.2. Architecture: Intercepting Routes
*   **Route Structure**:
    *   `/` (Home): Renders `LibraryGrid`.
    *   `/book/[slug]` (Page): Renders `BookLobby`.
    *   `@modal/(.)book/[slug]` (Intercepting Route): Renders `BookLobbyModal` *on top of* `/`.
*   **Behavior**:
    *   Navigation to `/book/slimey` triggers the Intercepting Route.
    *   The URL updates to `/book/slimey`.
    *   The background (Library) remains visible (dimmed).

### 3.3. The "Portal" Logic
To achieve the morph effect, we must assign matching `view-transition-name` CSS properties to the corresponding elements in both states.

1.  **The Trigger**:
    *   On click, the `LibraryGrid` sets a temporary state: `activeBookSlug = 'slimey'`.
    *   This applies `view-transition-name: active-book-cover` to the *specific* `<img>` of the clicked book.
2.  **The Transition**:
    *   Call `document.startViewTransition(() => router.push('/book/slimey'))`.
3.  **The Target**:
    *   The `BookLobbyModal` mounts. Its main cover image *also* has `view-transition-name: active-book-cover`.
4.  **The Browser**:
    *   Automatically morphs the Grid Image -> Modal Image.

### 3.4. Aspect Ratio Locking (Critical)
To prevent "squashing/stretching" during the morph:
*   Both the Grid Thumbnail and the Modal Cover Image **MUST** maintain the exact same aspect ratio (e.g., `3:4`).
*   Use `object-fit: cover` on both.
*   The Modal Cover should ideally be the *same* image source (cached) to prevent flickering.

## 4. Fallbacks & Constraints

### 4.1. Browser Support
*   **Chrome/Edge/Android**: Full support.
*   **Safari/Firefox**: Limited/No support (as of late 2024).
*   **Fallback Strategy**:
    *   Check `if (!document.startViewTransition)`.
    *   If unsupported, use a standard Framer Motion `opacity: 0 -> 1` fade-in for the modal.

### 4.2. Reduced Motion
*   Respect `prefers-reduced-motion` media query.
*   If true, disable the morph and use a simple fade.
