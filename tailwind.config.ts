import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mp: {
          // Primary / accent
          red: "#DC1E44",
          "red-dark": "#B31739",
          // Background accent (hero, ruban, gradient)
          coral: "#F25353",
          orange: "#F7945B",
          // Backgrounds doux
          sky: "#B9DBFF",
          "sky-soft": "#E6F0FF",
          white: "#F8FBFF",
          // Textes
          ink: "#334155",
          "ink-soft": "#64748B",
          "white-text": "#FFFFFF",
          // Sakura accents (utilitaire pour pétales)
          sakura: "#FDD0E0",
          "sakura-core": "#F48BB2",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        display: ["var(--font-barlow)", "system-ui", "sans-serif"],
        body: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        mp: "0 10px 30px -10px rgba(220, 30, 68, 0.25)",
        "mp-card":
          "0 10px 35px -10px rgba(51, 65, 85, 0.18), 0 2px 6px -2px rgba(51, 65, 85, 0.08)",
        "mp-strong":
          "0 20px 45px -15px rgba(220, 30, 68, 0.35), 0 4px 10px -2px rgba(220, 30, 68, 0.18)",
      },
      keyframes: {
        "pulse-ring": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.18)", opacity: "0.4" },
        },
        "dash-flow": {
          to: { strokeDashoffset: "-24" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "torii-bounce": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-10px) scale(1.04)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.4s ease-in-out infinite",
        "dash-flow": "dash-flow 1.2s linear infinite",
        "float-slow": "float-slow 4s ease-in-out infinite",
        "torii-bounce": "torii-bounce 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
