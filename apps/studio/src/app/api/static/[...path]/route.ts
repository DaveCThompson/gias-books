import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// Use CONTENT_PATH from env (set in next.config.ts for monorepo)
const BOOKS_DIR = process.env.CONTENT_PATH || path.join(process.cwd(), '../../packages/content');

// Serve static assets from the content package
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathSegments } = await params;
    const filePath = path.join(BOOKS_DIR, ...pathSegments);

    // Security: ensure we're not escaping the books directory
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(BOOKS_DIR))) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    try {
        const buffer = await readFile(filePath);

        // Determine content type
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes: Record<string, string> = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
            '.mp3': 'audio/mpeg',
            '.m4a': 'audio/mp4',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
        };

        const contentType = contentTypes[ext] || 'application/octet-stream';

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch {
        return new NextResponse('Not Found', { status: 404 });
    }
}
