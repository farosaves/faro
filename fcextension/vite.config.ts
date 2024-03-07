import { crx } from "@crxjs/vite-plugin"
import manifest from "./manifest.json"
import { defineConfig } from "vite"
import path from "path"
import { svelte } from "@sveltejs/vite-plugin-svelte"

// const config = defineConfig(({ command, mode, ssrBuild }) => {
// 	return {
// 		plugins: (() => {
// 			if (mode === "sveltekit"){
// 				return [sveltekit()]
// 			}
// 			else if (mode === "crx"){
// 				return [crx({ manifest })]
// 			}
// 			else{
// 				return []
// 			}})(),
// 	};
// });

// export default config;
export default defineConfig(({ command, mode }) => ({
  plugins: [
    svelte(
      { emitCss: false }, // don't emit CSS to Vite
    ),
    crx({ manifest }),
  ],
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
  resolve: {
    alias: { $lib: path.resolve(__dirname, "./src/lib") },
  },
}))
