import { useState } from "react";
import { loginSchema } from "../../lib/services/auth.service";
import { ErrorNotification } from "../ErrorNotification";
import { Button } from "../ui/button";
import type { LoginCredentials } from "../../types";

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

      // Przekierowanie po udanym logowaniu
      window.location.href = "/generate";
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          disabled={isLoading}
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
          disabled={isLoading}
        />
      </div>

      {error && <ErrorNotification message={error} onClose={() => setError(null)} />}

      <div className="flex items-center justify-between">
        <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
          Forgot your password?
        </a>
      </div>

      <Button type="submit" disabled={isLoading} variant="default" className="w-full">
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
