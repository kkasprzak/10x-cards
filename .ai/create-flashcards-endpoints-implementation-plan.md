# API Endpoint Implementation Plan: Create Flashcards Endpoint

## 1. Przegląd punktu końcowego
Endpoint służy do tworzenia jednej lub wielu fiszek. Obsługuje zarówno ręczne dodawanie fiszek, jak i te generowane przez AI. Endpoint przyjmuje dane w formacie JSON zawierający tablicę obiektów fiszek, waliduje dane wejściowe oraz dokonuje operacji insercji w bazie danych z uwzględnieniem logiki biznesowej i zasad bezpieczeństwa.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: /flashcards
- **Parametry**:
  - Wymagane: 
    - `flashcards` (tablica obiektów)
      - Każdy obiekt musi zawierać:
        - `front`: string, min. 10 znaków, max. 200 znaków
        - `back`: string, min. 10 znaków, max. 500 znaków
        - `source`: string, dozwolone wartości: "manual", "ai-full", "ai-edited"
      - Dodatkowo, gdy `source` to "ai-full" lub "ai-edited", wymagany jest:
        - `generation_id`: number (referencja do istniejącej sesji generacji)
  - Opcjonalne: 
    - `generation_id` jest opcjonalny jeżeli `source` to "manual"

- **Request Body Example**:
  ```json
  {
    "flashcards": [
      {
        "front": "Question 1",
        "back": "Answer 1",
        "source": "ai-full",
        "generation_id": 345
      },
      {
        "front": "Question 2",
        "back": "Answer 2",
        "source": "ai-edited",
        "generation_id": 123
      },
      {
        "front": "Question 3",
        "back": "Answer 3",
        "source": "manual",
        "generation_id": null
      }
    ]
  }
  ```

## 3. Wykorzystywane typy
- **DTOs i Command Modele**:
  - `FlashcardCreateDto`: definiuje pola `front`, `back`, `source`, `generation_id`
  - `FlashcardsCreateCommandDto`: opakowuje tablicę `flashcards`
  
Typy te są zdefiniowane w pliku `src/types.ts` i stanowią podstawę dla walidacji oraz mapowania danych wejściowych.

## 4. Szczegóły odpowiedzi
- **Kod statusu**: 201 Created w przypadku pełnego powodzenia.
- **Struktura odpowiedzi**:
  ```json
  {
    "flashcards": [
      {
        "id": 1,
        "front": "Question text",
        "back": "Answer text",
        "source": "manual",
        "created_at": "timestamp"
      }
    ]
  }
  ```
- W przypadku częściowego powodzenia należy użyć kodu 207 Multi-Status, a dla błędów odpowiednio:
  - 400 Bad Request – niepoprawne dane wejściowe
  - 401 Unauthorized – brak autoryzacji

## 5. Przepływ danych
1. Odbiór żądania przez endpoint /flashcards.
2. Walidacja danych wejściowych przy użyciu schematu Zod, zgodnie z wymogami:
   - Sprawdzenie długości `front` i `back`.
   - Walidacja wartości `source` oraz wymagalności `generation_id` dla wartości "ai-full" i "ai-edited".
3. Wywołanie logiki biznesowej zawartej w serwisie (np. w `src/lib/services/flashcard.service.ts`), która:
   - Wykonuje insercję danych batchem do bazy Supabase.
   - Realizuje RLS, aby upewnić się, że użytkownik ma dostęp tylko do swoich danych.
4. Zwrócenie odpowiedzi JSON z utworzonymi wpisami lub odpowiednim kodem błędu.

## 6. Względy bezpieczeństwa
- Autoryzacja: Sprawdzenie, czy użytkownik jest zalogowany, oraz weryfikacja RLS poprzez `auth.uid()` wykonane na poziomie bazy danych.
- Walidacja danych wejściowych przy użyciu Zod, aby zapobiegać atakom typu injection lub wprowadzeniu niepoprawnych danych.
- Sprawdzenie, czy `generation_id` odnosi się do istniejącej sesji generacji, aby uniknąć błędów referencyjnych.

## 7. Obsługa błędów
- **400 Bad Request**: Niepoprawny format danych, nie spełniający kryteriów walidacji (np. długość `front`, `back`, brak `generation_id` dla danych AI).
- **401 Unauthorized**: Użytkownik nie jest autoryzowany do wykonania operacji.
- **207 Multi-Status**: Scenariusz, w którym niektóre fiszki zostają utworzone pomyślnie, a inne nie.
- **500 Internal Server Error**: Błąd po stronie serwera, np. problem z połączeniem do bazy danych lub niespodziewane wyjątki.
- Ewentualne logowanie błędów do tabeli `generation_error_logs` w przypadku problemów z sesjami generacji lub błędnych operacji związanych z AI.

## 8. Rozważenia dotyczące wydajności
- Wykorzystanie insercji zbiorczej (batch insert) w celu zmniejszenia liczby operacji na bazie danych.
- Wprowadzenie transakcji podczas insercji wielu fiszek, aby zapewnić spójność danych.
- Optymalizacja walidacji przy użyciu Zod, minimalizująca koszt operacji walidacyjnych dla wielu obiektów jednocześnie.

## 9. Etapy wdrożenia
1. **Definicja walidacji danych**:
   - Utworzenie/aktualizacja schematu Zod zgodnie z wymogami walidacyjnymi w pliku walidacji (np. `src/lib/validators/flashcard.validator.ts`).
2. **Implementacja serwisu**:
   - Wyodrębnienie logiki biznesowej do dedykowanego serwisu (np. `src/lib/services/flashcard.service.ts`), odpowiedzialnego za insercję danych i komunikację z bazą Supabase.
3. **Modyfikacja endpointu API**:
   - Aktualizacja handlera endpointu `/flashcards` (np. w pliku `src/pages/api/flashcards.ts`) tak, aby używał nowego serwisu oraz walidacji Zod.
4. **Testy jednostkowe i integracyjne**:
   - Pisanie testów dla walidacji, logiki serwisu oraz endpointu API, aby upewnić się, że spełnia on specyfikację oraz obsługuje wszystkie scenariusze błędów.
5. **Logowanie i monitorowanie**:
   - Implementacja mechanizmu logowania błędów, szczególnie dla sytuacji, w których występuje częściowa porażka (207 Multi-Status) lub wewnętrzne błędy serwera.
6. **Code Review i wdrożenie**:
   - Przeprowadzenie przeglądu kodu przez zespół developerski oraz wdrożenie na środowisko staging przed wdrożeniem produkcyjnym.