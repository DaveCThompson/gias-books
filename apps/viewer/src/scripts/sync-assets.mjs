// src/scripts/sync-assets.mjs
// Syncs assets from @gia/content package to public/books for static serving

import path from 'path';
import fs from 'fs-extra';

const CWD = process.cwd();
// Source: monorepo packages/content (the shared content package)
const CONTENT_PKG = path.resolve(CWD, '..', '..', 'packages', 'content');
const PUBLIC_DIR = path.join(CWD, 'public', 'books');

async function syncAssets() {
  try {
    // 1. Clean the destination directory
    console.log(`🧹 Cleaning asset directory: ${PUBLIC_DIR}`);
    await fs.emptyDir(PUBLIC_DIR);

    // 2. Find all book folders in packages/content
    const bookDirs = await fs.readdir(CONTENT_PKG);
    const books = bookDirs.filter(d =>
      !d.startsWith('.') &&
      d !== 'node_modules' &&
      d !== 'package.json'
    );

    if (books.length === 0) {
      console.log('No books found to sync.');
      return;
    }

    console.log(`Found ${books.length} book(s): ${books.join(', ')}`);

    // 3. Copy each book's assets folder to public/books/{slug}/assets
    for (const book of books) {
      const assetsDir = path.join(CONTENT_PKG, book, 'assets');
      const destDir = path.join(PUBLIC_DIR, book, 'assets');

      if (await fs.pathExists(assetsDir)) {
        await fs.copy(assetsDir, destDir);
        console.log(`  ✅ ${book}/assets copied`);
      }
    }

    console.log('✅ All book assets synced to public directory.');
  } catch (error) {
    console.error('❌ Error syncing assets:', error);
    process.exit(1);
  }
}

syncAssets();