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
        background: "var(--bg-primary)",
        surface: "var(--bg-surface)",
        subtle: "var(--bg-subtle)",
        foreground: "var(--text-primary)",
        muted: "var(--text-secondary)",
        border: "var(--border-subtle)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(9, 9, 11, 0.03), 0 1px 3px 0 rgba(9, 9, 11, 0.02)",
        card: "0 2px 8px -2px rgba(9, 9, 11, 0.05), 0 1px 3px -1px rgba(9, 9, 11, 0.03)",
        float: "0 12px 32px -4px rgba(9, 9, 11, 0.08), 0 4px 12px -2px rgba(9, 9, 11, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
