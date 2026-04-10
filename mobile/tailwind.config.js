/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1F6F54", // Deep Heritage Green
        background: "#faf9f6", // Linen White
        cream: "#f5f2e9", // Warm Cream
        error: "#B00020", // Heritage Red
        "secondary-fixed": "#b1f0ce",
        "heritage-green": "#1F6F54",
        "linen-white": "#faf9f6",
        "warm-cream": "#f5f2e9",
      },
      fontFamily: {
        serif: ["NotoSerif_500Medium", "serif"],
        sans: ["Manrope_500Medium", "sans-serif"],
        "manrope-reg": ["Manrope_400Regular"],
        "manrope-med": ["Manrope_500Medium"],
        "manrope-bold": ["Manrope_700Bold"],
        "noto-reg": ["NotoSerif_400Regular"],
        "noto-med": ["NotoSerif_500Medium"],
        "noto-bold": ["NotoSerif_700Bold"],
      },
      borderRadius: {
        "2xl": "1.5rem", // Standard card corners
      },
      boxShadow: {
        premium: "0 20px 40px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
