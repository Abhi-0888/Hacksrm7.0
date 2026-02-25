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
        background: "#050507",
        bg2: "#09090e",
        foreground: "#eeeef8",
        primary: "#b4f500", // Lime Green
        secondary: "#00f5c8", // Teal
        accent: "#f5a800", // Gold
        danger: "#f5003d",
        panel: "#0d0d15",
        panel2: "#111119",
        border: "#1c1c2e",
        muted: "#52526e",
        dim: "#252538",
      },
      fontFamily: {
        mono: ["var(--font-share-tech-mono)", "monospace"],
        display: ["var(--font-bebas-neue)", "sans-serif"],
        ui: ["var(--font-rajdhani)", "sans-serif"],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-fast': 'pls 1.8s ease-in-out infinite',
      },
      keyframes: {
        pls: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(180,245,0,.4)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 0 5px rgba(180,245,0,0)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
