# Technical Architecture Specification

## 🏗 Architecture

- **Monorepo**: Turborepo managing `viewer` (consumer) and `studio` (creator).
- **Framework**: Next.js 15 (Pages Router for Viewer/SSG, App Router for Studio).
- **State**: Zustand for global state (lightweight, atomic).

## 🚀 Deployment Strategy

### Viewer (GitHub Pages)
- Deployed as a static site (`output: 'export'`) to GitHub Pages.
- Uses `basePath` configuration for subdirectory hosting.
- Optimized for aggressive caching and CDNs.

### Studio (Local/Internal)
- Runs as a standard Next.js application (App Router).
- Designed for local authoring or internal hosting.
