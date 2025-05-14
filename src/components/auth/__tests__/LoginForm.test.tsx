import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginForm from "../LoginForm";

describe("LoginForm", () => {
  it("renders all form fields and submit button", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
  });

  it("shows validation errors for empty required fields", async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  it("shows error for invalid email format", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('has "Forgot your password?" link pointing to `/forgot-password`', () => {
    render(<LoginForm />);

    const forgotPasswordLink = screen.getByText(/forgot your password\?/i);
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
  });

  it('has "Don\'t have an account? Sign up" link pointing to `/register`', () => {
    render(<LoginForm />);

    const signUpLink = screen.getByText(/don't have an account\? sign up/i);
    expect(signUpLink).toHaveAttribute("href", "/register");
  });
});
