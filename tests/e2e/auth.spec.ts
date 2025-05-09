import { test } from "@playwright/test";
import { HomePage } from "./pages/home.page";
import { LoginPage } from "./pages/login.page";
import { GeneratePage } from "./pages/generate.page";
import { TEST_USER, INVALID_USER } from "./config/test.config";

test.describe("Authentication flows", () => {
  let homePage: HomePage;
  let loginPage: LoginPage;
  let generatePage: GeneratePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    generatePage = new GeneratePage(page);
  });

  test("successful login flow", async () => {
    await test.step("navigate to home page", async () => {
      await homePage.goto();
      await homePage.expectTitleVisible();
    });

    await test.step("click login button", async () => {
      await homePage.clickLogin();
      await loginPage.expectFormVisible();
    });

    await test.step("fill and submit login form", async () => {
      await loginPage.login(TEST_USER.email, TEST_USER.password);
    });

    await test.step("verify successful login and redirection", async () => {
      await generatePage.expectPageLoaded();
    });
  });

  test("displays error for invalid credentials", async () => {
    await test.step("navigate to login page", async () => {
      await loginPage.goto();
      await loginPage.expectFormVisible();
    });

    await test.step("attempt login with invalid credentials", async () => {
      await loginPage.login(INVALID_USER.email, INVALID_USER.password);
    });

    await test.step("verify error message", async () => {
      await loginPage.expectErrorMessage("Invalid credentials");
    });
  });

  test("redirects to login when accessing protected route", async () => {
    await test.step("attempt to access generate page directly", async () => {
      await generatePage.goto();
    });

    await test.step("verify redirect to login page", async () => {
      await generatePage.expectRedirectToLoginIfNotAuthenticated();
      await loginPage.expectFormVisible();
    });
  });
});
