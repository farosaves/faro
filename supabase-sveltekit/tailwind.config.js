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
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "retro", "cyberpunk", "aqua", "night"],
    // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
  },
}
