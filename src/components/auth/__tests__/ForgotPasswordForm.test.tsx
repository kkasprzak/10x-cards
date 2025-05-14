import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { toast } from "sonner";
import ForgotPasswordForm from "../ForgotPasswordForm";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(toast.error).mockClear();
    vi.mocked(toast.success).mockClear();
  });

  it("renders form fields and submit button", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });

  it("shows validation error for empty email field", async () => {
    render(<ForgotPasswordForm />);

    const submitButton = screen.getByRole("button", { name: /reset password/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it("shows error for invalid email format", async () => {
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('has "Back to login" link pointing to `/login` in form view', () => {
    render(<ForgotPasswordForm />);

    const backToLoginLink = screen.getByText(/back to login/i);
    expect(backToLoginLink).toHaveAttribute("href", "/login");
  });
});
