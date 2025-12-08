# Animated Text Strategy

*Stable layout, performant motion, expressive typography.*

---

## 1. Objectives

1. **Zero layout surprises**

   * No line-wrap changes or “jumps” while text animates.
   * Keep Cumulative Layout Shift (CLS) effectively at 0 for all text animations. ([debugbear.com][1])

2. **High performance**

   * Avoid main-thread thrash and excessive re-layout.
   * Prefer GPU-friendly properties (transforms, opacity). ([CSS Author][2])

3. **Brand-consistent, accessible**

   * Animations enhance meaning and hierarchy, not distract.
   * Respect `prefers-reduced-motion` and maintain legibility.

---

## 2. Key Technical Realities

### 2.1 Variable fonts & animation

* `font-variation-settings` lets you animate axes like weight (`"wght"`), width (`"wdth"`), slant (`"slnt"`), optical size (`"opsz"`), etc. ([MDN Web Docs][3])
* Animating these axes is legal CSS and widely supported. ([CSS { In Real Life }][4])
* But: each new axis value can trigger **glyph recalculation + rasterization**, which is significantly heavier than a `transform`. ([Stack Overflow][5])

### 2.2 Layout shift (CLS) from fonts

* Web fonts commonly cause layout shift when fallback metrics don’t match final font metrics. ([debugbear.com][1])
* Newer CSS props (`size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`) let you tune fallback metrics to match the web font and reduce CLS. ([vincent.bernat.ch][6])

### 2.3 What not to animate directly

For text that must not re-wrap:

* Avoid animating **layout-driving properties** on the “real” inline text:

  * `font-size`, `letter-spacing`, `word-spacing`
  * `line-height` (especially unitless)
  * margins/padding that affect inline flow
  * `font-variation-settings` on long text blocks

Use them only on **isolated, controlled elements** or overlays.

---

## 3. Core Design Principles

1. **Decouple layout from visuals**

   * One copy of the text defines layout.
   * Another copy (overlay) handles animation via transforms or axis changes.

2. **Reserve maximum space**

   * Layout should assume the **widest / tallest** version of the animated text.
   * All animation happens inside that pre-reserved box.

3. **Keep animation in the composite layer**

   * Favor `transform` and `opacity` over anything that forces layout/paint. ([CSS Author][2])

4. **Scope and throttle**

   * Animate short strings (hero words, labels) rather than big paragraphs.
   * Avoid animating dozens of elements simultaneously with variable axes. ([Stack Overflow][5])

---

## 4. Canonical Patterns

### 4.1 Inline emphasized word (no wrap changes)

**Use when:** One word in a paragraph animates weight/width/slant; wrapping must be rock solid.

**Pattern: ghost width + overlay**

```html
<p>
  The decision was
  <span class="fx-word" data-text="final">
    <span class="fx-word-inner">final</span>
  </span>.
</p>
```

```css
.fx-word {
  position: relative;
  display: inline-block;
  white-space: nowrap; /* prevents the word itself from breaking */
}

/* Ghost: establishes max width using extreme axis values */
.fx-word::before {
  content: attr(data-text);
  visibility: hidden;                /* still participates in layout */
  font-variation-settings: "wght" 900, "wdth" 125;
}

/* Overlay: animates freely without touching layout */
.fx-word-inner {
  position: absolute;
  inset: 0;
  font-variation-settings: "wght" 400, "wdth" 100;
  transition: font-variation-settings 250ms ease;
}

.fx-word.is-strong .fx-word-inner {
  font-variation-settings: "wght" 800, "wdth" 115;
}
```

**Why it works**

* The `::before` pseudo-element fixes the inline box width at the **maximum** expected size.
* The absolutely positioned `.fx-word-inner` can animate axes or transforms without changing layout.
* Pseudo-elements are a well-established technique for “extra visuals without extra DOM,” and widely used for animated underlines, fills, and glitch layers. ([PreCodeCamp][7])

---

### 4.2 Headline / hero text (can tolerate micro-reflow)

**Use when:** Big hero line where small layout adjustments are acceptable, but CLS and jank still matter.

