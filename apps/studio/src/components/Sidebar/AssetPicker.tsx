'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './AssetPicker.module.css';

// Convert /books/slug/assets/file to API route for preview
function getPreviewUrl(path: string): string {
    // /books/slimey/assets/image.png → /api/static/slimey/assets/image.png
    return path.replace('/books/', '/api/static/');
}

export type AssetType = 'illustration' | 'mask' | 'narration';

interface Asset {
    name: string;
    path: string;
    type: 'image' | 'audio';
}

interface AssetPickerProps {
    bookSlug: string;
    assetType: AssetType;
    currentValue: string | undefined;
    onSelect: (path: string | undefined) => void;
    onClose: () => void;
}

const ASSET_CONFIG: Record<AssetType, { label: string; accept: string; icon: string }> = {
    illustration: { label: 'Illustration', accept: 'image/*', icon: '🖼️' },
    mask: { label: 'Mask', accept: 'image/svg+xml', icon: '🎭' },
    narration: { label: 'Narration', accept: 'audio/*', icon: '🔊' },
};

export function AssetPicker({
    bookSlug,
    assetType,
    currentValue,
    onSelect,
    onClose,
}: AssetPickerProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const config = ASSET_CONFIG[assetType];

    // Fetch existing assets
    const fetchAssets = useCallback(async () => {
        try {
            const res = await fetch(`/api/assets/${bookSlug}`);
            if (res.ok) {
                const data = await res.json();
                // Filter by type
                const filtered = data.filter((asset: Asset) => {
                    if (assetType === 'narration') return asset.type === 'audio';
                    if (assetType === 'mask') return asset.name.endsWith('.svg');
                    return asset.type === 'image' && !asset.name.endsWith('.svg');
                });
                setAssets(filtered);
            }
        } catch {
            setError('Failed to load assets');
        } finally {
            setLoading(false);
        }
    }, [bookSlug, assetType]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const handleUpload = async (file: File) => {
        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('slug', bookSlug);
        formData.append('assetType', assetType);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const { path } = await res.json();
                onSelect(path);
                fetchAssets();
            } else {
                setError('Upload failed');
            }
        } catch {
            setError('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    const isImage = assetType !== 'narration';

    const handlePlayAudio = (e: React.MouseEvent, path: string) => {
        e.stopPropagation();
        if (playingAudio === path) {
            audioRef.current?.pause();
            setPlayingAudio(null);
        } else {
            if (audioRef.current) {
                audioRef.current.src = getPreviewUrl(path);
                audioRef.current.play();
                setPlayingAudio(path);
            }
        }
    };

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2>{config.icon} Select {config.label}</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </header>

                {/* Drop Zone */}
                <div
                    className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={config.accept}
                        onChange={handleFileChange}
                        className={styles.hiddenInput}
                    />
                    {uploading ? (
                        <p>Uploading...</p>
                    ) : (
                        <>
                            <p className={styles.dropText}>
                                Drop file here or click to browse
                            </p>
                            <p className={styles.dropHint}>
                                {assetType === 'mask' ? 'SVG files only' :
                                    assetType === 'narration' ? 'Audio files (M4A, MP3)' :
                                        'Images (PNG, JPG, WebP)'}
                            </p>
                        </>
                    )}
                </div>

                {error && <p className={styles.error}>{error}</p>}

                {/* Current Selection */}
                {currentValue && (
                    <div className={styles.currentSelection}>
                        <span className={styles.currentLabel}>Current:</span>
                        <span className={styles.currentPath}>{currentValue.split('/').pop()}</span>
                        <button
                            className={styles.clearButton}
                            onClick={() => onSelect(undefined)}
                        >
                            Clear
                        </button>
                    </div>
                )}

                {/* Asset Grid */}
                <div className={styles.assetGrid}>
                    {loading ? (
                        <p className={styles.loadingText}>Loading assets...</p>
                    ) : assets.length === 0 ? (
                        <p className={styles.emptyText}>No {assetType} assets yet</p>
                    ) : (
                        assets.map((asset) => (
                            <div
                                key={asset.path}
                                className={`${styles.assetCard} ${currentValue === asset.path ? styles.selected : ''
                                    }`}
                                onClick={() => onSelect(asset.path)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        onSelect(asset.path);
                                    }
                                }}
                            >
                                {isImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={getPreviewUrl(asset.path)}
                                        alt={asset.name}
                                        className={styles.assetPreview}
                                    />
                                ) : (
                                    <button
                                        className={styles.playButton}
                                        onClick={(e) => handlePlayAudio(e, asset.path)}
                                        title={playingAudio === asset.path ? 'Stop' : 'Play'}
                                    >
                                        {playingAudio === asset.path ? '⏹' : '▶️'}
                                    </button>
                                )}
                                <span className={styles.assetName}>
                                    {asset.name}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* Hidden audio element for playback */}
                <audio
                    ref={audioRef}
                    onEnded={() => setPlayingAudio(null)}
                    className={styles.hiddenAudio}
                />

                <footer className={styles.footer}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                </footer>
            </div>
        </div>
    );
}
