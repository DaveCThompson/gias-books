# GIA Studio

A high-craft WYSIWYG story editor for creating interactive children's storybooks.

> **Part of the [gia-workspace](../../README.md) monorepo**

---

## Quick Start

```bash
# From monorepo root
npm install
npm run dev  # Starts both apps

# Or individually (port 3001)
cd apps/studio
$env:PORT='3001'
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the book library.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.1.0 (App Router) |
| Rich Text | TipTap with custom marks |
| State | Zustand |
| Validation | Zod (via `@gia/schemas`) |
| Styling | CSS Modules + oklch + Semantic Variables |

---

## Monorepo Location

This app lives at `apps/studio/` within the monorepo:

```
gia-workspace/
├── apps/
│   ├── studio/       ← You are here (Editor)
│   └── viewer/       ← Companion viewer
├── packages/
│   ├── content/      ← Shared book data (data.json + assets)
│   ├── schemas/      ← Zod schemas + TypeScript types
│   └── design-system/ ← Shared CSS variables
└── README.md
```

**Key:** Both apps consume `@gia/content` - edits in Studio are immediately available in the Viewer.

---

## Key Features

- **Rich Text Editor** - TipTap-based with custom DSL marks
- **Expressive Text** - `handwritten`, `shout`, `bully` styles
- **Interactive Text** - Tooltips on words
- **Page Management** - Add, delete, reorder pages
- **Asset Upload** - Illustrations, masks, narration
- **Live Sync** - Changes visible in viewer immediately

---

## DSL Tag Format

Content uses a custom DSL format stored in `data.json`:

```
[expressive:handwritten]different[/expressive]
[interactive:wearing glasses]bespectacled[/interactive]
```

The editor converts between DSL and HTML for editing.

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/books` | GET | List all books |
| `/api/books` | POST | Create new book |
| `/api/books/[slug]` | GET | Get book data |
| `/api/books/[slug]` | PUT | Save book data |
| `/api/upload` | POST | Upload asset file |

---

## Development Workflow

1. Edit in Studio at `http://localhost:3001`
2. Preview in Viewer at `http://localhost:3000`
3. Save in Studio → immediately reflected in Viewer

---

## Documentation

- [Root README](../../README.md) - Monorepo overview
- [AGENTS.md](../../AGENTS.md) - AI agent guidelines
- [CSS-PRINCIPLES.md](../../CSS-PRINCIPLES.md) - Styling architecture
