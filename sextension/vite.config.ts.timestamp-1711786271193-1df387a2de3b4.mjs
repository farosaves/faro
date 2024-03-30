// vite.config.ts
import { defineConfig } from "file:///Users/pawel/Projects/flashcardiser/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///Users/pawel/Projects/flashcardiser/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { crx } from "file:///Users/pawel/Projects/flashcardiser/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// manifest.json
var manifest_default = {
  manifest_version: 3,
  name: "FarosDev",
  version: "0.2.1",
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
import Icons from "file:///Users/pawel/Projects/flashcardiser/node_modules/unplugin-icons/dist/vite.js";
var __vite_injected_original_dirname = "/Users/pawel/Projects/flashcardiser/sextension";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9wYXdlbC9Qcm9qZWN0cy9mbGFzaGNhcmRpc2VyL3NleHRlbnNpb25cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9wYXdlbC9Qcm9qZWN0cy9mbGFzaGNhcmRpc2VyL3NleHRlbnNpb24vdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3Bhd2VsL1Byb2plY3RzL2ZsYXNoY2FyZGlzZXIvc2V4dGVuc2lvbi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCJcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gXCJAc3ZlbHRlanMvdml0ZS1wbHVnaW4tc3ZlbHRlXCJcbmltcG9ydCB7IGNyeCB9IGZyb20gXCJAY3J4anMvdml0ZS1wbHVnaW5cIlxuaW1wb3J0IG1hbmlmZXN0IGZyb20gXCIuL21hbmlmZXN0Lmpzb25cIlxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIlxuaW1wb3J0IEljb25zIGZyb20gXCJ1bnBsdWdpbi1pY29ucy92aXRlXCJcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICBzdmVsdGUoKSxcbiAgICBJY29ucyh7XG4gICAgICBjb21waWxlcjogXCJzdmVsdGVcIixcbiAgICB9KSxcbiAgICBjcngoeyBtYW5pZmVzdCB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7ICRsaWI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvbGliXCIpIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFtcImNocm9tZVwiLCBcInJhbmd5LWNvcmUubWluLmpzXCIsIFwicmFuZ3ktY2xhc3NhcGxpZXIubWluLmpzXCIsIFwicmFuZ3ktaGlnaGxpZ2h0ZXIubWluLmpzXCJdLFxuICAgIH0sXG4gICAgbWluaWZ5OiBmYWxzZSxcbiAgfSxcbn0pXG4iLCAie1xuXHRcIm1hbmlmZXN0X3ZlcnNpb25cIjogMyxcblx0XCJuYW1lXCI6IFwiRmFyb3NEZXZcIixcblx0XCJ2ZXJzaW9uXCI6IFwiMC4yLjFcIixcblx0XCJpY29uc1wiOiB7XG5cdFx0XCIxNlwiOiBcImljb25zL2ljb24xNi5wbmdcIixcblx0XHRcIjQ4XCI6IFwiaWNvbnMvaWNvbjQ4LnBuZ1wiLFxuXHRcdFwiMTI4XCI6IFwiaWNvbnMvaWNvbjEyOC5wbmdcIlxuXHR9LFxuXHRcImRlc2NyaXB0aW9uXCI6IFwiRWFzaWx5IGNyZWF0ZSBmbGFzaGNhcmRzIHdoaWxlIGJyb3dzaW5nXCIsXG5cdFwiYWN0aW9uXCI6IHtcblx0XHRcImRlZmF1bHRfaWNvblwiOiBcImljb25zL2ljb240OC5wbmdcIlxuXHR9LFxuXHRcImJhY2tncm91bmRcIjoge1xuXHRcdFwic2VydmljZV93b3JrZXJcIjogXCJzcmMvYmFja2dyb3VuZC50c1wiXG5cdH0sXG5cblx0XCJob3N0X3Blcm1pc3Npb25zXCI6IFtcIjxhbGxfdXJscz5cIl0sXG5cdFwiY29udGVudF9zY3JpcHRzXCI6IFtcblx0XHR7XG5cdFx0XHRcIm1hdGNoZXNcIjogW1wiPGFsbF91cmxzPlwiXSxcblx0XHRcdFwianNcIjogW1wic3JjL2NvbnRlbnQudHNcIl1cblx0XHR9XG5cdF0sXG5cdFwicGVybWlzc2lvbnNcIjogW1xuXHRcdFwiYWN0aXZlVGFiXCIsXG5cdFx0XCJzY3JpcHRpbmdcIixcblx0XHRcInN0b3JhZ2VcIixcblx0XHRcImNvbnRleHRNZW51c1wiLFxuXHRcdFwidGFic1wiLFxuXHRcdFwic2lkZVBhbmVsXCIsXG5cdFx0XCJjb29raWVzXCIsXG5cdFx0XCJjb21tYW5kc1wiXG5cdF0sXG5cdFwiY29tbWFuZHNcIjoge1xuXHRcdFwiX2V4ZWN1dGVfYWN0aW9uXCI6IHtcblx0XHRcdFwic3VnZ2VzdGVkX2tleVwiOiB7XCJkZWZhdWx0XCI6IFwiQWx0K0RcIn0sXG5cdFx0XHRcImRlc2NyaXB0aW9uXCI6IFwiQ2FwdHVyZSB0ZXh0XCJcblx0XHR9LFxuXHRcdFwic2VhcmNoXCI6IHtcblx0XHRcdFwic3VnZ2VzdGVkX2tleVwiOiB7XCJkZWZhdWx0XCI6IFwiQWx0K0dcIn0sXG5cdFx0XHRcImRlc2NyaXB0aW9uXCI6IFwiU2VhcmNoIGluIHRoZSBkYXNoYm9hcmRcIlxuXHRcdH1cblx0fSxcblx0XCJzaWRlX3BhbmVsXCI6IHtcblx0XHRcImRlZmF1bHRfcGF0aFwiOiBcImluZGV4Lmh0bWxcIlxuXHR9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRULFNBQVMsb0JBQW9CO0FBQ3pWLFNBQVMsY0FBYztBQUN2QixTQUFTLFdBQVc7OztBQ0ZwQjtBQUFBLEVBQ0Msa0JBQW9CO0FBQUEsRUFDcEIsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLEVBQ1gsT0FBUztBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBQ1I7QUFBQSxFQUNBLGFBQWU7QUFBQSxFQUNmLFFBQVU7QUFBQSxJQUNULGNBQWdCO0FBQUEsRUFDakI7QUFBQSxFQUNBLFlBQWM7QUFBQSxJQUNiLGdCQUFrQjtBQUFBLEVBQ25CO0FBQUEsRUFFQSxrQkFBb0IsQ0FBQyxZQUFZO0FBQUEsRUFDakMsaUJBQW1CO0FBQUEsSUFDbEI7QUFBQSxNQUNDLFNBQVcsQ0FBQyxZQUFZO0FBQUEsTUFDeEIsSUFBTSxDQUFDLGdCQUFnQjtBQUFBLElBQ3hCO0FBQUEsRUFDRDtBQUFBLEVBQ0EsYUFBZTtBQUFBLElBQ2Q7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRDtBQUFBLEVBQ0EsVUFBWTtBQUFBLElBQ1gsaUJBQW1CO0FBQUEsTUFDbEIsZUFBaUIsRUFBQyxTQUFXLFFBQU87QUFBQSxNQUNwQyxhQUFlO0FBQUEsSUFDaEI7QUFBQSxJQUNBLFFBQVU7QUFBQSxNQUNULGVBQWlCLEVBQUMsU0FBVyxRQUFPO0FBQUEsTUFDcEMsYUFBZTtBQUFBLElBQ2hCO0FBQUEsRUFDRDtBQUFBLEVBQ0EsWUFBYztBQUFBLElBQ2IsY0FBZ0I7QUFBQSxFQUNqQjtBQUNEOzs7QUQzQ0EsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sV0FBVztBQUxsQixJQUFNLG1DQUFtQztBQVF6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxNQUFNO0FBQUEsTUFDSixVQUFVO0FBQUEsSUFDWixDQUFDO0FBQUEsSUFDRCxJQUFJLEVBQUUsMkJBQVMsQ0FBQztBQUFBLEVBQ2xCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPLEVBQUUsTUFBTSxLQUFLLFFBQVEsa0NBQVcsV0FBVyxFQUFFO0FBQUEsRUFDdEQ7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxVQUFVLHFCQUFxQiw0QkFBNEIsMEJBQTBCO0FBQUEsSUFDbEc7QUFBQSxJQUNBLFFBQVE7QUFBQSxFQUNWO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
