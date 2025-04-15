import type { SupabaseClient } from "@supabase/supabase-js";
import type { FlashcardProposalDto, GenerationCreateResponseDto } from "../../types";

export class GenerationService {
  constructor(private readonly supabase: SupabaseClient) {}

  async generateFlashcards(sourceText: string, userId: string): Promise<GenerationCreateResponseDto> {
    const startTime = Date.now();

    try {
      // TODO: Call external AI service
      // For now, return mock data
      const mockProposals: FlashcardProposalDto[] = [
        {
          front: "Mock front",
          back: "Mock back",
          source: "ai-full",
        },
      ];

      // Calculate generation duration
      const generationDuration = Date.now() - startTime;

      // Create generation record in database
      const { data: generation, error: insertError } = await this.supabase
        .from("generations")
        .insert({
          user_id: userId,
          model: "mock-model",
          generated_count: mockProposals.length,
          source_text_hash: "mock-hash", // TODO: Implement proper hashing
          source_text_length: sourceText.length,
          generation_duration: generationDuration,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to save generation: ${insertError.message}`);
      }

      return {
        generation_id: generation.id,
        flashcards_proposals: mockProposals,
        generated_count: mockProposals.length,
      };
    } catch (error) {
      // Log error to generation_error_logs table
      await this.supabase.from("generation_error_logs").insert({
        user_id: userId,
        error_code: "GENERATION_FAILED",
        error_message: error instanceof Error ? error.message : "Unknown error",
        model: "mock-model",
        source_text_hash: "mock-hash",
        source_text_length: sourceText.length,
      });

      throw error;
    }
  }
}
