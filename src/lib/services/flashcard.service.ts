import type { SupabaseClient } from "@supabase/supabase-js";
import type { FlashcardCreateDto, FlashcardDto } from "../../types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

export interface FlashcardCreationResult {
  success: FlashcardDto[];
  failed: {
    flashcard: FlashcardCreateDto;
    error: string;
  }[];
}

export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient) {}

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
            user_id: DEFAULT_USER_ID,
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
}
