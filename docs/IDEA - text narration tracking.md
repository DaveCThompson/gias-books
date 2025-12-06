# IDEA: Word-by-word audio highlighting in PWA “rich media book”

**Type:** Product/UX+Engineering Exploration  
**Owner:** TBD (Design Systems + Frontend Platform)  
**Stakeholders:** Product (Reading Experience), Content Ops, Accessibility, QA  
**Status:** Proposed  
**Priority:** High for 2025 Q1 discovery

---

## Problem
Readers need synchronized **word-level highlighting** as narration plays. Current experience lacks precise sync, limiting comprehension, language learning, and accessibility. We need an approach that supports our **custom typographic system**, works **offline** in a **PWA**, and scales to thousands of pages.

---

## Goals
- 🎯 Highlight the **exact word** currently being spoken.
- 🎯 Support **custom DOM/typography** (classes per word type).
- 🎯 Work **offline** after initial load (Service Worker + IndexedDB).
- 🎯 Handle both **mastered human narration** and **dynamic TTS**.
- 🎯 A11y-compliant; minimal CPU/battery impact on mid-tier devices.

### Non-Goals
- Phoneme-level karaoke effects.
- Auto-translation or ASR (speech → text) on-device.
- Visual editing tooling (covered in separate authoring initiative).

---

## Candidate Solutions (evaluate + compare)

### A) Precomputed Forced Alignment (human audio)
- **What:** Align final narration to canonical text offline; store per-word timings (`t0/t1`) as JSON or per-word WebVTT cues.
- **How:** Montreal Forced Aligner / Gentle / aeneas in CI or content pipeline.
- **Runtime:** Binary search `audio.currentTime` → active word; update CSS class.
- **Pros:** Highest accuracy; deterministic; fully **offline** after caching.
- **Cons:** Re-run alignment on content/audio changes; pipeline complexity.

### B) Real-time TTS with Word Boundaries
- **What:** Use TTS engines that emit boundary events (word offsets/durations).
- **Options:** Amazon Polly (Speech Marks), Azure Speech (WordBoundary), or Web Speech API (where supported).
- **Runtime:** Drive highlight from boundary events instead of `currentTime`.
- **Pros:** No preprocessing; great for dynamic or personalized text.
- **Cons:** Usually **online**; engine/browser variance; vendor SDK integration.

### C) Hybrid (recommended)
- **Primary path:** A) for mastered audiobooks (chapters ship with `words.json`).
- **Fallback:** B) when narration missing or user selects “Read Aloud.”
- **Graceful degrade:** Sentence/phrase-level **WebVTT** cues when word-level data unavailable.

---

## Technical Approach (proposed)

### Data model
```ts
type WordTiming = {
  wid: number;          // stable word id
  charStart: number;    // offset in canonical text
  charEnd: number;
  t0: number;           // ms
  t1: number;           // ms
  posTag?: string;      // noun/verb/etc. (optional for styling)
};
type ChapterTimings = WordTiming[];
