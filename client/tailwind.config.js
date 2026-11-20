/** Tailwind reads every value from the CSS design tokens in src/styles/tokens.css. */
const v = (name) => `var(--${name})`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    // 8px spacing scale (plus 4px half-step for fine adjustments).
    spacing: {
      0: '0', px: '1px', 0.5: '4px', 1: '8px', 2: '16px', 3: '24px', 4: '32px', 5: '40px',
      6: '48px', 7: '56px', 8: '64px', 10: '80px', 12: '96px', 16: '128px',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      bg: v('color-bg'),
      surface: v('color-surface'),
      'surface-2': v('color-surface-2'),
      text: v('color-text'),
      muted: v('color-muted'),
      border: v('color-border'),
      accent: v('color-accent'),
      'accent-strong': v('color-accent-strong'),
      'accent-soft': v('color-accent-soft'),
      'on-accent': v('color-on-accent'),
      danger: v('color-danger'),
      success: v('color-success'),
    },
    borderRadius: { none: '0', sm: v('radius-sm'), md: v('radius-md'), lg: v('radius-lg'), full: '9999px' },
    boxShadow: { none: 'none', sm: v('shadow-sm'), md: v('shadow-md'), lg: v('shadow-lg') },
    fontFamily: { heading: v('font-heading'), body: v('font-body') },
    fontSize: {
      xs: v('text-xs'), sm: v('text-sm'), base: v('text-base'), lg: v('text-lg'),
      xl: v('text-xl'), '2xl': v('text-2xl'), '3xl': v('text-3xl'), display: v('text-display'),
    },
    extend: {
      maxWidth: { content: '72rem' },
      minHeight: { touch: '44px' },
      minWidth: { touch: '44px' },
    },
  },
  plugins: [],
};
