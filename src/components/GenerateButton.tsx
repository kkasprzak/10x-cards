import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export function GenerateButton({ onClick, disabled, isLoading }: GenerateButtonProps) {
  const buttonText = isLoading ? "Generating..." : "Generate Flashcards";
  const loader = isLoading ? <Loader2 className="animate-spin" /> : null;

  return (
    <Button onClick={onClick} disabled={disabled || isLoading} className="w-full sm:w-auto">
      {loader}
      {buttonText}
    </Button>
  );
}
