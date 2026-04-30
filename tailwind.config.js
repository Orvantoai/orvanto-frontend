/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: "var(--purple)",
        indigo: "var(--indigo)",
        green: "var(--green)",
        dark: "var(--dark)",
        card: "var(--card)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--muted)",
      }
    },
  },
  plugins: [],
}
