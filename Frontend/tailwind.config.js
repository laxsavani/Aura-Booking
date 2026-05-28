/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          dark: "var(--primary-dark)",
          light: "var(--primary-light)",
          xlight: "var(--primary-xlight)"
        },
        teal: {
          DEFAULT: "var(--teal)",
          dark: "var(--teal-dark)",
          light: "var(--teal-light)"
        },
        sidebar: "var(--sidebar)",
        brand: {
          bg: "var(--bg)",
          border: "var(--border)",
          text: "var(--text)",
          muted: "var(--muted)",
          hint: "var(--hint)",
        },
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-hover)",
        btn: "var(--shadow-btn)",
      },
      fontFamily: { sans: ["Inter", "sans-serif"], display: ["Playfair Display", "serif"] },
      borderRadius: { card: "16px", btn: "10px", pill: "50px" },
    },
  },
  plugins: [],
};
