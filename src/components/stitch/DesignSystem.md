# Design System Specification: The Editorial Wellness Collective

## 1. Overview & Creative North Star: "The Digital Curator"
This design system rejects the "utility-only" aesthetic of traditional marketplaces. Our Creative North Star is **The Digital Curator**. We treat every service provider like a high-end gallery exhibit and every user interaction like a personalized consultation.

To move beyond the "template" look, we utilize **Intentional Asymmetry**. Instead of a rigid, centered grid, we use overlapping elements—such as images breaking the bounds of their containers—and dramatic shifts in typography scale. This creates a rhythmic, editorial flow that feels "Empowering" and "Modern" rather than just functional.

---

## 2. Colors: Tonal Depth & Soul
Our palette is a dialogue between the energy of **Vibrant Coral** and the grounding stability of **Deep Teal**.

### Core Palette
*   **Primary (Vibrant Coral - #AE2F34 / Container - #FF6B6B):** Use for "Empowering" actions. It represents the vibrant energy of beauty.
*   **Secondary (Deep Teal - #006C4F / Container - #67FCC6):** Used for "Trustworthy" elements, success states, and wellness-focused UI.
*   **Neutral (Surface - #F8F9FA):** A professional, breathable canvas.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Boundaries must be defined through background color shifts. A `surface-container-low` section sitting on a `surface` background is the only way to define blocks of content. We do not "box" our users; we guide them through tonal transitions.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper. 
*   **Level 0 (Background):** `surface` (#F8F9FA)
*   **Level 1 (Sections):** `surface-container-low` (#F3F4F5)
*   **Level 2 (Cards/Widgets):** `surface-container-lowest` (#FFFFFF)

### The "Glass & Gradient" Rule
For floating elements (like "Book Now" bars or mobile navigation), use **Glassmorphism**: 
*   `surface-container-lowest` at 80% opacity + 12px Backdrop Blur. 
*   **Signature Textures:** Use subtle linear gradients on CTAs (e.g., `primary` to `primary-container`) to provide a "soul" that flat hex codes cannot achieve.

---

### 3. Typography: Editorial Authority
We pair the high-fashion elegance of **Newsreader** (standing in for Playfair Display's serif qualities) with the clinical precision of **Inter**.

*   **Display & Headlines (Newsreader):** Use for storytelling and brand-led titles. The contrast between these serif headers and the UI makes the platform feel like a premium magazine.
*   **Title, Body, & Labels (Inter):** High-readability sans-serif for functional UI.

| Level | Font | Size | Weight/Style | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Display-LG** | Newsreader | 3.5rem | Light/Italic | Hero Marketing |
| **Headline-MD** | Newsreader | 1.75rem | Medium | Section Headers |
| **Title-LG** | Inter | 1.375rem | Medium | Card Titles |
| **Body-MD** | Inter | 0.875rem | Regular | Descriptions |
| **Label-MD** | Inter | 0.75rem | Bold (All Caps) | Navigation / Meta |

---

## 4. Elevation & Depth: Tonal Layering
We move away from the "shadow-heavy" look of 2010s apps toward **Ambient Light**.

*   **The Layering Principle:** Place a `surface-container-lowest` (#FFFFFF) card on a `surface-container-low` (#F3F4F5) background. This creates a soft, natural lift without a single shadow pixel.
*   **Ambient Shadows:** If a card must float (e.g., a hover state), use a shadow with a 24px blur, 0% spread, and 6% opacity. The shadow color should be a tinted version of `on-surface-variant` rather than pure black.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline-variant` at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components: Style & Execution

### Buttons (The "Soft-Sharp" Aesthetic)
*   **Primary:** `primary` background, `on-primary` text. Roundedness: `md` (12px).
*   **Secondary:** `secondary-container` background, `on-secondary-container` text.
*   **Tertiary:** No background. Text uses `primary` with a 2px underline on hover.

### Cards & Dashboard Widgets
*   **Rule:** Forbid divider lines. Separate content using `title-sm` headings and vertical white space (use the Spacing Scale: 1.5rem between content blocks).
*   **Style:** `surface-container-lowest` background, `xl` (24px) padding, and `lg` (16px) corners.

### Specialized Wellness UI (STYLING.md)
*   **Calendars:** Use `surface-container-low` for the calendar grid. Selected dates should use a `primary` circle. "Available" slots should use a subtle `secondary-fixed-dim` background with no border.
*   **Appointment Cards:** Use a vertical "Time-Bar" using the `secondary` color (2px wide) on the left edge instead of a full border. This creates a professional, timeline-oriented look.
*   **Chips:** Selection chips should use `surface-variant` with `on-surface-variant` text. When selected, transition to `primary-container` background.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace White Space:** If a screen feels cluttered, increase the padding; do not add lines.
*   **Use Asymmetry:** Place an image slightly off-center from the text block above it to create an "Editorial" feel.
*   **Nesting:** Always place white cards on light grey sections to define hierarchy.

### Don’t:
*   **Don't use 1px Borders:** This is the most important rule. Borders make the app look like a generic database.
*   **Don't use Dark Shadows:** Avoid heavy, muddy shadows. If it’s not subtle, it’s not premium.
*   **Don't use Inter for Headlines:** Using Inter for large headings makes the platform feel like a SaaS tool rather than a wellness marketplace. Always use Newsreader for headlines.
