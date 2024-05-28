import { test, expect } from "./fixtures"

const dev = process.env.DEV || "http://localhost:5173/"

test("example test", async ({ page }) => {
  await page.goto(dev)

  await page.getByText("Account", { exact: true }).click()
  // await expect(page).toHaveTitle("Faros - Login")
  await expect(page).toHaveURL(/login/)
  await page.waitForTimeout(50)
  const email = page.getByPlaceholder(/email/i)
  await email.fill("mati88p@gmail.com")
  const password = page.getByPlaceholder(/password/i)
  await password.fill("test3030")

  await password.press("Enter")

  await expect(page).toHaveURL(/account($|\?)/)

  await page.goto("https://en.wikipedia.org/wiki/Kalanchoe")
  await expect(page).toHaveURL(/wiki/)

  await page.getByText("Kalanchoë", { exact: true }).click({ clickCount: 2 })
  await page.waitForTimeout(50)
  await page.keyboard.press("Alt+f")
  await expect(page).toHaveURL(/dashboard/)

  await page.goto(dev)
  await page.getByText("Dashboard", { exact: true }).click()
  // await expect(page.locator("body")).toHaveText(/Welcome/)
  // await expect(page.locator("body")).toHaveText(/hiiiii/)
})
