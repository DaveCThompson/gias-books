import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

// Use CONTENT_PATH from env (set in next.config.ts for monorepo)
const BOOKS_DIR = process.env.CONTENT_PATH || path.join(process.cwd(), '../../packages/content');

interface Asset {
    name: string;
    path: string;
    type: 'image' | 'audio';
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const assetsDir = path.join(BOOKS_DIR, slug, 'assets');

    try {
        const files = await readdir(assetsDir);
        const assets: Asset[] = [];

        for (const file of files) {
            if (file.startsWith('.')) continue;

            const filePath = path.join(assetsDir, file);
            const fileStat = await stat(filePath);

            if (!fileStat.isFile()) continue;

            const ext = path.extname(file).toLowerCase();
            const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].includes(ext);
            const isAudio = ['.mp3', '.m4a', '.wav', '.ogg'].includes(ext);

            if (isImage || isAudio) {
                assets.push({
                    name: file,
                    path: `/books/${slug}/assets/${file}`,
                    type: isImage ? 'image' : 'audio',
                });
            }
        }

        // Sort by name
        assets.sort((a, b) => a.name.localeCompare(b.name));

        return NextResponse.json(assets);
    } catch {
        // Assets folder might not exist yet
        return NextResponse.json([]);
    }
}
