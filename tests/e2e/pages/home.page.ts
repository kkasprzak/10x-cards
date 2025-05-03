import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

/**
 * Home page Page Object Model - following Page Object Model pattern for E2E testing
 */
export class HomePage {
  readonly page: Page;
  readonly title: Locator;
  // Add more locators as needed

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator("h1").first();
    // Initialize more locators as needed
  }

  async goto() {
    await this.page.goto("/");
  }

  async expectTitleVisible() {
    await expect(this.title).toBeVisible();
  }

  // Add more page-specific methods as needed
}
