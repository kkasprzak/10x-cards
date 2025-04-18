# Plan implementacji widoku /generate

## 1. Przegląd
Widok umożliwia użytkownikowi generowanie propozycji fiszek przez AI. Użytkownik wprowadza tekst (od 1000 do 10000 znaków) i po kliknięciu przycisku generowania aplikacja wysyła zapytanie do API. Po otrzymaniu odpowiedzi wyświetlana jest lista propozycji fiszek, które użytkownik może zaakceptować, edytować lub odrzucić. Na koniec uytkownik moe zapisać do bazy wszystkie bądz tylko zaakceptowane fiszki.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką: `/generate`.

## 3. Struktura komponentów
- **FlashcardGenerationView** (główny kontener widoku)
  - **TextInputArea** (pole tekstowe do wprowadzania tekstu)
  - **GenerateButton** (przycisk do generowania fiszek)
  - **FlashcardsList** (lista wygenerowanych fiszek)
    - **FlashcardListItem** (pojedyncza fiszka z przyciskami: zaakceptuj, edytuj, odrzuć)
  - **SkeletonLoader** (wskaźnik trwania operacji, np. skeleton loader)
  - **BulkSaveButton** (przycisk do zapisu wszystkich fiszek lub tylko zaakceptowanych)
  - **ErrorNotification** (komponent do wyświetlania komunikatów o błędach)

## 4. Szczegóły komponentów
### FlashcardGenerationView
- Opis: Główny widok zarządzający stanem oraz integracją wszystkich podkomponentów.
- Główne elementy: TextInputArea, GenerateButton, FlashcardsList, SkeletonLoader, ErrorNotification.
- Obsługiwane interakcje: wprowadzanie tekstu, generowanie fiszek, obsługa akcji na fiszkach (akceptacja, edycja, odrzucenie), zapis fiszek.
- Walidacja: Pole tekstowe musi zawierać od 1000 do 10000 znaków.
- Typy: Używa typu `GenerateFlashcardsCommand`, `GenerationCreateResponseDto` oraz `FlashcardProposalDto`.
- Propsy: Brak – zarządza własnym stanem.

### TextInputArea
- Opis: Komponent wejściowy służący do wprowadzania tekstu przez użytkownika.
- Główne elementy: Pole tekstowe (textarea) z placeholderem.
- Obsługiwane interakcje: onChange, onBlur (do walidacji długości tekstu).
- Walidacja: Minimalna długość 1000 znaków, maksymalna 10000 znaków.
- Typy: Prosty string.
- Propsy: `value`, `onChange`, `onBlur`.

### GenerateButton
- Opis: Przycisk inicjujący wywołanie API w celu generowania fiszek.
- Główne elementy: Element button z etykietą np. "Generuj fiszki".
- Obsługiwane interakcje: onClick – wywołanie funkcji generującej fiszki.
- Walidacja: Przycisk jest aktywny tylko, gdy tekst spełnia kryteria walidacji.
- Typy: Standardowy przycisk, brak dodatkowych typów.
- Propsy: `disabled`, `onClick`.

### FlashcardsList
- Opis: Wyświetla listę fiszek wygenerowanych przez API.
- Główne elementy: Lista komponentów FlashcardItem.
- Obsługiwane interakcje: Przekazywanie akcji (akceptacja, edycja, odrzucenie) do poszczególnych fiszek.
- Walidacja: Brak bezpośredniej walidacji.
- Typy: Tablica `FlashcardProposalViewModel`.
- Propsy: `flashcards` (tablica), `onAccept`, `onEdit`, `onReject`.

### FlashcardListItem
- Opis: Pojedynczy element listy fiszek wyświetlający treść fiszki oraz przyciski akcji.
- Główne elementy: Wyświetlanie pól `front` oraz `back` i przyciski: zaakceptuj, edytuj, odrzuć.
- Obsługiwane interakcje: onAccept, onEdit, onReject – wywoływane dla danej fiszki.
- Walidacja: Brak wewnętrznej walidacji, treść opiera się na danych z API.
- Typy: `FlashcardProposalViewModel`.
- Propsy: `flashcard`, `onAccept`, `onEdit`, `onReject`.

