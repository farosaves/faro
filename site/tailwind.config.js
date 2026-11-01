import daisyui from "daisyui"
import themes from "daisyui/src/theming/themes"

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,svelte,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      minHeight: {
        "screen-minus-80": "calc(100vh - 80px)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        default: {
          ...themes["night"],
          "primary": "oklch(61.77% 0.163 307.59)", // #a066d0 closest web is  #9966cc
          "secondary": "oklch(75.72% 0.1387 252)", // #6bb4ff
          "base-100": "oklch(20.77% 0.06 265.75)", // #0a1633
        },
      },
      "light",
      "dark",
      "retro",
      "cyberpunk",
      "aqua",
      "night",
    ],
  },
}
