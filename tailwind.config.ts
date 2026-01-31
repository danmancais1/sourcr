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
      colors: {
        sourcr: {
          dark: "#363020",
          brown: "#605C4E",
          gold: "#A49966",
          sand: "#C7C7A6",
          mint: "#EAFFDA",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
