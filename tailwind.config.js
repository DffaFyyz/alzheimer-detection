/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        clinical: {
          bg: "#F7FAFC",
          ink: "#102A43",
          muted: "#627D98",
          line: "#D9E2EC",
          blue: "#2563EB",
          teal: "#0F766E",
        },
      },
      boxShadow: {
        panel: "0 12px 30px rgba(16, 42, 67, 0.06)",
      },
    },
  },
  plugins: [],
};
