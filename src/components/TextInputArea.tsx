import { Textarea } from "./ui/textarea";
import type { ChangeEvent } from "react";

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TextInputArea({ value, onChange, disabled }: TextInputAreaProps) {
  const characterCount = value.length;
  const isValid = characterCount >= 1000 && characterCount <= 10000;
  const remainingChars = 10000 - characterCount;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 shadow-sm hover:border-slate-300 transition-colors">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Enter your text</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <Textarea
            placeholder="Enter text to generate flashcards (minimum 1000 characters, maximum 10000 characters)"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className="min-h-[200px] bg-white"
          />
          <div className="text-sm text-gray-500 flex justify-between">
            <span>Characters: {characterCount}/10000</span>
            {!isValid && characterCount > 0 && (
              <span className="text-red-500">
                {characterCount < 1000
                  ? `${1000 - characterCount} more characters needed`
                  : `${Math.abs(remainingChars)} characters over limit`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
