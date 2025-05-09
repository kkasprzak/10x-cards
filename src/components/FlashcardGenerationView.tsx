import { useState } from "react";
import type { FlashcardProposalDto, GenerationCreateResponseDto } from "../types";
import { TextInputArea } from "./TextInputArea";
import { FlashcardsList } from "./FlashcardsList";
import { SkeletonLoader } from "./SkeletonLoader";
import { ErrorNotification } from "./ErrorNotification";
import { BulkSaveButton } from "./BulkSaveButton";
import { Alert, AlertDescription } from "./ui/alert";
import { CheckCircle2 } from "lucide-react";

export interface FlashcardProposalViewModel extends FlashcardProposalDto {
  accepted: boolean;
  edited: boolean;
}

export function FlashcardGenerationView() {
  const [textInput, setTextInput] = useState("");
  const [flashcardProposals, setFlashcardProposals] = useState<FlashcardProposalViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTextChange = (value: string) => {
    setTextInput(value);
    setError(null);
    setShowSuccess(false);
  };

  const handleGenerate = async () => {
    if (textInput.length < 1000 || textInput.length > 10000) {
      setError("Text must be between 1000 and 10000 characters");
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowSuccess(false);

    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_text: textInput }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data: GenerationCreateResponseDto = await response.json();
      setGenerationId(data.generation_id);
      setFlashcardProposals(
        data.flashcards_proposals.map((proposal) => ({
          ...proposal,
          accepted: false,
          edited: false,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = (index: number) => {
    setFlashcardProposals((prev) =>
      prev.map((proposal, i) => (i === index ? { ...proposal, accepted: true } : proposal))
    );
  };

  const handleEdit = (index: number, front: string, back: string) => {
    setFlashcardProposals((prev) =>
      prev.map((proposal, i) => (i === index ? { ...proposal, front, back, edited: true } : proposal))
    );
  };

  const handleReject = (index: number) => {
    setFlashcardProposals((prev) =>
      prev.map((proposal, i) => (i === index ? { ...proposal, accepted: false } : proposal))
    );
  };

  const handleSaveSuccess = () => {
    setShowSuccess(true);
    setTextInput("");
    setFlashcardProposals([]);
    setGenerationId(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6" data-testid="flashcard-generation-view">
      <TextInputArea
        value={textInput}
        onChange={handleTextChange}
        disabled={isLoading}
        onGenerate={handleGenerate}
        isGenerating={isLoading}
        data-testid="text-input-area"
      />

      {isLoading && <SkeletonLoader />}

      {error && <ErrorNotification message={error} onClose={() => setError(null)} />}

      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Flashcards have been saved successfully!</AlertDescription>
        </Alert>
      )}

      {flashcardProposals.length > 0 && (
        <>
          <FlashcardsList
            flashcards={flashcardProposals}
            onAccept={handleAccept}
            onEdit={handleEdit}
            onReject={handleReject}
            data-testid="flashcards-list"
          />

          <BulkSaveButton
            flashcards={flashcardProposals.filter((p) => p.accepted)}
            generationId={generationId || 0}
            onSuccess={handleSaveSuccess}
            data-testid="bulk-save-button"
          />
        </>
      )}
    </div>
  );
}
