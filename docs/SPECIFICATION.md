# Madoodle Project Specification

**Madoodle** is a high-craft, mobile-first interactive storybook platform designed to bring digital stories to life with the tangible warmth of physical books and the dynamic magic of the web.

## 🌟 Core Philosophy

### 1. "Digital Warmth"
We reject cold, sterile interfaces. Our app feels "alive" and "organic".
- **Textures & Layers**: Use subtle noise, paper textures, and depth.
- **Organic Motion**: Physics-based springs (not linear tweens) for everything.
- **Roundness**: Soft corners, concentric radii, friendly shapes.

### 2. "Expressive Text"
Text is not just static glyphs; it is an actor in the story.
- **The DSL**: Our custom markup language (`[style motion="bounce"]`) allows authors to imbue words with emotion.
- **Typography**: Curated font stack (Google Fonts) that reinforces the mood (Calm, Tense, Joyful).

### 3. "Immersive Audio"
Sound is a first-class citizen, not an afterthought.
- **Foley & Ambience**: Background loops (rain, cafe noise) that cross-fade smoothly.
- **Interaction Sounds**: Subtle "pop", "swish", "click" sounds on UI interactions.
- **Narration**: Word-level timing (future goal) and high-quality voiceovers.

---

## 🏗 Technical Specification

### 1. Architecture
- **Monorepo**: Turborepo managing `viewer` (consumer) and `studio` (creator).
- **Framework**: Next.js 15 (Pages Router for Viewer/SSG, App Router for Studio).
- **State**: Zustand for global state (lightweight, atomic).

### 2. The Data Model
- **Books**: JSON-based structure defined in `@gia/content`.
- **Validation**: Strict Zod schemas in `@gia/schemas`.
- **Portability**: Books are self-contained bundles (JSON + Assets) ready for static hosting.

### 3. The Rendering Engine
- **VFX Layer**: Canvas-based effects (rain, snow) overlaid on the DOM.
- **Gesture System**: `@use-gesture/react` for natural touch interactions (swipe to turn).
- **View Transitions**: Mobile-app-like navigation fluidity using the View Transitions API.

---

## 🎨 Design Language (The "Feel")

- **Color**: OKLCH space for perceptual uniformity.
- **Theme**: "Moods" (Calm, Tense, Joyful) drive the entire color palette dynamically.
- **Responsiveness**: Mobile-first design that scales up to desktop elegantly (split views).
