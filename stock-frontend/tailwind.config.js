/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0d0e11',
          card: '#1a1b1e',
          hover: '#22232a',
        },
        border: {
          DEFAULT: '#2a2b2e',
        },
        text: {
          primary: '#ffffff',
          secondary: '#858ca2',
          muted: '#5a6172',
        },
        green: {
          stock: '#16c784',
        },
        red: {
          stock: '#ea3943',
        },
        blue: {
          accent: '#3861fb',
        },
      },
    },
  },
  plugins: [],
}
