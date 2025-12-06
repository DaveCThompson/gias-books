# Madoodle Studio: Complete Implementation Plan

> **Purpose:** This document provides complete context for an agent to build the Studio app, which outputs content for the companion `gia-t-books` viewer.

---

## Project Context

### What is Madoodle Studio?

A web-based WYSIWYG story editor for creating interactive children's storybooks. Outputs JSON + assets that the viewer app consumes.

### Relationship to Viewer

```
gia-studio/              ← THIS PROJECT (Editor)
├── books/               ← Symlink → ../gia-t-books/books/
│   └── slimey/
│       ├── data.json    ← Studio WRITES this
│       └── assets/

gia-t-books/             ← Companion viewer app
├── books/
│   └── slimey/
│       ├── data.json    ← Viewer READS this
│       └── assets/
```

**Key:** Studio writes to `books/`, viewer reads from `books/`. Symlink keeps them in sync.

---

## Step 1: Initial Setup Commands

```powershell
cd c:\Users\dthompson\Documents\GIA_CODE\gia-studio

# Create symlink (run as admin if needed)
cmd /c mklink /D books "..\gia-t-books\books"

# Install dependencies
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline zod zustand clsx

# Create folder structure
mkdir src\components\BookLibrary
mkdir src\components\Editor
mkdir src\components\Sidebar
mkdir src\editor\marks
mkdir src\data\stores
mkdir src\utils
```

---

## Step 2: Content Schema (Source of Truth)

This schema MUST match what the viewer expects. Copy exactly.

### CREATE: `src/data/schemas.ts`

```typescript
import { z } from 'zod';

// Parallax support: single string OR layered object
export type IllustrationData =
  | string
  | { bg?: string; mid?: string; fg?: string };

// VFX/SFX effect
export interface EffectData {
  type: 'vfx' | 'sfx';
  name: string;
  trigger: 'onPageEnter' | 'onPageExit';
}

export interface PageData {
  pageNumber: number;
  text: string;
  illustration?: IllustrationData;
  mask?: string;
  narrationUrl?: string;
  mood?: 'calm' | 'tense' | 'joyful';
  effects?: EffectData[];
  layout?: 'fullbleed' | 'split' | 'textOnly';
}

export interface BookData {
  slug: string;
  title: string;
  author: string;
  pages: PageData[];
}

// Zod schemas for validation
const IllustrationSchema = z.union([
  z.string(),
  z.object({
    bg: z.string().optional(),
    mid: z.string().optional(),
    fg: z.string().optional(),
  }),
]);

const EffectSchema = z.object({
  type: z.enum(['vfx', 'sfx']),
  name: z.string(),
  trigger: z.enum(['onPageEnter', 'onPageExit']),
});

export const PageSchema = z.object({
  pageNumber: z.number().int().positive(),
  text: z.string().min(1),
  illustration: IllustrationSchema.optional(),
  mask: z.string().optional(),
  narrationUrl: z.string().optional(),
  mood: z.enum(['calm', 'tense', 'joyful']).optional(),
  effects: z.array(EffectSchema).optional(),
  layout: z.enum(['fullbleed', 'split', 'textOnly']).optional(),
});

export const BookSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  author: z.string().min(1),
  pages: z.array(PageSchema).min(1),
});
```

---

## Step 3: DSL Tag Format

The viewer uses custom DSL tags in text. Studio must convert between HTML and DSL.

### DSL Format (stored in data.json):
```
[expressive:handwritten]different[/expressive]
[interactive:wearing glasses]bespectacled[/interactive]
```

### Available Expressive Styles:
- `handwritten` - Cursive font, teal color
- `shout` - Bold, larger, slightly raised
- `bully` - Bold, red, skewed

### Interactive Format:
- `[interactive:tooltip text]word[/interactive]` - Shows tooltip on hover

---

## Step 4: Zustand Store

### CREATE: `src/data/stores/bookStore.ts`

