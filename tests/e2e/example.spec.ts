import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect the page to have a specific title
  await expect(page).toHaveTitle(/10x/);
});

test("navigates to a page", async ({ page }) => {
  // Start from the index page
  await page.goto("/");

  // Find a navigation element and click it
  // Replace with actual navigation selector when implemented
  // await page.getByRole('link', { name: 'About' }).click();

  // Expect the URL to change
  // await expect(page).toHaveURL(/.*about/);
});
