# Data Model Specification

## 📚 The Data Model

### Books
- **Structure**: JSON-based structure defined in `@gia/content`.
- **Validation**: Strict Zod schemas in `@gia/schemas`.
- **Portability**: Books are self-contained bundles (JSON + Assets) ready for static hosting.

### Schemas
Refer to `packages/schemas/src/index.ts` for the authoritative TypeScript definitions.

**Key Types:**
- `BookData`: The root object for a book.
- `PageData`: Individual page content and metadata.
- `IllustrationData`: Background/layer definitions.
