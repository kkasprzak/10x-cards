import { useState } from "react";
import { Button } from "./ui/button";
import { Save } from "lucide-react";
import type { FlashcardProposalViewModel } from "./FlashcardGenerationView";
import type { FlashcardCreateDto } from "../types";

interface BulkSaveButtonProps {
  flashcards: FlashcardProposalViewModel[];
  generationId: number;
  onSuccess: () => void;
}

export function BulkSaveButton({ flashcards, generationId, onSuccess }: BulkSaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFlashcard = (flashcard: FlashcardProposalViewModel): string | null => {
    if (flashcard.front.length < 10 || flashcard.front.length > 200) {
      return `Front side must be between 10 and 200 characters (currently ${flashcard.front.length})`;
    }
    if (flashcard.back.length < 10 || flashcard.back.length > 500) {
      return `Back side must be between 10 and 500 characters (currently ${flashcard.back.length})`;
    }
    return null;
  };

  const handleSave = async () => {
    // Validate all flashcards first
    for (const flashcard of flashcards) {
      const validationError = validateFlashcard(flashcard);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      const flashcardsToSave: FlashcardCreateDto[] = flashcards.map((flashcard) => ({
        front: flashcard.front,
        back: flashcard.back,
        source: flashcard.edited ? "ai-edited" : "ai-full",
        generation_id: generationId,
      }));

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flashcards: flashcardsToSave }),
      });

      if (!response.ok) {
        if (response.status === 207) {
          const data = await response.json();
          throw new Error(`Some flashcards could not be saved: ${data.message}`);
        }
        throw new Error("Failed to save flashcards");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while saving flashcards");
    } finally {
      setIsSaving(false);
    }
  };

  if (flashcards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}
      <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? "Saving..." : `Save ${flashcards.length} Flashcard${flashcards.length === 1 ? "" : "s"}`}
      </Button>
    </div>
  );
}
