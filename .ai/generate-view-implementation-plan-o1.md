# Plan wdrożenia widoku Generate

## 1. Przegląd
Widok „Generate” ma umożliwić użytkownikowi wprowadzenie tekstu, zlecenie jego przetworzenia przez AI w celu wygenerowania propozycji fiszek, a następnie przejrzenie i weryfikację tych propozycji. Użytkownik może zaakceptować, edytować lub odrzucić wygenerowane fiszki. Po wybraniu odpowiednich fiszek może je zapisać w bazie danych.

## 2. Routing widoku
- Ścieżka: `/generate`
- W pliku routingowym należy przekierować żądania pod tę ścieżkę do nowego widoku (komponentu) odpowiedzialnego za generowanie i weryfikację fiszek.

## 3. Struktura komponentów
1. `GenerateView` (główny kontener widoku)
   - `TextInputSection` (sekcja wprowadzania tekstu)
   - `GenerateButton` (przycisk wywołujący proces generowania)
   - `LoadingIndicator` (wskaźnik ładowania, np. skeleton)
   - `FlashcardsList` (lista wygenerowanych propozycji fiszek z przyciskami akcji)
   - `SaveActions` (przyciski zapisu i potwierdzenia)

## 4. Szczegóły komponentów

### GenerateView
- Opis komponentu: Główny widok odpowiedzialny za połączenie wszystkich sekcji. Renderuje input tekstowy, przycisk generowania, listę fiszek i akcje zapisu.
- Główne elementy:
  - Sekcja tekstowa do wprowadzenia treści
  - Lista propozycji fiszek (po udanym generowaniu)
  - Przycisk generowania, a potem zapisywania fiszek
  - Element ładowania (wyświetlany podczas przetwarzania)
- Obsługiwane interakcje:
  - Wprowadzanie tekstu w polu
  - Kliknięcie przycisku „Generuj”
  - Kliknięcie przycisku „Zatwierdź / Edytuj / Odrzuć” przy każdej fiszce
  - Kliknięcie przycisku „Zapisz”
- Obsługiwana walidacja:
  - Długość wprowadzonego tekstu (1000–10000 znaków)
  - Sprawdzenie poprawności formatu fiszek przed zapisem
- Typy:
  - Używa `GenerateFlashcardsCommand` do wywołania API
  - Otrzymuje w odpowiedzi `GenerationCreateResponseDto`
- Propsy: Brak zewnętrznych w podstawowej implementacji, pełni rolę głównego widoku.

### TextInputSection
- Opis komponentu: Sekcja do wprowadzania tekstu przez użytkownika.
- Główne elementy: 
  - Pole tekstowe (textarea)
- Obsługiwane interakcje:
  - Wpisywanie / wklejanie tekstu
  - Obsługa zdarzeń onChange / onBlur
- Obsługiwana walidacja:
  - Sprawdzanie długości tekstu przy kliknięciu „Generuj”
- Typy:
  - Może korzystać z typu localnego `TextInputValue` (np. string)
- Propsy:
  - `value`: string
  - `onChange(value: string)`: obsługa aktualizacji wartości

### GenerateButton
- Opis komponentu: Przycisk do wywołania akcji generowania fiszek.
- Główne elementy:
  - Implementacja standardowego przycisku z atrybutem onClick
- Obsługiwane interakcje:
  - Kliknięcie przycisku powoduje wysłanie żądania do endpointu `/generations`
- Walidacja: 
  - Weryfikacja, czy pole tekstowe nie jest puste i spełnia warunek 1000–10000 znaków (poziom rodzica)
- Propsy:
  - `onClick()`: funkcja wywoływana po kliknięciu

### LoadingIndicator
- Opis komponentu: Widoczny podczas wysyłania żądania lub oczekiwania na odpowiedź z AI. 
- Główne elementy:
  - Może to być skeleton lub spinner
- Interakcje:
  - Brak, wyświetlany tylko gdy stan generowania jest aktywny
- Walidacja: Brak
- Propsy:
  - `isLoading: boolean`

### FlashcardsList
- Opis komponentu: Lista wyświetlająca propozycje fiszek uzyskane z API.
- Główne elementy:
  - Iterowanie po tablicy wygenerowanych fiszek i renderowanie każdego elementu w postaci `FlashcardItem`
- Interakcje:
  - Kliknięcia w „Zatwierdź / Edytuj / Odrzuć”
- Walidacja:
  - Sprawdzanie, czy dana fiszka jest poprawna do zapisu
- Typy:
  - `FlashcardProposalDto[]` (lub podobny model) do wyświetlenia
- Propsy:
  - `proposals`: tablica fiszek wstępnych

### FlashcardItem
- Opis komponentu: Wyświetla informacje o jednej fiszce i umożliwia jej modyfikację lub odrzucenie.
- Główne elementy:
  - Pole z pytaniem (front)
  - Pole z odpowiedzią (back)
  - Przyciski: „Zatwierdź”, „Edytuj”, „Odrzuć”
- Interakcje:
  - Edycja front/back
  - Zatwierdzenie/odrzucenie
- Walidacja:
  - Minimalna długość front/back (np. 10 znaków)
- Typy:
  - `FlashcardProposalDto`
