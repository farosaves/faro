import { test, expect } from "@playwright/test"

const dev = process.env.DEV || "http://localhost:5173/"
test("has title", async ({ page }) => {
  await page.goto(dev)

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Faros/)
})

test("check version is current", async ({ page }) => {
  const resp = await page.goto(dev + "api/version")
  const versionData = await resp?.json()
  // if (process.env.DEV) expect(versionData?.version).toBe(process.env.COMMIT_UUID); // doesnt work on pr
  expect(versionData?.version).toMatch(/[0-9a-f]{40}/)
})
