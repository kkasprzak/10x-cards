import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

/**
 * Generate page Page Object Model
 */
export class GeneratePage {
  readonly page: Page;
  readonly flashcardGenerationView: Locator;

  constructor(page: Page) {
    this.page = page;
    this.flashcardGenerationView = page.locator("[data-testid='flashcard-generation-view']");
  }

  async goto() {
    await this.page.goto("/generate");
  }

  async expectPageLoaded() {
    await expect(this.flashcardGenerationView).toBeVisible();
    await expect(this.page).toHaveURL("/generate");
  }

  async expectRedirectToLoginIfNotAuthenticated() {
    await expect(this.page).toHaveURL("/login");
  }
}
