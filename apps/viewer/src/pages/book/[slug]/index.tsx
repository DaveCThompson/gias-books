// src/pages/book/[slug]/index.tsx

import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { BookData } from '@gia/schemas';
import BookLobby from '@/features/BookLobby/BookLobby';
import { loadBook } from '@/data/bookLoader';

interface BookLobbyPageProps {
    book: BookData;
}

const BookLobbyPage: NextPage<BookLobbyPageProps> = ({ book }) => {
    return <BookLobby book={book} isModal={false} />;
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const slug = typeof params?.slug === 'string' ? params.slug : '';

    // Dynamic loading from file system (live sync with Studio)
    const book = await loadBook(slug);

    if (!book) {
        return { notFound: true };
    }

    return {
        props: { book },
    };
};

export default BookLobbyPage;
