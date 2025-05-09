import { useState } from "react";
import { loginSchema } from "../../lib/services/auth.service";
import { ErrorNotification } from "../ErrorNotification";
import { Button } from "../ui/button";
import type { LoginCredentials } from "../../types";
import { ZodError } from "zod";

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add validation on input change
  const validateField = (name: keyof LoginCredentials, value: string) => {
    try {
      loginSchema.shape[name].parse(value);
      return null;
    } catch (err) {
      if (err instanceof ZodError) {
        return err.errors[0].message;
      }
      return null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      return newData;
    });

    // Clear error when user starts typing
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const validatedData = loginSchema.parse(formData);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      window.location.href = "/generate";
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((error) => error.message).join(", ");
        setError(errorMessages);
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={formData.email}
          onChange={handleInputChange}
          onBlur={(e) => {
            const fieldError = validateField("email", e.target.value);
            if (fieldError) setError(fieldError);
          }}
          disabled={isLoading}
          data-test-id="login-email-input"
          aria-invalid={error ? "true" : "false"}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={formData.password}
          onChange={handleInputChange}
          onBlur={(e) => {
            const fieldError = validateField("password", e.target.value);
            if (fieldError) setError(fieldError);
          }}
          disabled={isLoading}
          data-test-id="login-password-input"
          aria-invalid={error ? "true" : "false"}
        />
      </div>

      {error && <ErrorNotification message={error} onClose={() => setError(null)} />}

      <div className="flex items-center justify-between">
        <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
          Forgot your password?
        </a>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        variant="default"
        className="w-full"
        data-test-id="login-submit-button"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>

      <div className="text-center">
        <a href="/register" className="text-sm text-indigo-600 hover:text-indigo-500">
          Don&apos;t have an account? Sign up
        </a>
      </div>
    </form>
  );
}
