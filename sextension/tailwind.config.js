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
}
