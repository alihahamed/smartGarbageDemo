# Smart Village App - Design System Specification

This document defines the visual design system, color palette, typography guidelines, and layout specifications for the Smart Village App interactive demo.

---

## 1. Color Palette (Dark Theme / Glassmorphism)

Based on the **Leafy Lemon** and **Greenish Black** palette, the app will use a premium, high-contrast dark theme inspired by organic modernism and glowing civic UI elements.

| Color Token | Hex / HSL | Usage | Role |
| :--- | :--- | :--- | :--- |
| **Primary Accent (Leafy Lemon)** | `#BEF000` / `hsl(72, 100%, 47%)` | Buttons, Active states, Highlights, Focus borders | High-visibility CTA |
| **Base Background (Pitch Black)**  | `#000000` / `hsl(0, 0%, 0%)`   | App background | Pure screen depth |
| **Surface Dark (Greenish Black)** | `#0F6441` / `hsl(156, 74%, 22%)` | Card backgrounds, panels, navigation containers | Secondary structure |
| **Surface Medium (Moss Slate)** | `#162E23` / `hsl(154, 35%, 14%)` | Card borders, secondary actions, inputs | Tertiary utility |
| **Text Primary (Snow)** | `#F0FDF4` / `hsl(133, 60%, 97%)` | Large headings, critical labels | High contrast |
| **Text Secondary (Sage)** | `#8FA399` / `hsl(150, 11%, 60%)` | Descriptions, captions, helper texts | Subtext |
| **Warning/Alert (Tangerine)** | `#FB8500` / `hsl(32, 100%, 49%)` | Missed collections, failed GPS checks | Status |
| **Success Alert (Lime Glow)** | `#2BE080` / `hsl(148, 74%, 52%)` | Done status, paid checkmarks | Status |

---

## 2. Typography ("DM Sans")

We use the Google Font **"DM Sans"** for a clean, friendly, geometric sans-serif aesthetic. Under strict design guidelines, only two font weights are permitted across the entire application:

* **Medium (`font-weight: 500`):** Used for main headings (`h1`, `h2`, `h3`), navigation controls, active items, badges, actions, and prominent highlight text.
* **Light (`font-weight: 300`):** Used for body text, descriptions, secondary metadata, tables, forms, captions, and secondary elements.

> [!IMPORTANT]
> **Strict Font Weight Rule:** Semibold (600), Bold (700), Extrabold (800), and Black (900) weights are strictly prohibited. All elements requiring emphasis must use `font-weight: 500` (Medium) combined with appropriate size/color contrast, rather than heavier weights.

### Text Size Scale
* **Hero / Large Value:** `2.25rem` (36px) / Line height `1.1`
* **Heading 1:** `1.5rem` (24px) / Line height `1.2`
* **Heading 2:** `1.25rem` (20px) / Line height `1.3`
* **Body Text:** `1rem` (16px) / Line height `1.5`
* **Small / Helper Text:** `0.875rem` (14px) / Line height `1.5`
* **Micro / Badge Text:** `0.75rem` (12px) / Line height `1`

---

## 3. Layout & Structure (Mobile-First)

The demo is optimized for mobile-first interactions simulating a citizen's or field collector's smartphone.

* **App Shell Max-Width:** `480px` (centered on desktop viewports with a deep `#000000` backdrop to mimic a phone device body).
* **Grid Layouts:**
  - **Home Screen Tile Grid:** `2x2` columns (`grid-template-columns: repeat(2, 1fr)`), Gap: `1rem` (16px).
  - **Stats & Dashboard Lists:** Stacked vertical list structure, Gap: `0.75rem` (12px).
* **Padding Constants:**
  - **Screen Padding:** `1.25rem` (20px) all sides.
  - **Card Inner Padding:** `1.25rem` (20px).
  - **List Item Padding:** `1rem` (16px).

---

## 4. Visual Tokens & Glassmorphism

To give the app a premium, glowing, high-fidelity appearance:

* **Corner Radius (Rounding):**
  - **Large Panels & Screens:** `24px` (`1.5rem`) - Matches the organic roundness in the Leafy Lemon color card.
  - **Cards & Modals:** `20px` (`1.25rem`)
  - **Buttons & Inputs:** `12px` (`0.75rem`)
  - **Badges:** `6px` (`0.375rem`)
* **Borders:**
  - Standard card borders: `1px solid rgba(190, 240, 0, 0.15)` (Leafy Lemon with low opacity over Greenish Black).
  - Active/Focus state borders: `1.5px solid #BEF000` (Glow accent).
* **Gradients & Shadows:**
  - Main background gradient: `radial-gradient(circle at top left, #0F6441 0%, #000000 80%)`.
  - Accent card gradient: `linear-gradient(135deg, rgba(15, 100, 65, 0.4) 0%, rgba(5, 15, 11, 0.9) 100%)`.
  - Glow Shadow: `box-shadow: 0 0 20px rgba(190, 240, 0, 0.12)`.
