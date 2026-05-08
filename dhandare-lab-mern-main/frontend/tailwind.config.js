/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1D4ED8", // Medical Blue (used for buttons, headers)
        secondary: "#9333EA", // Purple accent (used for highlights)
      }
    },
  },
  plugins: [],
}