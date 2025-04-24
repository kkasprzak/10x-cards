import type { SupabaseClient } from "@supabase/supabase-js";
import type { FlashcardProposalDto, GenerationCreateResponseDto, Generation } from "../../types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import crypto from "crypto";
import { OpenRouterService } from "../openrouter.service";
import { z } from "zod";

export class GenerationService {
  private readonly openRouter: OpenRouterService;

  constructor(
    private readonly supabase: SupabaseClient,
    openRouterApiKey: string = import.meta.env.OPENROUTER_API_KEY || ""
  ) {
    if (!openRouterApiKey) {
      throw new Error("OpenRouter API key is required");
    }
    this.openRouter = new OpenRouterService(openRouterApiKey);
    this.setupOpenRouter();
  }

  private setupOpenRouter(): void {
    // Set system message to explain the task
    this.openRouter.setSystemMessage(
      "You are a flashcard generation assistant. Your task is to create educational flashcards from the provided text. " +
        "Each flashcard should have a clear question on the front and a concise, accurate answer on the back. " +
        "Focus on key concepts, definitions, and important relationships in the text. " +
        "Make sure the flashcards are self-contained and understandable without additional context."
    );

    // Set response format schema for structured output
    const flashcardSchema = {
      type: "object",
      properties: {
        flashcards: {
          type: "array",
          items: {
            type: "object",
            properties: {
              front: {
                type: "string",
              },
              back: {
                type: "string",
              },
            },
            required: ["front", "back"],
            additionalProperties: false,
          },
        },
      },
      required: ["flashcards"],
      additionalProperties: false,
    };

    this.openRouter.setResponseFormat(flashcardSchema);
  }

  private generateTextHash(text: string): string {
    return crypto.createHash("md5").update(text).digest("hex");
  }

  private async callExternalAIService(sourceText: string): Promise<FlashcardProposalDto[]> {
    const prompt = `Please generate educational flashcards from the following text. Focus on key concepts and important information:

${sourceText}

Generate flashcards that capture the most important information from the text. Each flashcard should have a clear question on the front and a concise answer on the back.`;

    try {
      const response = await this.openRouter.sendChatMessage(prompt);
      const parsedResponse = JSON.parse(response.content);

      // Validate the response matches our expected format
      const flashcardSchema = z.object({
        flashcards: z.array(
          z.object({
            front: z.string().min(10).max(200),
            back: z.string().min(10).max(500),
          })
        ),
      });

      const validatedResponse = flashcardSchema.parse(parsedResponse);
      // Add source: "ai-full" to each flashcard
      const flashcardsWithSource = validatedResponse.flashcards.map((flashcard) => ({
        ...flashcard,
        source: "ai-full" as const,
      }));
      return flashcardsWithSource;
    } catch (error) {
      throw new Error("Failed to generate flashcards from the provided text:" + error);
    }
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
        model: this.openRouter.getModel(),
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
      model: this.openRouter.getModel(),
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
