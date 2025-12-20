
// Helper from dslConverter.ts
function parseStyleAttributes(attrString) {
    const attrs = {};
    if (!attrString) return attrs;

    // Match key="value" pairs
    const attrRegex = /(\w+)="([^"]+)"/g;
    let match;
    while ((match = attrRegex.exec(attrString)) !== null) {
        attrs[match[1]] = match[2];
    }
    return attrs;
}

// Regex patterns (copied for context, though mostly unused in the new recursive function except for reference/fallback if I kept them)
// Actually I don't use them in the new recursive function except inside the case logic if I did... 
// Wait, my recursive implementation in Step 74 uses `parseStyleAttributes` but doesn't use the external REGEX constants for the recursive part.
// It DOES use `parseStyleAttributes`.

/**
 * Recursive parser for DSL tags
 */
function parseDslRecursive(text) {
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
            // Check if it's a real open tag
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
                transformedTag = parsedContent;
            }
            break;
        case 'size':
            const sizeMatch = fullOpenTag.match(/\[size:([a-z]+)\]/i);
            const sizeVal = sizeMatch ? sizeMatch[1] : '';
            if (sizeVal && sizeVal !== 'regular') {
                transformedTag = `<span data-size="${sizeVal}">${parsedContent}</span>`;
            } else {
                transformedTag = parsedContent;
            }
            break;
        case 'interactive':
            const interactiveMatch = fullOpenTag.match(/\[interactive:([^\]]+)\]/i);
            const tooltip = interactiveMatch ? interactiveMatch[1] : '';
            transformedTag = `<span data-interactive data-tooltip="${tooltip}">${parsedContent}</span>`;
            break;
        default:
            transformedTag = fullOpenTag + parsedContent + closeTag;
            break;
    }

    return prefix + transformedTag + parseDslRecursive(textAfter);
}

function dslToHtml(dsl) {
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

// TESTS
const testCases = [
    {
        name: 'Basic style',
        input: '[style color="red"]text[/style]',
        expected: '<span data-color="red">text</span>'
    },
    {
        name: 'Nested styles',
        input: '[style color="red"][style size="giant"]text[/style][/style]',
        expected: '<span data-color="red"><span data-size="giant">text</span></span>'
    },
    {
        name: 'Mixed nesting',
        input: '[style color="red"]Red [style color="blue"]Blue[/style] Red[/style]',
        expected: '<span data-color="red">Red <span data-color="blue">Blue</span> Red</span>'
    },
    {
        name: 'Multiple top-level',
        input: '[style color="red"]Red[/style] [style color="blue"]Blue[/style]',
        expected: '<span data-color="red">Red</span> <span data-color="blue">Blue</span>'
    },
    {
        name: 'Legacy expressive',
        input: '[expressive:joyful]Happy[/expressive]',
        expected: '<span data-expressive data-style="joyful">Happy</span>'
    },
    {
        name: 'Legacy expressive with size',
        input: '[expressive:joyful:giant]Big Happy[/expressive]',
        expected: '<span data-expressive data-style="joyful" data-size="giant">Big Happy</span>'
    }
];

const fs = require('fs');

function log(msg) {
    console.log(msg);
    fs.appendFileSync('test-result.txt', msg + '\n');
}

// Clear previous result
try { fs.unlinkSync('test-result.txt'); } catch (e) { }

log('Running DSL Converter Tests...\n');

let passed = 0;
let failed = 0;

for (const test of testCases) {
    const result = dslToHtml(test.input);
    const cleanResult = result.replace(/^<p>|<\/p>$/g, '');

    // Check if result matches expected, either wrapped or unwrapped, or exact match if expected has <p>
    // We'll relax the check to allow <p> wrapping
    const isMatch = cleanResult === test.expected || result === test.expected || result === `<p>${test.expected}</p>`;

    if (isMatch) {
        log(`✅ ${test.name}: PASS`);
        passed++;
    } else {
        log(`❌ ${test.name}: FAIL`);
        log(`   Input:    ${test.input}`);
        log(`   Expected: ${test.expected}`);
        log(`   Actual:   ${result}`);
        failed++;
    }
}

log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);
