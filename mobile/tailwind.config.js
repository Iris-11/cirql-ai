/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // CIRQL Design Tokens — "The Digital Curator"
        primary: {
          DEFAULT: "#1F6F54",
          dark: "#012d1d",
          container: "#1b4332",
          light: "#2c694e",
        },
        secondary: {
          DEFAULT: "#2c694e",
          container: "#aeeecb",
          fixed: "#b1f0ce",
          "fixed-dim": "#95d4b3",
        },
        surface: {
          DEFAULT: "#faf9f6",
          cream: "#f5f2e9",
          "container-low": "#f3f4f5",
          "container": "#edeeef",
          "container-high": "#e7e8e9",
          "container-highest": "#e1e3e4",
          "container-lowest": "#ffffff",
        },
        "on-surface": "#191c1d",
        "on-primary": "#ffffff",
        outline: {
          DEFAULT: "#717973",
          variant: "#c1c8c2",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        accent: {
          gold: "#C49B5F",
          amber: "#E8A951",
        },
      },
      fontFamily: {
        "serif": ["NotoSerif"],
        "serif-medium": ["NotoSerif-Medium"],
        "serif-semibold": ["NotoSerif-SemiBold"],
        "serif-bold": ["NotoSerif-Bold"],
        "sans": ["Manrope"],
        "sans-medium": ["Manrope-Medium"],
        "sans-semibold": ["Manrope-SemiBold"],
        "sans-bold": ["Manrope-Bold"],
        "body": ["Inter"],
        "body-medium": ["Inter-Medium"],
        "body-semibold": ["Inter-SemiBold"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "ambient": "0 20px 40px rgba(25, 28, 29, 0.04)",
        "ambient-lg": "0 20px 40px rgba(25, 28, 29, 0.08)",
      },
    },
  },
  plugins: [],
};
