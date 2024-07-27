/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // "./**/*.{svelte,ts}",
    // "./node_modules/*.{svelte,ts}",
    "./*.{svelte,ts}",
    // './index.html',
    "./src/**/*.{svelte,ts}",
    "../node_modules/shared/**/*.{svelte,ts}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      height: {
        "screen-minus-80": "calc(100vh - 80px)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        default: {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          ...require("daisyui/src/theming/themes")["night"],
          "primary": "oklch(61.77% 0.163 307.59)", // #a066d0 closest web is  #9966cc
          // secondary: "oklch(53.53% 0.2365 269.97)",
          // secondary: "oklch(70.58% 0.1581 252)", // ph
          "secondary": "oklch(75.72% 0.1387 252)", // id rather do reddish..
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
    // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
  },
}
