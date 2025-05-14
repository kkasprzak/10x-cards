# Authentication Forms Refactoring Plan

## Current State Analysis

### Components Overview

1. **LoginForm.tsx**
   - Already implements React Hook Form
   - Handles login credentials validation
   - Manages API error states
   - Direct window.location navigation
   - Complex className logic in inputs

2. **RegisterForm.tsx**
   - Uses manual form state management with useState
   - Handles registration validation
   - Manual error state management
   - Direct API calls in component

3. **ForgotPasswordForm.tsx**
   - Simple component without React Hook Form
   - Manual form validation with Zod
   - Basic state management
   - Minimal error handling

### Common Patterns & Issues

1. **Form State Management**
   - Inconsistent approaches (React Hook Form vs manual useState)
   - Different error handling patterns
   - Duplicate validation logic

2. **API Calls**
   - Direct fetch calls within components
   - No centralized error handling
   - Inconsistent loading state management

3. **Validation**
   - Mix of Zod schemas and manual validation
   - Inconsistent validation approaches
   - Some duplicate validation logic

4. **Navigation**
   - Direct window.location usage
   - No consistent navigation pattern

## Refactoring Plan

### 1. Component Structure Changes

Instead of creating a custom FormField component, we'll use shadcn/ui's Form components that are specifically designed to work with React Hook Form:

```typescript
// Example of refactored RegisterForm.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { registerSchema } from "@/lib/services/auth.service"
import { useAuth } from "@/hooks/useAuth"
import type { RegisterCredentials } from "@/types"

export function RegisterForm() {
  const { handleAuthAction } = useAuth()
  const form = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: RegisterCredentials) => {
    await handleAuthAction(
      () => authService.register(data),
      "/login"
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Input 
                  type="password" 
                  {...field} 
                />
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
                <Input 
                  type="password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  )
}
```

This approach:
- Uses shadcn/ui's Form components that are specifically designed for React Hook Form
- Provides better type safety through form control props
- Handles form state and validation messages elegantly
- Maintains consistent styling and accessibility
- Integrates seamlessly with Zod schemas

### 2. Form Components Installation

Install required shadcn/ui components using either pnpm or npx:

```bash
# Using pnpm
pnpm dlx shadcn@latest add form input button sonner

# Using npx
npx shadcn-ui@latest add form input button sonner
```

### 3. Schema and Type Organization

We need to separate frontend form schemas from backend validation:

```typescript
// src/lib/schemas/auth.schema.ts (Frontend Schemas)
import { z } from "zod"

export const loginFormSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
});

export const registerFormSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordFormSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
});

// Form types using schema inference
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;
```

The existing backend types and validation remain in their current locations:

```typescript
// src/types.ts (API Types)
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

// src/lib/services/auth.service.ts (Backend Service)
import type { LoginCredentials, RegisterCredentials } from "@/types";

export class AuthService {
  async login(credentials: LoginCredentials) {
    // Backend validation and API calls
  }
}
```

### 4. Example Implementation (LoginForm)

```typescript
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, type LoginFormData } from "@/lib/schemas/auth.schema";
import type { LoginCredentials } from "@/types";
import { AuthService } from "@/lib/services/auth.service";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData: LoginFormData) => {
    try {
      setIsLoading(true);
      
      // Map form data to API type
      const credentials: LoginCredentials = {
        email: formData.email,
        password: formData.password,
      };

      const response = await AuthService.login(credentials);

      if (response.error) {
        toast.error("Login failed", {
          description: response.error,
        });
        return;
      }

      toast.success("Success", {
        description: "You have been logged in successfully.",
      });

      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-6"
        noValidate
      >
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
                <Input
                  type="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <a
            href="/forgot-password"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Forgot your password?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}
```

## Implementation Priority

1. Install required shadcn/ui components using either pnpm or npx:
   ```bash
   # Using pnpm
   pnpm dlx shadcn@latest add form input button sonner

   # Using npx
   npx shadcn-ui@latest add form input button sonner
   ```

2. Add Toaster component to the root layout:
   ```typescript
   // src/layouts/Layout.astro
   ---
   // ... other imports
   import { Toaster } from "@/components/ui/sonner";
   ---

   <html lang="en">
     <head>
       <!-- ... -->
     </head>
     <body>
       <slot />
       <Toaster />
     </body>
   </html>
   ```

3. Create frontend schema definitions (`auth.schema.ts`)
4. Implement forms in this order:
   - LoginForm (simplest with just email/password)
   - ForgotPasswordForm (single field)
   - RegisterForm (most complex with password confirmation)
5. Add toast notifications for success/error states
6. Implement test suite
7. Add E2E tests

## Testing Strategy

1. **Unit Tests**
```typescript
// src/components/auth/__tests__/RegisterForm.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { RegisterForm } from "../RegisterForm"

describe("RegisterForm", () => {
  it("displays validation errors for invalid input", async () => {
    render(<RegisterForm />)
    
    fireEvent.click(screen.getByRole("button", { name: /create account/i }))
    
    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument()
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument()
  })

  it("handles successful registration", async () => {
    const mockRegister = vi.spyOn(authService, "register")
    mockRegister.mockResolvedValueOnce()
    
    render(<RegisterForm />)
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" }
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" }
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" }
    })
    
    fireEvent.click(screen.getByRole("button", { name: /create account/i }))
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123"
      })
    })
  })
})
```

## Benefits

- Clear separation between frontend and backend validation
- Enhanced UX with frontend-specific validation messages
- Type-safe form handling with separate form and API types
- Consistent UI using shadcn/ui Form components
- Built-in accessibility features
- Comprehensive error handling
- Reduced boilerplate code
- Better maintainability 