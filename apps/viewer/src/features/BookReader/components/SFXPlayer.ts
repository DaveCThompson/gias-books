// src/features/BookReader/components/SFXPlayer.ts

// Sound effect URLs (relative to public folder)
const SFX_MAP: Record<string, string> = {
    whoosh: '/audio/sfx/whoosh.mp3',
    chime: '/audio/sfx/chime.mp3',
    sparkle: '/audio/sfx/sparkle.mp3',
    bell: '/audio/sfx/bell.mp3',
};

export function playSFX(name: string, volume: number = 0.5): void {
    const url = SFX_MAP[name];
    if (!url) {
        console.warn(`SFX not found: ${name}`);
        return;
    }

    // Simple audio playback (can be enhanced with Web Audio API later)
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch((err) => {
        // Autoplay may be blocked until user interaction
        console.warn('SFX autoplay blocked:', err);
    });
}

export function playSFXFromEffects(
    effects: { type: string; name: string; trigger: string }[] | undefined,
    trigger: 'onPageEnter' | 'onPageExit'
): void {
    if (!effects) return;

    effects
        .filter((e) => e.type === 'sfx' && e.trigger === trigger)
        .forEach((e) => playSFX(e.name));
}
