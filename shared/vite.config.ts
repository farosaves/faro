import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import Icons from "unplugin-icons/vite"

export default defineConfig({
  plugins: [
    sveltekit(),
    Icons({
      compiler: "svelte",
    }),
  ],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
  build: { minify: false },
  ssr: {
    noExternal: ["@yaireo/tagify"],
  },
})
