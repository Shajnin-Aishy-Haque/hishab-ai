/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        google: ['"Plus Jakarta Sans"', 'Roboto', 'sans-serif'],
      },
      colors: {
        gDark: {
          bg: "#131314",
          surface: "#1e1f20",
          surfaceHigh: "#282a2c",
          surfaceHighest: "#333538",
          blue: "#a8c7fa",
          blueContainer: "#004a77",
          onBlueContainer: "#c2e7ff",
          green: "#a8dab5",
          greenContainer: "#0f5223",
          yellow: "#fde293",
          red: "#f2b8b5",
          redContainer: "#601410",
          outline: "#444746",
          textPrimary: "#e3e3e3",
          textSecondary: "#c4c7c5",
          textTertiary: "#8e918f"
        },
        gLight: {
          bg: "#ffffff",
          surface: "#f0f4f9",
          surfaceHigh: "#e9eef6",
          surfaceHighest: "#d3e3fd",
          blue: "#0b57d0",
          blueContainer: "#d3e3fd",
          onBlueContainer: "#041e49",
          green: "#137333",
          greenContainer: "#ceead6",
          red: "#b3261e",
          redContainer: "#f9dedc",
          outline: "#747775",
          textPrimary: "#1f1f1f",
          textSecondary: "#444746",
          textTertiary: "#747775"
        }
      }
    },
  },
  plugins: [],
}
