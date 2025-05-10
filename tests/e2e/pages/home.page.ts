import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

/**
 * Home page Page Object Model - following Page Object Model pattern for E2E testing
 */
export class HomePage {
  readonly page: Page;
  readonly title: Locator;
  readonly loginButton: Locator;
  readonly signUpButton: Locator;
  // Add more locators as needed

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole("heading", { name: "Twórz fiszki szybciej z AI" });
    this.loginButton = page.getByRole("link", { name: "Login" });
    this.signUpButton = page.getByRole("link", { name: "Sign up" });
    // Initialize more locators as needed
  }

  async goto() {
    await this.page.goto("/");
  }

  async expectTitleVisible() {
    await expect(this.title).toBeVisible();
  }

  async clickLogin() {
    await this.loginButton.click();
    // Wait for navigation to complete
    await this.page.waitForURL("/login");
  }

  async clickSignUp() {
    await this.signUpButton.click();
  }

  // Add more page-specific methods as needed
}
