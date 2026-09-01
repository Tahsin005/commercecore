# Commerce Core — UI Design System & Aesthetic Guide

This document serves as the authoritative visual design guide for **Commerce Core**. All future UI components, pages, and feature additions must strictly adhere to the visual tokens, typography hierarchies, border specifications, and design patterns outlined below.

---

## 1. Core Visual Identity & Philosophy

Commerce Core embodies an **elegant, high-contrast, luxury e-commerce aesthetic**. It blends rich deep maroon shades with warm cream accents, soft rose blush tones, crisp white surfaces, and refined serif/sans-serif typography.

### Key Aesthetic Principles:
- **Rich Palette**: Deep maroon hues (`--maroon-900`) for headers, primary actions, and hero sections paired with warm cream (`--cream`) and rose blush (`--maroon-100` / `--maroon-50`).
- **Typography Contrast**: Editorial serif headers (`Playfair Display`) paired with clean, readable sans-serif body text (`Poppins`) and monospaced prices (`font-mono`).
- **Tactile Depth**: Subtle border definitions (`border-maroon-100`), smooth box shadows, and smooth micro-animations (`active:scale-95`, hover scale transitions).

---

## 2. Color Palette & Tokens

Referenced directly from [`client/app/globals.css`](client/app/globals.css).

### Primary Color Tokens

| Token Name | Hex Code | Usage & Placement |
|---|---|---|
| `--maroon-900` | `#321014` | Primary headers, primary buttons, hero background, active selected pills |
| `--maroon-800` | `#42151B` | Secondary header buttons, hover state for primary buttons, banner badges |
| `--maroon-700` | `#5B1E26` | Subtitles, loading spinners, focused border rings, secondary text |
| `--maroon-600` | `#7A2933` | Category counters, interactive icons, hover text |
| `--maroon-500` | `#8E3A43` | Uppercase tracking labels, muted metadata, icon defaults |
| `--maroon-200` | `#D9A6A3` | Subtle element borders, outline button borders, hero paragraph text |
| `--maroon-100` | `#F3E4E3` | Card divider lines (`border-maroon-100`), soft background accents, badge fills |
| `--maroon-50` | `#FAECEB` | Outline button hover backgrounds (`hover:bg-maroon-50`), soft pill highlights |
| `--cream` | `#D9C6B5` | High-contrast text on dark backgrounds, active badge text, logo hover highlights |
| `--off-white` | `#F7F7F7` | Main page background (`var(--background)`), product card image containers |
| `--white` | `#FFFFFF` | Card surfaces, modal dialogs, input field backgrounds |
| `--text` | `#333333` | Main body text (`var(--foreground)`) |

### Functional & Status Colors

| State | Background | Border | Text | Icon |
|---|---|---|---|---|
| **In-Stock / Success** | `bg-emerald-50` | `border-emerald-200` | `text-emerald-700` | `CheckCircle2` |
| **Out-of-Stock / Danger** | `bg-red-50` | `border-red-200` | `text-red-700` / `text-red-600` | `XCircle` / `Trash2` |
| **Featured Badge** | `bg-maroon-900` | `border-maroon-900` | `text-cream` | `Tag` |

---

## 3. Typography & Hierarchy

Commerce Core uses two primary Google Fonts loaded via Next.js Font Optimization in [`client/app/layout.tsx`](client/app/layout.tsx):

1. **Serif Heading Font**: `Playfair Display` (`--font-playfair`, Tailwind class `font-serif`)
2. **Sans-Serif Body Font**: `Poppins` (`--font-poppins`, Tailwind class `font-sans`, weights: 400, 500, 600, 700)
3. **Price & Numerical Font**: `font-mono` (System Monospace)

### Typography Scale & Hierarchy Table

