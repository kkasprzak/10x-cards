import { Alert, AlertDescription } from "./ui/alert";
import { XCircle, X } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
}

export function ErrorNotification({ message, onClose }: ErrorNotificationProps) {
  return (
    <Alert variant="destructive" className="relative">
      <XCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
      <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-6 w-6 p-0" onClick={onClose}>
        <X className="h-4 w-4" />
        <span className="sr-only">Close error message</span>
      </Button>
    </Alert>
  );
}
