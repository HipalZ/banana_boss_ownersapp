/**
 * Banana Boss Owner — District palette shared with the customer app.
 *
 * One source of truth for colour. Screens import from here instead of
 * hardcoding hex, so the app reads as one deep, premium dark surface.
 *
 * Palette intent (CRED-style fintech):
 *   - Near-black canvas, softly elevated charcoal cards
 *   - Near-white text on dark, muted greys for secondary copy
 *   - Banana-yellow as the single vivid accent (pops on black)
 *   - Hairline translucent-white borders; depth from elevation, not lines
 *   - Semantic colours brightened so they read on dark surfaces
 *
 * Token NAMES are kept stable from the previous theme so every screen that
 * already consumes tokens adopts the dark look automatically.
 */
import { useThemeStore } from '@/stores/themeStore';

export const darkColors = {
  // Brand / accent
  primary: '#F3CE5C',
  primaryDark: '#F3CE5C',
  onPrimary: '#1F1F1F',
  gold: '#B8935A',
  brass: '#C9A961',

  // Semantic (brightened for dark)
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#F87171',
  info: '#38BDF8',
  exportAction: { bg: '#23344C', text: '#B9D5FF', border: '#3B5575' },

  // Surfaces (Midnight system)
  surface: {
    canvas: '#101013',
    card: '#1A1A1E',
    raised: '#232328',
    border: 'rgba(255,255,255,0.10)',
    borderSoft: 'rgba(255,255,255,0.06)',
    // Distinct elevated ("ink") surface — active chips / hero cards
    ink: '#232328',
    inkRaised: '#2C2C31',
    inkBorder: 'rgba(255,255,255,0.10)',
    overlay: 'rgba(0,0,0,0.66)', // modal backdrop
    // Back-compat aliases (older screens used these as backgrounds) → dark now
    white: '#1A1A1E',
    base: '#101013',
    base200: '#232328',
  },

  // Text (light on dark)
  text: {
    base: '#FFFFFF',
    secondary: '#A8A8B0',
    muted: '#A8A8B0',
    faint: '#6F6F78',
    white: '#FFFFFF',
    onAccent: '#1F1F1F',
    onInk: '#FFFFFF',
    onInkMuted: '#A8A8B0',
  },

  // Soft tinted fills for report/category icon tiles (translucent on dark)
  tint: {
    sky: { bg: 'rgba(56,189,248,0.14)', fg: '#7DD3FC' },
    rose: { bg: 'rgba(248,113,113,0.14)', fg: '#FCA5A5' },
    violet: { bg: 'rgba(167,139,250,0.16)', fg: '#C4B5FD' },
    amber: { bg: 'rgba(251,191,36,0.15)', fg: '#FCD34D' },
    green: { bg: 'rgba(74,222,128,0.14)', fg: '#86EFAC' },
    accent: { bg: 'rgba(255,228,92,0.14)', fg: '#FFE45C' },
  },

  badge: {
    paid: { bg: 'rgba(74,222,128,0.16)', text: '#86EFAC' },
    pending: { bg: 'rgba(251,191,36,0.16)', text: '#FCD34D' },
    veg: { bg: 'rgba(74,222,128,0.14)', text: '#86EFAC' },
    nonVeg: { bg: 'rgba(248,113,113,0.14)', text: '#FCA5A5' },
    vegan: { bg: 'rgba(251,191,36,0.14)', text: '#FCD34D' },
  },
} as const;

// Lemon Zest mirrors the diner app's light palette.
export const lightColors = {
  ...darkColors,
  primary: '#F4D03F', primaryDark: '#F4D03F',
  gold: '#8A650F', brass: '#A77A15',
  success: '#2E7D32', warning: '#9A6500', danger: '#C53D3D', info: '#176F9D',
  exportAction: { bg: '#EAF2FF', text: '#2457B5', border: '#C9DDFB' },
  surface: {
    canvas: '#FAF9F6', card: '#FFFFFF', raised: '#FAF8F1',
    border: '#EFE6C8', borderSoft: 'rgba(239,230,200,0.58)',
    ink: '#FAF8F1', inkRaised: '#F5F0E3', inkBorder: '#EFE6C8',
    overlay: 'rgba(31,31,31,0.48)', white: '#FFFFFF', base: '#FAF9F6', base200: '#FAF8F1',
  },
  text: {
    base: '#1F1F1F', secondary: '#6B6B6B', muted: '#6B6B6B', faint: '#888888',
    white: '#FFFFFF', onAccent: '#1F1F1F', onInk: '#1F1F1F', onInkMuted: '#6B6B6B',
  },
  tint: {
    sky: { bg: '#E9F6FC', fg: '#176F9D' },
    rose: { bg: '#FDECEC', fg: '#C53D3D' },
    violet: { bg: '#F1EDFC', fg: '#6747B8' },
    amber: { bg: '#FFF5D8', fg: '#8A650F' },
    green: { bg: '#E9F5E9', fg: '#2E7D32' },
    accent: { bg: '#FFF7D8', fg: '#8A650F' },
  },
  badge: {
    paid: { bg: '#E9F5E9', text: '#2E7D32' },
    pending: { bg: '#FFF5D8', text: '#8A650F' },
    veg: { bg: '#E9F5E9', text: '#2E7D32' },
    nonVeg: { bg: '#FDECEC', text: '#C53D3D' },
    vegan: { bg: '#FFF5D8', text: '#8A650F' },
  },
} as const;

// Theme tokens are resolved at render time. The navigator refreshes when the
// mode changes, so existing screens can share these semantic roles.
function themed<T extends object>(dark: T, light: object): T {
  return new Proxy(dark, {
    get(_target, key) {
      const active = useThemeStore.getState().mode === 'light' ? light : dark;
      const value = Reflect.get(active, key);
      return value && typeof value === 'object'
        ? themed(Reflect.get(dark, key) as object, Reflect.get(light, key) as object)
        : value;
    },
  });
}

export const colors = themed(darkColors, lightColors);