| Element Type | Font Family | Size & Weight | Line Height & Tracking | Tailwind Classes |
|---|---|---|---|---|
| **Page / Hero Title** | `Playfair Display` | `36px - 40px` (Bold) | Tight | `font-serif text-3xl sm:text-4xl font-bold tracking-tight text-maroon-900` |
| **Section Title** | `Playfair Display` | `24px - 28px` (Bold) | Normal | `font-serif text-2xl font-bold text-maroon-900` |
| **Product Title** | `Playfair Display` | `18px - 24px` (Bold) | Normal | `font-serif text-lg sm:text-xl font-bold text-maroon-900` |
| **Body Text** | `Poppins` | `14px` (Regular) | `leading-relaxed` | `font-sans text-sm text-maroon-700/90` |
| **Micro / Subtitle** | `Poppins` | `12px` (Medium) | Normal | `font-sans text-xs text-maroon-700` |
| **Uppercase Label** | `Poppins` | `10px - 11px` (SemiBold) | Uppercase `tracking-wider` | `font-sans text-[10px] font-semibold uppercase tracking-wider text-maroon-500` |
| **Price Tag** | `Monospace` | `18px - 24px` (Bold) | Normal | `font-mono text-lg font-bold text-maroon-900` |

---

## 4. Borders, Corner Radii & Elevation

### Border Radius System (`globals.css`)

```css
--radius-sm: 4px;   /* Tailwind: rounded-sm */
--radius-md: 6px;   /* Tailwind: rounded-md */
--radius-lg: 8px;   /* Tailwind: rounded-lg */
--radius-xl: 12px;  /* Tailwind: rounded-xl / rounded-2xl */
```

| Radius Token | Class | Recommended Component Usage |
|---|---|---|
| **Small (`4px`)** | `rounded-sm` | Badges, tags, tiny metadata chips, category highlights |
| **Medium (`6px`)** | `rounded-md` | Buttons, input fields, quantity selectors, icon buttons |
| **Large (`8px`)** | `rounded-lg` | Logo containers, header navigation wrappers |
| **Extra Large (`12px+`)** | `rounded-xl` / `rounded-2xl` | Product cards, checkout section cards, hero banners, modals |
| **Full (`9999px`)** | `rounded-full` | Cart counter badges, wishlist heart button, category pill tabs |

### Border Styling Tokens

- **Default Surface Divider**: `border border-maroon-100`
- **Interactive Element Border**: `border border-maroon-200`
- **Focused State Ring**: `focus:ring-2 focus:ring-maroon-700 focus:outline-none`

### Box Shadows & Elevation

- **Card Default**: `shadow-md border border-maroon-100`
- **Card Hover State**: `hover:shadow-xl transition-all duration-300`
- **Primary Buttons**: `shadow-sm hover:shadow-md active:scale-[0.98]`
- **Floating Header / Hero**: `shadow-lg` / `shadow-xl`

---

## 5. UI Component Blueprints

### A. Primary Action Button
```tsx
<button className="px-4 py-2.5 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.98] text-white font-semibold text-xs rounded-md transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer">
  <span>Action Text</span>
</button>
```

### B. Secondary / Outline Button
```tsx
<button className="px-4 py-2.5 bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200 font-semibold text-xs rounded-md transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer">
  <span>Outline Action</span>
</button>
```

### C. Variant Size Selector Pill
```tsx
<button className="px-3.5 py-2 rounded-md border text-xs font-bold font-mono transition-all cursor-pointer bg-maroon-900 text-cream border-maroon-900 shadow-md ring-2 ring-maroon-700">
  <span>M</span>
</button>
```

### D. Form Input Field
```tsx
<input
  type="text"
  className="w-full px-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
/>
```

---

## 6. Micro-Interactions & Responsive Rules

- **Hover States**: All clickable buttons and cards must feature smooth background and shadow transitions (`transition-all duration-200`).
- **Active Click Feedback**: Buttons use `active:scale-[0.98]` or `active:scale-95` to give physical touch feedback.
- **Mobile First Spacing**: Mobile padding defaults to `px-4 py-6`, expanding to `sm:px-6 md:px-8 md:py-10` on desktop containers (`max-w-6xl` or `max-w-5xl`).
