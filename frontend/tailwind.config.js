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
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
