/**
 * DSL to HTML Converter for TipTap Editor
 * 
 * Converts custom DSL markup to TipTap-compatible HTML and vice versa.
 * 
 * Supported DSL formats:
 * - [expressive:STYLE]content[/expressive] → <span data-expressive data-style="STYLE">
 * - [interactive:TOOLTIP]word[/interactive] → <span data-interactive data-tooltip="TOOLTIP">
 * - [b]text[/b] → <strong>
 * - [i]text[/i] → <em>
 * - [u]text[/u] → <u>
 * - [s]text[/s] → <s>
 * - [code]text[/code] → <code>
 */

// Regex patterns for DSL → HTML
const EXPRESSIVE_DSL_REGEX = /\[expressive:(\w+)\](.*?)\[\/expressive\]/g;
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
 * Converts DSL markup to TipTap-compatible HTML.
 */
export function dslToHtml(dsl: string): string {
    let html = dsl;

    // Convert standard formatting DSL → HTML
    html = html.replace(BOLD_DSL_REGEX, '<strong>$1</strong>');
    html = html.replace(ITALIC_DSL_REGEX, '<em>$1</em>');
    html = html.replace(UNDERLINE_DSL_REGEX, '<u>$1</u>');
    html = html.replace(STRIKE_DSL_REGEX, '<s>$1</s>');
    html = html.replace(CODE_DSL_REGEX, '<code>$1</code>');

    // Convert expressive tags
    html = html.replace(EXPRESSIVE_DSL_REGEX, (_, style, content) => {
        return `<span data-expressive data-style="${style}">${content}</span>`;
    });

    // Convert interactive tags
    html = html.replace(INTERACTIVE_DSL_REGEX, (_, tooltip, word) => {
        return `<span data-interactive data-tooltip="${tooltip}">${word}</span>`;
    });

    // Wrap in paragraph if no HTML structure
    if (!html.includes('<p>') && !html.includes('<br>')) {
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

    // Convert expressive spans back to DSL
    dsl = dsl.replace(/<span[^>]*data-expressive[^>]*data-style="(\w+)"[^>]*>(.*?)<\/span>/g,
        (_, style, content) => `[expressive:${style}]${content}[/expressive]`);

    // Handle alternate attribute order
    dsl = dsl.replace(/<span[^>]*data-style="(\w+)"[^>]*data-expressive[^>]*>(.*?)<\/span>/g,
        (_, style, content) => `[expressive:${style}]${content}[/expressive]`);

    // Convert interactive spans back to DSL
    dsl = dsl.replace(/<span[^>]*data-interactive[^>]*data-tooltip="([^"]+)"[^>]*>(.*?)<\/span>/g,
        (_, tooltip, word) => `[interactive:${tooltip}]${word}[/interactive]`);

    // Handle alternate attribute order for interactive
    dsl = dsl.replace(/<span[^>]*data-tooltip="([^"]+)"[^>]*data-interactive[^>]*>(.*?)<\/span>/g,
        (_, tooltip, word) => `[interactive:${tooltip}]${word}[/interactive]`);

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

