import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1d3328",
        forest: "#244b38",
        sage: "#e9eee7",
        cream: "#f7f7f2",
        muted: "#6d776f",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
      boxShadow: {
        card: "0 16px 40px rgba(29, 51, 40, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
