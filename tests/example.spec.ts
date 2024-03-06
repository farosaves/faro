import { test, expect } from '@playwright/test';

const dev = "https://dev.farosapp.com/"
test('has title', async ({ page }) => {
  await page.goto(dev);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Faros/);
});

test('get started link', async ({ page }) => {
  const resp = await page.goto(dev+"api/version");
  const versionData = await resp?.json(); 
  expect(versionData?.version).toBe(process.env.COMMIT_UUID);
  // Click the get started link.
  // await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  // await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
