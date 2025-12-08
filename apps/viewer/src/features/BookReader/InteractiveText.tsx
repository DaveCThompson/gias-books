// src/features/BookReader/InteractiveText.tsx

import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { resolveStyle, getSizeScale, type StyleAttributes } from '@gia/schemas';
import { cn } from '@gia/utils';
import styles from './Page.module.css';

interface InteractiveTextProps {
  text: string;
  animateText?: boolean;
}

// Regex to match outermost DSL tag
const tagRegex = /\[(\w+)(?::([^\]]+))?\](.*?)\[\/\1\]/;

/**
 * Recursively parses DSL text and renders all formatting.
 * Handles nested tags like [b][u]text[/u][/b].
 */
function parseText(
  text: string,
  keyPrefix: string = '',
  animateText: boolean = true
): React.ReactNode[] {
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
    const innerContent = parseText(content, `${keyPrefix}${tag}-${matchIndex}-`, animateText);
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
      case 'interactive':
        elements.push(
          <Tooltip.Root key={key}>
            <Tooltip.Trigger asChild onClick={(e) => e.stopPropagation()}>
              <span className={styles.interactiveWord}>{innerContent}</span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className={styles.tooltipContent} sideOffset={5}>
                {value || 'No definition available.'}
                <Tooltip.Arrow className={styles.tooltipArrow} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        );
        break;
      case 'style': {
        // NEW: Atomic style attributes
        // Parse: font="handwritten" color="red" motion="bounce"
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

        // Build inline styles
        const inlineStyle: React.CSSProperties = {};
        if (resolved.fontFamily) inlineStyle.fontFamily = resolved.fontFamily;
        if (resolved.fontVariationSettings) inlineStyle.fontVariationSettings = resolved.fontVariationSettings;
        if (resolved.color) inlineStyle.color = resolved.color;
        if (resolved.textShadow) inlineStyle.textShadow = resolved.textShadow;
        if (resolved.transform) inlineStyle.transform = resolved.transform;
        if (resolved.fontSize) inlineStyle.fontSize = resolved.fontSize;

        // Apply animation class if animateText is enabled
        const animationClass = (animateText && resolved.animation)
          ? `animate-${resolved.animation}`
          : '';

        elements.push(
          <span
            key={key}
            className={cn(styles.expressive, animationClass)}
            style={inlineStyle}
          >
            {innerContent}
          </span>
        );
        break;
      }
      case 'expressive': {
        // LEGACY: emotion ID or emotion:size
        const parts = (value || '').split(':');
        const emotionId = parts[0] || 'normal';
        const size = parts[1];

        // Use resolveStyle for legacy emotions
        const resolved = resolveStyle(emotionId);
        if (size) {
          resolved.fontSize = getSizeScale(size);
        }

        // Build inline styles from resolved config
        const inlineStyle: React.CSSProperties = {};
        if (resolved.fontFamily) inlineStyle.fontFamily = resolved.fontFamily;
        if (resolved.fontVariationSettings) inlineStyle.fontVariationSettings = resolved.fontVariationSettings;
        if (resolved.color) inlineStyle.color = resolved.color;
        if (resolved.textShadow) inlineStyle.textShadow = resolved.textShadow;
        if (resolved.transform) inlineStyle.transform = resolved.transform;
        if (resolved.fontSize) inlineStyle.fontSize = resolved.fontSize;

        // Only apply animation class if animateText is true and emotion has an animation
        const animationClass = (animateText && resolved.animation)
          ? `animate-${resolved.animation}`
          : '';

        elements.push(
          <span
            key={key}
            className={cn(styles.expressive, animationClass)}
            style={inlineStyle}
          >
            {innerContent}
          </span>
        );
        break;
      }
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

export const InteractiveText: React.FC<InteractiveTextProps> = ({
  text,
  animateText = true
}) => {
  return <>{parseText(text, '', animateText)}</>;
};