### SkeletonLoader
- Opis: Wskaźnik informujący o trwającym procesie generowania (np. skeleton loader).
- Główne elementy: Wizualny komponent wskaźnika (spinner/skeleton).
- Obsługiwane interakcje: Brak akcji użytkownika.
- Walidacja: N/A.
- Typy: Boolean (flagą widoczności).
- Propsy: `show` (boolean).

### ErrorNotification
- Opis: Komponent odpowiedzialny za wyświetlanie komunikatów o błędach.
- Główne elementy: Wizualny komunikat błędu.
- Obsługiwane interakcje: Możliwość zamknięcia/ukrycia komunikatu.
- Walidacja: N/A.
- Typy: String (treść komunikatu błędu).
- Propsy: `message`, `onClose`.

### BulkSaveButton
- Opis: Komponent umożliwiający zapisanie wszystkich fiszek lub tylko zaakceptowanych. Po kliknięciu wysyła zapytanie do endpointu `/flashcards`, aby zapisać fiszki w bazie danych.
- Główne elementy: Element button z etykietą, np. "Zapisz fiszki".
- Obsługiwane interakcje: onClick – wywołanie funkcji, która zbiera dane fiszek (wszystkie lub zaakceptowane) i wysyła żądanie POST do `/flashcards`.
- Walidacja: Przycisk powinien być aktywny tylko, gdy lista fiszek zawiera elementy do zapisu.
- Typy: Wysyłany payload oparty na typie `FlashcardsCreateCommandDto` (czyli obiekt z polem `flashcards`, gdzie każdy element spełnia typ `FlashcardCreateDto`). Można to rozumieć jako CreateFlashcardCommand.
- Propsy: Może przyjmować listę fiszek do zapisu oraz funkcję callback `onSaveSuccess` dla obsługi odpowiedzi API.

## 5. Typy
- `GenerateFlashcardsCommand`: { source_text: string }.
- `GenerationCreateResponseDto`: { generation_id: number, flashcards_proposals: FlashcardProposalDto[], generated_count: number }.
- `FlashcardProposalDto`: { front: string, back: string, source: 'ai-full' }.
- `FlashcardProposalViewModel`: { front: string, back: string, source: 'ai-full' | 'ai-edited', accepted: boolean, edited: boolean } - rozszerzony model reprezentujący stan propozycji fiszki, umozliwiający dynamiczne ustawienie pola source podczas wysyłania danych do endpointu `/flashcards`.
- ViewModel: `GenerateViewModel` z polami:
  - textInput: string
  - flashcardProposals: `FlashcardProposalViewModel` 
  - isLoading: boolean
  - error: string | null

## 6. Zarządzanie stanem
- Użycie hooka `useState` w komponencie GenerateView do zarządzania:
  - `textInput` – przechowywanie tekstu wejściowego
  - `flashcardProposals` – lista fiszek z odpowiedzi API
  - `isLoading` – wskaźnik trwającej operacji
  - `error` – komunikat o błędzie
- Opcjonalnie utworzenie customowego hooka `useGenerateFlashcards` do obsługi logiki API i zarządzania stanem.

## 7. Integracja API
- Wywołanie endpointu POST `/generations` przy kliknięciu przycisku generowania.
- Żądanie wysyła payload: { source_text: string }.
- Oczekiwana odpowiedź: `GenerationCreateResponseDto` zawierający `generation_id`, tablicę `flashcards_proposals` oraz `generated_count`.
- **Bulk Save**: Po zaznaczeniu fiszek do zapisu i następnie kliknięciu BulkSaveButton, aplikacja wysyła zapytanie POST do endpointu `/flashcards`.
  - Żądanie wysyła payload według struktury: 
    ```json
    {
      "flashcards": [
        {
          "front": "Question text",
          "back": "Answer text",
          "source": "ai-full", // lub "ai-edited" w zależności od modyfikacji
          "generation_id": 123 // wymagane dla fiszek generowanych przez AI
        }
      ]
    }
    ```
  - Payload musi być zgodny z typem `FlashcardsCreateCommandDto` (CreateFlashcardCommand) oraz walidowany:
    - `front`: min 10 i max 200 znaków
    - `back`: min 10 i max 500 znaków
    - `source`: dozwolone wartości: "manual", "ai-full", "ai-edited"
    - `generation_id`: wymagane przy źródłach "ai-full" lub "ai-edited"
