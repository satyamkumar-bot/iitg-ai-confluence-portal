import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        iitg: {
          navy: {
            950: "#060D17",
            900: "#0B192C",
            800: "#132A46",
            700: "#1E3E62",
            600: "#2B5685",
            500: "#3B72A8",
            100: "#E3EDF7",
            50: "#F0F5FA",
          },
          cyan: {
            600: "#0891B2",
            500: "#06B6D4",
            400: "#22D3EE",
            100: "#CFFAFE",
            50: "#ECFEFF",
          },
          teal: {
            600: "#0D9488",
            500: "#14B8A6",
          },
          gold: {
            500: "#F59E0B",
            600: "#D97706",
          }
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
