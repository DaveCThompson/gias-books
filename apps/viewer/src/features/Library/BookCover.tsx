// src/features/Library/BookCover.tsx

import React from 'react';
import Image from 'next/image';
import { BookData } from '@gia/schemas';
import { useViewTransitionRouter } from '@/hooks/useViewTransition';
import styles from './BookCover.module.css';

interface BookCoverProps {
  book: BookData;
}

const BookCover: React.FC<BookCoverProps> = ({ book }) => {
  const { navigateWithTransition } = useViewTransitionRouter();

  // Find the first page with an illustration to use as a cover image
  const illustration = book.pages.find((page) => page.illustration)?.illustration;
  // Handle both string and layered object illustration formats
  const coverImage = typeof illustration === 'string'
    ? illustration
    : illustration?.bg || illustration?.mid || illustration?.fg;

  const handleClick = () => {
    navigateWithTransition(`/book/${book.slug}`);
  };

  return (
    <button onClick={handleClick} className={styles.coverLink}>
      <div className={styles.coverContainer}>
        {coverImage ? (
          <Image
            src={coverImage}
            alt={`Cover for ${book.title}`}
            fill
            className={styles.coverImage}
            style={{ viewTransitionName: `book-cover-${book.slug}` }}
          />
        ) : (
          <div className={styles.placeholderImage} />
        )}
        <div className={styles.overlay} />
        <div className={styles.textContainer}>
          <h2 className={styles.title}>{book.title}</h2>
          <p className={styles.author}>by {book.author}</p>
        </div>
      </div>
    </button>
  );
};

export default BookCover;
