import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import { crx } from "@crxjs/vite-plugin"
import manifest from "./manifest.json"
import path from "path"
import Icons from "unplugin-icons/vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    Icons({
      compiler: "svelte",
    }),
    crx({ manifest }),
  ],
  resolve: {
    alias: { $lib: path.resolve(__dirname, "./src/lib") },
  },
  build: {
    rollupOptions: {
      input: { dashboard: "dashboard.html" },
      external: ["chrome", "rangy-core.min.js", "rangy-classaplier.min.js", "rangy-highlighter.min.js"],
    },
    minify: false,
  },
})
