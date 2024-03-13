import { test, expect } from "@playwright/test"

const dev = process.env.DEV || "http://dev.farosapp.com/"
test("has title", async ({ page }) => {
  await page.goto(dev)

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Faros/)
})

test("check version is current", async ({ page }) => {
  const resp = await page.goto(dev + "api/version")
  const versionData = await resp?.json()
  if (process.env.DEV) expect(versionData?.version).toBe(process.env.COMMIT_UUID)
  else expect(versionData?.version).toMatch(/[0-9a-f]{40}/)
})

test("login flow", async ({ page }) => {
  await page.goto(dev)
  await page.getByText("Dashboard", {exact: true}).click()
  await expect(page).toHaveTitle("Faros - Login")
  const email = page.getByPlaceholder(/email/);
  const password = page.getByPlaceholder(/password/);

  

  // expect(page).to
  // Expect a title "to contain" a substring.
})
