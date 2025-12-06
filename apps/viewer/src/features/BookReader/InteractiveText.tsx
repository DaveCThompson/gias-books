// src/features/BookReader/InteractiveText.tsx

import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import styles from './Page.module.css';

interface InteractiveTextProps {
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
      case 'expressive': {
        let className = styles.expressiveDefault;
        switch (value) {
          case 'shout':
            className = styles.expressiveShout;
            break;
          case 'bully':
            className = styles.expressiveBully;
            break;
          case 'handwritten':
            className = styles.expressiveHandwritten;
            break;
        }
        elements.push(<span key={key} className={className}>{innerContent}</span>);
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

export const InteractiveText: React.FC<InteractiveTextProps> = ({ text }) => {
  return <>{parseText(text)}</>;
};


