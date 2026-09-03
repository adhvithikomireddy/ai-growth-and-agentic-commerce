/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F8F4",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#166534",
          hover: "#14532d",
          light: "#DCFCE7",
          soft: "#F0FDF4",
          border: "#BBF7D0",
        },
        accent: {
          DEFAULT: "#15803D",
          dark: "#14532D",
          light: "#86EFAC",
        },
        charcoal: {
          DEFAULT: "#172018",
          secondary: "#475548",
          muted: "#667067",
          border: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
