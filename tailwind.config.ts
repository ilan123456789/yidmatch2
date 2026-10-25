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
        brand: {
          navy: "#081c3b",
          navyDark: "#040f22",
          navyLight: "#132d59",
          blue: "#1e72c8",
          blueHover: "#165ea8",
          blueLight: "#e9f2fb",
          gold: "#f59e0b",
          goldLight: "#fef3c7",
          goldDark: "#b45309",
        },
      },
    },
  },
  plugins: [],
};
export default config;
