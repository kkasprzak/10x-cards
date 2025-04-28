import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { LoginCredentials, AuthResponse, RegisterCredentials } from "../../types";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export class AuthService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async register(credentials: Omit<RegisterCredentials, "confirmPassword">): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user || !data.user.email) {
      return { user: null, error: "Failed to create user" };
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signInWithPassword(credentials);

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: "User not found" };
    }

    if (!data.user.email) {
      return { user: null, error: "User email not found" };
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  }

  /**
   * Signs out the current user and clears the session
   * @throws Error if the sign out operation fails
   */
  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw new Error("Failed to sign out");
    }
  }
}
