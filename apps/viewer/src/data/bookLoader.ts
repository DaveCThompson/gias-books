// src/data/bookLoader.ts
// Dynamic book loading for live sync with Studio

import fs from 'fs/promises';
import path from 'path';
import { BookData } from '@gia/schemas';

const BOOKS_DIR = path.resolve(process.cwd(), '..', '..', 'packages', 'content');

/**
 * Load a single book by slug (reads from file system each time)
 */
export async function loadBook(slug: string): Promise<BookData | null> {
    try {
        const dataPath = path.join(BOOKS_DIR, slug, 'data.json');
        const content = await fs.readFile(dataPath, 'utf-8');
        return JSON.parse(content) as BookData;
    } catch {
        console.error(`Failed to load book: ${slug}`);
        return null;
    }
}

/**
 * Load all books (scans books directory dynamically)
 */
export async function loadAllBooks(): Promise<BookData[]> {
    try {
        const entries = await fs.readdir(BOOKS_DIR, { withFileTypes: true });
        const books: BookData[] = [];

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const book = await loadBook(entry.name);
                if (book) {
                    books.push(book);
                }
            }
        }

        return books;
    } catch {
        console.error('Failed to load books directory');
        return [];
    }
}

/**
 * Get list of all book slugs (for fallback: 'blocking' pattern)
 */
export async function getAllBookSlugs(): Promise<string[]> {
    try {
        const entries = await fs.readdir(BOOKS_DIR, { withFileTypes: true });
        return entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
    } catch {
        return [];
    }
}
