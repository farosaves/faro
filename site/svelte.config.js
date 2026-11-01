import adapter from "@sveltejs/adapter-cloudflare"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    prerender: {
      // Every page is static; fail the build on any broken internal link.
      handleHttpError: "fail",
      handleMissingId: "fail",
    },
  },
}

export default config
