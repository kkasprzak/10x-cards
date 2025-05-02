import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import type { ChangeEvent } from "react";

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function TextInputArea({ value, onChange, disabled, onGenerate, isGenerating }: TextInputAreaProps) {
  const characterCount = value.length;
  const isValid = characterCount >= 1000 && characterCount <= 10000;
  const remainingChars = 10000 - characterCount;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-4 border bg-card rounded-lg border shadow-sm">
      <div className="p-8">
        <h2 className="block text-sm font-medium text-gray-700 mb-1">Enter your text</h2>
        <Textarea
          placeholder="Enter text to generate flashcards (minimum 1000 characters, maximum 10000 characters)"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="mt-1 block min-h-[200px]"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-gray-500">
            <span>Characters: {characterCount}/10000</span>
            {!isValid && characterCount > 0 && (
              <span className="text-red-500 ml-2">
                {characterCount < 1000
                  ? `${1000 - characterCount} more characters needed`
                  : `${Math.abs(remainingChars)} characters over limit`}
              </span>
            )}
          </div>
          <Button
            onClick={onGenerate}
            disabled={!isValid || isGenerating || disabled}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            {isGenerating && <Loader2 className="animate-spin" />}
            {isGenerating ? "Generating..." : "Generate Flashcards"}
          </Button>
        </div>
      </div>
    </div>
  );
}
