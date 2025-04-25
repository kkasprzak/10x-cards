import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { LoginCredentials, AuthResponse } from "../../types";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export class AuthService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

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
