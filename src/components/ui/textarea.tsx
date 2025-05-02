import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "block w-full min-h-16 field-sizing-content",
        "rounded-md border border-gray-300 bg-white px-3 py-2",
        "text-base md:text-sm",
        "placeholder:text-muted-foreground",
        "outline-none",
        "focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        "shadow-xs transition-[color,box-shadow]",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
