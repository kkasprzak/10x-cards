import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

export const registerFormSchema = z
  .object({
    email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordFormSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
});

// Form types using schema inference
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;
