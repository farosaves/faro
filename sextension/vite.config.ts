import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import path from 'path';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), crx({manifest})],
  resolve: {
    alias: { $lib: path.resolve(__dirname, "./src/lib") },
  },
  build: {
    rollupOptions: {
      external: [
        "chrome",
        "rangy-core.min.js",
        "rangy-classaplier.min.js",
        "rangy-highlighter.min.js",
      ],
    },
    minify: false,
  },
})
