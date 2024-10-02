import { defineConfig } from "wxt"
import path from "path"


// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  alias: { $lib: path.resolve(__dirname, "./src/lib") },
  modules: ["@wxt-dev/module-svelte"],
  vite: _config => ({}),
})
