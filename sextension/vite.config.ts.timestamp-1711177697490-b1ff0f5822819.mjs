// vite.config.ts
import { defineConfig } from "file:///Users/pawelparadysz/Projects/flashcardiser/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///Users/pawelparadysz/Projects/flashcardiser/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { crx } from "file:///Users/pawelparadysz/Projects/flashcardiser/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// manifest.json
var manifest_default = {
  manifest_version: 3,
  name: "Faros",
  version: "0.2",
  icons: {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  description: "Easily create flashcards while browsing",
  action: {
    default_icon: "icons/icon48.png"
  },
  background: {
    service_worker: "src/background.ts"
  },
  host_permissions: ["<all_urls>"],
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content.ts"]
    }
  ],
  permissions: [
    "activeTab",
    "scripting",
    "storage",
    "contextMenus",
    "tabs",
    "sidePanel",
    "cookies",
    "commands"
  ],
  commands: {
    _execute_action: {
      suggested_key: { default: "Alt+D" },
      description: "Capture text"
    },
    search: {
      suggested_key: { default: "Alt+G" },
      description: "Search in the dashboard"
    }
  },
  side_panel: {
    default_path: "index.html"
  }
};

// vite.config.ts
import path from "path";
import Icons from "file:///Users/pawelparadysz/Projects/flashcardiser/node_modules/unplugin-icons/dist/vite.js";
var __vite_injected_original_dirname = "/Users/pawelparadysz/Projects/flashcardiser/sextension";
var vite_config_default = defineConfig({
  plugins: [
    svelte(),
    Icons({
      compiler: "svelte"
    }),
    crx({ manifest: manifest_default })
  ],
  resolve: {
    alias: { $lib: path.resolve(__vite_injected_original_dirname, "./src/lib") }
  },
  build: {
    rollupOptions: {
      external: ["chrome", "rangy-core.min.js", "rangy-classaplier.min.js", "rangy-highlighter.min.js"]
    },
    minify: false
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9wYXdlbHBhcmFkeXN6L1Byb2plY3RzL2ZsYXNoY2FyZGlzZXIvc2V4dGVuc2lvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3Bhd2VscGFyYWR5c3ovUHJvamVjdHMvZmxhc2hjYXJkaXNlci9zZXh0ZW5zaW9uL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9wYXdlbHBhcmFkeXN6L1Byb2plY3RzL2ZsYXNoY2FyZGlzZXIvc2V4dGVuc2lvbi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCJcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gXCJAc3ZlbHRlanMvdml0ZS1wbHVnaW4tc3ZlbHRlXCJcbmltcG9ydCB7IGNyeCB9IGZyb20gXCJAY3J4anMvdml0ZS1wbHVnaW5cIlxuaW1wb3J0IG1hbmlmZXN0IGZyb20gXCIuL21hbmlmZXN0Lmpzb25cIlxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIlxuaW1wb3J0IEljb25zIGZyb20gXCJ1bnBsdWdpbi1pY29ucy92aXRlXCJcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBzdmVsdGUoKSxcbiAgICBJY29ucyh7XG4gICAgICBjb21waWxlcjogXCJzdmVsdGVcIixcbiAgICB9KSxcbiAgICBjcngoeyBtYW5pZmVzdCB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7ICRsaWI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvbGliXCIpIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFtcImNocm9tZVwiLCBcInJhbmd5LWNvcmUubWluLmpzXCIsIFwicmFuZ3ktY2xhc3NhcGxpZXIubWluLmpzXCIsIFwicmFuZ3ktaGlnaGxpZ2h0ZXIubWluLmpzXCJdLFxuICAgIH0sXG4gICAgbWluaWZ5OiBmYWxzZSxcbiAgfSxcbn0pXG4iLCAie1xuXHRcIm1hbmlmZXN0X3ZlcnNpb25cIjogMyxcblx0XCJuYW1lXCI6IFwiRmFyb3NcIixcblx0XCJ2ZXJzaW9uXCI6IFwiMC4yXCIsXG5cdFwiaWNvbnNcIjoge1xuXHRcdFwiMTZcIjogXCJpY29ucy9pY29uMTYucG5nXCIsXG5cdFx0XCI0OFwiOiBcImljb25zL2ljb240OC5wbmdcIixcblx0XHRcIjEyOFwiOiBcImljb25zL2ljb24xMjgucG5nXCJcblx0fSxcblx0XCJkZXNjcmlwdGlvblwiOiBcIkVhc2lseSBjcmVhdGUgZmxhc2hjYXJkcyB3aGlsZSBicm93c2luZ1wiLFxuXHRcImFjdGlvblwiOiB7XG5cdFx0XCJkZWZhdWx0X2ljb25cIjogXCJpY29ucy9pY29uNDgucG5nXCJcblx0fSxcblx0XCJiYWNrZ3JvdW5kXCI6IHtcblx0XHRcInNlcnZpY2Vfd29ya2VyXCI6IFwic3JjL2JhY2tncm91bmQudHNcIlxuXHR9LFxuXG5cdFwiaG9zdF9wZXJtaXNzaW9uc1wiOiBbXCI8YWxsX3VybHM+XCJdLFxuXHRcImNvbnRlbnRfc2NyaXB0c1wiOiBbXG5cdFx0e1xuXHRcdFx0XCJtYXRjaGVzXCI6IFtcIjxhbGxfdXJscz5cIl0sXG5cdFx0XHRcImpzXCI6IFtcInNyYy9jb250ZW50LnRzXCJdXG5cdFx0fVxuXHRdLFxuXHRcInBlcm1pc3Npb25zXCI6IFtcblx0XHRcImFjdGl2ZVRhYlwiLFxuXHRcdFwic2NyaXB0aW5nXCIsXG5cdFx0XCJzdG9yYWdlXCIsXG5cdFx0XCJjb250ZXh0TWVudXNcIixcblx0XHRcInRhYnNcIixcblx0XHRcInNpZGVQYW5lbFwiLFxuXHRcdFwiY29va2llc1wiLFxuXHRcdFwiY29tbWFuZHNcIlxuXHRdLFxuXHRcImNvbW1hbmRzXCI6IHtcblx0XHRcIl9leGVjdXRlX2FjdGlvblwiOiB7XG5cdFx0XHRcInN1Z2dlc3RlZF9rZXlcIjoge1wiZGVmYXVsdFwiOiBcIkFsdCtEXCJ9LFxuXHRcdFx0XCJkZXNjcmlwdGlvblwiOiBcIkNhcHR1cmUgdGV4dFwiXG5cdFx0fSxcblx0XHRcInNlYXJjaFwiOiB7XG5cdFx0XHRcInN1Z2dlc3RlZF9rZXlcIjoge1wiZGVmYXVsdFwiOiBcIkFsdCtHXCJ9LFxuXHRcdFx0XCJkZXNjcmlwdGlvblwiOiBcIlNlYXJjaCBpbiB0aGUgZGFzaGJvYXJkXCJcblx0XHR9XG5cdH0sXG5cdFwic2lkZV9wYW5lbFwiOiB7XG5cdFx0XCJkZWZhdWx0X3BhdGhcIjogXCJpbmRleC5odG1sXCJcblx0fVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvVixTQUFTLG9CQUFvQjtBQUNqWCxTQUFTLGNBQWM7QUFDdkIsU0FBUyxXQUFXOzs7QUNGcEI7QUFBQSxFQUNDLGtCQUFvQjtBQUFBLEVBQ3BCLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxFQUNYLE9BQVM7QUFBQSxJQUNSLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxFQUNSO0FBQUEsRUFDQSxhQUFlO0FBQUEsRUFDZixRQUFVO0FBQUEsSUFDVCxjQUFnQjtBQUFBLEVBQ2pCO0FBQUEsRUFDQSxZQUFjO0FBQUEsSUFDYixnQkFBa0I7QUFBQSxFQUNuQjtBQUFBLEVBRUEsa0JBQW9CLENBQUMsWUFBWTtBQUFBLEVBQ2pDLGlCQUFtQjtBQUFBLElBQ2xCO0FBQUEsTUFDQyxTQUFXLENBQUMsWUFBWTtBQUFBLE1BQ3hCLElBQU0sQ0FBQyxnQkFBZ0I7QUFBQSxJQUN4QjtBQUFBLEVBQ0Q7QUFBQSxFQUNBLGFBQWU7QUFBQSxJQUNkO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Q7QUFBQSxFQUNBLFVBQVk7QUFBQSxJQUNYLGlCQUFtQjtBQUFBLE1BQ2xCLGVBQWlCLEVBQUMsU0FBVyxRQUFPO0FBQUEsTUFDcEMsYUFBZTtBQUFBLElBQ2hCO0FBQUEsSUFDQSxRQUFVO0FBQUEsTUFDVCxlQUFpQixFQUFDLFNBQVcsUUFBTztBQUFBLE1BQ3BDLGFBQWU7QUFBQSxJQUNoQjtBQUFBLEVBQ0Q7QUFBQSxFQUNBLFlBQWM7QUFBQSxJQUNiLGNBQWdCO0FBQUEsRUFDakI7QUFDRDs7O0FEM0NBLE9BQU8sVUFBVTtBQUNqQixPQUFPLFdBQVc7QUFMbEIsSUFBTSxtQ0FBbUM7QUFRekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsTUFBTTtBQUFBLE1BQ0osVUFBVTtBQUFBLElBQ1osQ0FBQztBQUFBLElBQ0QsSUFBSSxFQUFFLDJCQUFTLENBQUM7QUFBQSxFQUNsQjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTyxFQUFFLE1BQU0sS0FBSyxRQUFRLGtDQUFXLFdBQVcsRUFBRTtBQUFBLEVBQ3REO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsVUFBVSxxQkFBcUIsNEJBQTRCLDBCQUEwQjtBQUFBLElBQ2xHO0FBQUEsSUFDQSxRQUFRO0FBQUEsRUFDVjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
