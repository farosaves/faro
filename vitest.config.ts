import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["**/*.{test,spec}.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/cypress/**", "**/.{idea,git,cache,output,temp}/**", "**/playwright-report/**", "**/tests/**"],
    environment: "jsdom",
  },
})
