import { useState } from "react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Check, X, Edit } from "lucide-react";
import type { FlashcardProposalViewModel } from "./FlashcardGenerationView";

interface FlashcardListItemProps {
  flashcard: FlashcardProposalViewModel;
  onAccept: () => void;
  onEdit: (front: string, back: string) => void;
  onReject: () => void;
}

export function FlashcardListItem({ flashcard, onAccept, onEdit, onReject }: FlashcardListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(flashcard.front);
  const [editedBack, setEditedBack] = useState(flashcard.back);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFields = (): boolean => {
    if (editedFront.length < 10 || editedFront.length > 200) {
      setValidationError(`Front side must be between 10 and 200 characters (currently ${editedFront.length})`);
      return false;
    }
    if (editedBack.length < 10 || editedBack.length > 500) {
      setValidationError(`Back side must be between 10 and 500 characters (currently ${editedBack.length})`);
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSaveEdit = () => {
    if (validateFields()) {
      onEdit(editedFront, editedBack);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
    setValidationError(null);
    setIsEditing(false);
  };

  return (
    <>
      <Card className={`${flashcard.accepted ? "border-green-500" : flashcard.edited ? "border-blue-500" : ""}`}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Front</h3>
              <p className="text-sm">{flashcard.front}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Back</h3>
              <p className="text-sm">{flashcard.back}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end space-x-2">
          <Button variant={flashcard.accepted ? "default" : "outline"} size="sm" onClick={onAccept} className="w-24">
            <Check className="mr-2 h-4 w-4" />
            {flashcard.accepted ? "Accepted" : "Accept"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="w-24">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onReject} className="w-24">
            <X className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="front" className="text-sm font-medium">
                Front <span className="text-gray-500">(10-200 characters)</span>
              </label>
              <Textarea
                id="front"
                value={editedFront}
                onChange={(e) => {
                  setEditedFront(e.target.value);
                  setValidationError(null);
                }}
                className="min-h-[100px]"
              />
              <div className="text-sm text-gray-500">Characters: {editedFront.length}/200</div>
            </div>
            <div className="space-y-2">
              <label htmlFor="back" className="text-sm font-medium">
                Back <span className="text-gray-500">(10-500 characters)</span>
              </label>
              <Textarea
                id="back"
                value={editedBack}
                onChange={(e) => {
                  setEditedBack(e.target.value);
                  setValidationError(null);
                }}
                className="min-h-[100px]"
              />
              <div className="text-sm text-gray-500">Characters: {editedBack.length}/500</div>
            </div>
            {validationError && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{validationError}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
