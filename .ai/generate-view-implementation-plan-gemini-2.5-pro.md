# Plan implementacji widoku Generowania Fiszek

## 1. Przegląd
Widok Generowania Fiszek (`/generate`) umożliwia zalogowanym użytkownikom wklejenie tekstu źródłowego, wygenerowanie propozycji fiszek (pytanie-odpowiedź) za pomocą modelu AI (poprzez API backendu), a następnie przeglądanie, edytowanie, akceptowanie lub odrzucanie tych propozycji przed zapisaniem ich w swojej kolekcji.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/generate`. Dostęp powinien być ograniczony tylko do zalogowanych użytkowników. Niezalogowani użytkownicy próbujący uzyskać dostęp powinni zostać przekierowani do strony logowania.

## 3. Struktura komponentów
```
src/pages/generate.astro (Strona Astro)
└── FlashcardGenerator.tsx (Komponent React)
    ├── SourceTextInput.tsx (Komponent React, używa Shadcn/ui Textarea)
    ├── Button (Generuj Fiszki) (Shadcn/ui Button)
    ├── [Warunkowo] Skeleton Loader (Shadcn/ui Skeleton)
    └── [Warunkowo] ProposalList.tsx (Komponent React)
        ├── Button (Zapisz Zaakceptowane) (Shadcn/ui Button)
        ├── Button (Zapisz Wszystkie) (Shadcn/ui Button) - Opcjonalnie, do decyzji UX
        └── ProposalCard.tsx[] (Komponent React, używa Shadcn/ui Card, Input, Textarea, Button, Checkbox)
            ├── Card (Shadcn/ui)
            ├── Checkbox (Akceptuj) (Shadcn/ui)
            ├── Editable Text (Pytanie/Odpowiedź) (React state + Shadcn/ui Input/Textarea)
            ├── Button (Edytuj) (Shadcn/ui)
            ├── Button (Odrzuć) (Shadcn/ui)
            ├── [Warunkowo w trybie edycji] Button (Zapisz Zmiany) (Shadcn/ui)
            └── [Warunkowo w trybie edycji] Button (Anuluj) (Shadcn/ui)
