import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordForm from "../ForgotPasswordForm";

describe("ForgotPasswordForm", () => {
  it("renders form fields and submit button", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });

  it("shows success message after form submission", async () => {
    render(<ForgotPasswordForm />);
    const user = userEvent.setup();
    const testEmail = "test@example.com";

    await user.type(screen.getByLabelText(/email address/i), testEmail);
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`If an account exists for ${testEmail}`, "i"))).toBeInTheDocument();
    expect(screen.getByText(/return to login/i)).toBeInTheDocument();
  });

  it("requires email field to be filled", async () => {
    render(<ForgotPasswordForm />);
    const user = userEvent.setup();

    // Try to submit without entering email
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    // Email input should still be visible (form not submitted)
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it("updates email state when typing", async () => {
    render(<ForgotPasswordForm />);
    const user = userEvent.setup();
    const testEmail = "test@example.com";

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, testEmail);

    expect(emailInput).toHaveValue(testEmail);
  });

  it("navigates back to login when clicking the back link", () => {
    render(<ForgotPasswordForm />);

    const loginLink = screen.getByText(/back to login/i);
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("navigates to login from success message", async () => {
    render(<ForgotPasswordForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    const returnLink = screen.getByText(/return to login/i);
    expect(returnLink).toHaveAttribute("href", "/login");
  });

  it("displays validation error for invalid email format", async () => {
    render(<ForgotPasswordForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), "invalid-email");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
  });

  it("clears error when email input changes", async () => {
    render(<ForgotPasswordForm />);
    const user = userEvent.setup();

    // First trigger an error
    await user.type(screen.getByLabelText(/email address/i), "invalid-email");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    // Verify error is shown
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();

    // Change input and verify error is cleared
    await user.type(screen.getByLabelText(/email address/i), "a");
    expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument();
  });
});
