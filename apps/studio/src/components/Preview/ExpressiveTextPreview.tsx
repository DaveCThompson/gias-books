'use client';

import React from 'react';
import { getEmotionStyle, getSizeScale } from '@gia/schemas';
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
            case 'expressive': {
                // Parse value as "emotion" or "emotion:size"
                const parts = (value || '').split(':');
                const emotionId = parts[0] || 'normal';
                const size = parts[1] || 'regular';

                const emotionStyle = getEmotionStyle(emotionId);

                // Build inline styles from config (no animations in preview)
                const inlineStyle: React.CSSProperties = {
                    display: 'inline-block',
                    fontFamily: emotionStyle.fontFamily,
                    fontSize: getSizeScale(size),
                };

                if (emotionStyle.fontVariationSettings) {
                    inlineStyle.fontVariationSettings = emotionStyle.fontVariationSettings;
                }
                if (emotionStyle.color) {
                    inlineStyle.color = emotionStyle.color;
                }

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

