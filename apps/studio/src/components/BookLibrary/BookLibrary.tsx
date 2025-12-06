'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { BookData } from '@gia/schemas';
import { getBooks, createBook } from '@/utils/fileIO';
import styles from './BookLibrary.module.css';

export function BookLibrary() {
    const [books, setBooks] = useState<BookData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newBook, setNewBook] = useState({ slug: '', title: '', author: '' });

    useEffect(() => {
        getBooks().then((data) => {
            setBooks(data);
            setLoading(false);
        });
    }, []);

    const handleCreate = async () => {
        if (!newBook.slug || !newBook.title || !newBook.author) return;

        const book = await createBook(newBook.slug, newBook.title, newBook.author);
        setBooks([...books, book]);
        setNewBook({ slug: '', title: '', author: '' });
        setShowModal(false);
    };

    if (loading) {
        return <div className={styles.loading}>Loading books...</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>📚 Madoodle Studio</h1>
                <button onClick={() => setShowModal(true)} className={styles.newButton}>
                    + New Book
                </button>
            </header>

            <div className={styles.grid}>
                {books.map((book) => (
                    <Link
                        key={book.slug}
                        href={`/edit/${book.slug}`}
                        className={styles.card}
                    >
                        <div className={styles.cardCover}>
                            <span className={styles.emoji}>📖</span>
                        </div>
                        <div className={styles.cardInfo}>
                            <h2>{book.title}</h2>
                            <p>by {book.author}</p>
                            <span className={styles.pageCount}>{book.pages.length} pages</span>
                        </div>
                    </Link>
                ))}
            </div>

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Create New Book</h2>
                        <div className={styles.field}>
                            <label>Slug (URL-safe)</label>
                            <input
                                type="text"
                                value={newBook.slug}
                                onChange={(e) => setNewBook({ ...newBook, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                placeholder="my-story"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Title</label>
                            <input
                                type="text"
                                value={newBook.title}
                                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                                placeholder="My Amazing Story"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Author</label>
                            <input
                                type="text"
                                value={newBook.author}
                                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                                placeholder="Author Name"
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowModal(false)}>Cancel</button>
                            <button onClick={handleCreate} className={styles.primaryButton}>Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
