// src/pages/index.tsx

import React from 'react';
import { GetServerSideProps } from 'next';
import LibraryGrid from '@/features/Library/LibraryGrid';
import { BookData } from '@gia/schemas';
import { loadAllBooks } from '@/data/bookLoader';

interface HomePageProps {
  books: BookData[];
}

const HomePage: React.FC<HomePageProps> = ({ books }) => {
  return (
    <div>
      <LibraryGrid books={books} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  // Dynamic loading from file system (live sync with Studio)
  const books = await loadAllBooks();

  return {
    props: {
      books,
    },
  };
};

export default HomePage;
