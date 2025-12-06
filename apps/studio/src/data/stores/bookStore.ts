import { create } from 'zustand';
import type { BookData, PageData } from '@gia/schemas';

interface BookStore {
    book: BookData | null;
    currentPageIndex: number;
    isDirty: boolean;

    loadBook: (book: BookData) => void;
    setCurrentPage: (index: number) => void;
    updatePage: (updates: Partial<PageData>) => void;
    updateBookMeta: (updates: Partial<Pick<BookData, 'title' | 'author'>>) => void;
    addPage: () => void;
    deletePage: (index: number) => void;
    reorderPages: (fromIndex: number, toIndex: number) => void;
    markClean: () => void;
    getCurrentPage: () => PageData | null;
}

export const useBookStore = create<BookStore>((set, get) => ({
    book: null,
    currentPageIndex: 0,
    isDirty: false,

    loadBook: (book) => set({
        book,
        currentPageIndex: 0,
        isDirty: false
    }),

    setCurrentPage: (index) => set({ currentPageIndex: index }),

    updatePage: (updates) => {
        const { book, currentPageIndex } = get();
        if (!book) return;

        const pages = [...book.pages];
        pages[currentPageIndex] = { ...pages[currentPageIndex], ...updates };
        set({ book: { ...book, pages }, isDirty: true });
    },

    updateBookMeta: (updates) => {
        const { book } = get();
        if (!book) return;
        set({ book: { ...book, ...updates }, isDirty: true });
    },

    addPage: () => {
        const { book } = get();
        if (!book) return;

        const newPage: PageData = {
            pageNumber: book.pages.length + 1,
            text: 'New page text...',
        };
        const newIndex = book.pages.length;
        set({
            book: { ...book, pages: [...book.pages, newPage] },
            currentPageIndex: newIndex,
            isDirty: true
        });
    },

    deletePage: (index) => {
        const { book, currentPageIndex } = get();
        if (!book || book.pages.length <= 1) return;

        const pages = book.pages.filter((_, i) => i !== index);
        // Renumber pages
        pages.forEach((p, i) => { p.pageNumber = i + 1; });

        const newIndex = Math.min(currentPageIndex, pages.length - 1);
        set({
            book: { ...book, pages },
            currentPageIndex: newIndex,
            isDirty: true
        });
    },

    reorderPages: (fromIndex, toIndex) => {
        const { book } = get();
        if (!book) return;

        const pages = [...book.pages];
        const [moved] = pages.splice(fromIndex, 1);
        pages.splice(toIndex, 0, moved);
        // Renumber pages
        pages.forEach((p, i) => { p.pageNumber = i + 1; });

        set({ book: { ...book, pages }, isDirty: true });
    },

    markClean: () => set({ isDirty: false }),

    getCurrentPage: () => {
        const { book, currentPageIndex } = get();
        return book?.pages[currentPageIndex] ?? null;
    },
}));
