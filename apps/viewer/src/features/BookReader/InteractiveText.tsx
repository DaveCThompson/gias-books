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

// Regex to detect opening tag: [tagName] or [tagName:value] or [tagName attr="val"]
const openTagRegex = /^\[(\w+)(?:([:\s])([^\]]+))?\]/;

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
      if (afterOpen.match(/^[:\s\]]/)) {
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

/**
 * Recursively parses DSL text and renders all formatting.
 * Handles nested same-name tags like [style][style]text[/style][/style].
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
    // Look for opening tag
    const tagMatch = remaining.match(openTagRegex);

    if (!tagMatch) {
      // No more tags, could be plain text or text with [ that isn't a tag
      // Find next [ to check
      const nextBracket = remaining.indexOf('[');
      if (nextBracket === -1) {
        // No more brackets, add all remaining text
        if (remaining) {
          elements.push(<React.Fragment key={`${keyPrefix}text-${matchIndex}`}>{remaining}</React.Fragment>);
        }
        break;
      } else if (nextBracket > 0) {
        // Add text before the bracket
        elements.push(<React.Fragment key={`${keyPrefix}text-${matchIndex}`}>{remaining.slice(0, nextBracket)}</React.Fragment>);
        remaining = remaining.slice(nextBracket);
        matchIndex++;
        continue;
      } else {
        // [ at start but no tag match, treat as literal text
        elements.push(<React.Fragment key={`${keyPrefix}literal-${matchIndex}`}>[</React.Fragment>);
        remaining = remaining.slice(1);
        matchIndex++;
        continue;
      }
    }

    const [fullOpenTag, tagName, separator, value] = tagMatch;
    const tagStartIndex = tagMatch.index || 0;

    // Add text before the tag
    if (tagStartIndex > 0) {
      elements.push(<React.Fragment key={`${keyPrefix}pre-${matchIndex}`}>{remaining.slice(0, tagStartIndex)}</React.Fragment>);
    }

    // Get content after opening tag
    const afterOpenTag = remaining.slice(tagStartIndex + fullOpenTag.length);

    // Find matching close tag (handles nesting)
    const closeResult = findMatchingClose(afterOpenTag, tagName);

    if (!closeResult) {
      // No matching close, treat opening tag as literal text
      elements.push(<React.Fragment key={`${keyPrefix}unmatched-${matchIndex}`}>{fullOpenTag}</React.Fragment>);
      remaining = afterOpenTag;
      matchIndex++;
      continue;
    }

    const { content, afterClose } = closeResult;

    // Recursively parse content inside the tag
    const innerContent = parseText(content, `${keyPrefix}${tagName}-${matchIndex}-`, animateText);
    const key = `${keyPrefix}${tagName}-${matchIndex}`;

    // Render the tag with parsed inner content
    switch (tagName) {
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
      case 'size': {
        // Standalone size tag
        const sizeScale = getSizeScale(value || 'regular');
        elements.push(
          <span key={key} style={{ fontSize: sizeScale, display: 'inline-block' }}>
            {innerContent}
          </span>
        );
        break;
      }
      case 'style': {
        // Atomic style attributes
        // Parse: font="handwritten" color="red" bgcolor="amber" effect="glow" motion="bounce"
        const attrs: StyleAttributes = {};
        const attrRegex = /(\w+)="([^"]+)"/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(value || '')) !== null) {
          const [, attrKey, attrValue] = attrMatch;
          if (attrKey === 'font' || attrKey === 'color' || attrKey === 'bgcolor' || attrKey === 'effect' || attrKey === 'motion' || attrKey === 'size') {
            attrs[attrKey as keyof StyleAttributes] = attrValue as never;
          }
        }

        const resolved = resolveStyle(attrs);

        // Build inline styles
        const inlineStyle: React.CSSProperties = {};
        if (resolved.fontFamily) inlineStyle.fontFamily = resolved.fontFamily;
        if (resolved.fontVariationSettings) inlineStyle.fontVariationSettings = resolved.fontVariationSettings;
        if (resolved.color) inlineStyle.color = resolved.color;
        if (resolved.backgroundColor) inlineStyle.backgroundColor = resolved.backgroundColor;
        if (resolved.padding) inlineStyle.padding = resolved.padding;
        if (resolved.borderRadius) inlineStyle.borderRadius = resolved.borderRadius;
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
        elements.push(<React.Fragment key={key}>{fullOpenTag}{innerContent}[/{tagName}]</React.Fragment>);
    }

    // Continue with text after the closing tag
    remaining = afterClose;
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

