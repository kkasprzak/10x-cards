import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, request, redirect }, next) => {
  // Create Supabase client with cookie handling
  const supabase = createSupabaseServerClient({
    cookies,
    headers: request.headers,
  });

  // Add supabase client to locals for use in API routes and pages
  locals.supabase = supabase;

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(new URL(request.url).pathname)) {
    return next();
  }

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    // Add user to locals if authenticated and has email
    locals.user = {
      id: user.id,
      email: user.email,
    };
    return next();
  }

  // Redirect to login for protected routes
  return redirect("/login");
});
