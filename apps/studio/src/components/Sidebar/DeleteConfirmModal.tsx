'use client';

import { useState } from 'react';
import styles from './DeleteConfirmModal.module.css';

interface DeleteConfirmModalProps {
    pageNumber: number;
    pagePreview: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteConfirmModal({
    pageNumber,
    pagePreview,
    onConfirm,
    onCancel,
}: DeleteConfirmModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = () => {
        setIsDeleting(true);
        onConfirm();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div
            className={styles.overlay}
            onClick={onCancel}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 id="delete-modal-title" className={styles.title}>
                    Delete Page {pageNumber}?
                </h2>

                <p className={styles.preview}>
                    &ldquo;{pagePreview}...&rdquo;
                </p>

                <p className={styles.warning}>
                    This action cannot be undone.
                </p>

                <div className={styles.actions}>
                    <button
                        className={styles.cancelButton}
                        onClick={onCancel}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        className={styles.deleteButton}
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        autoFocus
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Page'}
                    </button>
                </div>
            </div>
        </div>
    );
}
