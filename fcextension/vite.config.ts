import { crx } from "@crxjs/vite-plugin"
import manifest from "./manifest.json"
import { defineConfig } from "vite"
import { sveltekit } from "@sveltejs/kit/vite"
import path from "path";

export default defineConfig(({ command, mode }) => ({
	plugins: [mode == 'crx' ? crx({ manifest }) : sveltekit()],
	build: {
		rollupOptions: {
			external: [
				'chrome',
				'rangy-core.min.js',
				'rangy-classaplier.min.js',
				'rangy-highlighter.min.js'
			]
		},
		minify: false
	},
	resolve: {
		alias: {'$lib': path.resolve(__dirname, './src/lib'),}
	}
}));