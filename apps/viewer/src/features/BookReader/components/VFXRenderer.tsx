// src/features/BookReader/components/VFXRenderer.tsx

import React, { useEffect, useState } from 'react';
import type { EffectData } from '@gia/schemas';
import styles from './VFXRenderer.module.css';

interface VFXRendererProps {
    effects?: EffectData[];
    trigger: 'onPageEnter' | 'onPageExit';
    isActive: boolean;
}

const VFX_COMPONENTS: Record<string, React.FC<{ isActive: boolean }>> = {
    sparkle: SparkleEffect,
    fade: FadeEffect,
    slide: SlideEffect,
};

export function VFXRenderer({ effects, trigger, isActive }: VFXRendererProps) {
    if (!effects || effects.length === 0) return null;

    const activeEffects = effects.filter(
        (e) => e.type === 'vfx' && e.trigger === trigger
    );

    if (activeEffects.length === 0) return null;

    return (
        <div className={styles.vfxContainer}>
            {activeEffects.map((effect, i) => {
                const VFXComponent = VFX_COMPONENTS[effect.name];
                if (!VFXComponent) return null;
                return <VFXComponent key={`${effect.name}-${i}`} isActive={isActive} />;
            })}
        </div>
    );
}

// --- Effect Components ---

function SparkleEffect({ isActive }: { isActive: boolean }) {
    const [particles, setParticles] = useState<{ x: number; y: number; delay: number }[]>([]);

    useEffect(() => {
        if (isActive) {
            const newParticles = Array.from({ length: 12 }, () => ({
                x: Math.random() * 100,
                y: Math.random() * 100,
                delay: Math.random() * 0.5,
            }));
            setParticles(newParticles);
        }
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div className={styles.sparkleContainer}>
            {particles.map((p, i) => (
                <span
                    key={i}
                    className={styles.sparkle}
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        animationDelay: `${p.delay}s`,
                    }}
                >
                    ✨
                </span>
            ))}
        </div>
    );
}

function FadeEffect({ isActive }: { isActive: boolean }) {
    return (
        <div
            className={`${styles.fadeOverlay} ${isActive ? styles.fadeIn : styles.fadeOut}`}
        />
    );
}

function SlideEffect({ isActive }: { isActive: boolean }) {
    return (
        <div
            className={`${styles.slideOverlay} ${isActive ? styles.slideIn : ''}`}
        />
    );
}
