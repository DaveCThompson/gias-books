// src/pages/[bookSlug]/[pageNumber].tsx

import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import BookReader from '@/features/BookReader/BookReader';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BookData } from '@gia/schemas';
import { loadBook } from '@/data/bookLoader';

interface BookPageProps {
  bookData: BookData;
  currentPage: number;
}

const BookPage: NextPage<BookPageProps> = ({ bookData, currentPage }) => {
  if (!bookData) {
    return <div>Book not found.</div>;
  }
  return (
    <ErrorBoundary>
      <BookReader bookData={bookData} currentPage={currentPage} />
    </ErrorBoundary>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { bookSlug, pageNumber } = context.params || {};

  const slug = typeof bookSlug === 'string' ? bookSlug : '';
  const pageNum = typeof pageNumber === 'string' ? parseInt(pageNumber, 10) : 1;

  // Dynamic loading from file system (live sync with Studio)
  const bookData = await loadBook(slug);

  if (!bookData || isNaN(pageNum)) {
    return { notFound: true };
  }

  // Validate page number exists
  const pageExists = bookData.pages.some(p => p.pageNumber === pageNum);
  if (!pageExists) {
    return { notFound: true };
  }

  return {
    props: {
      bookData,
      currentPage: pageNum,
    },
  };
};

export default BookPage;
