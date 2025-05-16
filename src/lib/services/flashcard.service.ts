import type { SupabaseClient } from "@supabase/supabase-js";
import type { FlashcardCreateDto, FlashcardDto, FlashcardsListResponseDto, PaginationDto } from "../../types";
import type { FlashcardsListQueryParams } from "../validators/flashcard.validator";

export interface FlashcardCreationResult {
  success: FlashcardDto[];
  failed: {
    flashcard: FlashcardCreateDto;
    error: string;
  }[];
}

export class FlashcardService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string
  ) {}

  async createFlashcards(flashcards: FlashcardCreateDto[]): Promise<FlashcardCreationResult> {
    const result: FlashcardCreationResult = {
      success: [],
      failed: [],
    };

    // Process flashcards one by one to handle partial success
    for (const flashcard of flashcards) {
      try {
        const { data, error } = await this.supabase
          .from("flashcards")
          .insert({
            ...flashcard,
            user_id: this.userId,
          })
          .select()
          .single();

        if (error) {
          result.failed.push({
            flashcard,
            error: error.message,
          });
        } else {
          result.success.push(data);
        }
      } catch (error) {
        result.failed.push({
          flashcard,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return result;
  }

  async getUserFlashcards(params: FlashcardsListQueryParams): Promise<FlashcardsListResponseDto> {
    const { page, limit, sort, order } = params;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, count, error } = await this.supabase
      .from("flashcards")
      .select("*", { count: "exact" })
      .eq("user_id", this.userId)
      .range(start, end)
      .order(sort, { ascending: order === "asc" });

    if (error) {
      throw new Error(`Failed to fetch flashcards: ${error.message}`);
    }

    const flashcards: FlashcardDto[] =
      data?.map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        source: card.source,
        created_at: card.created_at,
        updated_at: card.updated_at,
      })) ?? [];

    const pagination: PaginationDto = {
      page,
      limit,
      total: count ?? 0,
    };

    return {
      data: flashcards,
      pagination,
    };
  }
}
