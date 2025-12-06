import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

// Use CONTENT_PATH from env (set in next.config.ts for monorepo)
const BOOKS_DIR = process.env.CONTENT_PATH || path.join(process.cwd(), '../../packages/content');

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const filePath = path.join(BOOKS_DIR, slug, 'data.json');

    try {
        const data = await readFile(filePath, 'utf-8');
        return NextResponse.json(JSON.parse(data));
    } catch {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const book = await req.json();
    const filePath = path.join(BOOKS_DIR, slug, 'data.json');

    await writeFile(filePath, JSON.stringify(book, null, 2));

    return NextResponse.json({ success: true });
}
