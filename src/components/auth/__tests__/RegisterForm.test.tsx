import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "../RegisterForm";

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all form fields and submit button", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("displays validation error for invalid email", async () => {
    render(<RegisterForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "@");
    await user.type(screen.getByLabelText(/^password$/i), "Password123!");
    await user.type(screen.getByLabelText(/confirm password/i), "Password123!");

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    const errorElement = await screen.findByTestId("form-error");
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent(/invalid email format/i);
  });

  it("displays error when passwords don't match", async () => {
    render(<RegisterForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Password123!");
    await user.type(screen.getByLabelText(/confirm password/i), "DifferentPass123!");

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
  });

  it("handles successful registration", async () => {
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Success" }),
    } as Response);

    render(<RegisterForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Password123!");
    await user.type(screen.getByLabelText(/confirm password/i), "Password123!");

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      }),
    });

    expect(await screen.findByText(/account created successfully/i)).toBeInTheDocument();
    expect(await screen.findByText(/sign in/i)).toBeInTheDocument();
  });

  it("handles API error during registration", async () => {
    const errorMessage = "Registration failed";
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: errorMessage }),
    } as Response);

    render(<RegisterForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Password123!");
    await user.type(screen.getByLabelText(/confirm password/i), "Password123!");

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it("handles network error during registration", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

    render(<RegisterForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Password123!");
    await user.type(screen.getByLabelText(/confirm password/i), "Password123!");

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText(/an error occurred during registration/i)).toBeInTheDocument();
  });
});
