import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "400px",
      },
      colors: {
        night: {
          900: "#070b26",
          800: "#0c1340",
          700: "#131a55",
          600: "#1c2570",
        },
        neon: {
          pink: "#ff3aa6",
          blue: "#4ad6ff",
          yellow: "#ffd84a",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "cursive"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(74, 214, 255, 0.45)",
        "glow-pink": "0 0 25px rgba(255, 58, 166, 0.45)",
        "glow-soft": "0 0 40px -8px rgba(255,58,166,0.45)",
        "glow-blue-soft": "0 0 40px -8px rgba(74,214,255,0.35)",
      },
      backgroundImage: {
        "starry-night":
          "radial-gradient(ellipse at top, #1c2570 0%, #0c1340 40%, #070b26 100%)",
        aurora:
          "radial-gradient(60% 50% at 50% 0%, rgba(255,58,166,0.12) 0%, rgba(74,214,255,0.06) 35%, transparent 70%)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
