/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'text-[#e8d4b8]',
    'text-cream',
    'hover:text-cream',
    'hover:text-[#e8d4b8]',
  ],
  theme: {
    fontFamily: {
      sans: ['var(--font-sans)'],
      mono: ['var(--font-mono)'],
    },
    extend: {
      colors: {
        black: '#121214',
        white: '#efeff1',
        cream: '#e8d4b8',
      }
    },
  },
  plugins: [],
}