```typescript
import { create } from 'zustand';
import type { BookData, PageData } from '../schemas';

interface BookStore {
  book: BookData | null;
  currentPageIndex: number;
  isDirty: boolean;

  loadBook: (book: BookData) => void;
  setCurrentPage: (index: number) => void;
  updatePage: (updates: Partial<PageData>) => void;
  updateBookMeta: (updates: Partial<Pick<BookData, 'title' | 'author'>>) => void;
  addPage: () => void;
  deletePage: (index: number) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  markClean: () => void;
  getCurrentPage: () => PageData | null;
}

export const useBookStore = create<BookStore>((set, get) => ({
  book: null,
  currentPageIndex: 0,
  isDirty: false,

  loadBook: (book) => set({ 
    book, 
    currentPageIndex: 0, 
    isDirty: false 
  }),

  setCurrentPage: (index) => set({ currentPageIndex: index }),

  updatePage: (updates) => {
    const { book, currentPageIndex } = get();
    if (!book) return;

    const pages = [...book.pages];
    pages[currentPageIndex] = { ...pages[currentPageIndex], ...updates };
    set({ book: { ...book, pages }, isDirty: true });
  },

  updateBookMeta: (updates) => {
    const { book } = get();
    if (!book) return;
    set({ book: { ...book, ...updates }, isDirty: true });
  },

  addPage: () => {
    const { book } = get();
    if (!book) return;

    const newPage: PageData = {
      pageNumber: book.pages.length + 1,
      text: 'New page text...',
    };
    const newIndex = book.pages.length;
    set({ 
      book: { ...book, pages: [...book.pages, newPage] }, 
      currentPageIndex: newIndex,
      isDirty: true 
    });
  },

  deletePage: (index) => {
    const { book, currentPageIndex } = get();
    if (!book || book.pages.length <= 1) return;

    const pages = book.pages.filter((_, i) => i !== index);
    // Renumber pages
    pages.forEach((p, i) => { p.pageNumber = i + 1; });
    
    const newIndex = Math.min(currentPageIndex, pages.length - 1);
    set({ 
      book: { ...book, pages }, 
      currentPageIndex: newIndex, 
      isDirty: true 
    });
  },

  reorderPages: (fromIndex, toIndex) => {
    const { book } = get();
    if (!book) return;

    const pages = [...book.pages];
    const [moved] = pages.splice(fromIndex, 1);
    pages.splice(toIndex, 0, moved);
    // Renumber pages
    pages.forEach((p, i) => { p.pageNumber = i + 1; });

    set({ book: { ...book, pages }, isDirty: true });
  },

  markClean: () => set({ isDirty: false }),

  getCurrentPage: () => {
    const { book, currentPageIndex } = get();
    return book?.pages[currentPageIndex] ?? null;
  },
}));
```

---

## Step 5: Utility Functions

### CREATE: `src/utils/cn.ts`

```typescript
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
```

### CREATE: `src/utils/dslConverter.ts`

```typescript
/**
 * Converts DSL tags to TipTap-compatible HTML
 */
export function dslToHtml(text: string): string {
  return text
    .replace(
      /\[expressive:(\w+)\](.*?)\[\/expressive\]/g,
      '<span data-expressive="true" data-style="$1">$2</span>'
    )
    .replace(
      /\[interactive:([^\]]+)\](.*?)\[\/interactive\]/g,
      '<span data-interactive="true" data-tooltip="$1">$2</span>'
    )
    .replace(/\n/g, '<br>');
}

/**
 * Converts TipTap HTML back to DSL tags
 */
export function htmlToDsl(html: string): string {
  return html
    .replace(
      /<span data-expressive="true" data-style="(\w+)">(.*?)<\/span>/g,
      '[expressive:$1]$2[/expressive]'
    )
    .replace(
      /<span data-interactive="true" data-tooltip="([^"]+)">(.*?)<\/span>/g,
      '[interactive:$1]$2[/interactive]'
    )
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<p>(.*?)<\/p>/g, '$1\n')
    .replace(/<[^>]+>/g, '') // Strip remaining HTML
    .trim();
}
```

### CREATE: `src/utils/fileIO.ts`

```typescript
import type { BookData } from '@/data/schemas';
import { BookSchema } from '@/data/schemas';

export async function getBooks(): Promise<BookData[]> {
  const res = await fetch('/api/books');
  return res.json();
}

export async function getBook(slug: string): Promise<BookData> {
  const res = await fetch(`/api/books/${slug}`);
  return res.json();
}

export async function saveBook(book: BookData): Promise<{ success: boolean; error?: string }> {
  // Validate before saving
  const result = BookSchema.safeParse(book);
  if (!result.success) {
    return { 
      success: false, 
      error: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n') 
    };
  }

  const res = await fetch(`/api/books/${book.slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.data),
  });

  if (!res.ok) {
    return { success: false, error: 'Failed to save book' };
  }

  return { success: true };
}

