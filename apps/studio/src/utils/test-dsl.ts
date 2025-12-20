
import { dslToHtml } from './dslConverter';

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

console.log('Running DSL Converter Tests...\n');

let passed = 0;
let failed = 0;

for (const test of testCases) {
    const result = dslToHtml(test.input);
    // Remove <p> wrapping for simple comparison if added
    const cleanResult = result.replace(/^<p>|<\/p>$/g, '');

    // Normalize logic slightly for comparison if needed, but strict exact match is better if possible.
    // My parser adds <p> if no HTML structure. 

    // Let's strip <p> tags for the test verification to focus on the span structure
    // The parser adds <p> if it doesn't find <p> or <br>.

    const isMatch = cleanResult === test.expected || result === test.expected || result === `<p>${test.expected}</p>`;

    if (isMatch) {
        console.log(`✅ ${test.name}: PASS`);
        passed++;
    } else {
        console.log(`❌ ${test.name}: FAIL`);
        console.log(`   Input:    ${test.input}`);
        console.log(`   Expected: ${test.expected}`);
        console.log(`   Actual:   ${result}`);
        failed++;
    }
}

console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);
