/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'telegram-blue': '#0088cc',
        'telegram-dark': '#17212b',
        'telegram-darker': '#0e1621',
        'telegram-light': '#2b5278',
      },
    },
  },
  plugins: [],
}
