import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        newsprint: {
          bg: "#F9F9F7",
          fg: "#111111",
          muted: "#E5E5E0",
          accent: "#CC0000",
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "'Times New Roman'", "serif"],
        sans: ["'Inter'", "'Helvetica Neue'", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Courier New'", "monospace"],
      },
      animation: {
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "slide-down": "slide-down 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