- Propsy:
  - `flashcard`: obiekt fiszki
  - `onAccept`, `onReject`, `onEdit`: funkcje obsługujące kliknięcie

### SaveActions
- Opis komponentu: Zbiera przyciski do zapisu zaakceptowanych fiszek.
- Główne elementy:
  - Przycisk „Zapisz wszystkie” lub „Zapisz wybrane”
- Interakcje:
  - Kliknięcie przycisku wywołuje zapis do `/flashcards`
- Walidacja: 
  - Sprawdzenie, czy lista zawiera co najmniej jeden element do zapisu
- Propsy:
  - `onSave()`: wywoływana przy zapisie

## 5. Typy
- `GenerateFlashcardsCommand`: 
  - Pole `source_text: string` (1000–10000 znaków)
- `GenerationCreateResponseDto`:
  - `generation_id: number`
  - `flashcards_proposals: FlashcardProposalDto[]`
  - `generated_count: number`
- `FlashcardProposalDto`:
  - `front: string`
  - `back: string`
  - `source: "ai-full"`
- `FlashcardsCreateCommandDto`:
  - `flashcards: FlashcardCreateDto[]`
- `FlashcardCreateDto`:
  - `front: string`
  - `back: string`
  - `source: "manual" | "ai-full" | "ai-edited"`
  - `generation_id?: number`

## 6. Zarządzanie stanem
- Stan główny w `GenerateView`, np.:
  - `sourceText: string` (tekst do generowania)
  - `loading: boolean` (czy trwa pobieranie)
  - `proposals: FlashcardProposalDto[]` (wyniki wygenerowane przez AI)
  - Informacja o błędach, np. `error: string | null`
- Można rozważyć dedykowany hook (np. `useGenerateFlashcards`) do obsługi logiki pobierania i walidacji stringa.

## 7. Integracja API
- Wywołanie `/generations` metodą POST z payloadem:
  ```json
  {
    "source_text": "<tekst do wygenerowania>"
  }
  ```
  - Sprawdzenie, czy API nie zwróciło błędu (400 lub 500)
  - Po otrzymaniu odpowiedzi wypełniamy tablicę `proposals`
- Zapisanie zaakceptowanych fiszek do `/flashcards` metodą POST:
  ```json
  {
    "flashcards": [
      {
        "front": "tekst pytania",
        "back": "tekst odpowiedzi",
        "source": "ai-full" lub "ai-edited",
        "generation_id": <nr>
      }
    ]
  }
  ```
  - Obsługa kodów odpowiedzi: 201 (sukces), 207 (częściowy sukces), 400, 401, 500

## 8. Interakcje użytkownika
1. Użytkownik wkleja tekst w polu `TextInputSection`.
2. Kliknięcie „Generuj”:
   - Walidacja długości tekstu (1000–10000 znaków)
   - Ustawienie stanu `loading = true`
   - Wywołanie API `/generations`
   - Po sukcesie aktualizacja `proposals` i `loading = false`
   - W przypadku błędu – wyświetlenie komunikatu w `error`
3. Przeglądanie listy `FlashcardsList`:
   - Kliknięcie „Zatwierdź” lub „Odrzuć” zmienia stan danej fiszki
   - Edycja front/back ustawia `source` na „ai-edited”
4. Kliknięcie „Zapisz” w `SaveActions`:
   - Przygotowanie danych do żądania POST `/flashcards`
   - Wywołanie API zapisu i wyświetlenie ewentualnych błędów lub potwierdzenia sukcesu

## 9. Warunki i walidacja
- Walidacja tekstu wejściowego (min 1000, max 10000 znaków)
- Walidacja pól fiszki (front/back min 10 znaków)
- W przypadku `source = "ai-full" | "ai-edited"` wymagany `generation_id`
- Po stronie UI można blokować przycisk generowania, jeśli warunki nie są spełnione

## 10. Obsługa błędów
- Błąd sieci lub odpowiedź 400/500 przy generowaniu – wyświetlenie komunikatu w widoku (np. alert lub inline).
- Błąd przy zapisie `/flashcards` – jeśli zwróci 207 (Multi-Status), wyświetlamy listę nieudanych zapisów inline, a udane fiszki oznaczamy jako zapisane.

## 11. Kroki implementacji
1. Stworzenie nowego pliku widoku `GenerateView` i podpięcie go do ścieżki `/generate`.
2. Zaimplementowanie sekcji wprowadzania tekstu (`TextInputSection`), wraz z podstawową walidacją.
3. Dodanie przycisku „Generuj” i wywołania API do `/generations`, stworzenie wskaźnika `LoadingIndicator`.
4. Odbiór odpowiedzi i wyrenderowanie listy `FlashcardsList` z komponentem `FlashcardItem` prezentującym propozycje.
5. Dodanie logiki edycji/odrzucania/akceptowania fiszek.
6. Stworzenie i podpięcie komponentu `SaveActions`, wysyłającego żądanie do `/flashcards`.
7. Obsługa błędów (wyświetlanie komunikatów).
8. Testy lokalne, weryfikacja zgodności z PRD i user stories.
9. Refaktor i optymalizacja w razie potrzeb (np. hook `useGenerateFlashcards`).