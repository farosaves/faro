/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{html,js,svelte,ts}",
    "./*.{html,js,svelte,ts}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../node_modules/shared/**/*.{html,js,svelte,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        default: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          ...require("daisyui/src/theming/themes")["night"],
          "primary": "oklch(61.77% 0.163 307.59)",
          // secondary: "oklch(53.53% 0.2365 269.97)",
          // secondary: "oklch(70.58% 0.1581 252)", // ph
          "secondary": "oklch(75.72% 0.1387 252)",
          "base-100": "oklch(20.77% 0.06 265.75)", // #1A103D  // #1A103D
        },
      },
      "light",
      "dark",
      "retro",
      "cyberpunk",
      "aqua",
      "night",
    ],
    // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
  },
}
