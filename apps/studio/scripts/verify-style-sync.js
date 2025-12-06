/**
 * verify-style-sync.js
 * 
 * Verifies that shared styling files are properly synced between repos.
 * Run as part of postinstall or manually to check sync status.
 * 
 * For Option B architecture: symlinks from studio → viewer
 */

const fs = require('fs');
const path = require('path');

// Configuration: files that should be synced
const SYNC_CONFIG = {
    // Relative to studio root
    studioRoot: path.resolve(__dirname, '..'),
    viewerRoot: path.resolve(__dirname, '../../gias-books'),

    // Files to verify (relative paths from their respective roots)
    sharedFiles: [
        {
            viewer: 'src/styles/variables.css',
            studio: 'src/styles/variables.css',
            description: 'Core CSS variables (oklch colors, gradients, etc.)'
        }
    ]
};

function checkSync() {
    const results = [];
    let hasErrors = false;

    console.log('\n🎨 Verifying style sync between Viewer and Studio...\n');

    for (const file of SYNC_CONFIG.sharedFiles) {
        const viewerPath = path.join(SYNC_CONFIG.viewerRoot, file.viewer);
        const studioPath = path.join(SYNC_CONFIG.studioRoot, file.studio);

        // Check if viewer file exists
        if (!fs.existsSync(viewerPath)) {
            console.log(`❌ Viewer file missing: ${file.viewer}`);
            hasErrors = true;
            continue;
        }

        // Check if studio file/symlink exists
        if (!fs.existsSync(studioPath)) {
            console.log(`⚠️  Studio file missing: ${file.studio}`);
            console.log(`   → Create symlink: ln -s ../../gias-books/${file.viewer} ${file.studio}`);
            hasErrors = true;
            continue;
        }

        // Check if it's a symlink
        const stats = fs.lstatSync(studioPath);
        if (stats.isSymbolicLink()) {
            const target = fs.readlinkSync(studioPath);
            console.log(`✅ ${file.studio} → symlinked to ${target}`);
        } else {
            // Compare file contents
            const viewerContent = fs.readFileSync(viewerPath, 'utf8');
            const studioContent = fs.readFileSync(studioPath, 'utf8');

            if (viewerContent === studioContent) {
                console.log(`✅ ${file.studio} → in sync (copy)`);
            } else {
                console.log(`⚠️  ${file.studio} → OUT OF SYNC`);
                console.log(`   ${file.description}`);
                console.log(`   → Consider creating symlink or manually syncing`);
                hasErrors = true;
            }
        }

        results.push({
            file: file.studio,
            synced: !hasErrors
        });
    }

    console.log('\n' + (hasErrors ? '⚠️  Some files need attention' : '✅ All styles synced!') + '\n');

    return !hasErrors;
}

// Run if executed directly
if (require.main === module) {
    const success = checkSync();
    process.exit(success ? 0 : 1);
}

module.exports = { checkSync, SYNC_CONFIG };
