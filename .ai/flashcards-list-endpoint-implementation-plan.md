# API Endpoint Implementation Plan: List Flashcards

## 1. Przegląd punktu końcowego
Pobranie paginowanej listy fiszek zalogowanego użytkownika.

## 2. Szczegóły żądania
- Metoda HTTP: `GET`
- Ścieżka: `/flashcards`
- Parametry zapytania:
  - Wymagane: brak
  - Opcjonalne:
    - `page`: liczba całkowita ≥ 1 (domyślnie 1)
    - `limit`: liczba całkowita ≥ 1 (domyślnie 10, maks. np. 100)
    - `sort`: nazwa kolumny tabeli, np. `"created_at"`
    - `order`: `"asc"` lub `"desc"` (domyślnie `"desc"`)
- Body: brak

## 3. Szczegóły odpowiedzi
- Kod statusu: `200 OK`
- Typ odpowiedzi: `FlashcardsListResponseDto`
- Struktura:
  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "Question text",
        "back": "Answer text",
        "source": "manual",
        "created_at": "2023-01-01T12:00:00Z",
        "updated_at": "2023-01-02T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100
    }
  }
  ```
- Wykorzystywane typy:
  - `FlashcardDto`
  - `PaginationDto`
  - `FlashcardsListResponseDto`

## 4. Przepływ danych
1. Middleware uwierzytelniający pobiera z `context.locals` obiekty `supabase` i `user` (`user.id`).
2. Walidacja parametrów zapytania przy użyciu `zod` (schema w `src/lib/validators/flashcard.validator.ts`).
3. Wywołanie metody `userFlashcards` z serwisu `src/lib/services/flashcard.service.ts`.
4. W serwisie:
   - Wykonanie zapytania:
     ```ts
     const { data, count, error } = await supabase
       .from('flashcards')
       .select('*', { count: 'exact' })
       .eq('user_id', userId)
       .range((page - 1) * limit, page * limit - 1)
       .order(sort, { ascending: order === 'asc' });
     ```
   - Obsługa błędów zapytania Supabase.
   - Mapowanie `data` na `FlashcardDto[]`.
   - Zwrócenie obiektu zawierającego `data`, `count`, `page`, `limit`.
5. Kontroler (API route) buduje obiekt `FlashcardsListResponseDto` i zwraca `Response.json(...)`.

## 5. Względy bezpieczeństwa
- Autoryzacja: endpoint dostępny tylko dla zalogowanych użytkowników (middleware).
- Autoryzacja danych: RLS w Supabase + filtr `.eq('user_id', userId)`.
- Walidacja wejścia: ochrona przed SQL injection i nieprawidłowymi typami.

## 6. Obsługa błędów
| Kod  | Przypadek                                | Treść odpowiedzi                         |
| ---- | ---------------------------------------- | ---------------------------------------- |
| 400  | Nieprawidłowe parametry (Zod)           | `{ "error": "Invalid query parameters" }` |
| 401  | Brak uwierzytelnienia (middleware)       | `{ "error": "Unauthorized" }`         |
| 500  | Błąd serwera (błąd Supabase lub wyjątek) | `{ "error": "Internal Server Error" }` |

## 7. Wydajność
- Indeksy na kolumnach `user_id`, `created_at`.
- Paginacja offset-limit – w przypadku bardzo dużych zbiorów rozważyć kursory lub klauzulę keyset pagination.
- Ograniczenie maksymalnego `limit` (np. 100) w walidacji.

## 8. Kroki implementacji
1. Utworzyć lub zaktualizować schema walidacji w `src/lib/validators/flashcard.validator.ts` dla parametrów.
2. Utworzyć w serwisie `src/lib/services/flashcard.service.ts` metode `userFlashcards`.
3. Dodać nowy endpoint w `src/pages/api/flashcards.ts`:
   - `export const GET` jako funkcja obsługi GET zgodnie z Astro Server Endpoint.
4. W endpointzie:
   - Pobranie `supabase` i `user` z `context.locals`.
   - Walidacja query przy użyciu stworzonej `zod` schema.
   - Wywołanie `userFlashcards`.
   - Zwrócenie `Response.json(...)` z kodem 200 lub odpowiednim błędem.