# Madoodle Viewer

An interactive storybook viewer built for mobile-first, high-craft reading experiences.

> **Part of the [gia-workspace](../../README.md) monorepo**

---

## Quick Start

```bash
# From monorepo root
npm install
npm run dev  # Starts both apps

# Or individually (port 3000)
cd apps/viewer && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the library.

---

## Core Principles

- **Mobile-First Design:** Layouts, components, and interactions are designed for touch-based devices first
- **High-Craft UI:** Smooth, intuitive, and visually polished interactions
- **Component-Based Architecture:** Reusable, accessible components built on Radix UI
- **Simple & Scalable State:** Zustand for minimal, performant state management

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.1.0 (Pages Router, SSG) |
| Language | TypeScript (strict mode) |
| Styling | CSS Modules + oklch + Semantic Variables |
| State | Zustand |
| Deployment | GitHub Pages (via `gh-pages` package) |

---

## Monorepo Location

This app lives at `apps/viewer/` within the monorepo:

```
gia-workspace/
├── apps/
│   ├── viewer/       ← You are here (Viewer)
│   └── studio/       ← Companion editor
├── packages/
│   ├── content/      ← Shared book data (data.json + assets)
│   ├── schemas/      ← Zod schemas + TypeScript types
│   └── design-system/ ← Shared CSS variables
└── README.md
```

---

## Rendering Features

- **Parallax Illustrations:** Multi-layer images (bg/mid/fg) with depth effect
- **VFX Effects:** sparkle, fade, slide triggered on page enter/exit
- **SFX Effects:** Audio effects (whoosh, chime, etc.)
- **Layout Variations:** fullbleed, split, textOnly page layouts

---

## Deployment to GitHub Pages

```bash
# Set deploy target and build
$env:DEPLOY_TARGET='github-pages'
npm run build

# Deploy
npm run deploy
```

This builds the project with static export enabled and pushes to the `gh-pages` branch.

---

## Asset Specifications

| Asset | Format | Size |
|-------|--------|------|
| Book Cover | JPG/WebP (3:4) | 600 x 800 |
| Page Illustration | JPG/WebP (4:3) | 1600 x 1200 |
| Illustration Mask | SVG (1:1) | 1000 x 1000 |
| Narration Audio | M4A/MP3 | Optimized |
| SFX Audio | MP3 | < 100KB |

---

## Validation

```bash
npm run validate  # Check data.json against schema
npm run sync:assets  # Copy assets to public/
```

---

## Documentation

- [Root README](../../README.md) - Monorepo overview
- [AGENTS.md](../../AGENTS.md) - AI agent guidelines
- [CSS-PRINCIPLES.md](../../CSS-PRINCIPLES.md) - Styling architecture