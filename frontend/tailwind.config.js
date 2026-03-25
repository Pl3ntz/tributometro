/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── SURFACES (elevation, neutro-quente) ──
        surface: {
          0: '#111113',
          1: '#1A1A1E',
          2: '#232328',
          3: '#2C2C33',
          4: '#36363F',
        },
        // ── BORDERS ──
        line: {
          subtle: '#2A2A32',
          DEFAULT: '#3D3D48',
          strong: '#52525E',
        },
        // ── TEXT ──
        txt: {
          primary: '#EDEDF0',
          secondary: '#A0A0AE',
          tertiary: '#6B6B7B',
        },
        // ── ACCENT: AMBER/GOLD ──
        accent: {
          50: '#FFF8E6',
          100: '#FFEDB3',
          200: '#FFD666',
          300: '#F5B731',
          400: '#E5A216',
          500: '#C4880E',
          600: '#9E6D0B',
          700: '#7A5409',
          800: '#2E2008',
          900: '#1C1405',
        },
        // ── SECONDARY: STEEL BLUE ──
        steel: {
          300: '#7EB8DA',
          400: '#5A9BBF',
          500: '#4080A0',
          600: '#2D6480',
        },
        // ── SEMANTIC ──
        success: { DEFAULT: '#34D399', muted: '#1A3A2E' },
        error: { DEFAULT: '#F87171', muted: '#3B1C1C' },
        warning: { DEFAULT: '#FBBF24', muted: '#3D3210' },
        info: { DEFAULT: '#60A5FA', muted: '#1C2A3B' },
        // ── CHART ──
        chart: {
          1: '#E5A216',
          2: '#5A9BBF',
          3: '#F87171',
          4: '#34D399',
          5: '#A78BFA',
          6: '#FB923C',
          7: '#38BDF8',
          8: '#F472B6',
        },
      },
      fontFamily: {
        mono: ['"Fira Code"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(229, 162, 22, 0.15)',
        'glow-lg': '0 0 40px rgba(229, 162, 22, 0.2), 0 0 80px rgba(229, 162, 22, 0.08)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.6)',
        'elevated': '0 12px 40px rgba(0, 0, 0, 0.7)',
        'input-focus': '0 0 0 2px rgba(229, 162, 22, 0.35)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(145deg, #1A1A1E 0%, #1C1405 40%, #2E2008 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
