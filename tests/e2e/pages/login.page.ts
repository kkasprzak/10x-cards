import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

/**
 * Login page Page Object Model
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly form: Locator;
  readonly errorNotification: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator("[data-test-id='login-email-input']");
    this.passwordInput = page.locator("[data-test-id='login-password-input']");
    this.submitButton = page.locator("[data-test-id='login-submit-button']");
    this.form = page.locator("[data-testid='login-form']");
    this.errorNotification = page.locator("[role='alert']");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.waitFor({ state: "visible" });
    await this.passwordInput.waitFor({ state: "visible" });
    await this.submitButton.waitFor({ state: "visible" });

    await this.emailInput.focus();
    await this.emailInput.fill(email);

    await this.passwordInput.focus();
    await this.passwordInput.fill(password);

    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes("/api/auth/login") && response.request().method() === "POST"
    );

    await expect(this.submitButton).toBeEnabled();
    await Promise.all([this.submitButton.click(), this.page.waitForLoadState("domcontentloaded")]);

    const response = await responsePromise;

    if (response.ok()) {
      await this.page.waitForURL("/generate");
      await this.page.waitForLoadState("networkidle");
    } else {
      await this.errorNotification.waitFor({ state: "visible", timeout: 5000 });
    }
  }

  async expectFormVisible() {
    await expect(this.form).toBeVisible();
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorNotification).toContainText(message);
  }

  async expectLoginSuccessful() {
    await expect(this.page).toHaveURL("/generate");
  }
}
