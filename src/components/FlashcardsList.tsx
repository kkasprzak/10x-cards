import type { FlashcardProposalViewModel } from "./FlashcardGenerationView";
import { FlashcardListItem } from "./FlashcardListItem";

interface FlashcardsListProps {
  flashcards: FlashcardProposalViewModel[];
  onAccept: (index: number) => void;
  onEdit: (index: number, front: string, back: string) => void;
  onReject: (index: number) => void;
}

export function FlashcardsList({ flashcards, onAccept, onEdit, onReject }: FlashcardsListProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {flashcards.map((flashcard, index) => (
        <FlashcardListItem
          key={index}
          flashcard={flashcard}
          onAccept={() => onAccept(index)}
          onEdit={(front: string, back: string) => onEdit(index, front, back)}
          onReject={() => onReject(index)}
        />
      ))}
    </div>
  );
}
