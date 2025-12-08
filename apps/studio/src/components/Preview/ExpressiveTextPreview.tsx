'use client';

import React from 'react';
import { resolveStyle, getSizeScale, type StyleAttributes } from '@gia/schemas';
import styles from './ExpressiveTextPreview.module.css';

interface ExpressiveTextPreviewProps {
    text: string;
}

/**
 * Find the matching closing tag for a tag at the start of the string.
 * Handles nested same-name tags by counting open/close brackets.
 */
function findMatchingClose(text: string, tagName: string): { content: string; afterClose: string } | null {
    const openPattern = `[${tagName}`;
    const closePattern = `[/${tagName}]`;

    let depth = 1;
    let i = 0;

    while (i < text.length && depth > 0) {
        // Check for closing tag
        if (text.slice(i).startsWith(closePattern)) {
            depth--;
            if (depth === 0) {
                return {
                    content: text.slice(0, i),
                    afterClose: text.slice(i + closePattern.length)
                };
            }
            i += closePattern.length;
        }
        // Check for opening tag (same name)
        else if (text.slice(i).startsWith(openPattern)) {
            // Make sure it's actually an opening tag (followed by : or space or ])
            const afterOpen = text.slice(i + openPattern.length);
            if (afterOpen.match(/^[:|\s\]]/)) {
                depth++;
            }
            i++;
        }
        else {
            i++;
        }
    }

    return null; // No matching close found
}

// Regex to match the START of a DSL tag (captures tag name and optional value)
const tagStartRegex = /\[(\w+)(?:[:\s]([^\]]+))?\]/;

/**
 * Recursively parses DSL text and renders all formatting.
 * Handles nested tags including same-name nesting like [style][style]...[/style][/style].
 */
function parseText(text: string, keyPrefix: string = ''): React.ReactNode[] {
    const elements: React.ReactNode[] = [];
    let remaining = text;
    let matchIndex = 0;

    while (remaining.length > 0) {
        const match = remaining.match(tagStartRegex);

        if (!match || match.index === undefined) {
            // No more tags, add remaining text
            if (remaining) {
                elements.push(<React.Fragment key={`${keyPrefix}text-${matchIndex}`}>{remaining}</React.Fragment>);
            }
            break;
        }

        const [fullOpenTag, tag, value] = match;
        const beforeTag = remaining.slice(0, match.index);

        // Add text before the tag
        if (beforeTag) {
            elements.push(<React.Fragment key={`${keyPrefix}pre-${matchIndex}`}>{beforeTag}</React.Fragment>);
        }

        // Find matching close tag (handles nesting)
        const afterOpen = remaining.slice(match.index + fullOpenTag.length);
        const closeResult = findMatchingClose(afterOpen, tag);

        if (!closeResult) {
            // No matching close - treat as regular text
            elements.push(<React.Fragment key={`${keyPrefix}orphan-${matchIndex}`}>{fullOpenTag}</React.Fragment>);
            remaining = afterOpen;
            matchIndex++;
            continue;
        }

        const { content, afterClose } = closeResult;

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
                    if (attrKey === 'font' || attrKey === 'color' || attrKey === 'bgcolor' || attrKey === 'motion' || attrKey === 'size') {
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
                    ...(resolved.backgroundColor && { backgroundColor: resolved.backgroundColor }),
                    ...(resolved.padding && { padding: resolved.padding }),
                    ...(resolved.borderRadius && { borderRadius: resolved.borderRadius }),
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
                elements.push(<React.Fragment key={key}>{`[${tag}${value ? `:${value}` : ''}]`}{innerContent}{`[/${tag}]`}</React.Fragment>);
        }

        // Continue with text after the closing tag
        remaining = afterClose;
        matchIndex++;
    }

    return elements;
}

export function ExpressiveTextPreview({ text }: ExpressiveTextPreviewProps) {
    return <>{parseText(text)}</>;
}
