// vite.config.ts
import { defineConfig } from "file:///Users/pawelparadysz/Projects/flashcardiser/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///Users/pawelparadysz/Projects/flashcardiser/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { crx } from "file:///Users/pawelparadysz/Projects/flashcardiser/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// manifest.json
var manifest_default = {
  manifest_version: 3,
  name: "FarosDev",
  version: "0.1.0",
  icons: {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  description: "Save & organize snippets - use like bookmarks",
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
  permissions: ["activeTab", "scripting", "storage", "contextMenus", "tabs", "sidePanel", "commands"],
  commands: {
    _execute_action: {
      suggested_key: { default: "Alt+D" },
      description: "Capture text"
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
      input: { dashboard: "dashboard.html" },
      external: ["chrome", "rangy-core.min.js", "rangy-classaplier.min.js", "rangy-highlighter.min.js"]
    },
    minify: false
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9wYXdlbHBhcmFkeXN6L1Byb2plY3RzL2ZsYXNoY2FyZGlzZXIvc2V4dGVuc2lvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3Bhd2VscGFyYWR5c3ovUHJvamVjdHMvZmxhc2hjYXJkaXNlci9zZXh0ZW5zaW9uL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9wYXdlbHBhcmFkeXN6L1Byb2plY3RzL2ZsYXNoY2FyZGlzZXIvc2V4dGVuc2lvbi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCJcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gXCJAc3ZlbHRlanMvdml0ZS1wbHVnaW4tc3ZlbHRlXCJcbmltcG9ydCB7IGNyeCB9IGZyb20gXCJAY3J4anMvdml0ZS1wbHVnaW5cIlxuaW1wb3J0IG1hbmlmZXN0IGZyb20gXCIuL21hbmlmZXN0Lmpzb25cIlxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIlxuaW1wb3J0IEljb25zIGZyb20gXCJ1bnBsdWdpbi1pY29ucy92aXRlXCJcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBzdmVsdGUoKSxcbiAgICBJY29ucyh7XG4gICAgICBjb21waWxlcjogXCJzdmVsdGVcIixcbiAgICB9KSxcbiAgICBjcngoeyBtYW5pZmVzdCB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7ICRsaWI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvbGliXCIpIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgaW5wdXQ6IHsgZGFzaGJvYXJkOiBcImRhc2hib2FyZC5odG1sXCIgfSxcbiAgICAgIGV4dGVybmFsOiBbXCJjaHJvbWVcIiwgXCJyYW5neS1jb3JlLm1pbi5qc1wiLCBcInJhbmd5LWNsYXNzYXBsaWVyLm1pbi5qc1wiLCBcInJhbmd5LWhpZ2hsaWdodGVyLm1pbi5qc1wiXSxcbiAgICB9LFxuICAgIG1pbmlmeTogZmFsc2UsXG4gIH0sXG59KVxuIiwgIntcbiAgXCJtYW5pZmVzdF92ZXJzaW9uXCI6IDMsXG4gIFwibmFtZVwiOiBcIkZhcm9zRGV2XCIsXG4gIFwidmVyc2lvblwiOiBcIjAuMS4wXCIsXG4gIFwiaWNvbnNcIjoge1xuICAgIFwiMTZcIjogXCJpY29ucy9pY29uMTYucG5nXCIsXG4gICAgXCI0OFwiOiBcImljb25zL2ljb240OC5wbmdcIixcbiAgICBcIjEyOFwiOiBcImljb25zL2ljb24xMjgucG5nXCJcbiAgfSxcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlNhdmUgJiBvcmdhbml6ZSBzbmlwcGV0cyAtIHVzZSBsaWtlIGJvb2ttYXJrc1wiLFxuICBcImFjdGlvblwiOiB7XG4gICAgXCJkZWZhdWx0X2ljb25cIjogXCJpY29ucy9pY29uNDgucG5nXCJcbiAgfSxcbiAgXCJiYWNrZ3JvdW5kXCI6IHtcbiAgICBcInNlcnZpY2Vfd29ya2VyXCI6IFwic3JjL2JhY2tncm91bmQudHNcIlxuICB9LFxuXG4gIFwiaG9zdF9wZXJtaXNzaW9uc1wiOiBbXCI8YWxsX3VybHM+XCJdLFxuICBcImNvbnRlbnRfc2NyaXB0c1wiOiBbXG4gICAge1xuICAgICAgXCJtYXRjaGVzXCI6IFtcIjxhbGxfdXJscz5cIl0sXG4gICAgICBcImpzXCI6IFtcInNyYy9jb250ZW50LnRzXCJdXG4gICAgfVxuICBdLFxuICBcInBlcm1pc3Npb25zXCI6IFtcImFjdGl2ZVRhYlwiLCBcInNjcmlwdGluZ1wiLCBcInN0b3JhZ2VcIiwgXCJjb250ZXh0TWVudXNcIiwgXCJ0YWJzXCIsIFwic2lkZVBhbmVsXCIsIFwiY29tbWFuZHNcIl0sXG4gIFwiY29tbWFuZHNcIjoge1xuICAgIFwiX2V4ZWN1dGVfYWN0aW9uXCI6IHtcbiAgICAgIFwic3VnZ2VzdGVkX2tleVwiOiB7IFwiZGVmYXVsdFwiOiBcIkFsdCtEXCIgfSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJDYXB0dXJlIHRleHRcIlxuICAgIH1cbiAgfSxcbiAgXCJzaWRlX3BhbmVsXCI6IHtcbiAgICBcImRlZmF1bHRfcGF0aFwiOiBcImluZGV4Lmh0bWxcIlxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9WLFNBQVMsb0JBQW9CO0FBQ2pYLFNBQVMsY0FBYztBQUN2QixTQUFTLFdBQVc7OztBQ0ZwQjtBQUFBLEVBQ0Usa0JBQW9CO0FBQUEsRUFDcEIsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLEVBQ1gsT0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLGFBQWU7QUFBQSxFQUNmLFFBQVU7QUFBQSxJQUNSLGNBQWdCO0FBQUEsRUFDbEI7QUFBQSxFQUNBLFlBQWM7QUFBQSxJQUNaLGdCQUFrQjtBQUFBLEVBQ3BCO0FBQUEsRUFFQSxrQkFBb0IsQ0FBQyxZQUFZO0FBQUEsRUFDakMsaUJBQW1CO0FBQUEsSUFDakI7QUFBQSxNQUNFLFNBQVcsQ0FBQyxZQUFZO0FBQUEsTUFDeEIsSUFBTSxDQUFDLGdCQUFnQjtBQUFBLElBQ3pCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsYUFBZSxDQUFDLGFBQWEsYUFBYSxXQUFXLGdCQUFnQixRQUFRLGFBQWEsVUFBVTtBQUFBLEVBQ3BHLFVBQVk7QUFBQSxJQUNWLGlCQUFtQjtBQUFBLE1BQ2pCLGVBQWlCLEVBQUUsU0FBVyxRQUFRO0FBQUEsTUFDdEMsYUFBZTtBQUFBLElBQ2pCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsWUFBYztBQUFBLElBQ1osY0FBZ0I7QUFBQSxFQUNsQjtBQUNGOzs7QUQ5QkEsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sV0FBVztBQUxsQixJQUFNLG1DQUFtQztBQVF6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxNQUFNO0FBQUEsTUFDSixVQUFVO0FBQUEsSUFDWixDQUFDO0FBQUEsSUFDRCxJQUFJLEVBQUUsMkJBQVMsQ0FBQztBQUFBLEVBQ2xCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPLEVBQUUsTUFBTSxLQUFLLFFBQVEsa0NBQVcsV0FBVyxFQUFFO0FBQUEsRUFDdEQ7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLE9BQU8sRUFBRSxXQUFXLGlCQUFpQjtBQUFBLE1BQ3JDLFVBQVUsQ0FBQyxVQUFVLHFCQUFxQiw0QkFBNEIsMEJBQTBCO0FBQUEsSUFDbEc7QUFBQSxJQUNBLFFBQVE7QUFBQSxFQUNWO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
