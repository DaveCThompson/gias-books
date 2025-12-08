# Gia Workspace

A **Turborepo monorepo** containing the Madoodle platform: an interactive storybook viewer and authoring studio.

---

## 📦 Repository Structure

```
gia-workspace/
├── apps/
│   ├── viewer/       Next.js 15 – Pages Router (SSG/SSR for dev)
│   └── studio/       Next.js 15 – App Router (WYSIWYG editor)
├── packages/
│   ├── schemas/      Zod schemas + TypeScript types
│   ├── design-system/  Shared CSS variables + tokens
│   ├── content/      Book content (data.json + assets)
│   └── utils/        Shared utilities (cn, etc.)
├── turbo.json        Turborepo task config
└── package.json      Workspace root
```

---

## 🚀 Quick Start

```bash
# Install dependencies from workspace root
npm install

# Verify codebase
npm run lint   # ESLint both apps
npm run build  # Production build both apps

# Development - run both apps via Turborepo
npm run dev    # Viewer on :3000, Studio on :3001
```

## ✅ Pre-Development Checklist

Before starting development, verify everything works:

```bash
npm install           # 1. Install dependencies
npm run lint          # 2. Should show 0 errors, 0 warnings
npm run build         # 3. Should complete successfully  
npm run dev           # 4. Viewer at :3000, Studio at :3001
```

> **Note**: If `npm run dev` shows a port conflict, one app is already running. Use `--workspace` to run individually.

### Running Apps Individually

**Viewer** (port 3000, or next available):
```bash
# Note: Package name is 'gias-books' but directory is apps/viewer
npm run dev --workspace=gias-books
# Access at http://localhost:3000 (or 3002, 3003 if busy)
```

**Studio** (port 3001 - auto-assigned):
```bash
npm run dev --workspace=gia-studio
# Access at http://localhost:3001
```

> **💡 Tip**: Studio automatically uses port 3001 when viewer is running. If you see a "lock" error, that app is already running. If port 3000 is busy, the viewer will auto-increment to 3002, 3003, etc.

---

## 📁 Package Roles

| Package | Purpose | Consumers |
|---------|---------|-----------|
| `@gia/schemas` | Zod schemas, TypeScript types, style registries | Both apps |
| `@gia/design-system` | Shared CSS tokens, fonts, reset | Both apps |
| `@gia/content` | Book data.json + validation | Both apps |
| `@gia/utils` | Shared utilities (`cn()`, `EASING`, `DURATION`) | Both apps |
| `@gia/ui` | Shared UI components (Tooltip, Dialog, Popover) | Both apps |

---

## 🔧 Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Run all apps in development mode |
| `npm run build` | Production build (both apps) |
| `npm run lint` | ESLint check across workspace |
| `npm run clean` | Remove all build artifacts |
| `npm run reset-dev` | Remove dev caches (Next.js) |

### App-Specific Commands

| App | Command | Description |
|-----|---------|-------------|
| Viewer | `npm run validate` | Validate book content |
| Viewer | `npm run sync:assets` | Sync assets to public/ |
| Studio | `npm run dev` | Editor with TipTap + Zustand |

---

## 🎨 Architecture Decisions

- **Next.js**: Viewer (Pages Router) + Studio (App Router)
- **State**: Zustand (minimal, performant)
- **Styling**: CSS Modules + oklch color space (see [STYLING-GUIDE.md](./STYLING-GUIDE.md))
- **Validation**: Zod schemas in shared package
- **Build**: Turborepo for caching + parallel builds
- **Page Transitions**: 3-page carousel with spring physics + gesture support

---

## 📝 Documentation

| File | Contents |
|------|----------|
| [AGENTS.md](./AGENTS.md) | AI agent guidelines, coding standards, common pitfalls |
| [STYLING-GUIDE.md](./STYLING-GUIDE.md) | Styling architecture, theming, design tokens, UI patterns |

---

## 🚢 Deployment

### Viewer (GitHub Pages)

```bash
cd apps/viewer
$env:DEPLOY_TARGET='github-pages'
npm run build
# Output in apps/viewer/out/
```

### Studio

Studio runs as a local development tool; deploy via standard Next.js mechanisms if needed.

---

## ⚠️ Important Notes

1. **Single lockfile**: Only root `package-lock.json` – apps must NOT have their own lockfiles
2. **Turbo 2.x**: Uses `"tasks"` not deprecated `"pipeline"` in `turbo.json`
3. **ESLint 9**: Both apps use native flat config (`eslint.config.mjs`)
4. **TypeScript 5.x**: Strict mode enabled across workspace
5. **Shared utils**: Import `cn()` from `@gia/utils`, not local files
