/**
 * DSL to HTML Converter for TipTap Editor
 * 
 * Converts custom DSL markup to TipTap-compatible HTML and vice versa.
 * 
 * Supported DSL formats:
 * - [style font="X" color="Y" motion="Z"]content[/style] → <span data-font="X" data-color="Y" data-motion="Z">
 * - [expressive:STYLE]content[/expressive] → <span data-expressive data-style="STYLE"> (legacy)
 * - [expressive:STYLE:SIZE]content[/expressive] → <span data-expressive data-style="STYLE" data-size="SIZE"> (legacy)
 * - [interactive:TOOLTIP]word[/interactive] → <span data-interactive data-tooltip="TOOLTIP">
 * - [b]text[/b] → <strong>
 * - [i]text[/i] → <em>
 * - [u]text[/u] → <u>
 * - [s]text[/s] → <s>
 * - [code]text[/code] → <code>
 */

// Regex patterns for DSL → HTML
// New atomic style syntax
const STYLE_DSL_REGEX = /\[style(?:\s+([^\]]+))?\](.*?)\[\/style\]/gi;
// Legacy expressive syntax (with optional :size)
const EXPRESSIVE_DSL_REGEX = /\[expressive:([a-z_]+)(?::([a-z]+))?\](.*?)\[\/expressive\]/gi;
const SIZE_DSL_REGEX = /\[size:([a-z]+)\](.*?)\[\/size\]/gi;
const INTERACTIVE_DSL_REGEX = /\[interactive:([^\]]+)\](.*?)\[\/interactive\]/g;
const BOLD_DSL_REGEX = /\[b\](.*?)\[\/b\]/g;
const ITALIC_DSL_REGEX = /\[i\](.*?)\[\/i\]/g;
const UNDERLINE_DSL_REGEX = /\[u\](.*?)\[\/u\]/g;
const STRIKE_DSL_REGEX = /\[s\](.*?)\[\/s\]/g;
const CODE_DSL_REGEX = /\[code\](.*?)\[\/code\]/g;

// Regex patterns for HTML → DSL
const BOLD_HTML_REGEX = /<strong>(.*?)<\/strong>/g;
const ITALIC_HTML_REGEX = /<em>(.*?)<\/em>/g;
const UNDERLINE_HTML_REGEX = /<u>(.*?)<\/u>/g;
const STRIKE_HTML_REGEX = /<s>(.*?)<\/s>/g;
const CODE_HTML_REGEX = /<code>(.*?)<\/code>/g;

/**
 * Parse attribute string from [style] tag.
 * Example: 'font="handwritten" color="red"' → { font: 'handwritten', color: 'red' }
 */
function parseStyleAttributes(attrString: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    if (!attrString) return attrs;

    // Match key="value" pairs
    const attrRegex = /(\w+)="([^"]+)"/g;
    let match;
    while ((match = attrRegex.exec(attrString)) !== null) {
        attrs[match[1]] = match[2];
    }
    return attrs;
}

/**
 * Converts DSL markup to TipTap-compatible HTML.
 */
/**
 * Converts DSL markup to TipTap-compatible HTML.
 * Handles nested tags (e.g., [style][style]...[/style][/style]) correctly.
 */
export function dslToHtml(dsl: string): string {
    // 1. First, we need to protect strict tags that shouldn't be parsed recursively if we were doing a full parser,
    // but here we just want to convert everything to HTML.

    // We'll use a recursive descent parser approach for the DSL
    // This is necessary because regex cannot handle arbitrary nesting of the same tag (like [style]...[style]...[/style]...[/style])

    let html = parseDslRecursive(dsl);

    // Wrap in paragraph if no HTML structure (and not empty)
    if (html.trim() && !html.includes('<p>') && !html.includes('<br>')) {
        const paragraphs = html.split('\n\n').filter(p => p.trim());
        if (paragraphs.length > 1) {
            html = paragraphs.map(p => `<p>${p}</p>`).join('');
        } else if (!html.startsWith('<')) {
            html = `<p>${html}</p>`;
        }
    }

    return html;
}

