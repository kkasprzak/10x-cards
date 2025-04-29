import type { APIRoute } from "astro";
import { AuthService } from "@/lib/services/auth.service";

export const prerender = false;

interface LogoutResponse {
  success: boolean;
  message: string;
}

export const POST: APIRoute = async ({ locals }) => {
  const { supabase } = locals;
  const authService = new AuthService(supabase);

  try {
    await authService.logout();

    const response: LogoutResponse = {
      success: true,
      message: "Logged out successfully",
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const response: LogoutResponse = {
      success: false,
      message: error instanceof Error ? error.message : "Failed to sign out",
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
