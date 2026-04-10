# Design System Document: The Ethereal Archive

## 1. Overview & Creative North Star: "The Digital Curator"

This design system is built upon the philosophy of **"The Digital Curator."** In an era of disposable commerce, this system treats every circular product as an artifact of value. We move beyond the "app as a tool" and toward the "app as a gallery."

The Creative North Star is an experience that feels **Aspirational, Authoritative, and Architectural.** We achieve this by rejecting the standard "boxed" web. Instead, we use intentional asymmetry, overlapping elements that break the container, and a high-contrast typographic scale that mirrors premium editorial magazines. This isn't just a marketplace; it is a ledger of sustainability, where high whitespace and soft tonal layering create a sense of calm and trust.

---

## 2. Colors: Tonal Depth & The Forest Palette

Our palette is rooted in the "Deep Forest" (Sustainability) and "Soft Neutrals" (Luxury). We use color not just for decoration, but to define the physical architecture of the screen.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Structural boundaries must be defined solely through background color shifts. Use `surface-container-low` components against a `surface` background to create separation. Lines are a crutch; let the tonal shifts speak.

### Surface Hierarchy & Nesting
Treat the UI as a series of layered, fine-paper sheets. 
- **Base:** `surface` (#f8f9fa)
- **Nested Content:** Use `surface-container-low` (#f3f4f5) for large sections.
- **Floating Cards:** Use `surface-container-lowest` (#ffffff) to provide the highest contrast against the background, giving the item "importance" without a shadow.

### The "Glass & Gradient" Rule
To elevate the experience, use **Glassmorphism** for floating headers or navigation bars. Apply `surface` or `primary` colors at 80% opacity with a `20px` backdrop-blur. 
- **Signature Texture:** For primary CTAs, do not use a flat fill. Use a subtle linear gradient from `primary` (#012d1d) to `primary_container` (#1b4332) at a 135-degree angle to add "soul" and depth.

---

## 3. Typography: Editorial Authority

We use a dual-font system to balance modern tech with classic sophistication.

*   **Display & Headlines (Manrope):** This is our "Editorial" voice. Use `display-lg` and `headline-lg` with tight letter spacing and varying weights (Bold for impact, Light for subtext) to create a rhythmic hierarchy.
*   **Body & Labels (Inter):** Our "Functional" voice. This provides the precision and readability expected of an Apple-inspired interface.

**Hierarchy as Identity:** The massive contrast between a `display-lg` product title and a `label-sm` sustainability tag creates a premium, intentional look that separates this system from "generic" commerce apps.

---

## 4. Elevation & Depth: Tonal Layering

We reject traditional material shadows in favor of **Ambient Presence.**

*   **The Layering Principle:** Stacking is our primary method of elevation. A `surface-container-highest` navigation element should sit atop a `surface-container-low` body.
*   **Ambient Shadows:** If a card must "float" (e.g., a modal), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(25, 28, 29, 0.05);`. The shadow color is a tinted version of `on-surface`, never pure black.
*   **The "Ghost Border" Fallback:** For input fields or high-density lists where separation is critical, use a "Ghost Border": `outline-variant` (#c1c8c2) at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** Use for persistent AI verification overlays. A semi-transparent `secondary_container` with a heavy blur allows the rich forest greens of the background to bleed through, making the UI feel like part of the environment.

---

## 5. Components: Primatives & Custom Modules

### Buttons
- **Primary:** Rounded `full` (9999px). Gradient fill (`primary` to `primary_container`). White text. High horizontal padding (24px+).
- **Secondary:** Surface-container-highest fill, `on-surface` text. No border.
- **Tertiary:** Text-only with an underline that only appears on hover/interaction.

### Input Fields & Search
- **Style:** `surface-container-low` background. 
- **Border:** Ghost Border (15% opacity `outline-variant`).
- **Radius:** `md` (0.75rem).
- **Focus State:** Transition the Ghost Border to 100% opacity `primary`.

### Cards (The Product Passport)
- **Rule:** Forbid divider lines.
- **Layout:** Use `xl` (1.5rem) rounded corners. Use vertical whitespace (32px) to separate the product image from its metadata.
- **Sustainability Scoring:** Use circular progress indicators or "pills" utilizing `secondary` (#2c694e) for high scores, ensuring the green of sustainability is the hero.

### AI Verification Chips
- **Visuals:** Use a subtle glassmorphism effect. A small icon of a leaf or a spark, followed by "AI Verified" in `label-md`. Use `secondary_fixed` (#b1f0ce) as a soft background glow.

---

## 6. Do’s and Don’ts

### Do
- **Do** use "Breathing Room." If you think there is enough whitespace, add 8px more.
- **Do** overlap elements. Let a product image bleed out of its container slightly to break the "grid" feel.
- **Do** use `primary_fixed_dim` for subtle background highlights on selected states.

### Don't
- **Don’t** use 1px black or grey borders. This immediately cheapens the brand.
- **Don’t** use "Drop Shadows" (high opacity, low blur). They look like 2010-era software.
- **Don’t** crowd the "Product Passport" cards. Each item should feel like it has its own pedestal.
- **Don’t** use pure black (#000000). Use `on-background` (#191c1d) for a softer, more premium "ink" feel.
