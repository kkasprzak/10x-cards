import type { APIRoute } from "astro";
import { AuthService } from "@/lib/services/auth.service";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  const { supabase } = locals;
  const authService = new AuthService(supabase);

  try {
    await authService.logout();

    return new Response(JSON.stringify({ message: "Logged out successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Failed to sign out", { status: 500 });
  }
};
