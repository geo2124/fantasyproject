# ProDraft Design System

## Overview
The design system implements a strict, professional vibe heavily emphasizing structured layouts. It utilizes `tailwindcss v4` natively mapped to deep CSS variables injected into `:root` and `.dark` allowing instantaneous theme swapping without expensive rendering overhead.

## Theme Architecture
- **Persisted State**: Handled by Zustand `persist` middleware, pushing a class binding to `<html>` dynamically. 
- **Dark Mode**: Configured as the **DEFAULT** application theme. Deep blacks (`#050505`), subdued borders (`#262626`), and a bright Emerald Green (`#10B981`) accent. 
- **Light Theme**: Maintained as an explicit fallback. Never implemented by simply "inverting" hex codes. It consists of tailored grays, softer whites, to avoid burning retinas while keeping clarity.

## Typography
Fonts are fetched inside `index.css`:
- **`font-sans`** -> `Space Grotesk`. Used for heavy, highly structured headings (H1-H6) set strictly to `uppercase` with aggressive negative tracking (`-0.02em`).
- **`font-mono`** -> `JetBrains Mono`. Used strictly for `tabular-nums` data fields and small semantic micro-labels across the layout boundaries.
- **`font-inter`** -> Available for future generic prose and long-form writing inside CMS grids. 

## Utilities & Conventions
- **Subtle Grid Structure**: The `body` houses a repeating linear-gradient creating a subtle `32px by 32px` tech grid beneath everything.
- **Strictly Minimal Box Model**: Absolutely no `box-shadow` or heavily rounded `border-radius`. Cards are flat `bg-surface`, surrounded by single pixel `border-border`.
- **Global Transition Gate**: The `*` CSS selector strictly permits `200ms` `linear` transitions targeting strictly properties that do NOT trigger reflows (`opacity`, `color`, `background-color`, `border-color`). There is NO scaling/translating allowing rapid snappy navigation ideal for data ingestion.

## Standard Component Dictionary (`src/components/ui`)
The library exposes low-level composite parts built using `class-variance-authority` style `cn()` mapping using Tailwind utility maps. 

1. **Button (`Button.tsx`)**: 
   - `variant`: `primary` (emerald block), `secondary` (surface block), `outline`, `ghost`, `danger`.
2. **Card (`Card.tsx`)**: Flat pane structures exposing `CardHeader`, `CardTitle`, and `CardContent`.
3. **Table (`Table.tsx`)**: Fully styled technical generic `<table>` layouts utilizing the `tabular-nums` specifications inside cell bodies implicitly.
4. **Input (`Input.tsx`)**: Clean bordered focus-mode aware data entry forms.
5. **Badge (`Badge.tsx`)**: Tag indicators wrapping `font-mono` configurations perfect for indicating status or tracking items.

All layouts (`PublicLayout`, `AppLayout`, `AdminLayout`) max-out linearly at `max-w-[1500px]` avoiding endless distortion on super clear technical desktop viewports.
