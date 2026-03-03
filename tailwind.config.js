/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'text-cream',
    'text-[#f0e8d8]',
    'hover:text-cream',
    'hover:text-[#f0e8d8]',
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
        cream: '#f0e8d8',
      }
    },
  },
  plugins: [],
}
