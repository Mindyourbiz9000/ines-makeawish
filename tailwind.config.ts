import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
      },
      backgroundImage: {
        "starry-night":
          "radial-gradient(ellipse at top, #1c2570 0%, #0c1340 40%, #070b26 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
