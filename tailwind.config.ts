import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#7C3AED",
          foreground: "#FFFFFF",
          50: "#F3EAFF",
          100: "#E4D1FF",
          200: "#C9A3FF",
          300: "#AD75FF",
          400: "#9247FF",
          500: "#7C3AED",
          600: "#6D28D9",
          700: "#5B21B6",
          800: "#4C1D95",
          900: "#3B0764",
        },
        accent: {
          DEFAULT: "#22C55E",
          foreground: "#FFFFFF",
          green: "#22C55E",
          amber: "#F59E0B",
          red: "#EF4444",
        },
        card: {
          DEFAULT: "#141420",
          foreground: "#E2E8F0",
        },
        surface: {
          DEFAULT: "#0A0A0F",
          raised: "#141420",
          overlay: "#1E1E2E",
        },
        muted: {
          DEFAULT: "#1E1E2E",
          foreground: "#94A3B8",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#141420",
          foreground: "#E2E8F0",
        },
        secondary: {
          DEFAULT: "#1E1E2E",
          foreground: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      boxShadow: {
        glow: "0 0 20px rgba(124, 58, 237, 0.3)",
        "glow-green": "0 0 20px rgba(34, 197, 94, 0.3)",
        "glow-sm": "0 0 10px rgba(124, 58, 237, 0.2)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
