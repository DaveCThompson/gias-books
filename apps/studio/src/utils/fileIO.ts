import type { BookData } from '@gia/schemas';

/**
 * File I/O utilities for book data
 * 
 * These functions interact with the API routes to read/write book data.
 * The actual file system operations happen on the server side.
 */

/**
 * Fetches all books from the content directory.
 */
export async function getBooks(): Promise<BookData[]> {
    try {
        const response = await fetch('/api/books');
        if (!response.ok) {
            console.warn('getBooks: API returned', response.status);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.warn('getBooks: Failed to fetch books', error);
        return [];
    }
}

/**
 * Fetches a single book by slug.
 */
export async function getBook(slug: string): Promise<BookData | null> {
    try {
        const response = await fetch(`/api/books/${slug}`);
        if (!response.ok) {
            console.warn(`getBook(${slug}): API returned`, response.status);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.warn(`getBook(${slug}): Failed to fetch`, error);
        return null;
    }
}

/**
 * Creates a new book with initial data.
 */
export async function createBook(slug: string, title: string, author: string): Promise<BookData> {
    const newBook: BookData = {
        slug,
        title,
        author,
        pages: [{ pageNumber: 1, text: 'Once upon a time...' }],
    };

    try {
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBook),
        });

        if (!response.ok) {
            console.warn('createBook: API returned', response.status);
            return newBook; // Return local copy as fallback
        }

        return await response.json();
    } catch (error) {
        console.warn('createBook: Failed to create', error);
        return newBook; // Return local copy as fallback
    }
}

/**
 * Result type for save operations.
 */
interface SaveResult {
    success: boolean;
    error?: string;
}

/**
 * Saves a book to the content directory.
 */
export async function saveBook(book: BookData): Promise<SaveResult> {
    try {
        const response = await fetch(`/api/books/${book.slug}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book),
        });

        if (!response.ok) {
            console.error('saveBook: API returned', response.status);
            return { success: false, error: `Failed to save book: ${response.status}` };
        }

        return { success: true };
    } catch (error) {
        console.error('saveBook: Failed to save', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
