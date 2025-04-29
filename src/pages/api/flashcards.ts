import type { APIRoute } from "astro";
import { FlashcardService } from "../../lib/services/flashcard.service";
import { flashcardsCreateCommandSchema } from "../../lib/validators/flashcard.validator";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Ensure user is authenticated
    if (!locals.user?.id) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to create flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();

    // Validate input data
    const validationResult = flashcardsCreateCommandSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const flashcardService = new FlashcardService(locals.supabase, locals.user.id);
    const result = await flashcardService.createFlashcards(validationResult.data.flashcards);

    // If some flashcards failed to create, return 207 Multi-Status
    if (result.failed.length > 0) {
      return new Response(
        JSON.stringify({
          message: "Some flashcards failed to create",
          success: result.success,
          failed: result.failed,
        }),
        {
          status: 207,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // All flashcards created successfully
    return new Response(JSON.stringify({ flashcards: result.success }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Return error response without logging
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