export async function createBook(slug: string, title: string, author: string): Promise<BookData> {
  const res = await fetch('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, title, author }),
  });
  return res.json();
}
```

---

## Step 6: API Routes

### CREATE: `src/app/api/books/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { readdir, readFile, mkdir, writeFile } from 'fs/promises';
import path from 'path';

const BOOKS_DIR = path.join(process.cwd(), 'books');

export async function GET() {
  try {
    const slugs = await readdir(BOOKS_DIR);
    const books = await Promise.all(
      slugs
        .filter(s => !s.startsWith('.'))
        .map(async (slug) => {
          const data = await readFile(path.join(BOOKS_DIR, slug, 'data.json'), 'utf-8');
          return JSON.parse(data);
        })
    );
    return NextResponse.json(books);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const { slug, title, author } = await req.json();
  
  const bookDir = path.join(BOOKS_DIR, slug);
  const assetsDir = path.join(bookDir, 'assets');
  
  await mkdir(assetsDir, { recursive: true });
  
  const book = {
    slug,
    title,
    author,
    pages: [{ pageNumber: 1, text: 'Once upon a time...' }],
  };
  
  await writeFile(path.join(bookDir, 'data.json'), JSON.stringify(book, null, 2));
  
  return NextResponse.json(book);
}
```

### CREATE: `src/app/api/books/[slug]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const BOOKS_DIR = path.join(process.cwd(), 'books');

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
```

### CREATE: `src/app/api/upload/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const BOOKS_DIR = path.join(process.cwd(), 'books');

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const slug = formData.get('slug') as string;
  const pageNumber = formData.get('pageNumber') as string;
  
  if (!file || !slug) {
    return NextResponse.json({ error: 'Missing file or slug' }, { status: 400 });
  }
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name);
  const filename = `page-${pageNumber}-illustration${ext}`;
  const assetsDir = path.join(BOOKS_DIR, slug, 'assets');
  
  await mkdir(assetsDir, { recursive: true });
  await writeFile(path.join(assetsDir, filename), buffer);
  
  const publicPath = `/books/${slug}/assets/${filename}`;
  return NextResponse.json({ path: publicPath });
}
```

---

## Step 7: TipTap Custom Marks

### CREATE: `src/editor/marks/ExpressiveMark.ts`

```typescript
import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    expressive: {
      setExpressive: (style: string) => ReturnType;
      unsetExpressive: () => ReturnType;
    };
  }
}

export const ExpressiveMark = Mark.create({
  name: 'expressive',

  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-style'),
        renderHTML: (attrs) => ({ 'data-style': attrs.style }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-expressive]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ 'data-expressive': 'true' }, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setExpressive:
        (style: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { style });
        },
      unsetExpressive:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
```

### CREATE: `src/editor/marks/InteractiveMark.ts`

```typescript
import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    interactive: {
      setInteractive: (tooltip: string) => ReturnType;
      unsetInteractive: () => ReturnType;
    };
  }
}