**Guidelines**

* Use variable fonts for expressive axes. ([This Design Girl][8])
* Animate **narrow axis ranges** (e.g., `wght: 350→650`, not `100→900`). ([Stack Overflow][5])
* Prefer:

  * `transform: scaleX` for width-like effects.
  * `transform: skewX` for slant-like effects.
* Use `font-variation-settings` only on short, large text and avoid constant looping; trigger on scroll or hover.

Example:

```css
.hero-word {
  display: inline-block;
  font-variation-settings: "wght" 500;
  transition:
    transform 500ms ease,
    font-variation-settings 500ms ease;
}

.hero-word.is-active {
  transform: scaleX(1.05);
  font-variation-settings: "wght" 650;
}
```

---

### 4.3 Buttons and compact labels

**Use when:** Short, self-contained text (CTA, tag, pill).

**Strategy**

* Wrap label text in an inline-block.
* Reserve width using the boldest / widest state.
* Animate:

  * Background, border, shadows.
  * `transform` (subtle `scale(1.03)` on hover).
  * Optional narrow-band `font-variation-settings`.

Because the text is short, any residual metric change is low risk, but still prefer the reserved-width pattern for critical layouts.

---

### 4.4 Shape-level animation (SVG / canvas)

**Use when:** Need extreme deformation or generative typography without touching layout at all.

**Approach**

* Use normal HTML text for layout and accessibility (can be visually hidden or low-emphasis).
* Render a matching string into:

  * `<svg><text>…</text></svg>` and animate paths, or
  * canvas/WebGL (for complex generative motion). ([arXiv][9])
* Overlay the SVG/canvas on top of the “real” text; mark overlay `aria-hidden="true"`.

This decouples layout completely from rendering and is ideal for hero-level experimentation.

---

## 5. Font Loading & Metrics Strategy

### 5.1 Reduce initial CLS from web fonts

* **Self-host** variable fonts and preload key faces for critical text. ([debugbear.com][1])

* Use `font-display` thoughtfully (`swap` or `optional`) depending on brand tolerance for FOUT. ([debugbear.com][1])

* Use metric overrides to align fallback and final font: ([vincent.bernat.ch][6])

  ```css
  @font-face {
    font-family: "BrandVar";
    src: url("/fonts/BrandVar.woff2") format("woff2-variations");
    font-display: swap;
    size-adjust: 98%;
    ascent-override: 90%;
    descent-override: 22%;
    line-gap-override: 0%;
  }
  ```

* Choose fallback fonts with similar metrics to primary variable font (same general x-height and width). ([debugbear.com][1])

### 5.2 Manage variable font complexity

* Subset fonts to used scripts and characters for animation-heavy faces. ([This Design Girl][8])
* Limit axis usage to what actually supports the brand:

  * e.g., `"wght"`, `"wdth"`, `"slnt"`, `"opsz"` — avoid “toy” axes unless needed.

---

## 6. Performance Constraints & Deep Tricks

1. **Don’t animate everything, everywhere**

   * Stack Overflow and performance discussions confirm variable font animations are significantly more CPU-intensive than transform-only animations. ([Stack Overflow][5])
   * Only a few elements (e.g., hero word, 1–3 key labels) should animate at any given time.

2. **Use transforms as the “first resort”**

   * Many modern text effect galleries rely heavily on transforms, text-shadow, clip-path, and pseudo-elements for high-performance animations. ([CSS Author][2])

3. **Split effects over multiple layers**

   * Use `::before` / `::after` for highlights, fills, glitches, outlines, etc., leaving the core glyphs static. ([PreCodeCamp][7])

4. **Prefer event-based motion over infinite loops**

   * Trigger animations on scroll, hover, active states, or one-time page load.
   * Avoid full-page infinite “breathing” variable-font animations.

5. **Test CPU and CLS**

   * In DevTools, compare:

     * Variable axis animation vs transform-only animation.
     * CLS score across common devices. ([debugbear.com][1])

---

## 7. Accessibility & UX Guardrails

