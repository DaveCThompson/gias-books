# Gia Workspace

A **Turborepo monorepo** containing the Madoodle platform: an interactive storybook viewer and authoring studio.

---

## 📦 Repository Structure

```
gia-workspace/
├── apps/
│   ├── viewer/       Next.js 15.1.0 – Pages Router (SSG/SSR for dev)
│   └── studio/       Next.js 15.1.0 – App Router (WYSIWYG editor)
├── packages/
│   ├── schemas/      Zod schemas + TypeScript types
│   ├── design-system/  Shared CSS variables
│   └── content/      Book content (data.json + assets)
├── turbo.json        Turborepo pipeline config
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

### Running Apps Individually

**Option A: Viewer** (port 3000):
```bash
cd apps/viewer && npm run dev
# Access at http://localhost:3000
```

**Option B: Studio** (port 3001):
```powershell
# From workspace root (PowerShell)
$env:PORT='3001'; cd apps/studio; npm run dev

# OR if already in apps/studio/
$env:PORT='3001'
npm run dev
# Access at http://localhost:3001
```

> **💡 Tip**: Studio requires `PORT=3001` environment variable to avoid port conflicts with viewer. If you see a "lock" error, you already have that app running.

---

## 📁 Package Roles

| Package | Purpose | Consumers |
|---------|---------|-----------|
| `@gia/schemas` | Zod schemas, TypeScript types | Both apps |
| `@gia/design-system` | Shared `variables.css` | Both apps |
| `@gia/content` | Book data.json + validation | Both apps |

---

## 🔧 Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Run all apps in development mode |
| `npm run build` | Production build (both apps) |
| `npm run lint` | ESLint check across workspace |
| `npm run clean` | Remove all build artifacts |

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
- **Styling**: CSS Modules + oklch color space (see [CSS-PRINCIPLES.md](./CSS-PRINCIPLES.md))
- **Validation**: Zod schemas in shared package
- **Build**: Turborepo for caching + parallel builds

---

## 📝 Documentation

| File | Contents |
|------|----------|
| [AGENTS.md](./AGENTS.md) | AI agent guidelines, coding standards, common pitfalls |
| [CSS-PRINCIPLES.md](./CSS-PRINCIPLES.md) | Styling architecture, theming, design tokens |

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
3. **ESLint 8.57.1**: Both apps use pinned version with native flat config (`eslint.config.mjs`)
4. **TypeScript 5.x**: Strict mode enabled across workspace
