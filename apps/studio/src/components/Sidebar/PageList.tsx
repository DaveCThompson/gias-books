'use client';

import { useState } from 'react';
import { X } from '@phosphor-icons/react';
import { useBookStore } from '@/data/stores/bookStore';
import type { PageData } from '@gia/schemas';
import { cn } from '@gia/utils';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import styles from './PageList.module.css';

export function PageList() {
    const book = useBookStore((state) => state.book);
    const currentPageIndex = useBookStore((state) => state.currentPageIndex);
    const setCurrentPage = useBookStore((state) => state.setCurrentPage);
    const addPage = useBookStore((state) => state.addPage);
    const deletePage = useBookStore((state) => state.deletePage);

    const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

    if (!book) return null;

    const handleDeleteClick = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        setPendingDeleteIndex(index);
    };

    const handleConfirmDelete = () => {
        if (pendingDeleteIndex !== null) {
            deletePage(pendingDeleteIndex);
            setPendingDeleteIndex(null);
        }
    };

    const handleCancelDelete = () => {
        setPendingDeleteIndex(null);
    };

    const pendingPage = pendingDeleteIndex !== null ? book.pages[pendingDeleteIndex] : null;

    return (
        <>
            <aside className={styles.sidebar}>
                <div className={styles.header}>
                    <h2>Pages</h2>
                    <button onClick={addPage} className={styles.addButton}>
                        + Add
                    </button>
                </div>

                <ul className={styles.pageList}>
                    {book.pages.map((page: PageData, index: number) => (
                        <li
                            key={page.pageNumber}
                            className={cn(styles.pageItem, index === currentPageIndex && styles.active)}
                            onClick={() => setCurrentPage(index)}
                        >
                            <span className={styles.pageNumber}>{page.pageNumber}</span>
                            <span className={styles.pagePreview}>
                                {page.text.slice(0, 30)}...
                            </span>
                            {book.pages.length > 1 && (
                                <button
                                    className={styles.deleteButton}
                                    onClick={(e) => handleDeleteClick(e, index)}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </aside>

            {pendingPage && (
                <DeleteConfirmModal
                    pageNumber={pendingPage.pageNumber}
                    pagePreview={pendingPage.text.slice(0, 50)}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </>
    );
}
