'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './InteractiveModal.module.css';

interface InteractiveModalProps {
    initialText: string;
    selectedText?: string;
    onConfirm: (tooltip: string) => void;
    onCancel: () => void;
}

export function InteractiveModal({
    initialText,
    selectedText = 'word',
    onConfirm,
    onCancel,
}: InteractiveModalProps) {

    const [tooltip, setTooltip] = useState(initialText);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tooltip.trim()) {
            onConfirm(tooltip.trim());
        }
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
            aria-labelledby="interactive-modal-title"
        >
            <form
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <h2 id="interactive-modal-title" className={styles.title}>
                    Interactive Text
                </h2>

                <p className={styles.description}>
                    Add a tooltip that appears when readers hover over this word.
                </p>

                <div className={styles.field}>
                    <label htmlFor="tooltip-input">Tooltip text:</label>
                    <input
                        ref={inputRef}
                        id="tooltip-input"
                        type="text"
                        value={tooltip}
                        onChange={(e) => setTooltip(e.target.value)}
                        placeholder="e.g., wearing glasses"
                        className={styles.input}
                    />
                </div>

                <div className={styles.preview}>
                    <span className={styles.previewLabel}>Preview:</span>
                    <span className={styles.previewWord} title={tooltip || 'Tooltip text'}>
                        {selectedText}
                    </span>
                    <span className={styles.previewHint}>← hover to preview</span>
                </div>


                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.confirmButton}
                        disabled={!tooltip.trim()}
                    >
                        Apply
                    </button>
                </div>
            </form>
        </div>
    );
}
