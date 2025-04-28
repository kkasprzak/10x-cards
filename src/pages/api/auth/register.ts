import type { APIRoute } from "astro";
import { registerSchema } from "../../../lib/services/auth.service";
import { createSupabaseServerClient } from "../../../db/supabase.client";
import { AuthService } from "../../../lib/services/auth.service";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    // Validate request body
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error.issues[0].message }), { status: 400 });
    }

    const supabase = createSupabaseServerClient({ cookies, headers: request.headers });
    const authService = new AuthService(supabase);

    const { user, error } = await authService.register({
      email: result.data.email,
      password: result.data.password,
    });

    if (error || !user) {
      return new Response(JSON.stringify({ error: error || "Failed to create user" }), { status: 400 });
    }

    return new Response(JSON.stringify({ user: { id: user.id } }), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