export const InteractiveMark = Mark.create({
  name: 'interactive',

  addAttributes() {
    return {
      tooltip: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-tooltip'),
        renderHTML: (attrs) => ({ 'data-tooltip': attrs.tooltip }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-interactive]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ 'data-interactive': 'true' }, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setInteractive:
        (tooltip: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { tooltip });
        },
      unsetInteractive:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
```

---

## Step 8: Editor Components

### CREATE: `src/components/Editor/TextEditor.tsx`

```typescript
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { ExpressiveMark } from '@/editor/marks/ExpressiveMark';
import { InteractiveMark } from '@/editor/marks/InteractiveMark';
import { dslToHtml, htmlToDsl } from '@/utils/dslConverter';
import { useBookStore } from '@/data/stores/bookStore';
import { useEffect } from 'react';
import styles from './TextEditor.module.css';

const EXPRESSIVE_STYLES = ['handwritten', 'shout', 'bully'];

export function TextEditor() {
  const { getCurrentPage, updatePage } = useBookStore();
  const page = getCurrentPage();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      ExpressiveMark,
      InteractiveMark,
    ],
    content: page ? dslToHtml(page.text) : '',
    onUpdate: ({ editor }) => {
      const dsl = htmlToDsl(editor.getHTML());
      updatePage({ text: dsl });
    },
  });

  // Update editor when page changes
  useEffect(() => {
    if (editor && page) {
      const currentHtml = editor.getHTML();
      const newHtml = dslToHtml(page.text);
      if (currentHtml !== newHtml) {
        editor.commands.setContent(newHtml);
      }
    }
  }, [editor, page?.pageNumber]);

  if (!editor || !page) return null;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? styles.active : ''}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? styles.active : ''}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? styles.active : ''}
        >
          U
        </button>

        <span className={styles.divider} />

        <select
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setExpressive(e.target.value).run();
            } else {
              editor.chain().focus().unsetExpressive().run();
            }
            e.target.value = '';
          }}
          defaultValue=""
        >
          <option value="">Expressive...</option>
          {EXPRESSIVE_STYLES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button
          onClick={() => {
            const tooltip = prompt('Enter tooltip text:');
            if (tooltip) {
              editor.chain().focus().setInteractive(tooltip).run();
            }
          }}
        >
          📖 Interactive
        </button>

        <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>
          Clear
        </button>
      </div>

      <EditorContent editor={editor} className={styles.editor} />
    </div>
  );
}
```

### CREATE: `src/components/Editor/TextEditor.module.css`

```css
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--color-surface);
  border-radius: 0.5rem;
  flex-wrap: wrap;
}

.toolbar button,
.toolbar select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  background: var(--color-bg);
  cursor: pointer;
  font-size: 0.875rem;
}

.toolbar button:hover {
  background: var(--color-surface-hover);
}

.toolbar button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.divider {
  width: 1px;
  background: var(--color-border);
  margin: 0 0.5rem;
}

.editor {
  min-height: 200px;
  padding: 1rem;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1.25rem;
  line-height: 1.8;
}

.editor :global([data-expressive][data-style="handwritten"]) {
  font-family: 'Caveat', cursive;
  font-size: 1.4em;
  color: teal;
}

.editor :global([data-expressive][data-style="shout"]) {
  font-weight: bold;
  font-size: 1.2em;
}

.editor :global([data-expressive][data-style="bully"]) {
  font-weight: bold;
  color: crimson;
  font-style: italic;
}

.editor :global([data-interactive]) {
  color: navy;
  border-bottom: 2px dotted navy;
  cursor: help;
}
```

---

## Step 9: Remaining Components (Build These)

### Pages Panel (Sidebar)
- List all pages
- Click to navigate
- Add/Delete buttons
- Drag to reorder (optional for v1)

### Illustration Pane
- File upload input
- Preview current illustration
- Clear illustration button

### Effects Panel
- VFX presets: sparkle, fade, slide
- SFX presets: whoosh, chime, bell
- Trigger selector: onPageEnter, onPageExit
- List of current effects with delete

### Page Settings
- Mood dropdown (calm, tense, joyful)
- Layout dropdown (fullbleed, split, textOnly)
- Mask selector (optional)

### Book Library (Home Page)
- Grid of book cards
- New Book button with modal
- Click to open editor

### Save/Preview Bar
- Save button (validates + writes)
- Preview button (opens viewer in new tab)
- Dirty indicator

---

## Step 10: Global Styles

### MODIFY: `src/app/globals.css`

```css
:root {
  --color-bg: #fafafa;
  --color-surface: #f0f0f0;
  --color-surface-hover: #e5e5e5;
  --color-text: #1a1a1a;
  --color-text-subtle: #666;
  --color-border: #ddd;
  --color-primary: #0066cc;
  --color-danger: #cc3333;
  --color-success: #33aa33;
}

* {
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  margin: 0;
}
```

---

## Verification Checklist

After building:

- [ ] `npm run dev` starts without errors
- [ ] Home page shows book library
- [ ] Can create new book
- [ ] Can edit page text with rich formatting
- [ ] Expressive marks render in preview and export correctly
- [ ] Can upload illustration
- [ ] Can add/delete pages
- [ ] Save validates and writes `data.json`
- [ ] Viewer (`gia-t-books`) renders saved content correctly