1. **Respect reduced motion**

   ```css
   @media (prefers-reduced-motion: reduce) {
     .fx-word-inner,
     .hero-word {
       transition: none;
       animation: none;
       transform: none;
       font-variation-settings: "wght" 600; /* fixed state */
     }
   }
   ```

2. **Maintain legibility**

   * Avoid extreme skew/scale on body-sized text.
   * Keep contrast ratios compliant even at animation extremes.

3. **Semantic structure**

   * One semantic text node; mark decorative overlays as `aria-hidden="true"`.
   * Avoid duplicating text content for assistive tech.

---

## 8. Anti-Patterns to Avoid

* Animating `font-size` or `letter-spacing` on paragraph text.
* Applying different `font-variation-settings` to every word of a large sentence without reserving space (guaranteed CLS). ([Stack Overflow][10])
* Looping multi-axis variable font animations on large blocks of text.
* Relying on web-font swap without metric overrides on text-critical screens.

---

## 9. Implementation Checklist

**Design phase**

* [ ] Identify which text elements can safely reflow (hero lines) vs which must be fixed (body, legal, UI labels).
* [ ] Choose variable fonts & axes that align with brand personality.
* [ ] Decide “animation roles” (e.g., hero emphasis, micro-interactions).

**Engineering phase**

* [ ] Implement font loading with self-hosted variable fonts and metric overrides.
* [ ] For inline emphasis, use the **ghost + overlay** pattern.
* [ ] Use transforms/text-shadow/clip-path for most animation, with variable axes in narrow ranges on small sets of elements.
* [ ] Add `prefers-reduced-motion` handling and ARIA semantics.

**QA & performance**

* [ ] Verify CLS ~ 0 in Lighthouse / Web Vitals tooling on key pages. ([debugbear.com][1])
* [ ] Compare CPU usage between axis-animated and transform-only variants.
* [ ] Check legibility and motion comfort on low-end and mobile devices.

---

This strategy gives you a **repeatable pattern**: expressive animated typography layered on top of a stable text layout. You get the brand drama from variable fonts and modern text effects, but you operate inside performance and UX constraints that will hold up in a real product, not just a CodePen.

[1]: https://www.debugbear.com/blog/web-font-layout-shift?utm_source=chatgpt.com "Fixing Layout Shifts Caused by Web Fonts - DebugBear"
[2]: https://cssauthor.com/css-text-animation-examples/?utm_source=chatgpt.com "35+ CSS Text Animation Examples: Live CodePen Demos & Copy-Paste Code 2025"
[3]: https://developer.mozilla.org/docs/Web/CSS/Reference/Properties/font-variation-settings?utm_source=chatgpt.com "font-variation-settings - CSS | MDN"
[4]: https://css-irl.info/variable-font-animation-with-css-and-splitting-js/?utm_source=chatgpt.com "Variable Font Animation with CSS and Splitting JS"
[5]: https://stackoverflow.com/questions/74111171/reduce-css-layout-and-repaint-for-variable-font-animation?utm_source=chatgpt.com "Reduce CSS layout and repaint for variable font animation"
[6]: https://vincent.bernat.ch/en/blog/2024-cls-webfonts?utm_source=chatgpt.com "Fixing layout shifts caused by web fonts - vincent.bernat.ch"
[7]: https://www.precodecamp.com/blog/master-css-before-and-after-pseudo-elements-for-stunning-styles/?utm_source=chatgpt.com "Master CSS ::before and ::after Pseudo-elements for Stunning Styles"
[8]: https://thisdesigngirl.com/typography/variable-fonts-dynamic/?utm_source=chatgpt.com "Creating Dynamic Typography With Variable Fonts"
[9]: https://arxiv.org/html/2404.11614v1?utm_source=chatgpt.com "Dynamic Typography: Bringing Words to Life - arXiv.org"
[10]: https://stackoverflow.com/questions/79592482/prevent-cls-when-using-variable-font-with-font-variation-settings?utm_source=chatgpt.com "Prevent CLS when using variable font with font-variation-settings"