```

## 4. Szczegóły komponentów

### `generate.astro`
- **Opis komponentu:** Główny plik strony Astro dla ścieżki `/generate`. Odpowiada za ustawienie layoutu strony, potencjalnie obsługę middleware Astro do weryfikacji autentykacji i renderowanie komponentu React `FlashcardGenerator` jako "wyspy" Astro (client:load).
- **Główne elementy:** `Layout`, `<FlashcardGenerator client:load />`.
- **Obsługiwane interakcje:** Brak bezpośrednich, deleguje do `FlashcardGenerator`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych.
- **Propsy:** Brak.

### `FlashcardGenerator.tsx`
- **Opis komponentu:** Główny komponent React zarządzający całym procesem generowania i przeglądu fiszek. Zawiera logikę stanu, obsługę API i koordynuje komponenty podrzędne.
- **Główne elementy:** `SourceTextInput`, `Button` (Generuj), `ProposalList` (warunkowo), Wskaźnik ładowania (np. `Skeleton`), Komunikaty o błędach (np. `Alert` z Shadcn/ui).
- **Obsługiwane interakcje:** Zmiana tekstu źródłowego, kliknięcie "Generuj", obsługa akcji z `ProposalList` i `ProposalCard` (accept, reject, edit, save), kliknięcie "Zapisz".
- **Obsługiwana walidacja:** Sprawdza, czy tekst źródłowy spełnia wymogi długości przed wywołaniem API. Zarządza stanem błędów i ładowania. Dezaktywuje przyciski "Generuj" i "Zapisz", gdy akcje są niemożliwe (np. trwa ładowanie, brak tekstu, brak propozycji do zapisania).
- **Typy:** `GenerateFlashcardsCommand`, `GenerationCreateResponseDto`, `FlashcardsCreateCommandDto`, `FlashcardCreateDto`, `FlashcardProposalViewModel` (patrz sekcja 5).
- **Propsy:** Brak (renderowany jako główny komponent na stronie Astro).

### `SourceTextInput.tsx`
- **Opis komponentu:** Kontrolowany komponent wejściowy dla tekstu źródłowego. Wykorzystuje `Textarea` z Shadcn/ui. Wyświetla licznik znaków i komunikaty o błędach walidacji.
- **Główne elementy:** `Label`, `Textarea` (Shadcn/ui), mały tekst dla licznika znaków, mały tekst dla komunikatu błędu.
- **Obsługiwane interakcje:** `onChange` - aktualizuje stan tekstu w `FlashcardGenerator` i uruchamia walidację.
- **Obsługiwana walidacja:** Długość tekstu (min 1000, max 10000 znaków). Wyświetla błąd, jeśli warunki nie są spełnione.
- **Typy:** Własny interfejs Props: `{ value: string; onChange: (value: string) => void; error?: string; minLength: number; maxLength: number; }`.
- **Propsy:** `value`, `onChange`, `error`, `minLength`, `maxLength` - przekazywane z `FlashcardGenerator`.

### `ProposalList.tsx`
- **Opis komponentu:** Renderuje listę wygenerowanych propozycji fiszek (`ProposalCard`) lub stan ładowania (np. za pomocą komponentów `Skeleton` z Shadcn/ui). Zawiera przyciski akcji do zapisywania fiszek.
- **Główne elementy:** Kontener listy, mapowanie `proposals` na `ProposalCard`, Przyciski "Zapisz Zaakceptowane" / "Zapisz Wszystkie", warunkowe renderowanie stanu ładowania.
- **Obsługiwane interakcje:** Kliknięcie przycisków "Zapisz" - wywołuje odpowiednie funkcje `onSaveAccepted` / `onSaveAll` przekazane w propsach.
- **Obsługiwana walidacja:** Dezaktywuje przyciski "Zapisz", jeśli nie ma odpowiednich propozycji do zapisania (np. żadna nie jest zaakceptowana dla "Zapisz Zaakceptowane").
- **Typy:** Własny interfejs Props: `{ proposals: FlashcardProposalViewModel[]; isLoading: boolean; onSaveAccepted: () => void; onSaveAll?: () => void; /* ...inne handlery przekazujące akcje z ProposalCard do FlashcardGenerator... */ }`.
- **Propsy:** `proposals`, `isLoading`, `onSaveAccepted`, `onSaveAll`, handlery akcji dla `ProposalCard`.

### `ProposalCard.tsx`
- **Opis komponentu:** Wyświetla pojedynczą propozycję fiszki. Umożliwia akceptację, odrzucenie lub edycję. Zarządza lokalnym stanem edycji.
- **Główne elementy:** `Card` (Shadcn/ui), `Checkbox` (Akceptuj), `Input`/`Textarea` (dla edycji front/back), `Button` (Edytuj/Odrzuć), `Button` (Zapisz Zmiany/Anuluj - w trybie edycji).
- **Obsługiwane interakcje:** Zaznaczenie/odznaczenie `Checkbox` (akceptacja), kliknięcie "Odrzuć", kliknięcie "Edytuj" (przełącza w tryb edycji), zmiana tekstu w polach edycji, kliknięcie "Zapisz Zmiany" (z walidacją), kliknięcie "Anuluj".
- **Obsługiwana walidacja:** W trybie edycji: `front` (min 10, max 200), `back` (min 10, max 500). Wyświetla błędy inline. Dezaktywuje przycisk "Zapisz Zmiany", jeśli dane są niepoprawne.
- **Typy:** Własny interfejs Props: `{ proposal: FlashcardProposalViewModel; onUpdateProposal: (updatedProposal: FlashcardProposalViewModel) => void; }`. `onUpdateProposal` służy do komunikacji zmian statusu lub treści z powrotem do `FlashcardGenerator`.
- **Propsy:** `proposal` (obiekt `FlashcardProposalViewModel`), `onUpdateProposal` (funkcja zwrotna do aktualizacji stanu w `FlashcardGenerator`).

## 5. Typy

Oprócz istniejących typów DTO z `src/types.ts` (`GenerateFlashcardsCommand`, `GenerationCreateResponseDto`, `FlashcardProposalDto`, `FlashcardsCreateCommandDto`, `FlashcardCreateDto`, `Source`), potrzebny będzie nowy typ ViewModel do zarządzania stanem propozycji na frontendzie:

```typescript
// Proponowany nowy typ ViewModel w src/components/FlashcardGenerator.types.ts lub podobnym miejscu
interface FlashcardProposalViewModel {
  /** Unikalny identyfikator po stronie klienta (np. crypto.randomUUID() lub index) */
  id: string;
  /** Oryginalna treść pytania z API */
  originalFront: string;
  /** Oryginalna treść odpowiedzi z API */
  originalBack: string;
  /** Aktualna treść pytania (może być edytowana) */
  currentFront: string;
  /** Aktualna treść odpowiedzi (może być edytowana) */
  currentBack: string;
  /** Status propozycji w procesie przeglądu */
  status: "pending" | "accepted" | "rejected" | "editing";
  /** Błędy walidacji podczas edycji */
  validationErrors?: {
    front?: string;
    back?: string;
  } | null;
}
```

Ten ViewModel pozwoli na:
- Śledzenie oryginalnych wartości na potrzeby określenia `source` ("ai-full" vs "ai-edited") podczas zapisu.
- Zarządzanie stanem akceptacji/odrzucenia (`status`).
- Obsługę trybu edycji (`status: "editing"`) i przechowywanie tymczasowych zmian (`currentFront`, `currentBack`).
- Przechowywanie błędów walidacji specyficznych dla danej propozycji w trybie edycji.

## 6. Zarządzanie stanem

Stan widoku będzie zarządzany głównie w komponencie `FlashcardGenerator.tsx` przy użyciu hooków React (`useState`, `useCallback`). Kluczowe elementy stanu:

- `sourceText: string`: Tekst wprowadzony przez użytkownika.
- `proposals: FlashcardProposalViewModel[]`: Lista propozycji fiszek pobranych z API i wzbogaconych o metadane ViewModel.
- `generationId: number | null`: ID generacji zwrócone przez API `/generations`.
- `isLoading: boolean`: Status ładowania podczas wywołania API `/generations`.
- `isSaving: boolean`: Status ładowania podczas wywołania API `/flashcards`.
- `error: string | null`: Komunikat o błędzie (z API lub walidacji).

**Rozważenie Custom Hooka:** Można stworzyć customowy hook `useFlashcardGenerator` w celu enkapsulacji logiki stanu i operacji API, aby komponent `FlashcardGenerator` był czystszy. Hook ten zarządzałby wszystkimi powyższymi stanami i eksportowałby wartości oraz funkcje obsługi (np. `handleGenerate`, `handleSaveAccepted`, `updateProposal`).

## 7. Integracja API

1.  **Generowanie propozycji:**
    - **Akcja:** Kliknięcie przycisku "Generuj Fiszki".
    - **Wywołanie:** `POST /api/generations`
    - **Typ Żądania:** `GenerateFlashcardsCommand` (`{ source_text: string }`)
    - **Obsługa Odpowiedzi:**
        - Sukces (201): Parsowanie `GenerationCreateResponseDto`. Zapisanie `generation_id`. Transformacja `flashcards_proposals` (DTO) do `FlashcardProposalViewModel[]` (generowanie `id`, ustawienie `status: 'pending'`, skopiowanie `front`/`back` do `originalFront`/`Back` i `currentFront`/`Back`). Aktualizacja stanu `proposals`.
        - Błąd (4xx, 5xx): Wyświetlenie komunikatu o błędzie.
    - **Stan Ładowania:** Ustawienie `isLoading` na `true` przed wywołaniem, `false` po zakończeniu.

2.  **Zapisywanie fiszek:**
    - **Akcja:** Kliknięcie przycisku "Zapisz Zaakceptowane" (lub "Zapisz Wszystkie").
    - **Wywołanie:** `POST /api/flashcards`
    - **Typ Żądania:** `FlashcardsCreateCommandDto` (`{ flashcards: FlashcardCreateDto[] }`)
        - Filtrowanie `proposals` na podstawie statusu (`accepted` lub `!rejected`).
        - Mapowanie przefiltrowanych `FlashcardProposalViewModel` do `FlashcardCreateDto`:
            - `front`: `proposal.currentFront`
            - `back`: `proposal.currentBack`
            - `source`: Jeśli `proposal.currentFront !== proposal.originalFront || proposal.currentBack !== proposal.originalBack`, ustaw `source = "ai-edited"`, w przeciwnym razie `source = "ai-full"`.
            - `generation_id`: Użyj zapisanego `generationId`.
    - **Obsługa Odpowiedzi:**
        - Sukces (201): Wyświetlenie komunikatu o sukcesie (np. Toast). Opcjonalnie wyczyszczenie stanu `proposals` lub przekierowanie.
        - Sukces Częściowy (207): Wyświetlenie komunikatu o częściowym sukcesie/błędzie (np. Toast). Można rozważyć aktualizację UI, aby pokazać, które fiszki się nie zapisały, jeśli API zwraca takie informacje.
        - Błąd (4xx, 5xx): Wyświetlenie komunikatu o błędzie.
    - **Stan Ładowania:** Ustawienie `isSaving` na `true` przed wywołaniem, `false` po zakończeniu.

## 8. Interakcje użytkownika

- **Wpisywanie tekstu:** Aktualizacja stanu `sourceText`, licznika znaków i statusu walidacji pola tekstowego.
- **Kliknięcie "Generuj":** Uruchomienie walidacji tekstu, pokazanie wskaźnika ładowania, wywołanie API `/generations`, wyświetlenie propozycji lub błędu.
- **Zaznaczenie/Odznaczenie "Akceptuj":** Zmiana `status` w odpowiednim `FlashcardProposalViewModel` między `pending` a `accepted`.
- **Kliknięcie "Odrzuć":** Zmiana `status` na `rejected`. Wizualne oznaczenie karty (np. wyszarzenie).
- **Kliknięcie "Edytuj":** Zmiana `status` na `editing`. Wyświetlenie pól `Input`/`Textarea` z `currentFront`/`currentBack`. Pokazanie przycisków "Zapisz Zmiany"/"Anuluj". Ukrycie "Akceptuj"/"Odrzuć".
- **Edycja Pól:** Aktualizacja `currentFront`/`currentBack` w `FlashcardProposalViewModel`. Uruchomienie walidacji (długość). Aktualizacja `validationErrors`. Włączanie/wyłączanie przycisku "Zapisz Zmiany".
- **Kliknięcie "Zapisz Zmiany":** Jeśli walidacja przejdzie, zmiana `status` na `accepted`. Ukrycie pól edycji.
- **Kliknięcie "Anuluj":** Przywrócenie `currentFront`/`currentBack` do wartości sprzed edycji (np. z `originalFront`/`Back`). Zmiana `status` na `pending` (lub poprzedni?). Ukrycie pól edycji.
- **Kliknięcie "Zapisz Zaakceptowane":** Pokazanie wskaźnika ładowania, wywołanie API `/flashcards` z zaakceptowanymi (`status === 'accepted'`) propozycjami, obsługa odpowiedzi.

## 9. Warunki i walidacja

- **Pole Tekstu Źródłowego (`SourceTextInput`):**
    - Warunek: Długość tekstu musi być >= 1000 i <= 10000 znaków.
    - Weryfikacja: W `FlashcardGenerator` przed wywołaniem API `/generations`. W `SourceTextInput` do wyświetlania błędów inline.
    - Wpływ na UI: Wyświetlenie komunikatu błędu pod polem tekstowym. Dezaktywacja przycisku "Generuj".
- **Pola Edycji Fiszki (`ProposalCard`):**
    - Warunek `front`: Długość tekstu musi być >= 10 i <= 200 znaków.
    - Warunek `back`: Długość tekstu musi być >= 10 i <= 500 znaków.
    - Weryfikacja: W `ProposalCard` podczas edycji (`status === 'editing'`).
    - Wpływ na UI: Wyświetlenie komunikatu błędu przy odpowiednim polu. Dezaktywacja przycisku "Zapisz Zmiany".
- **Przycisk "Generuj":**
    - Warunek: `sourceText` jest poprawny (długość) ORAZ `!isLoading`.
    - Wpływ na UI: Przycisk jest aktywny/nieaktywny.
- **Przyciski "Zapisz":**
    - Warunek "Zapisz Zaakceptowane": Istnieje co najmniej jedna propozycja ze `status === 'accepted'` ORAZ `!isSaving`.
    - Warunek "Zapisz Wszystkie": Istnieje co najmniej jedna propozycja ze `status !== 'rejected'` ORAZ `!isSaving`.
    - Wpływ na UI: Przyciski są aktywne/nieaktywne.

## 10. Obsługa błędów

- **Błędy Walidacji Frontendowej:** Wyświetlanie komunikatów o błędach bezpośrednio przy polach, których dotyczą (pole tekstowe, pola edycji fiszek). Dezaktywacja odpowiednich przycisków akcji.
- **Błędy API (`/generations`):**
    - Wyświetlenie ogólnego komunikatu o błędzie w widocznym miejscu (np. komponent `Alert` nad listą propozycji).
    - Zalogowanie szczegółów błędu do konsoli.
    - Ustawienie `isLoading = false`.
- **Błędy API (`/flashcards`):**
    - Wyświetlenie ogólnego komunikatu o błędzie (np. Toast).
    - Zalogowanie szczegółów błędu do konsoli.
    - Ustawienie `isSaving = false`.
- **Odpowiedź 207 Multi-Status z `/flashcards`:**
    - Wyświetlenie specyficznego komunikatu informującego o częściowym sukcesie (np. "Część fiszek została zapisana, ale wystąpiły problemy z niektórymi.").
    - Zalogowanie szczegółów (które fiszki się powiodły/nie powiodły, jeśli API je zwraca).
    - Ustawienie `isSaving = false`.
- **Brak wygenerowanych propozycji:** Jeśli API `/generations` zwróci pustą listę `flashcards_proposals`, wyświetlić informację "Nie udało się wygenerować propozycji dla podanego tekstu." zamiast pustej listy.

## 11. Kroki implementacji

1.  **Utworzenie strony Astro:** Stworzyć plik `src/pages/generate.astro`. Dodać podstawowy layout i routing. Zaimplementować ochronę trasy (wymaganie zalogowania) za pomocą middleware Astro, jeśli jeszcze nie istnieje globalnie.
2.  **Utworzenie komponentu `FlashcardGenerator.tsx`:** Stworzyć plik `src/components/FlashcardGenerator.tsx`. Zdefiniować podstawową strukturę i logikę stanu (`useState` dla `sourceText`, `isLoading`, `isSaving`, `proposals`, `generationId`, `error`).
3.  **Implementacja `SourceTextInput.tsx`:** Stworzyć komponent `src/components/SourceTextInput.tsx` używając `Textarea`, `Label` z Shadcn/ui. Dodać logikę walidacji długości, licznik znaków i wyświetlanie błędów. Podłączyć go do stanu `sourceText` w `FlashcardGenerator`.
4.  **Implementacja logiki generowania:** W `FlashcardGenerator` dodać funkcję `handleGenerate`. Zaimplementować walidację `sourceText`, wywołanie `fetch` do `POST /api/generations`, obsługę stanu `isLoading` i `error`. Po sukcesie, przetworzyć odpowiedź, stworzyć `FlashcardProposalViewModel[]` i zaktualizować stan `proposals`.
5.  **Implementacja szkieletu ładowania:** Dodać warunkowe renderowanie komponentów `Skeleton` z Shadcn/ui w `FlashcardGenerator`, gdy `isLoading` jest `true`.
6.  **Utworzenie komponentu `ProposalList.tsx`:** Stworzyć plik `src/components/ProposalList.tsx`. Dodać logikę renderowania listy `ProposalCard` na podstawie stanu `proposals`. Dodać przyciski "Zapisz".
7.  **Utworzenie komponentu `ProposalCard.tsx`:** Stworzyć plik `src/components/ProposalCard.tsx`. Zaimplementować wyświetlanie `front` i `back`. Dodać `Checkbox` do akceptacji, przyciski "Edytuj", "Odrzuć". Zaimplementować logikę przełączania w tryb edycji (`status: 'editing'`).
8.  **Implementacja trybu edycji w `ProposalCard`:** Dodać `Input`/`Textarea` do edycji, lokalny stan dla edytowanych wartości, walidację długości pól edycji, przyciski "Zapisz Zmiany" i "Anuluj". Zaimplementować logikę zapisu/anulowania zmian i komunikację z `FlashcardGenerator` za pomocą `onUpdateProposal`.
9.  **Połączenie akcji `ProposalCard` z `FlashcardGenerator`:** Przekazać funkcje obsługi (`handleAcceptToggle`, `handleReject`, `handleUpdateProposal`) z `FlashcardGenerator` przez `ProposalList` do `ProposalCard`, aby aktualizować główny stan `proposals`.
10. **Implementacja logiki zapisywania:** W `FlashcardGenerator` dodać funkcje `handleSaveAccepted` / `handleSaveAll`. Zaimplementować filtrowanie i mapowanie `proposals` do `FlashcardsCreateCommandDto`. Wywołać `fetch` do `POST /api/flashcards`. Obsłużyć stan `isSaving`, odpowiedzi sukcesu (201), częściowego sukcesu (207) i błędu.
11. **Styling i UX:** Dopracować wygląd komponentów za pomocą Tailwind i Shadcn/ui. Zapewnić płynne przejścia stanów (ładowanie, błędy). Dodać komunikaty Toast dla akcji zapisu/błędów.
12. **Testowanie:** Przetestować różne scenariusze: poprawna generacja, błędy API, walidacja, edycja, zapis, obsługa 207, działanie na różnych danych wejściowych. 