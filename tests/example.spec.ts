import { test, expect } from "@playwright/test"

const dev = process.env.DEV || "http://localhost:5173/"
test("has title", async ({ page }) => {
  await page.goto(dev)

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Faro/)
})

test("check version is current", async ({ page }) => {
  const resp = await page.goto(dev + "api/version")
  const versionData = await resp?.json()
  expect(versionData?.version).toMatch(/[0-9a-f]{40}/)
})

test("login flow", async ({ page }) => {
  await page.goto(dev)
  await page.getByText("Dashboard", { exact: true }).click()
  await page.getByText("Click here", { exact: true }).click()
  // await expect(page).toHaveTitle("Faros - Login")
  await expect(page).toHaveURL(/login/)
  await page.waitForTimeout(50)
  const email = page.getByPlaceholder(/email/i)
  await email.fill("pawel.paradysz@protonmail.com")
  const password = page.getByPlaceholder(/password/i)
  await password.fill("test1234")

  await password.press("Enter")

  // await expect(page).toHaveURL(/account($|\?)/)
  // await page.getByText("Dashboard", { exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard\?from=login/)
  // reactivity
  const loc = page.locator("button.btn-sm", { hasNotText: /./ })
  await expect(loc.nth(1)).not.toHaveClass(/btn-outline/)
  await loc.nth(0).click()
  await expect(loc.nth(1)).toHaveClass(/btn-outline/)
})
