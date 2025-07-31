/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        neon: {
          blue: "#00f5ff",
          green: "#39ff14",
          purple: "#bf00ff",
          pink: "#ff10f0",
          orange: "#ff8c00",
        },
        glass: {
          light: "rgba(255, 255, 255, 0.05)",
          medium: "rgba(255, 255, 255, 0.1)",
          dark: "rgba(0, 0, 0, 0.1)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
        float: "float3d 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow3d 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fire-cursor": "fire-cursor 0.5s ease-out",
        "fire-trail": "fire-trail 0.5s ease-out forwards",
        "modal-enter": "modal-enter 0.3s ease-out",
        "modal-exit": "modal-exit 0.3s ease-in",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-in",
      },
      keyframes: {
        glow: {
          "0%": {
            boxShadow: "0 0 5px #00f5ff, 0 0 10px #00f5ff, 0 0 15px #00f5ff",
            transform: "perspective(1000px) rotateX(0deg) scale(1)",
          },
          "100%": {
            boxShadow: "0 0 10px #00f5ff, 0 0 20px #00f5ff, 0 0 30px #00f5ff",
            transform: "perspective(1000px) rotateX(-2deg) scale(1.02)",
          },
        },
        float3d: {
          "0%, 100%": {
            transform: "translateY(0px) rotateX(0deg)",
          },
          "50%": {
            transform: "translateY(-10px) rotateX(2deg)",
          },
        },
        "pulse-glow3d": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 20px rgba(0, 245, 255, 0.4), 0 4px 15px rgba(0, 0, 0, 0.1)",
            transform: "perspective(1000px) rotateX(0deg) scale(1)",
          },
          "50%": {
            opacity: "0.8",
            boxShadow: "0 0 40px rgba(0, 245, 255, 0.8), 0 8px 25px rgba(0, 0, 0, 0.2)",
            transform: "perspective(1000px) rotateX(-2deg) scale(1.02)",
          },
        },
        "fire-cursor": {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "50%": { transform: "scale(1.2) rotate(180deg)" },
          "100%": { transform: "scale(1) rotate(360deg)" },
        },
        "fire-trail": {
          "0%": {
            transform: "scale(1) rotate(0deg)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(0.3) rotate(180deg)",
            opacity: "0",
          },
        },
        "modal-enter": {
          "0%": {
            transform: "perspective(1000px) rotateX(-10deg) scale(0.8)",
            opacity: "0",
          },
          "100%": {
            transform: "perspective(1000px) rotateX(0deg) scale(1)",
            opacity: "1",
          },
        },
        "modal-exit": {
          "0%": {
            transform: "perspective(1000px) rotateX(0deg) scale(1)",
            opacity: "1",
          },
          "100%": {
            transform: "perspective(1000px) rotateX(-10deg) scale(0.8)",
            opacity: "0",
          },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "3d": "0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        "3d-hover": "0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        glow: "0 0 20px rgba(0, 245, 255, 0.4)",
        "glow-lg": "0 0 40px rgba(0, 245, 255, 0.6)",
        neon: "0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor",
        "neon-lg": "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor",
      },
      perspective: {
        1000: "1000px",
        1500: "1500px",
        2000: "2000px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    ({ addUtilities }) => {
      const newUtilities = {
        ".perspective-1000": { perspective: "1000px" },
        ".perspective-1500": { perspective: "1500px" },
        ".perspective-2000": { perspective: "2000px" },
        ".transform-3d": { transformStyle: "preserve-3d" },
        ".backface-hidden": { backfaceVisibility: "hidden" },
        ".rotate-x-0": { transform: "rotateX(0deg)" },
        ".rotate-x-2": { transform: "rotateX(2deg)" },
        ".rotate-x-5": { transform: "rotateX(5deg)" },
        ".rotate-x-10": { transform: "rotateX(10deg)" },
        ".-rotate-x-2": { transform: "rotateX(-2deg)" },
        ".-rotate-x-5": { transform: "rotateX(-5deg)" },
        ".-rotate-x-10": { transform: "rotateX(-10deg)" },
        ".rotate-y-0": { transform: "rotateY(0deg)" },
        ".rotate-y-2": { transform: "rotateY(2deg)" },
        ".rotate-y-5": { transform: "rotateY(5deg)" },
        ".rotate-y-10": { transform: "rotateY(10deg)" },
        ".-rotate-y-2": { transform: "rotateY(-2deg)" },
        ".-rotate-y-5": { transform: "rotateY(-5deg)" },
        ".-rotate-y-10": { transform: "rotateY(-10deg)" },
      };
      addUtilities(newUtilities);
    },
  ],
};
