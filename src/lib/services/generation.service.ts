import type { SupabaseClient } from "@supabase/supabase-js";
import type { FlashcardProposalDto, GenerationCreateResponseDto, Generation } from "../../types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import crypto from "crypto";

export class GenerationService {
  constructor(private readonly supabase: SupabaseClient) {}

  private generateTextHash(text: string): string {
    return crypto.createHash("md5").update(text).digest("hex");
  }

  private async callExternalAIService(sourceText: string): Promise<FlashcardProposalDto[]> {
    // Simulate network delay (1-3 seconds)
    const delay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Mock AI-generated flashcards based on common knowledge
    return [
      {
        front: "What is photosynthesis?",
        back: "A process by which plants convert light energy into chemical energy to produce glucose from carbon dioxide and water",
        source: "ai-full",
      },
      {
        front: "Who wrote 'Romeo and Juliet'?",
        back: "William Shakespeare wrote 'Romeo and Juliet', believed to be written between 1591 and 1595",
        source: "ai-full",
      },
      {
        front: "What is the capital of France?",
        back: "Paris is the capital and largest city of France, situated on the river Seine",
        source: "ai-full",
      },
      {
        front: "What is the speed of light?",
        back: "The speed of light in vacuum is approximately 299,792,458 meters per second",
        source: "ai-full",
      },
      {
        front: "What is the Pythagorean theorem?",
        back: "In a right triangle, the square of the length of the hypotenuse equals the sum of squares of the other two sides (a² + b² = c²)",
        source: "ai-full",
      },
    ];
  }

  private async saveGeneration(params: {
    sourceText: string;
    generatedCount: number;
    generationDuration: number;
  }): Promise<Generation> {
    const { data: generation, error: insertError } = await this.supabase
      .from("generations")
      .insert({
        user_id: DEFAULT_USER_ID,
        model: "mock-model",
        generated_count: params.generatedCount,
        source_text_hash: this.generateTextHash(params.sourceText),
        source_text_length: params.sourceText.length,
        generation_duration: params.generationDuration,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to save generation: ${insertError.message}`);
    }

    return generation;
  }

  private async logGenerationError(params: { sourceText: string; error: unknown }): Promise<void> {
    await this.supabase.from("generation_error_logs").insert({
      user_id: DEFAULT_USER_ID,
      error_code: "GENERATION_FAILED",
      error_message: params.error instanceof Error ? params.error.message : "Unknown error",
      model: "mock-model",
      source_text_hash: this.generateTextHash(params.sourceText),
      source_text_length: params.sourceText.length,
    });
  }

  async generateFlashcards(sourceText: string): Promise<GenerationCreateResponseDto> {
    const startTime = Date.now();

    try {
      // Call external AI service
      const proposals = await this.callExternalAIService(sourceText);
      const generationDuration = Date.now() - startTime;

      // Save generation to database
      const generation = await this.saveGeneration({
        sourceText,
        generatedCount: proposals.length,
        generationDuration,
      });

      return {
        generation_id: generation.id,
        flashcards_proposals: proposals,
        generated_count: proposals.length,
      };
    } catch (error) {
      // Log error to database
      await this.logGenerationError({
        sourceText,
        error,
      });

      throw error;
    }
  }
}
