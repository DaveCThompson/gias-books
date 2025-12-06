'use client';

import { useEffect, useState } from 'react';
import { useBookStore } from '@/data/stores/bookStore';
import { getBook, saveBook } from '@/utils/fileIO';
import { PageList } from '@/components/Sidebar/PageList';
import { Inspector } from '@/components/Sidebar/Inspector';
import { TextEditor } from '@/components/Editor/TextEditor';
import { PagePreview } from '@/components/Preview/PagePreview';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from './EditorShell.module.css';

// Convert book path to API route for preview
function getPreviewUrl(path: string): string {
    return path.replace('/books/', '/api/static/');
}

interface EditorShellProps {
    bookSlug: string;
}

export function EditorShell({ bookSlug }: EditorShellProps) {
    const book = useBookStore((state) => state.book);
    const isDirty = useBookStore((state) => state.isDirty);
    const currentPageIndex = useBookStore((state) => state.currentPageIndex);
    const loadBook = useBookStore((state) => state.loadBook);
    const markClean = useBookStore((state) => state.markClean);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getBook(bookSlug).then((book) => {
            if (book) loadBook(book);
        });
    }, [bookSlug, loadBook]);

    const handleSave = async () => {
        if (!book) return;
        setSaving(true);
        setError(null);

        const result = await saveBook(book);

        if (result.success) {
            markClean();
        } else {
            setError(result.error || 'Save failed');
        }

        setSaving(false);
    };

    if (!book) {
        return (
            <div className={styles.loading}>
                <p>Loading book...</p>
            </div>
        );
    }

    const currentPage = book.pages[currentPageIndex];

    return (
        <div className={styles.shell}>
            <header className={styles.header}>
                <div className={styles.title}>
                    <h1>
                        {book.title}
                        {isDirty && <span className={styles.dirty}>•</span>}
                    </h1>
                    <span className={styles.author}>by {book.author}</span>
                </div>
                <div className={styles.actions}>
                    {error && <span className={styles.error}>{error}</span>}
                    <button
                        onClick={handleSave}
                        disabled={!isDirty || saving}
                        className={styles.saveButton}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </header>

            <div className={styles.workspace}>
                <PageList />
                <main className={styles.editorArea}>
                    {/* Page Preview - mirrors viewer layout */}
                    <div className={styles.previewPane}>
                        {currentPage && (
                            <PagePreview
                                page={currentPage}
                                getAssetUrl={getPreviewUrl}
                            />
                        )}
                    </div>
                    {/* Text Editor */}
                    <div className={styles.editor}>
                        <TextEditor />
                    </div>
                </main>
                <Inspector />
            </div>
            <ThemeToggle />
        </div>
    );
}

