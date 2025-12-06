// src/features/BookLobby/BookLobby.tsx

import React from 'react';
import Link from 'next/link';
import { X } from '@phosphor-icons/react';
import { BookData } from '@gia/schemas';
import { MoreMenu } from './MoreMenu';
import styles from './BookLobby.module.css';

interface BookLobbyProps {
    book: BookData;
    isModal?: boolean;
    onClose?: () => void;
}

const BookLobby: React.FC<BookLobbyProps> = ({ book, isModal = false, onClose }) => {
    const firstPage = book.pages[0]?.pageNumber ?? 1;

    // Get cover image from first page illustration
    const coverImage = typeof book.pages[0]?.illustration === 'string'
        ? book.pages[0].illustration
        : book.pages[0]?.illustration?.bg || '/placeholder-cover.png';

    return (
        <div className={`${styles.lobby} ${isModal ? styles.modal : ''}`}>
            {isModal && onClose && (
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                    <X size={20} />
                </button>
            )}

            <div className={styles.coverArea}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={coverImage}
                    alt={`${book.title} cover`}
                    className={styles.coverImage}
                />
            </div>

            <div className={styles.info}>
                <h1 className={styles.title}>{book.title}</h1>
                <p className={styles.author}>by {book.author}</p>
                <p className={styles.pageCount}>{book.pages.length} pages</p>
            </div>

            <div className={styles.actions}>
                <Link
                    href={`/${book.slug}/${firstPage}`}
                    className={styles.readButton}
                    onClick={onClose}
                >
                    Read Now
                </Link>

                <MoreMenu bookSlug={book.slug} />
            </div>
        </div>
    );
};

export default BookLobby;
