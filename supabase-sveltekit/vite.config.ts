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
  build: { rollupOptions: { external: ["umami"] }, minify: process.env.VITE_DEBUG === "false",
  },
})