/**
 * Recursive parser for DSL tags
 */
function parseDslRecursive(text: string): string {
    if (!text) return '';

    // Find the first occurrence of ANY opening tag: [tagName ...]
    const tagMatch = text.match(/\[([a-z]+)(?:\s+([^\]]+)|(?::([^\]]+)))?\]/i);

    if (!tagMatch || tagMatch.index === undefined) {
        return text; // No more tags
    }

    const { 0: fullOpenTag, 1: tagName, 2: attrString, 3: legacyVal } = tagMatch;
    const startIndex = tagMatch.index;

    // Text before the tag
    const prefix = text.slice(0, startIndex);

    // Find the matching closing tag [/tagName]
    // We need to account for nesting depth of the SAME tag
    const remainder = text.slice(startIndex + fullOpenTag.length);
    const closeTag = `[/${tagName}]`;
    const openTagStart = `[${tagName}`; // partial match for nested opens

    let depth = 1;
    let cursor = 0;
    let contentEndIndex = -1;

    while (cursor < remainder.length) {
        if (remainder.startsWith(closeTag, cursor)) {
            depth--;
            if (depth === 0) {
                contentEndIndex = cursor;
                break;
            }
            cursor += closeTag.length;
        } else if (remainder.startsWith(openTagStart, cursor)) {
            // Check if it's a real open tag (followed by space, colon, or closing bracket)
            const nextChar = remainder[cursor + openTagStart.length];
            if (!nextChar || [' ', ':', ']'].includes(nextChar)) {
                depth++;
            }
            cursor += openTagStart.length;
        } else {
            cursor++;
        }
    }

    if (contentEndIndex === -1) {
        // No matching closing tag found, treat this open tag as literal text
        // and continue parsing the rest
        return prefix + fullOpenTag + parseDslRecursive(remainder);
    }

    // We found the content block!
    const rawContent = remainder.slice(0, contentEndIndex);
    const textAfter = remainder.slice(contentEndIndex + closeTag.length);

    // Recursively parse the inner content
    const parsedContent = parseDslRecursive(rawContent);

    // Transform the current tag
    let transformedTag = '';

    switch (tagName.toLowerCase()) {
        case 'b':
            transformedTag = `<strong>${parsedContent}</strong>`;
            break;
        case 'i':
            transformedTag = `<em>${parsedContent}</em>`;
            break;
        case 'u':
            transformedTag = `<u>${parsedContent}</u>`;
            break;
        case 's':
            transformedTag = `<s>${parsedContent}</s>`;
            break;
        case 'code':
            transformedTag = `<code>${parsedContent}</code>`;
            break;
        case 'style':
            const attrs = parseStyleAttributes(attrString || '');
            const dataAttrs = Object.entries(attrs)
                .map(([key, value]) => `data-${key}="${value}"`)
                .join(' ');
            transformedTag = `<span ${dataAttrs}>${parsedContent}</span>`;
            break;
        case 'expressive':
            // Logic for [expressive:style] or [expressive:style:size]
            // We need to parse the legacyVal part if it exists (captured as group 3 usually for : separated)
            // But our main regex might have captured it in group 2 or 3 depending on format.
            // Let's re-parse the fullOpenTag to be sure about format

            // Standardize legacy parsing
            let style = '';
            let size = '';

            // Re-match specific legacy format
            const legacyMatch = fullOpenTag.match(/\[expressive:([a-z_]+)(?::([a-z]+))?\]/i);
            if (legacyMatch) {
                style = legacyMatch[1];
                size = legacyMatch[2];
            }

            if (style) {
                const sizeAttr = size && size !== 'regular' ? ` data-size="${size}"` : '';
                transformedTag = `<span data-expressive data-style="${style}"${sizeAttr}>${parsedContent}</span>`;
            } else {
                transformedTag = parsedContent; // Fallback
            }
            break;
        case 'size':
            // [size:giant]
            const sizeMatch = fullOpenTag.match(/\[size:([a-z]+)\]/i);
            const sizeVal = sizeMatch ? sizeMatch[1] : '';
            if (sizeVal && sizeVal !== 'regular') {
                transformedTag = `<span data-size="${sizeVal}">${parsedContent}</span>`;
            } else {
                transformedTag = parsedContent;
            }
            break;
        case 'interactive':
            // [interactive:tooltip]
            const interactiveMatch = fullOpenTag.match(/\[interactive:([^\]]+)\]/i);
            const tooltip = interactiveMatch ? interactiveMatch[1] : '';
            transformedTag = `<span data-interactive data-tooltip="${tooltip}">${parsedContent}</span>`;
            break;
        default:
            // Unknown tag, treat as text
            transformedTag = fullOpenTag + parsedContent + closeTag;
            break;
    }

    // Continue parsing the text AFTER this tag block
    return prefix + transformedTag + parseDslRecursive(textAfter);
}

