/**
 * Central Theme & Design System Tokens for Khatma & Athar (ختمة وأثر)
 * Extracted directly from official brand palette (Palette (1).png).
 * Single Source of Truth for TypeScript runtime (MapLibre, WebRTC, Charts) and Tailwind CSS v4.
 */

export const themeColors = {
  primary: {
    DEFAULT: '#5e203b', // Swatch 2: Deep Royal Burgundy / عودي ملكي
    dark: '#4a1a2f',    // Standardized Hover / Dark state
    light: '#7a2d4f',   // Light Burgundy accent
    muted: '#9d7988',   // Swatch 6: Dusty Mauve / موف هادئ
    subtle: 'rgba(94, 32, 59, 0.08)',
  },
  secondary: {
    DEFAULT: '#d0a45f', // Swatch 8: Golden Amber / ذهبي
    dark: '#d6a642',    // Rich Golden Amber
    muted: '#c8aa7b',   // Swatch 1 & 5: Sand Gold / رملي ذهبي
    light: '#e7d6b8',   // Swatch 7: Light Cream Beige / بيج رملي فاتح
    subtle: 'rgba(208, 164, 95, 0.12)',
  },
  accent: {
    DEFAULT: '#154a32', // Swatch 4: Deep Emerald Green / أخضر زمردي
    dark: '#0e3522',    // Standardized Hover / Dark state
    light: '#1e6645',   // Light Emerald
    subtle: 'rgba(21, 74, 50, 0.08)',
  },
  background: {
    DEFAULT: '#f8f7f3', // Swatch 3: Warm Off-White / بيج دافئ
    paper: '#ffffff',   // Clean White / أبيض ناصع
    subtle: '#f1efe9',  // Subtle grey-beige
  },
  text: {
    primary: '#0f172a',   // Slate 900
    secondary: '#475569', // Slate 600
    muted: '#94a3b8',     // Slate 400
  },
  glow: {
    level0: '#9d7988', // Swatch 6 (Dusty Mauve) - Standard
    level1: '#5e203b', // Swatch 2 (Burgundy) - Colored
    level2: '#154a32', // Swatch 4 (Emerald Green) - Pulsing
    level3: '#d0a45f', // Swatch 8 (Golden Amber) - Radiant
  },
} as const;

export const typographyScale = {
  hero: 'text-3xl sm:text-4xl md:text-5xl font-black leading-tight',
  h1: 'text-2xl sm:text-3xl font-black',
  h2: 'text-xl sm:text-2xl font-bold',
  h3: 'text-lg sm:text-xl font-bold',
  body: 'text-sm font-normal text-slate-600',
  caption: 'text-xs font-semibold text-slate-500',
  micro: 'text-[10px] font-bold text-slate-400',
} as const;

export type ThemeColors = typeof themeColors;
export type TypographyScale = typeof typographyScale;
