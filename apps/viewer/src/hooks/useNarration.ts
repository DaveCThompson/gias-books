// src/hooks/useNarration.ts

import { useEffect, useRef, useCallback, useState } from 'react';
import { Howl } from 'howler';
import { AUDIO } from '@/data/constants';

interface UseNarrationProps {
    /** URL of the narration audio file */
    src?: string;
    /** Whether narration should be playing */
    isPlaying: boolean;
    /** Called when narration finishes */
    onEnd?: () => void;
    /** Called when an error occurs loading/playing audio */
    onError?: (error: Error) => void;
}

interface UseNarrationReturn {
    /** Duration of the audio in seconds */
    duration: number | null;
    /** Whether audio has encountered an error */
    hasError: boolean;
    /** Error message if any */
    errorMessage: string | null;
    /** Retry loading after error */
    retry: () => void;
}

/**
 * Unified narration hook using Howler.
 * Handles fade in/out, error states, and cleanup.
 * 
 * Per-page model: Audio resets when src changes.
 */
export const useNarration = ({
    src,
    isPlaying,
    onEnd,
    onError,
}: UseNarrationProps): UseNarrationReturn => {
    const soundRef = useRef<Howl | null>(null);
    const isFadingOut = useRef(false);
    const [duration, setDuration] = useState<number | null>(null);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Initialize or recreate Howl when src changes
    useEffect(() => {
        // Cleanup previous sound
        if (soundRef.current) {
            soundRef.current.unload();
            soundRef.current = null;
        }

        // Reset state
        setHasError(false);
        setErrorMessage(null);
        setDuration(null);

        // Skip if no src
        if (!src) return;

        // Create new Howl instance
        const sound = new Howl({
            src: [src],
            html5: true, // Better for longer audio files
            onload: () => {
                setDuration(sound.duration());
            },
            onend: () => {
                onEnd?.();
            },
            onloaderror: (_id, error) => {
                const errorMsg = `Failed to load audio: ${error}`;
                setHasError(true);
                setErrorMessage(errorMsg);
                onError?.(new Error(errorMsg));
            },
            onplayerror: (_id, error) => {
                const errorMsg = `Failed to play audio: ${error}`;
                setHasError(true);
                setErrorMessage(errorMsg);
                onError?.(new Error(errorMsg));
            },
        });

        soundRef.current = sound;

        return () => {
            sound.unload();
        };
    }, [src, onEnd, onError]);

    // Handle play/pause
    useEffect(() => {
        const sound = soundRef.current;
        if (!sound || !src) return;

        if (isPlaying && !hasError) {
            isFadingOut.current = false;

            if (!sound.playing()) {
                sound.play();
                // Fade in after brief delay to ensure playback started
                setTimeout(() => {
                    if (sound.playing()) {
                        sound.fade(0, 1, AUDIO.FADE_IN_MS);
                    }
                }, AUDIO.FADE_START_DELAY_MS);
            }
        } else if (sound.playing()) {
            // Fade out
            isFadingOut.current = true;
            sound.fade(1, 0, AUDIO.FADE_OUT_MS);

            const timer = setTimeout(() => {
                if (isFadingOut.current && sound) {
                    sound.pause();
                    isFadingOut.current = false;
                }
            }, AUDIO.FADE_OUT_MS);

            return () => clearTimeout(timer);
        }
    }, [isPlaying, src, hasError]);

    const retry = useCallback(() => {
        setHasError(false);
        setErrorMessage(null);
        // Force re-initialization by triggering the src effect
        if (soundRef.current) {
            soundRef.current.unload();
            soundRef.current = null;
        }
    }, []);

    return {
        duration,
        hasError,
        errorMessage,
        retry,
    };
};
