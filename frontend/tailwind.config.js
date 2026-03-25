/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── NAVY (fundo principal) ──
        navy: {
          950: '#080E1A',
          900: '#0C1525',
          800: '#0F2440',
          700: '#163356',
          600: '#1D4470',
          500: '#2563EB',
        },
        // ── AMARELO (accent/destaque) ──
        gold: {
          50:  '#FFF9E6',
          100: '#FFF0BF',
          200: '#FFE080',
          300: '#FFD040',
          400: '#E5A216',
          500: '#C4880E',
          600: '#9E6D0B',
        },
        // ── TEXTO ──
        txt: {
          primary: '#FFFFFF',
          secondary: '#B8C4D6',
          tertiary: '#6B7FA0',
        },
        // ── SEMÂNTICO ──
        success: { DEFAULT: '#34D399' },
        error: { DEFAULT: '#F87171' },
        warning: { DEFAULT: '#FBBF24' },
        info: { DEFAULT: '#60A5FA' },
        // ── CHART ──
        chart: {
          1: '#E5A216', 2: '#60A5FA', 3: '#F87171', 4: '#34D399',
          5: '#A78BFA', 6: '#FB923C', 7: '#38BDF8', 8: '#F472B6',
        },
      },
      fontFamily: {
        mono: ['"Fira Code"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(229, 162, 22, 0.2)',
        'glow-lg': '0 0 40px rgba(229, 162, 22, 0.25), 0 0 80px rgba(229, 162, 22, 0.1)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.5)',
        'elevated': '0 12px 40px rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(145deg, #080E1A 0%, #0C1525 50%, #0F2440 100%)',
        'gradient-card': 'linear-gradient(180deg, #0F2440 0%, #0C1525 100%)',
      },
    },
  },
  plugins: [],
}
