import type { SupabaseClient } from "@supabase/supabase-js";
import type { FlashcardProposalDto, GenerationCreateResponseDto, Generation } from "../../types";
import { OpenRouterService } from "../openrouter.service";
import { z } from "zod";
import { OPENROUTER_API_KEY } from "astro:env/server";

export class GenerationService {
  private readonly openRouter: OpenRouterService;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string,
    openRouterApiKey: string = OPENROUTER_API_KEY
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

  private async generateTextHash(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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
    const textHash = await this.generateTextHash(params.sourceText);
    const { data: generation, error: insertError } = await this.supabase
      .from("generations")
      .insert({
        user_id: this.userId,
        model: this.openRouter.getModel(),
        generated_count: params.generatedCount,
        source_text_hash: textHash,
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
    const textHash = await this.generateTextHash(params.sourceText);
    await this.supabase.from("generation_error_logs").insert({
      user_id: this.userId,
      error_code: "GENERATION_FAILED",
      error_message: params.error instanceof Error ? params.error.message : "Unknown error",
      model: this.openRouter.getModel(),
      source_text_hash: textHash,
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
