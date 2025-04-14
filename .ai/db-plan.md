# Schemat bazy danych PostgreSQL

## Tabele

### 1. users
- **id**: UUID PRIMARY KEY
- **email**: VARCHAR(255) NOT NULL UNIQUE
- **encrypted_password**: VARCHAR NOT NULL
- **confirmed_at**: TIMESTAMPTZ
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **confirmed_at**: TIMESTAMPTZ

### 2. flashcards
- **id**: BIGSERIAL PRIMARY KEY
- **front**: VARCHAR(200) NOT NULL
  - CHECK (char_length(front) BETWEEN 100 AND 200)
- **back**: VARCHAR(500) NOT NULL
  - CHECK (char_length(back) BETWEEN 100 AND 500)
- **source**: VARCHAR NOT NULL
  - CHECK (source IN ('ai-full', 'manual', 'ai-edited'))
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **generation_id**: BIGINT REFERENCES generations(id) ON DELETE SET NULL
- **user_id**: UUID NOT NULL REFERENCES users(id)

  *Trigger: Automatically update the `updated_at` column on record updates.*

### 3. generations
- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES users(id)
- **model**: VARCHAR NOT NULL
- **generated_count**: INTEGER NOT NULL
- **accepted_unedited_count**: INTEGER NULLABLE
- **accepted_edited_count**: INTEGER NULLABLE
- **source_text_hash**: VARCHAR NOT NULL
- **source_text_length**: INTEGER NOT NULL
  - CHECK (source_text_length BETWEEN 1000 AND 10000)
- **generation_duration**: INTEGER NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT now()

### 4. generation_error_logs
- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES users(id)
- **model**: VARCHAR NOT NULL
- **source_text_hash**: VARCHAR NOT NULL
- **source_text_length**: INTEGER NOT NULL
  - CHECK (source_text_length BETWEEN 1000 AND 10000)
- **error_code**: VARCHAR(100) NOT NULL
- **error_message**: TEXT NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()

## Relacje i Klucze
- `flashcards.user_id` → `users.id` (jeden użytkownik może posiadać wiele fiszek)
- `flashcards.generation_id` → `generations.id` (kazda fiszka moze opcjonalnie odnosic się do jednej generacji poprzez generation_id, fiszki dodawane manualnie mają generation_id jako null)
- `generations.user_id` → `users.id` (jeden użytkownik może mieć wiele sesji generacji)
- `generation_error_logs.user_id` → `users.id` (jeden użytkownik może mieć wiele logów błędów)

## Indeksy
- Utworzenie indeksu na kolumnie `flashcards.user_id`
- Utworzenie indeksu na kolumnie `generations.user_id`
- Utworzenie indeksu na kolumnie `generation_error_logs.user_id`
- Utworzenie indeksu na kolumnie `flashcards.generation_id`

*Dodatkowe indeksy mogą być rozważone na kolumnach często używanych do filtrowania (np. `source_text_hash`, `model`).*

## Zasady RLS (Row Level Security)

Dla tabel posiadających kolumnę `user_id` (tj. `flashcards`, `generations`, `generation_error_logs`) należy włączyć RLS i zastosować politykę ograniczającą dostęp do rekordów według:

```
CREATE POLICY "User can access own rows" ON <table>
  USING (user_id = auth.uid());
```

*(Reguły RLS muszą być wdrożone dla każdej z powyższych tabel, aby zapewnić, że użytkownik widzi tylko swoje dane.)*

## Dodatkowe Uwagi

- Wszystkie znaczniki czasu (`created_at`, `updated_at`) ustawiane są domyślnie na bieżący timestamp.