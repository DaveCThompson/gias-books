// src/features/BookLobby/MoreMenu.tsx

import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import styles from './MoreMenu.module.css';

interface MoreMenuProps {
    bookSlug: string;
}

export const MoreMenu: React.FC<MoreMenuProps> = ({ bookSlug }) => {
    const handleShare = async () => {
        const url = `${window.location.origin}/book/${bookSlug}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Check out this book!',
                    url,
                });
            } catch {
                // User cancelled share
            }
        } else {
            await navigator.clipboard.writeText(url);
            // TODO: Add toast notification "Link copied!"
        }
    };

    const handleFavorite = () => {
        // TODO: Implement favorite functionality in progress.store
        console.log('Favorite:', bookSlug);
    };

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger className={styles.trigger} aria-label="More options">
                ⋮
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content className={styles.menuContent} sideOffset={5}>
                    <DropdownMenu.Item className={styles.menuItem} onSelect={handleShare}>
                        Share
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className={styles.menuItem} onSelect={handleFavorite}>
                        Favorite
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};
