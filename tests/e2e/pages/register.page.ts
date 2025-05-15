import { type Page, type Locator, expect } from "@playwright/test";

export class RegisterPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly signUpButton: Locator;
  readonly successMessage: Locator;
  readonly form: Locator;
  readonly errorNotification: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.getByTestId("register-form");

    // Use form as a context for input fields to ensure we're targeting elements within the form
    this.emailInput = this.form.getByLabel(/email/i);
    this.passwordInput = this.form.getByLabel(/^password$/i);
    this.confirmPasswordInput = this.form.getByLabel(/confirm password/i);
    this.signUpButton = this.form.getByRole("button", { name: /create account/i });
    this.successMessage = page.getByTestId("register-success");
    this.errorNotification = page.getByTestId("form-error");
  }

  async goto() {
    await this.page.goto("/register");
  }

  async expectFormVisible() {
    await expect(this.form).toBeVisible();
  }

  async register(email: string, password: string) {
    // Wait for form elements to be visible
    await this.emailInput.waitFor({ state: "visible" });
    await this.passwordInput.waitFor({ state: "visible" });
    await this.confirmPasswordInput.waitFor({ state: "visible" });
    await this.signUpButton.waitFor({ state: "visible" });

    // Fill and verify email
    await this.emailInput.focus();
    await this.emailInput.fill(email);
    await expect(this.emailInput).toHaveValue(email);

    // Fill and verify password
    await this.passwordInput.focus();
    await this.passwordInput.fill(password);
    await expect(this.passwordInput).toHaveValue(password);

    // Fill and verify confirm password
    await this.confirmPasswordInput.focus();
    await this.confirmPasswordInput.fill(password);
    await expect(this.confirmPasswordInput).toHaveValue(password);

    // Wait for API response
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes("/api/auth/register") && response.request().method() === "POST"
    );

    // Submit form and wait for page load
    await expect(this.signUpButton).toBeEnabled();
    await Promise.all([this.signUpButton.click(), this.page.waitForLoadState("domcontentloaded")]);

    const response = await responsePromise;

    if (response.ok()) {
      await this.successMessage.waitFor({ state: "visible", timeout: 5000 });
      await this.page.waitForLoadState("networkidle");
    } else {
      await this.errorNotification.waitFor({ state: "visible", timeout: 5000 });
    }
  }

  async expectSuccessMessage() {
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toContainText("Account created successfully");
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorNotification).toContainText(message);
  }
}
