import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Aspecta", "var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
      },
      colors: {
        "deep-teal": {
          50: "#edf8f5",
          100: "#daf1ea",
          200: "#b6e2d6",
          300: "#91d4c1",
          400: "#6cc6ac",
          500: "#47b898",
          600: "#399379",
          700: "#2b6e5b",
          800: "#1d493d",
          900: "#0e251e",
          950: "#0a1a15",
        },
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0, 0, 0, 0.15)",
        "deep-teal-glow": "0 0 20px rgba(71, 184, 152, 0.15)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
