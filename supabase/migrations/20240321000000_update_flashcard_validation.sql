-- Update flashcard validation rules
ALTER TABLE flashcards
    DROP CONSTRAINT IF EXISTS flashcards_front_check,
    DROP CONSTRAINT IF EXISTS flashcards_back_check,
    ADD CONSTRAINT flashcards_front_check CHECK (char_length(front) between 10 and 200),
    ADD CONSTRAINT flashcards_back_check CHECK (char_length(back) between 10 and 500); 