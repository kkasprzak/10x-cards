import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../LoginForm";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock window.location.href since we'll be testing navigation
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  it("renders all form fields and submit button", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\? sign up/i)).toBeInTheDocument();
  });

  it("displays validation error for invalid email", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "@");
    await user.type(screen.getByLabelText(/^password$/i), "Password123!");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
  });

  it("displays validation error for short password", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "12345");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  it("handles successful login", async () => {
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Success" }),
    } as Response);

    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Password123!");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "Password123!",
      }),
    });

    // Check if redirected to /generate
    expect(window.location.href).toBe("/generate");
  });

  it("handles API error during login", async () => {
    const errorMessage = "Invalid credentials";
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: errorMessage }),
    } as Response);

    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Password123!");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it("handles network error during login", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Password123!");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });

  it("disables form inputs and shows loading state during submission", async () => {
    vi.spyOn(global, "fetch").mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ message: "Success" }),
              } as Response),
            100
          )
        )
    );

    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Password123!");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
    expect(screen.getByText(/signing in\.\.\./i)).toBeInTheDocument();
  });

  it("clears error when input changes", async () => {
    const errorMessage = "Invalid credentials";
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: errorMessage }),
    } as Response);

    render(<LoginForm />);
    const user = userEvent.setup();

    // First trigger an error
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Wait for error to appear
    const errorElement = await screen.findByText(errorMessage);
    expect(errorElement).toBeInTheDocument();

    // Change input and verify error is cleared
    await user.type(screen.getByLabelText(/email/i), "a");
    expect(errorElement).not.toBeInTheDocument();
  });
});
