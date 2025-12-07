# UI Design Principles - Concentric Radii Standard

## Wrapped Components with Concentric Radii

When creating UI components that wrap child elements (like toolbars, button groups, popovers), follow these optical design principles:

### 1. Even Optical Margins

**Rule**: All padding values must be equal on all sides for wrapped containers.

```css
/* ✅ CORRECT - Even optical margins */
.container {
    padding: 8px; /* Same top, right, bottom, left */
}

/* ❌ INCORRECT - Asymmetric margins */
.container {
    padding: 6px 8px; /* Different vertical/horizontal */
}
```

**Rationale**: Uneven padding creates visual weight imbalance and makes the design feel amateurish.

---

### 2. Concentric Border-Radius Calculation

**Formula**: `Container Radius = Button Radius + Padding`

**Example**:
- Button `border-radius: 6px`
- Container `padding: 8px`
- Therefore: Container `border-radius: 14px` (6 + 8)

```css
/* ✅ CORRECT - Concentric radii */
.bubbleMenu {
    padding: 8px;
    border-radius: 14px; /* 6px + 8px */
}

.button {
    border-radius: 6px;
}
```

**Visual Test**: When a button touches the container edge, the curvatures should flow seamlessly without creating sharp corners or odd gaps.

---

### 3. Implementation Checklist

For any wrapped component (toolbar, popover, button group):

- [ ] Measure button/child `border-radius` (R)
- [ ] Determine padding needed for visual breathing room (P)
- [ ] Set container `padding: P` (equal all sides)
- [ ] Calculate container `border-radius: R + P`
- [ ] Add CSS comment documenting the calculation

**Example Implementation**:

```css
/* BubbleMenu - Concentric Radii Pattern */
.bubbleMenu {
    padding: 8px;                    /* P = 8px */
    border-radius: 14px;             /* 6px + 8px */
    /* Comment: Container radius = button radius (6px) + padding (8px) = 14px */
}

.button {
    border-radius: 6px;              /* R = 6px */
}
```

---

### 4. Common Patterns

| Button Radius | Padding | Container Radius | Use Case |
|---------------|---------|------------------|----------|
| 3px | 4px | 7px | Compact toolbars |
| 4px | 6px | 10px | Standard buttons |
| 6px | 8px | 14px | Touch-friendly UI |
| 8px | 10px | 18px | Prominent CTAs |

---

### 5. Applied Example: EditorBubbleMenu

**File**: `EditorBubbleMenu.module.css`

```css
.bubbleMenu {
    padding: 8px;                       /* Even margins all sides */
    border-radius: 14px;                /* 6px button + 8px padding = 14px */
}

.button {
    border-radius: 6px;                 /* Base radius for all buttons */
}
```

**File**: `SizeDropdown.module.css`, `EmotionDropdown.module.css`

```css
.trigger {
    border-radius: 6px;                 /* Matches bubble menu buttons */
}
```

---

## Violation Detection

**Visual Indicators of Non-Concentric Design**:
1. Buttons appear to "pinch" the container edge
2. Asymmetric spacing around buttons
3. Sharp corners form where curves should flow
4. Different visual weight on different sides

---

## Documentation Standard

**When creating wrapped components**, always add a comment explaining the concentric calculation:

```css
.container {
    padding: 10px;
    border-radius: 16px;  /* 6px child + 10px padding = 16px for concentricity */
}
```

This makes the design intentional and maintainable.
