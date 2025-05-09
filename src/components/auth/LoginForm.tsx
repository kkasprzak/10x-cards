import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../lib/services/auth.service";
import { ErrorNotification } from "../ErrorNotification";
import { Button } from "../ui/button";
import type { LoginCredentials } from "../../types";

export default function LoginForm() {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const watchedEmail = watch("email");
  const watchedPassword = watch("password");

  useEffect(() => {
    if (apiError) {
      setApiError(null);
    }
  }, [watchedEmail, watchedPassword, apiError]);

  const onSubmit: SubmitHandler<LoginCredentials> = async (data) => {
    setApiError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Login failed");
      }

      window.location.href = "/generate";
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="login-form">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
            errors.email
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          }`}
          {...register("email")}
          disabled={isSubmitting}
          data-test-id="login-email-input"
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-xs text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
            errors.password
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          }`}
          {...register("password")}
          disabled={isSubmitting}
          data-test-id="login-password-input"
          aria-invalid={errors.password ? "true" : "false"}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && (
          <p id="password-error" className="mt-1 text-xs text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      {apiError && <ErrorNotification message={apiError} onClose={() => setApiError(null)} />}

      <div className="flex items-center justify-between">
        <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
          Forgot your password?
        </a>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        variant="default"
        className="w-full"
        data-test-id="login-submit-button"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <div className="text-center">
        <a href="/register" className="text-sm text-indigo-600 hover:text-indigo-500">
          Don&apos;t have an account? Sign up
        </a>
      </div>
    </form>
  );
}
