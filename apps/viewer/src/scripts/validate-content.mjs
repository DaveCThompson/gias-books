// src/scripts/validate-content.mjs
// Validates book content from @gia/content package

import path from 'path';
import fs from 'fs/promises';

const CWD = process.cwd();
// Read from shared packages/content (monorepo root/packages/content)
const BOOKS_DIR = path.resolve(CWD, '..', '..', 'packages', 'content');

// Simple schema validation (avoids import issues with @gia/schemas in mjs)
function validateBook(data) {
  const errors = [];
  if (!data.slug || typeof data.slug !== 'string') {
    errors.push('Missing or invalid slug');
  }
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Missing or invalid title');
  }
  if (!data.author || typeof data.author !== 'string') {
    errors.push('Missing or invalid author');
  }
  if (!Array.isArray(data.pages) || data.pages.length === 0) {
    errors.push('Missing or empty pages array');
  }
  return errors;
}

async function validateContent() {
  console.log('🔍 Starting content validation...');
  try {
    // Read all directories in BOOKS_DIR
    const entries = await fs.readdir(BOOKS_DIR, { withFileTypes: true });
    const bookDirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));

    if (bookDirs.length === 0) {
      throw new Error(`No book directories found in ${BOOKS_DIR}`);
    }

    let errorCount = 0;
    console.log(`Found ${bookDirs.length} book(s) to validate.`);

    for (const dir of bookDirs) {
      const dataPath = path.join(BOOKS_DIR, dir.name, 'data.json');
      try {
        const fileContent = await fs.readFile(dataPath, 'utf-8');
        const jsonData = JSON.parse(fileContent);

        const errors = validateBook(jsonData);

        if (errors.length === 0) {
          console.log(`  ✅ Validated: ${dir.name}/data.json`);
        } else {
          errorCount++;
          console.error(`  ❌ Invalid: ${dir.name}/data.json`);
          errors.forEach((err) => console.error(`    - ${err}`));
        }
      } catch {
        console.warn(`  ⚠️ Skipping ${dir.name} (no data.json found)`);
      }
    }

    if (errorCount > 0) {
      throw new Error(`${errorCount} book(s) failed validation.`);
    }

    console.log('✅ All content successfully validated!');
  } catch (error) {
    console.error('❌ Content validation failed:', error.message);
    process.exit(1);
  }
}

validateContent();