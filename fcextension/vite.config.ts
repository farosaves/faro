import { crx } from '@crxjs/vite-plugin';
import { sveltekit } from '@sveltejs/kit/vite';
import manifest from './manifest.json'
import { defineConfig } from 'vite';

const config = defineConfig(({ command, mode, ssrBuild }) => {
	return {
		plugins: (() => {
			if (mode === "sveltekit"){
				return [sveltekit()]
			}
			else if (mode === "crx"){
				return [crx({ manifest })]
			}
			else{
				return []
			}})(),
	};
});

export default config;
// export default defineConfig({
// 	plugins: [sveltekit()],
// 	build: {
// 		rollupOptions: {
// 			external: [
// 				'chrome'
// 			]
// 		}
// 	}
// });
