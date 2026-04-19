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
        parchment: {
          light: "#f5e6c8",
          DEFAULT: "#e8d4a8",
          dark: "#c9a876",
          ink: "#3a2818",
        },
        treasure: {
          red: "#c0392b",
          green: "#27ae60",
          grey: "#7f8c8d",
          gold: "#d4af37",
        },
        mp: {
          red: "#e63946",
          ink: "#1a1a1a",
        },
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        treasure: "0 10px 30px -10px rgba(58, 40, 24, 0.35)",
        parchment:
          "inset 0 0 120px rgba(58,40,24,0.25), 0 10px 40px -10px rgba(58,40,24,0.4)",
      },
      keyframes: {
        "pulse-ring": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.18)", opacity: "0.4" },
        },
        "dash-flow": {
          to: { strokeDashoffset: "-24" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.4s ease-in-out infinite",
        "dash-flow": "dash-flow 1.2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
