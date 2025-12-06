// src/features/BookLobby/BookLobbyModal.tsx

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLobbyStore } from '@/data/lobby.store';
import { bookDataMap } from '@/data/constants';
import BookLobby from './BookLobby';
import styles from './BookLobbyModal.module.css';

export const BookLobbyModal: React.FC = () => {
    const { activeBookSlug, closeLobby } = useLobbyStore();
    const book = activeBookSlug ? bookDataMap[activeBookSlug] : null;

    return (
        <Dialog.Root open={!!activeBookSlug} onOpenChange={(open) => !open && closeLobby()}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.backdrop} />
                <Dialog.Content className={styles.modal} aria-describedby={undefined}>
                    {book && <BookLobby book={book} onClose={closeLobby} isModal />}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
