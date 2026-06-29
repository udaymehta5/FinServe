/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        finBackground: '#FFFFFF',
        finCard: 'rgba(255, 255, 255, 0.85)',
        finGreen: '#00C766',
        finGreenHover: '#00A355',
        finBorder: '#E2E8F0',
        finText: '#1A2E25',
        finMuted: '#64748B',
        brand: {
          'green-dark': 'var(--brand-green-dark)',
          'green-mid': 'var(--brand-green-mid)',
          'green-light': 'var(--brand-green-light)',
          'green-border': 'var(--brand-green-border)',
          white: 'var(--brand-white)',
          'off-white': 'var(--brand-off-white)',
          'text-dark': 'var(--brand-text-dark)',
          'text-mid': 'var(--brand-text-mid)',
          'text-light': 'var(--brand-text-light)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
