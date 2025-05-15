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
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/^password$/i);
    this.submitButton = page.getByRole("button", { name: /sign in/i });
    this.form = page.getByTestId("login-form");
    this.errorNotification = page.getByRole("alert");
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
    await expect(this.emailInput).toHaveValue(email);

    await this.passwordInput.focus();
    await this.passwordInput.fill(password);
    await expect(this.passwordInput).toHaveValue(password);

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
