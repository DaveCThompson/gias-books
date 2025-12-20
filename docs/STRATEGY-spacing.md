# STRATEGY-spacing: Spacing & Geometry

## 📐 The Geometric Scale

We use a strict 4px baseline grid (`0.25rem`) to ensure rhythm and alignment across the application.

### Baseline Unit
**`--space-1` = `0.25rem` (4px)**

### The Scale
| Token | px | rem | Usage |
|-------|---|---|---|
| `--space-0` | 0 | 0 | Reset |
| `--space-px` | 1px | 1px | Borders, Hairlines |
| `--space-0-5`| 2px | 2px | Micro-adjustments |
| `--space-1` | 4px | 0.25 | Tight grouping |
| `--space-2` | 8px | 0.5 | Icon gaps |
| `--space-3` | 12px | 0.75 | Comfortable gap |
| `--space-4` | 16px | 1.0 | **Standard Base** |
| `--space-5` | 20px | 1.25 | |
| `--space-6` | 24px | 1.5 | Card padding |
| `--space-8` | 32px | 2.0 | Section break |
| `--space-10` | 40px | 2.5 | |
| `--space-12` | 48px | 3.0 | Module break |
| `--space-16` | 64px | 4.0 | Page Header |
| `--space-24` | 96px | 6.0 | Hero Section |

---

## 🎯 Radius System

Radii are concentric by design: `Outer = Inner + Padding`.

| Token | Value | Use Case |
|-------|-------|----------|
| `--radius-2px` | 2px | Tiny chevrons, nested items |
| `--radius-sm` | 4px | Inputs, small buttons |
| `--radius-md` | 8px | **Default** (Buttons, Cards) |
| `--radius-lg` | 12px | Containers wrapping `--radius-md` items |
| `--radius-xl` | 16px | Modals, Floating Panels |
| `--radius-2xl` | 24px | Large surfaces |
| `--radius-full`| 9999px| Pills |

---

## 🏗 Implementation Strategy

### 1. Token Architecture
We are splitting the monolithic `variables.css` into focused domains:
- `tokens/colors.css`: Primitives & Semantic colors.
- `tokens/spacing.css`: Spacing, Radius, Layout.
- `tokens/typography.css`: Fonts, Weights.
- `tokens/animation.css`: Timing & Easing.

### 2. Migration Path
1.  **Define**: Create `tokens/spacing.css` with the new scale.
2.  **Import**: Add to `index.css`.
3.  **Adopt**: Iteratively replace magic numbers in `apps/viewer` and `apps/studio` with tokens.
4.  **Lint**: Future goal—add stylelint rule to ban `px` for spacing properties.

### 3. Mobile Adaptation
- Tokens remain fixed (predictability).
- Layout Containers (`--container-*`) handle responsive constraints.
- Touch Targets: Components must ensure min-height `44px` (approx `--space-11`) for interactivity.
