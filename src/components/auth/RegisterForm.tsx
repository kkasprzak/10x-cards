import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema, type RegisterFormData } from "@/lib/schemas/auth.schema";
import { toast } from "sonner";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (formData: RegisterFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("Registration failed", {
          description: data.error || "An unexpected error occurred",
        });
        return;
      }

      setSubmitted(true);
      toast.success("Account created!", {
        description: "You can now sign in with your credentials.",
      });
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-4" data-testid="register-success">
        <h3 className="text-2xl font-bold tracking-tight">Account created successfully!</h3>
        <p className="mt-2 text-sm text-gray-600">You can now sign in with your new account.</p>
        <a href="/login" className="text-sm text-indigo-600 hover:text-indigo-500 block">
          Sign in
        </a>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate data-testid="register-form">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </Button>

        <div className="text-center">
          <a href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
            Already have an account? Sign in
          </a>
        </div>
      </form>
    </Form>
  );
}
