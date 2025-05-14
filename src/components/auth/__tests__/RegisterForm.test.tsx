import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RegisterForm from "../RegisterForm";

describe("RegisterForm", () => {
  it("renders all form fields and submit button", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty required fields", async () => {
    render(<RegisterForm />);

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/please confirm your password/i)).toBeInTheDocument();
  });

  it("shows error for invalid email format", async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it("shows error for password too short", async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "12345" } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  it("shows error when password and confirmPassword do not match", async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "password456" } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });
});
