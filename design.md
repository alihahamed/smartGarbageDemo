# Smart Village App - Design System Specification

This document defines the visual design system, color palette, typography guidelines, and layout specifications for the Smart Village App interactive demo.

---

## 1. Color Palette (SaaS Light Mode / Royal Blue & Light Cream Identity)

The app uses a clean, premium **light SaaS theme** with a strong **Royal Blue and Light Cream identity**. All text, borders, and backgrounds carry blue and cream tints instead of neutral greys.

| Color Token | Hex | Usage | Role |
| :--- | :--- | :--- | :--- |
| **Primary Accent (Vibrant Coral)** | `#FF5A36` | CTA button fills, active badges with light/dark text | High-visibility CTA |
| **App Background** | `#F8F3F0` | Page backdrop | Clean Light Cream base |
| **Card Surface** | `#FFFFFF` | Card/panel backgrounds | Primary surface |
| **Surface Alt (Cream Sage)** | `#EFEAE6` | Input backgrounds, borders, dividers, secondary fills | Cream-tinted neutral |
| **Text Primary (Deep Navy)** | `#0A1C33` | Headings, values, primary labels | High contrast navy |
| **Text Secondary (Steel Blue)** | `#4A607A` | Descriptions, captions, muted labels | Subtext blue-grey |
| **Royal Blue** | `#014BAA` | Section headers, icon accents, active nav text, borders | Brand identity |
| **Dark Blue** | `#0A3366` | Body text in cards, message content | Reading blue |
| **Placeholder (Steel)** | `#6B7F96` | Input placeholders | Subtle blue-grey hint |
| **Tint Background** | `#FAF6F3` | Input fills, autofill card fills, log panel backgrounds | Soft cream wash |
| **Hover Tint** | `#E5EFFC` | Button/card hover state backgrounds | Interactive feedback |
| **Warning/Alert (Red)** | `#EF4444` | Missed collections, failed GPS checks | Status |
| **Success Alert (Green)** | `#10B981` | Done status, paid checkmarks | Status |

### Contrast Guard Rules

- **Vibrant Coral (`#FF5A36`)** is **only** used as a **filled background** with high-contrast text (e.g., CTA buttons, active status badges). Never use as text color on light backgrounds.
- All text accents, active indicators, and icon highlights use **Royal Blue (`#014BAA`)** or **Deep Navy (`#0A1C33`)**.
- Borders use `#014BAA` with low opacity (`/8`, `/10`, `/12`) instead of grey `border-slate-*` classes.

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

* **App Shell Max-Width:** `480px` (centered on desktop viewports with a soft `#F8FAFC` backdrop).
* **Grid Layouts:**
  - **Home Screen Tile Grid:** `2x2` columns (`grid-template-columns: repeat(2, 1fr)`), Gap: `1rem` (16px).
  - **Stats & Dashboard Lists:** Stacked vertical list structure, Gap: `0.75rem` (12px).
* **Padding Constants:**
  - **Screen Padding:** `1.25rem` (20px) all sides.
  - **Card Inner Padding:** `1.25rem` (20px).
  - **List Item Padding:** `1rem` (16px).

---

## 4. Visual Tokens & Glass Panels

To give the app a premium, clean, SaaS-grade appearance:

* **Corner Radius (Rounding):**
  - **Large Panels & Screens:** `24px` (`1.5rem`)
  - **Cards & Modals:** `20px` (`1.25rem`)
  - **Buttons & Inputs:** `12px` (`0.75rem`)
  - **Badges:** `6px` (`0.375rem`)
* **Borders:**
  - Standard card borders: `1px solid rgba(1, 75, 170, 0.08)` (Royal Blue low opacity).
  - Active/Focus state borders: `1px solid rgba(1, 75, 170, 0.5)`.
  - Element borders: `border-[#014BAA]/10` or `border-[#014BAA]/12`.
* **Glass Panel:**
  - Background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 243, 240, 0.95) 100%)`
  - Border: `1px solid rgba(1, 75, 170, 0.08)`
  - Shadow: `0 10px 25px -5px rgba(1, 75, 170, 0.05), 0 8px 16px -6px rgba(0, 0, 0, 0.03)`
* **Scrollbars:** Blue-tinted thumbs (`#B4C6D8` / `#7FA3C7` on hover).
