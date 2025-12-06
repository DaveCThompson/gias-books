# PRD-02: The Interactive Reading Experience

**Goal:** To transform the static page from PRD-01 into a fully navigable book. This PRD focuses on implementing the core swipe-based navigation and dynamically rendering all pages of the story.

---

### 1. User Story

> As a user, I want to swipe horizontally to navigate between all pages of the book, so I can read the story from beginning to end.

### 2. Acceptance Criteria

1.  **Swipe Navigation:** Swiping left must navigate to the next page, and swiping right must navigate to the previous page.
2.  **Dynamic Content:** As the user navigates, the content (text and images) for the corresponding page number must be displayed.
3.  **URL Synchronization:** The browser URL must update to reflect the current page number (e.g., `/slimey/2`). Navigating directly to a page URL should load that specific page.
4.  **Boundary Handling:** Swiping right on the first page should do nothing. Swiping left on the last page should do nothing. The book should not loop.

### 3. Technical Implementation Plan

-   **Library Integration:** The `Swiper.js` library will be integrated into the `features/BookReader/BookReader.tsx` component.
-   **Component Structure Modification:**
    -   The `BookReader.tsx` component will be refactored. It will now map over the entire `bookData.pages` array.
    -   For each page in the array, it will render a `<SwiperSlide>` component.
    -   Inside each `<SwiperSlide>`, it will render the existing `<Page>` component, passing the corresponding page data as a prop.
-   **State & Routing Logic (within `BookReader.tsx`):**
    -   Use the `useRouter` hook from Next.js to read the `pageNumber` from the URL. This will be used to set the `initialSlide` for the Swiper instance, ensuring deep links work correctly.
    -   An event listener for Swiper's `slideChange` event will be added. When the user swipes to a new page, this event will fire.
    -   Inside the event listener, we will use `router.push()` to update the browser URL to match the new active slide index, keeping the UI and the URL perfectly synchronized.