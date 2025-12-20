# SPEC-data-model: Content & Data Structure

## 📚 The Book Model

Content is defined strictly by Zod schemas in `@gia/schemas`.

### Book Structure
```typescript
interface BookData {
  slug: string;       // URL-safe identifier
  title: string;
  author: string;
  pages: PageData[];  // Ordered list of pages
}
```

### Page Structure
```typescript
interface PageData {
  pageNumber: number;
  text: string;       // DSL-formatted text
  illustration?: IllustrationData;
  mood?: Mood;        // 'calm', 'tense', 'joyful', etc.
  layout?: 'split' | 'fullbleed';
  narrationUrl?: string;
}
```

## 📦 Portability & Storage

- **Format**: JSON (`data.json`).
- **Location**: `packages/content/<slug>/data.json`.
- **Assets**: Images and audio reside in `packages/content/<slug>/assets/`.
- **Portability**: A book is a self-contained folder. It can be zipped, moved, or hosted anywhere. The Viewer "hydrates" from this static data.

## 🛡 Validation

- **Runtime**: Zod schemas validate data on load (in Studio) and build (in Viewer).
- **Static Analysis**: TypeScript types are inferred from Zod schemas to ensure compile-time safety.
