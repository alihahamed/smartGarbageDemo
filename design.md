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
| **Text Secondary (Steel Blue)** | `#000000` | Descriptions, captions, muted labels | Subtext blue-grey |
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
* **Hero / Large Value:** `1.875rem` (30px) or `2.25rem` (36px) / Line height `1.1`
* **Card / Form / Normal Headings:** `1rem` (16px) / Line height `1.5`
* **Subheadings / Details / Badges / Captions:** `0.75rem` (12px) / Line height `1.5` or `1`
* **No `text-xs` or `text-sm` classes:** Tailored utility overrides (e.g. `text-[12px]`, `text-[16px]`) are used everywhere on mobile to guarantee readability and strict adherence to the 12px/16px scale.

---

## 3. Button Specifications

All interactive buttons and action selectors have been reskinned and scaled:

* **Primary CTAs (Royal Blue Pill):** 
  - **Fills:** Royal Blue (`#014BAA`) background with high-contrast white text.
  - **Sizing & Padding:** 
    - *Standard:* Tightly padded pill CTA with `pl-6 pr-1.5 py-[5px] rounded-full`.
    - *Compact (Login & Collector Console):* Tightly padded pill CTA with `pl-6 pr-1.5 py-[3px] rounded-full`.
  - **Typography:** Text size `15px` (`text-[15px] font-medium`).
  - **Icon Wrapper:** 
    - *Standard:* Fully rounded trailing circle badge in Cream (`#FAF6F3`) background of size `w-13 h-13` and `min-h-[50px] min-w-[50px]`.
    - *Compact (Login & Collector Console):* Fully rounded trailing circle badge in Cream (`#FAF6F3`) background of size `w-11 h-11` and `min-h-[44px] min-w-[44px]`.
  - **Icon Details:** 
    - *Standard:* Lucide icons scaled up to `size={22}` and colored in Royal Blue (`#014BAA`).
    - *Compact (Login & Collector Console):* Lucide icons scaled to `size={18}` and colored in Royal Blue (`#014BAA`).
* **Filter and Action Pills:**
  - **Pills:** Compact fully rounded pills with `py-[7px] px-3.5` and `text-[12px]`.
* **Grid and Card Buttons:**
  - **Sizing:** `p-3` (12px) scaled to `py-[13px] px-3`, and `p-4` (16px) scaled to `py-[17px] px-4` to add the +2px height requirement.

---

## 4. Layout & Structure (Mobile-First)

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

## 5. Visual Tokens & Glass Panels

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
* **Navbar:** Underlaid with a bottom-to-top linear gradient (`bg-gradient-to-t from-[#014BAA]/33 via-white/95 to-white/95`) spanning the bottom 1/3 of the screen.

