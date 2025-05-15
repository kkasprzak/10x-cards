import { test } from "@playwright/test";
import { HomePage } from "./pages/home.page";
import { LoginPage } from "./pages/login.page";
import { RegisterPage } from "./pages/register.page";
import { GeneratePage } from "./pages/generate.page";
import { TEST_USER } from "./config/test.config";
import { generateTestEmail, generateStrongPassword } from "./utils/test-data";

test.describe("Authentication flows", () => {
  let homePage: HomePage;
  let loginPage: LoginPage;
  let registerPage: RegisterPage;
  let generatePage: GeneratePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
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

  test("successful registration flow", async () => {
    const testEmail = generateTestEmail();
    const testPassword = generateStrongPassword();

    await test.step("navigate to home page", async () => {
      await homePage.goto();
      await homePage.expectTitleVisible();
    });

    await test.step("click sign up button", async () => {
      await homePage.clickSignUp();
      await registerPage.expectFormVisible();
    });

    await test.step("fill and submit registration form", async () => {
      await registerPage.register(testEmail, testPassword);
    });

    await test.step("verify successful registration", async () => {
      await registerPage.expectSuccessMessage();
    });
  });
});
