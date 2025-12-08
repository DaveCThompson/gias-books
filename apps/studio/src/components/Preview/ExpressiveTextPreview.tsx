'use client';

import React from 'react';
import { resolveStyle, getSizeScale, type StyleAttributes } from '@gia/schemas';
import styles from './ExpressiveTextPreview.module.css';

interface ExpressiveTextPreviewProps {
    text: string;
}

// Regex to match outermost DSL tag
const tagRegex = /\[(\w+)(?::([^\]]+))?\](.*?)\[\/\1\]/;

/**
 * Recursively parses DSL text and renders all formatting.
 * Handles nested tags like [b][u]text[/u][/b].
 */
function parseText(text: string, keyPrefix: string = ''): React.ReactNode[] {
    const elements: React.ReactNode[] = [];
    let remaining = text;
    let matchIndex = 0;

    while (remaining.length > 0) {
        const match = remaining.match(tagRegex);

        if (!match) {
            // No more tags, add remaining text
            if (remaining) {
                elements.push(<React.Fragment key={`${keyPrefix}text-${matchIndex}`}>{remaining}</React.Fragment>);
            }
            break;
        }

        const [fullMatch, tag, value, content] = match;
        const beforeTag = remaining.slice(0, match.index);

        // Add text before the tag
        if (beforeTag) {
            elements.push(<React.Fragment key={`${keyPrefix}pre-${matchIndex}`}>{beforeTag}</React.Fragment>);
        }

        // Recursively parse content inside the tag
        const innerContent = parseText(content, `${keyPrefix}${tag}-${matchIndex}-`);
        const key = `${keyPrefix}${tag}-${matchIndex}`;

        // Render the tag with parsed inner content
        switch (tag) {
            case 'b':
                elements.push(<strong key={key}>{innerContent}</strong>);
                break;
            case 'i':
                elements.push(<em key={key}>{innerContent}</em>);
                break;
            case 'u':
                elements.push(<u key={key}>{innerContent}</u>);
                break;
            case 's':
                elements.push(<s key={key}>{innerContent}</s>);
                break;
            case 'code':
                elements.push(<code key={key} className={styles.inlineCode}>{innerContent}</code>);
                break;
            case 'size': {
                // Standalone size without emotion
                const sizeScale = getSizeScale(value || 'regular');
                elements.push(
                    <span key={key} style={{ fontSize: sizeScale, display: 'inline-block' }}>
                        {innerContent}
                    </span>
                );
                break;
            }
            case 'style': {
                // NEW: Atomic style attributes
                const attrs: StyleAttributes = {};
                const attrRegex = /(\w+)="([^"]+)"/g;
                let attrMatch;
                while ((attrMatch = attrRegex.exec(value || '')) !== null) {
                    const [, attrKey, attrValue] = attrMatch;
                    if (attrKey === 'font' || attrKey === 'color' || attrKey === 'motion' || attrKey === 'size') {
                        attrs[attrKey as keyof StyleAttributes] = attrValue as any;
                    }
                }

                const resolved = resolveStyle(attrs);

                // Build inline styles (no animations in preview)
                const inlineStyle: React.CSSProperties = {
                    display: 'inline-block',
                    ...(resolved.fontFamily && { fontFamily: resolved.fontFamily }),
                    ...(resolved.fontVariationSettings && { fontVariationSettings: resolved.fontVariationSettings }),
                    ...(resolved.color && { color: resolved.color }),
                    ...(resolved.textShadow && { textShadow: resolved.textShadow }),
                    ...(resolved.transform && { transform: resolved.transform }),
                    ...(resolved.fontSize && { fontSize: resolved.fontSize }),
                };

                elements.push(
                    <span key={key} className={styles.expressive} style={inlineStyle}>
                        {innerContent}
                    </span>
                );
                break;
            }
            case 'expressive': {
                // LEGACY: Parse value as "emotion" or "emotion:size"
                const parts = (value || '').split(':');
                const emotionId = parts[0] || 'normal';
                const size = parts[1];

                const resolved = resolveStyle(emotionId);
                if (size) {
                    resolved.fontSize = getSizeScale(size);
                }

                // Build inline styles from config (no animations in preview)
                const inlineStyle: React.CSSProperties = {
                    display: 'inline-block',
                    ...(resolved.fontFamily && { fontFamily: resolved.fontFamily }),
                    ...(resolved.fontSize && { fontSize: resolved.fontSize }),
                    ...(resolved.color && { color: resolved.color }),
                    ...(resolved.fontVariationSettings && { fontVariationSettings: resolved.fontVariationSettings }),
                    ...(resolved.textShadow && { textShadow: resolved.textShadow }),
                    ...(resolved.transform && { transform: resolved.transform }),
                };

                elements.push(
                    <span key={key} className={styles.expressive} style={inlineStyle}>
                        {innerContent}
                    </span>
                );
                break;
            }
            case 'interactive':
                elements.push(<span key={key} className={styles.interactiveWord}>{innerContent}</span>);
                break;
            default:
                // Unknown tag, render as-is
                elements.push(<React.Fragment key={key}>{fullMatch}</React.Fragment>);
        }

        // Continue with text after the tag
        remaining = remaining.slice((match.index || 0) + fullMatch.length);
        matchIndex++;
    }

    return elements;
}

export function ExpressiveTextPreview({ text }: ExpressiveTextPreviewProps) {
    return <>{parseText(text)}</>;
}
