/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#0b1220",
        border: "#dfe4ea",
        input: "#dfe4ea",
        ring: "#0038a8",
        card: { DEFAULT: "#ffffff", foreground: "#0b1220" },
        muted: { DEFAULT: "#eef2f7", foreground: "#5b6472" },
        primary: { DEFAULT: "#0038a8", foreground: "#ffffff" },
        secondary: { DEFAULT: "#eaf0fb", foreground: "#0038a8" },
        accent: { DEFAULT: "#fcd116", foreground: "#3a2e00" },
        destructive: { DEFAULT: "#ce1126", foreground: "#ffffff" },
        success: { DEFAULT: "#12805c", foreground: "#ffffff" },
      },
    },
  },
  plugins: [],
};
