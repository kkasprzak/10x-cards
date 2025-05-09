const { E2E_USERNAME, E2E_PASSWORD } = process.env;

if (!E2E_USERNAME || !E2E_PASSWORD) {
  throw new Error("E2E_USERNAME and E2E_PASSWORD environment variables must be set");
}

export const TEST_USER = {
  email: E2E_USERNAME,
  password: E2E_PASSWORD,
} as const;

export const INVALID_USER = {
  email: "invalid@example.com",
  password: "WrongPassword123!",
} as const;
