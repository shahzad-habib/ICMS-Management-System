/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ─── ICMS Brand Color Palette (60-30-10 Design System) ───────────────
      colors: {
        // 60% — Neutral Base
        background: {
          DEFAULT: '#F7FAFC',
          dark:    '#0a0f1e',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark:    '#131929',
        },

        // 30% — ICMS Brand Blue (Primary)
        brand: {
          DEFAULT: '#003E78',   // ICMS Brand Blue
          light:   '#0057a8',
          dark:    '#002850',
          50:      '#e6eef7',
          100:     '#b3cce5',
          900:     '#001c38',
        },

        // 10% — Admin Dashboard Card Accents
        card: {
          red:    '#a5361b',   // Danger / Absent
          purple: '#5c1383',   // Leave / Analytics
          orange: '#f38600',   // Warnings / Half Day
          green:  '#0e7816',   // Present / Success
          blue:   '#003E78',   // Default / Info
        },
      },

      // ─── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      // ─── Border Radius ────────────────────────────────────────────────────
      borderRadius: {
        xl2: '1rem',
        xl3: '1.5rem',
      },

      // ─── Box Shadow ───────────────────────────────────────────────────────
      boxShadow: {
        card:  '0 4px 24px rgba(0, 62, 120, 0.08)',
        hover: '0 8px 32px rgba(0, 62, 120, 0.16)',
      },
    },
  },
  plugins: [],
};
