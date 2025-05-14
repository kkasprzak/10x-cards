import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordFormSchema, type ForgotPasswordFormData } from "@/lib/schemas/auth.schema";
import { toast } from "sonner";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (formData: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      // Form submission will be handled later
      setSubmittedEmail(formData.email);
      setSubmitted(true);
      toast.success("Check your email", {
        description: "If an account exists, you will receive password reset instructions.",
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
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold tracking-tight">Check your email</h3>
        <p className="mt-2 text-sm text-gray-600">
          If an account exists for {submittedEmail}, you will receive password reset instructions.
        </p>
        <a href="/login" className="text-sm text-indigo-600 hover:text-indigo-500 block">
          Back to login
        </a>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
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

        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500" disabled={isLoading}>
          {isLoading ? "Sending..." : "Reset password"}
        </Button>

        <div className="text-center">
          <a href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
            Back to login
          </a>
        </div>
      </form>
    </Form>
  );
}
