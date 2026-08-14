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
        joint: {
          green: '#55C72E',
          yellow: '#D4A017',
          red: '#D32F2F',
          gray: '#555555',
        }
      }
    },
  },
  plugins: [],
};
export default config;