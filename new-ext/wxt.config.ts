import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  extensionApi: "chrome",
  manifest: {
    side_panel: {
      default_path: "sidepanel.html",
    },
    commands: {
      _execute_action: {
        suggested_key: { default: "Alt+X" },
        description: "Capture text",
      },
    },
  },
  modules: ["@wxt-dev/module-svelte"],
})