- Oczekiwana odpowiedź:
  - Status 201 Created w przypadku pełnego sukcesu
  - Możliwy status 207 Multi-Status, gdy część fiszek nie zostanie utworzona
- W przypadku błędów (400, 401, 207, 500) aplikacja wyświetla odpowiednie komunikaty w komponencie ErrorNotification.

## 8. Interakcje użytkownika
- Użytkownik wprowadza tekst do pola TextInputArea.
- Po kliknięciu GenerateButton: rozpoczyna sie walidacja wprowadzonego tekstu. Jeśli walidacja przejdzie wywoływane jest API, pojawia się LoadingIndicator.
- Po otrzymaniu odpowiedzi API: lista fiszek pojawia się w FlashcardsList.
- Każda fiszka umożliwia akcje:
  - Akceptacja: Fiszka zostaje wybrana do zapisu
  - Edycja: Użytkownik modyfikuje zawartość fiszki
  - Odrzucenie: Usunięcie propozycji z listy
- Dzięki komponentowi `BulkSaveButton` Użytkownik może zapisać wybrane fiszki w bazie wysyłając dodatkowe żądanie do endpointu `/flashcards`.

## 9. Warunki i walidacja
- Tekst wejściowy: walidacja długości (min 1000, max 10000 znaków), aktywacja przycisku tylko przy prawidłowych danych.
- Przycisk generowania fiszek aktywny tylko przy poprawnym tekście wejściowym
- Podczas edycji fiszek: walidacja pól `front` (10-200 znaków) oraz `back` (10-500 znaków).
- Walidacja odpowiedzi API: sprawdzenie kodu statusu, odpowiednie przetwarzanie błędów. Komunikaty błędów wyświetlane w komponencie `ErrorNotification`

## 10. Obsługa błędów
- Wyświetlanie komunikatów błędów przez komponent ErrorNotification.
- Scenariusze: błędy walidacji wejścia, nieprawidłowy payload, błąd serwera.
- Rozwiązanie: reset stanu `isLoading`, możliwość ponownego wywołania operacji, informowanie użytkownika o rodzaju błędu.

## 11. Kroki implementacji
1. Utworzyć nowy widok (np. `generate.astro` lub `generate.tsx`) w folderze `src/pages`.
2. Zaimplementować główny komponent `FlashcardGenerationView` z zarządzaniem stanem.
3. Utworzyć wszystkie podkomponenty: `TextInputArea`, `GenerateButton`, `FlashcardsList`, `FlashcardListItem`, `SkeletonLoader`, `ErrorNotification`, `BulkSaveButton`.
4. Dodać walidację tekstu wejściowego (min. 1000 i max. 10000 znaków).
5. Zaimplementować funkcję wywołania API do endpointu `/generations` w momencie kliknięcia GenerateButton.
6. Przetworzyć otrzymaną odpowiedź API oraz zaktualizować stan widoku, wyświetlając listę fiszek.
7. Zaimplementować logikę akcji na fiszkach (akceptacja, edycja, odrzucenie) w komponencie FlashcardListItem.
8. Dodać obsługę stanu ładowania (SkeletonLoader) oraz komunikatów o błędach (ErrorNotification).
9. Przetestować widok pod kątem UX, walidacji oraz integracji z API.
10. Dokonać code review i przygotować dokumentację wdrożenia. 