/**
 * Converts TipTap HTML output back to DSL markup.
 */
export function htmlToDsl(html: string): string {
    let dsl = html;

    // Convert standard formatting HTML → DSL (before removing other tags)
    dsl = dsl.replace(BOLD_HTML_REGEX, '[b]$1[/b]');
    dsl = dsl.replace(ITALIC_HTML_REGEX, '[i]$1[/i]');
    dsl = dsl.replace(UNDERLINE_HTML_REGEX, '[u]$1[/u]');
    dsl = dsl.replace(STRIKE_HTML_REGEX, '[s]$1[/s]');
    dsl = dsl.replace(CODE_HTML_REGEX, '[code]$1[/code]');

    // Convert NEW atomic style spans back to DSL using DOM manipulation
    // This handles nested spans reliably by processing from innermost to outermost
    if (typeof DOMParser !== 'undefined') {
        // Browser environment - use DOMParser for reliable parsing
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${dsl}</div>`, 'text/html');
        const container = doc.body.firstChild as Element;

        // Process all spans with our data attributes, innermost first
        const processSpans = () => {
            let foundAny = false;
            // Find all spans with our data attributes
            const spans = container.querySelectorAll('span[data-color], span[data-bgcolor], span[data-font], span[data-effect], span[data-motion], span[data-size]');


            for (const span of Array.from(spans)) {
                // Skip if has nested data-spans (process innermost first)
                if (span.querySelector('span[data-color], span[data-bgcolor], span[data-font], span[data-effect], span[data-motion], span[data-size]')) {
                    continue;
                }

                // Skip legacy expressive spans
                if (span.hasAttribute('data-expressive')) {
                    continue;
                }

                // Build DSL attributes
                const attrs: string[] = [];
                if (span.getAttribute('data-font')) attrs.push(`font="${span.getAttribute('data-font')}"`);
                if (span.getAttribute('data-color')) attrs.push(`color="${span.getAttribute('data-color')}"`);
                if (span.getAttribute('data-bgcolor')) attrs.push(`bgcolor="${span.getAttribute('data-bgcolor')}"`);
                if (span.getAttribute('data-effect')) attrs.push(`effect="${span.getAttribute('data-effect')}"`);
                if (span.getAttribute('data-motion')) attrs.push(`motion="${span.getAttribute('data-motion')}"`);
                const size = span.getAttribute('data-size');
                if (size && size !== 'regular') attrs.push(`size="${size}"`);


                if (attrs.length > 0) {
                    // Replace span with DSL text
                    const dslText = `[style ${attrs.join(' ')}]${span.innerHTML}[/style]`;
                    span.replaceWith(doc.createTextNode(dslText));
                    foundAny = true;
                }
            }
            return foundAny;
        };

        // Process until no more spans found (handles nested spans)
        while (processSpans()) { /* keep processing */ }

        dsl = container.innerHTML;
    } else {
        // Fallback: simple regex for SSR (won't handle nested spans perfectly)
        dsl = dsl.replace(
            /<span\s+([^>]*\bdata-(?:font|color|bgcolor|effect|motion|size)="[^"]*"[^>]*)>([^<]*)<\/span>/gi,
            (fullMatch, attrString, content) => {
                const attrs: string[] = [];
                const fontMatch = /data-font="([^"]+)"/.exec(attrString);
                const colorMatch = /data-color="([^"]+)"/.exec(attrString);
                const bgcolorMatch = /data-bgcolor="([^"]+)"/.exec(attrString);
                const effectMatch = /data-effect="([^"]+)"/.exec(attrString);
                const motionMatch = /data-motion="([^"]+)"/.exec(attrString);
                const sizeMatch = /data-size="([^"]+)"/.exec(attrString);
                if (fontMatch) attrs.push(`font="${fontMatch[1]}"`);
                if (colorMatch) attrs.push(`color="${colorMatch[1]}"`);
                if (bgcolorMatch) attrs.push(`bgcolor="${bgcolorMatch[1]}"`);
                if (effectMatch) attrs.push(`effect="${effectMatch[1]}"`);
                if (motionMatch) attrs.push(`motion="${motionMatch[1]}"`);
                if (sizeMatch && sizeMatch[1] !== 'regular') attrs.push(`size="${sizeMatch[1]}"`);
                return attrs.length > 0 ? `[style ${attrs.join(' ')}]${content}[/style]` : content;
            }
        );
    }


    // Convert LEGACY expressive spans back to DSL (with optional size)
    // Pattern: data-expressive and data-style, optionally data-size
    dsl = dsl.replace(
        /<span[^>]*data-expressive[^>]*data-style="([^"]+)"(?:[^>]*data-size="([^"]+)")?[^>]*>(.*?)<\/span>/gi,
        (_, style, size, content) => {
            return size && size !== 'regular'
                ? `[expressive:${style}:${size}]${content}[/expressive]`
                : `[expressive:${style}]${content}[/expressive]`;
        }
    );

    // Handle alternate attribute order (data-style before data-expressive)
    dsl = dsl.replace(
        /<span[^>]*data-style="([^"]+)"[^>]*data-expressive(?:[^>]*data-size="([^"]+)")?[^>]*>(.*?)<\/span>/gi,
        (_, style, size, content) => {
            return size && size !== 'regular'
                ? `[expressive:${style}:${size}]${content}[/expressive]`
                : `[expressive:${style}]${content}[/expressive]`;
        }
    );

    // Convert interactive spans back to DSL
    dsl = dsl.replace(/<span[^>]*data-interactive[^>]*data-tooltip="([^"]+)"[^>]*>(.*?)<\/span>/g,
        (_, tooltip, word) => `[interactive:${tooltip}]${word}[/interactive]`);

    // Handle alternate attribute order for interactive
    dsl = dsl.replace(/<span[^>]*data-tooltip="([^"]+)"[^>]*data-interactive[^>]*>(.*?)<\/span>/g,
        (_, tooltip, word) => `[interactive:${tooltip}]${word}[/interactive]`);

    // Convert standalone size spans to DSL (without expressive or style)
    dsl = dsl.replace(/<span[^>]*data-size="([^"]+)"[^>]*>(.*?)<\/span>/gi,
        (_, size, content) => size && size !== 'regular' ? `[size:${size}]${content}[/size]` : content);

    // Remove paragraph tags, preserve content
    dsl = dsl
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<br\s*\/?>/g, '\n')
        .trim();

    // Clean up multiple newlines
    dsl = dsl.replace(/\n{3,}/g, '\n\n');

    return dsl;
}

