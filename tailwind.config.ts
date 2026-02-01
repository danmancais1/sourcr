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
        /* Cryptix-style: dark neutral bg, white/grey text, vibrant teal accent only */
        "deep-teal": {
          50: "#F1F1F1",
          100: "#E5E5E5",
          200: "#B0B0B0",
          300: "#909090",
          400: "#01CD9E",
          500: "#01B38C",
          600: "#019979",
          700: "#2a2f34",
          800: "#22262a",
          900: "#1e2226",
          950: "#1A1C1F",
        },
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0, 0, 0, 0.15)",
        "deep-teal-glow": "0 0 20px rgba(1, 205, 158, 0.2)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
