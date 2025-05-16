import { z } from "zod";

const sourceEnum = z.enum(["manual", "ai-full", "ai-edited"] as const);

export const flashcardCreateSchema = z
  .object({
    front: z
      .string()
      .min(10, "Front text must be at least 10 characters long")
      .max(200, "Front text cannot exceed 200 characters"),
    back: z
      .string()
      .min(10, "Back text must be at least 10 characters long")
      .max(500, "Back text cannot exceed 500 characters"),
    source: sourceEnum,
    generation_id: z.number().nullable(),
  })
  .refine(
    (data) => {
      if (data.source === "manual") return true;
      return data.generation_id !== null;
    },
    {
      message: "generation_id is required for AI-generated flashcards",
      path: ["generation_id"],
    }
  );

export const flashcardsCreateCommandSchema = z.object({
  flashcards: z
    .array(flashcardCreateSchema)
    .min(1, "At least one flashcard is required")
    .max(100, "Cannot create more than 100 flashcards at once"),
});

export const flashcardsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1).describe("Page number (≥1)"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10).describe("Items per page (1-100)"),
  sort: z.enum(["created_at", "updated_at"]).optional().default("created_at").describe("Sort column"),
  order: z.enum(["asc", "desc"]).optional().default("desc").describe("Sort order"),
});

export type FlashcardsListQueryParams = z.infer<typeof flashcardsListQuerySchema>;
