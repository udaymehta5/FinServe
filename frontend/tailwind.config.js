/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        finBackground: '#050505',
        finCard: '#0F0F0F',
        finGreen: '#00FF88',
        finGreenHover: '#00D973',
        finBorder: '#1B1B1B',
        finText: '#FFFFFF',
        finMuted: '#9CA3AF',
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
