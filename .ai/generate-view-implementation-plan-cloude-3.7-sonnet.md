# Plan implementacji widoku generowania fiszek

## 1. Przegląd
Widok generowania fiszek umożliwia użytkownikowi wprowadzenie tekstu źródłowego, który zostanie przetworzony przez model AI w celu wygenerowania propozycji fiszek edukacyjnych. Użytkownik może następnie przeglądać wygenerowane propozycje, akceptować, edytować lub odrzucać poszczególne fiszki, a na końcu zapisać wybrane fiszki do swojego zestawu.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/generate` i powinien być dostępny tylko dla zalogowanych użytkowników.

## 3. Struktura komponentów
```
GenerateView (strona główna)
|-- TextInputSection
|   |-- TextArea
|   |-- CharacterCounter
|   |-- GenerateButton
|   |-- ErrorMessage (warunkowo)
|
|-- LoadingIndicator (warunkowo podczas generowania)
|
|-- FlashcardProposalsList (warunkowo po wygenerowaniu)
|   |-- FlashcardProposalItem[]
|   |   |-- CardFront
|   |   |-- CardBack
|   |   |-- ActionButtons (Accept/Edit/Reject)
|   |
|   |-- GenerationActions
|       |-- SaveAllButton
|       |-- SaveAcceptedButton
|
|-- FlashcardEditModal (warunkowo podczas edycji)
    |-- FormInputs
    |-- ActionButtons
```

## 4. Szczegóły komponentów
### GenerateView
- Opis komponentu: Główny komponent strony, który integruje wszystkie podkomponenty i zarządza ogólnym stanem widoku.
- Główne elementy: Tytuł sekcji, TextInputSection, warunkowo LoadingIndicator, FlashcardProposalsList i FlashcardEditModal.
- Obsługiwane interakcje: Brak bezpośrednich - deleguje do komponentów potomnych.
- Obsługiwana walidacja: Brak bezpośredniej - deleguje do komponentów potomnych.
- Typy: Korzysta z useFlashcardGeneration hook dla zarządzania stanem.
- Propsy: Brak - komponenty na poziomie strony.

### TextInputSection
- Opis komponentu: Sekcja zawierająca pole tekstowe do wprowadzania tekstu źródłowego wraz z licznikiem znaków i przyciskiem generowania.
- Główne elementy: TextArea, CharacterCounter (wskazujący bieżącą liczbę znaków i limity), przycisk generowania, opcjonalnie komunikat błędu.
- Obsługiwane interakcje: Wprowadzanie tekstu, kliknięcie przycisku generowania.
- Obsługiwana walidacja: 
  - Długość tekstu: minimum 1000 znaków, maksimum 10000 znaków.
  - Walidacja w czasie rzeczywistym z odpowiednim feedbackiem wizualnym.
- Typy: Wykorzystuje GenerateFlashcardsCommand.
- Propsy: 
  ```typescript
  {
    onGenerate: (text: string) => Promise<void>;
    isGenerating: boolean;
    error: string | null;
  }
  ```

### LoadingIndicator
- Opis komponentu: Wskaźnik ładowania podczas generowania fiszek.
- Główne elementy: Animowany spinner lub skeleton z informacją tekstową.
- Obsługiwane interakcje: Brak.
- Obsługiwana walidacja: Brak.
- Typy: Brak specyficznych.
- Propsy: 
  ```typescript
  {
    message?: string;
  }
  ```

### FlashcardProposalsList
- Opis komponentu: Lista wygenerowanych propozycji fiszek z możliwością zarządzania każdą z nich.
- Główne elementy: Nagłówek z informacją o liczbie wygenerowanych fiszek, lista FlashcardProposalItem, sekcja GenerationActions.
- Obsługiwane interakcje: Deleguje do podkomponentów.
- Obsługiwana walidacja: Brak bezpośredniej.
- Typy: Wykorzystuje FlashcardViewModel[].
- Propsy: 
  ```typescript
  {
    flashcards: FlashcardViewModel[];
    onAccept: (id: string | number) => void;
    onReject: (id: string | number) => void;
    onEdit: (id: string | number) => void;
    onSaveAll: () => Promise<void>;
    onSaveAccepted: () => Promise<void>;
    isSaving: boolean;
  }
  ```

### FlashcardProposalItem
- Opis komponentu: Pojedynczy element fiszki z przyciskami do akceptacji, edycji i odrzucenia.
- Główne elementy: CardFront (przednia strona fiszki), CardBack (tylna strona), przyciski akcji.
- Obsługiwane interakcje: Kliknięcie przycisku akceptacji, edycji lub odrzucenia.
- Obsługiwana walidacja: Brak (tylko wyświetlanie).
- Typy: Wykorzystuje FlashcardViewModel.
- Propsy: 
  ```typescript
  {
    flashcard: FlashcardViewModel;
    onAccept: () => void;
    onReject: () => void;
    onEdit: () => void;
  }
  ```

### GenerationActions
- Opis komponentu: Przyciski akcji dla całego zestawu fiszek.
- Główne elementy: Przycisk "Zapisz wszystkie", przycisk "Zapisz zaakceptowane".
- Obsługiwane interakcje: Kliknięcie przycisku zapisywania.
- Obsługiwana walidacja: Sprawdzenie, czy są jakieś fiszki do zapisania.
- Typy: Brak specyficznych.
- Propsy: 
  ```typescript
  {
    onSaveAll: () => Promise<void>;
    onSaveAccepted: () => Promise<void>;
    hasAcceptedFlashcards: boolean;
    isSaving: boolean;
  }
  ```

### FlashcardEditModal
- Opis komponentu: Modal do edycji pojedynczej fiszki.
- Główne elementy: Pola formularza dla przedniej i tylnej strony fiszki, przyciski akcji.
- Obsługiwane interakcje: Edycja pól, zatwierdzenie zmian, anulowanie edycji.
- Obsługiwana walidacja:
  - Front: wymagane, 10-200 znaków
  - Back: wymagane, 10-500 znaków
- Typy: Wykorzystuje FlashcardViewModel.
- Propsy: 
  ```typescript
  {
    flashcard: FlashcardViewModel | null;
    onSave: (data: { front: string; back: string }) => void;
    onCancel: () => void;
    isOpen: boolean;
  }
  ```

## 5. Typy
### FlashcardViewModel
```typescript
interface FlashcardViewModel {
  id: number | string;  // Identyfikator (tymczasowy lub z bazy)
  front: string;        // Przednia strona fiszki
  back: string;         // Tylna strona fiszki
  source: Source;       // Źródło fiszki (ai-full, ai-edited, manual)
  status: 'accepted' | 'rejected' | 'pending';  // Status akceptacji
  generation_id: number | null;  // Powiązanie z generacją
  isEditing?: boolean;  // Flaga edycji
  originalData?: { front: string; back: string };  // Dane oryginalne do przywrócenia
}
```

### FlashcardSaveDto
```typescript
interface FlashcardSaveDto {
  front: string;
  back: string;
  source: Source;
  generation_id: number | null;
}
```

### GenerationState
```typescript
interface GenerationState {
  sourceText: string;
  flashcardProposals: FlashcardViewModel[];
  generationId: number | null;
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;
}
```

### ValidationState
```typescript
interface ValidationState {
  isValid: boolean;
  message: string | null;
}

interface TextValidationState {
  text: string;
  validation: ValidationState;
}

interface FlashcardValidationState {
  front: ValidationState;
  back: ValidationState;
}
```

## 6. Zarządzanie stanem
Zarządzanie stanem widoku będzie zaimplementowane przy użyciu customowego hooka `useFlashcardGeneration`. Ten hook będzie odpowiedzialny za:

```typescript
function useFlashcardGeneration() {
  // Stan
  const [state, setState] = useState<GenerationState>({
    sourceText: '',
    flashcardProposals: [],
    generationId: null,
    isGenerating: false,
    isSaving: false,
    error: null
  });

  // Metody
  const generateFlashcards = async (text: string) => {
    // Logika generowania fiszek
  };

  const handleAccept = (id: string | number) => {
    // Logika akceptacji fiszki
  };

  const handleReject = (id: string | number) => {
    // Logika odrzucenia fiszki
  };

  const handleEdit = (id: string | number, data: { front: string; back: string }) => {
    // Logika edycji fiszki
  };

  const saveFlashcards = async (onlyAccepted: boolean) => {
    // Logika zapisywania fiszek
  };

  return {
    state,
    generateFlashcards,
    handleAccept,
    handleReject,
    handleEdit,
    saveFlashcards
  };
}
```

Dodatkowo, stworzone zostaną dwa pomocnicze hooki:
1. `useTextInputValidation` - do walidacji tekstu wejściowego
2. `useFlashcardEdit` - do zarządzania stanem edycji fiszki

## 7. Integracja API
### Generowanie fiszek
```typescript
const generateFlashcards = async (text: string) => {
  setState(prev => ({ ...prev, isGenerating: true, error: null }));
  
  try {
    const response = await fetch('/api/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_text: text })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Błąd podczas generowania fiszek');
    }
    
    const data: GenerationCreateResponseDto = await response.json();
    
    // Konwersja odpowiedzi na model widoku
    const flashcardViewModels = data.flashcards_proposals.map(proposal => ({
      id: uniqueId(), // Generowanie tymczasowego ID
      front: proposal.front,
      back: proposal.back,
      source: 'ai-full' as Source,
      status: 'pending' as const,
      generation_id: data.generation_id,
      originalData: { front: proposal.front, back: proposal.back }
    }));
    
    setState(prev => ({
      ...prev,
      flashcardProposals: flashcardViewModels,
      generationId: data.generation_id,
      isGenerating: false
    }));
  } catch (error) {
    setState(prev => ({
      ...prev,
      isGenerating: false,
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    }));
  }
};
```

### Zapisywanie fiszek
```typescript
const saveFlashcards = async (onlyAccepted: boolean) => {
  setState(prev => ({ ...prev, isSaving: true, error: null }));
  
  try {
    // Filtrowanie fiszek w zależności od parametru
    const flashcardsToSave = onlyAccepted
      ? state.flashcardProposals.filter(f => f.status === 'accepted')
      : state.flashcardProposals;
    
    if (flashcardsToSave.length === 0) {
      throw new Error('Brak fiszek do zapisania');
    }
    
    // Konwersja na DTO
    const flashcardsDto: FlashcardSaveDto[] = flashcardsToSave.map(f => ({
      front: f.front,
      back: f.back,
      source: f.source,
      generation_id: f.generation_id
    }));
    
    const response = await fetch('/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flashcards: flashcardsDto })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Błąd podczas zapisywania fiszek');
    }
    
    // Po udanym zapisie, możemy przekierować do innego widoku lub zresetować stan
    // np. router.push('/flashcards');
    
  } catch (error) {
    setState(prev => ({
      ...prev,
      isSaving: false,
      error: error instanceof Error ? error.message : 'Nieznany błąd'
    }));
  }
};
```

## 8. Interakcje użytkownika
### Wprowadzenie tekstu i generowanie fiszek
1. Użytkownik wkleja tekst do pola tekstowego.
2. System waliduje długość tekstu w czasie rzeczywistym (1000-10000 znaków).
3. Gdy tekst spełnia wymagania, przycisk "Generuj" staje się aktywny.
4. Po kliknięciu przycisku "Generuj":
   - System wyświetla wskaźnik ładowania.
   - Wysyła żądanie do API.
   - Po otrzymaniu odpowiedzi wyświetla wygenerowane propozycje fiszek.
   - W przypadku błędu wyświetla komunikat.

### Zarządzanie propozycjami fiszek
1. Użytkownik przegląda listę wygenerowanych propozycji.
2. Dla każdej fiszki może:
   - Zaakceptować fiszkę (zmiana statusu na "accepted").
   - Odrzucić fiszkę (zmiana statusu na "rejected").
   - Edytować fiszkę (otwarcie modalu edycji).

### Edycja fiszki
1. Po kliknięciu "Edytuj" otwiera się modal z formularzem.
2. Użytkownik może edytować pola front i back.
3. System waliduje wprowadzone dane:
   - Front: 10-200 znaków.
   - Back: 10-500 znaków.
4. Po kliknięciu "Zapisz":
   - Jeśli dane są poprawne, fiszka jest aktualizowana i oznaczana jako "ai-edited".
   - Jeśli dane są niepoprawne, wyświetlane są komunikaty o błędach.
5. Po kliknięciu "Anuluj" zmiany są odrzucane i modal jest zamykany.

### Zapisywanie fiszek
1. Użytkownik ma dwie opcje:
   - "Zapisz wszystkie" - zapisuje wszystkie fiszki niezależnie od statusu.
   - "Zapisz zaakceptowane" - zapisuje tylko fiszki ze statusem "accepted".
2. Po kliknięciu jednego z przycisków:
   - System wyświetla wskaźnik ładowania.
   - Wysyła żądanie do API.
   - W przypadku powodzenia informuje o sukcesie.
   - W przypadku błędu wyświetla komunikat.

## 9. Warunki i walidacja
### Walidacja tekstu źródłowego
- Pole nie może być puste.
- Długość tekstu musi wynosić od 1000 do 10000 znaków.
- Walidacja odbywa się w czasie rzeczywistym podczas wprowadzania tekstu.
- Efekty wizualne: licznik znaków zmienia kolor na czerwony przy niewłaściwej długości.

### Walidacja pól fiszki w modalu edycji
- Front:
  - Pole wymagane.
  - Długość: 10-200 znaków.
  - Walidacja przy próbie zapisania i w czasie rzeczywistym.
- Back:
  - Pole wymagane.
  - Długość: 10-500 znaków.
  - Walidacja przy próbie zapisania i w czasie rzeczywistym.

### Walidacja akcji zapisywania
- Przed zapisem sprawdzane jest, czy istnieją fiszki do zapisania:
  - Przy "Zapisz wszystkie" - musi istnieć co najmniej jedna fiszka.
  - Przy "Zapisz zaakceptowane" - musi istnieć co najmniej jedna fiszka ze statusem "accepted".

## 10. Obsługa błędów
### Błędy walidacji
- Wyświetlanie komunikatów inline pod odpowiednimi polami.
- Dezaktywacja przycisków akcji, gdy dane są niepoprawne.

### Błędy API
1. Błędy podczas generowania fiszek:
   - Wyświetlenie komunikatu o błędzie pod formularzem.
   - Możliwość ponownej próby.
   - Szczegółowe komunikaty dla różnych kodów błędów (400, 401, 500).

2. Błędy podczas zapisywania fiszek:
   - Wyświetlenie komunikatu o błędzie.
   - W przypadku częściowego powodzenia (207) - informacja o tym, które fiszki zostały zapisane.
   - Możliwość ponownej próby.

### Obsługa długotrwałych operacji
- Wskaźniki ładowania dla operacji generowania i zapisywania.
- Dezaktywacja odpowiednich przycisków podczas trwających operacji.

## 11. Kroki implementacji
1. Utworzenie podstawowej struktury plików:
   ```
   src/pages/generate.astro
   src/components/generate/TextInputSection.tsx
   src/components/generate/FlashcardProposalsList.tsx
   src/components/generate/FlashcardProposalItem.tsx
   src/components/generate/GenerationActions.tsx
   src/components/generate/FlashcardEditModal.tsx
   src/hooks/useFlashcardGeneration.ts
   src/hooks/useTextInputValidation.ts
   src/hooks/useFlashcardEdit.ts
   ```

2. Implementacja typów i interfejsów potrzebnych dla komponentów.

3. Implementacja customowych hooków:
   - `useFlashcardGeneration`
   - `useTextInputValidation`
   - `useFlashcardEdit`

4. Implementacja poszczególnych komponentów od najniższego poziomu:
   - Implementacja komponentów bazowych (TextArea, Button, etc.)
   - Implementacja FlashcardProposalItem
   - Implementacja FlashcardEditModal
   - Implementacja FlashcardProposalsList
   - Implementacja TextInputSection
   - Implementacja GenerationActions

5. Integracja komponentów w głównym widoku generate.astro:
   - Zaimportowanie wszystkich komponentów
   - Implementacja logiki zarządzania stanem używając customowych hooków
   - Implementacja obsługi interakcji użytkownika

6. Implementacja integracji z API:
   - Funkcja generowania fiszek
   - Funkcja zapisywania fiszek

7. Testowanie:
   - Testowanie walidacji formularzy
   - Testowanie integracji z API
   - Testowanie interakcji użytkownika

8. Optymalizacja:
   - Dodanie debounce dla walidacji tekstu
   - Optymalizacja renderowania listy fiszek
   - Dodanie animacji dla poprawy UX

9. Dostosowanie pod kątem dostępności:
   - Poprawne atrybuty aria
   - Obsługa klawiatury
   - Odpowiednie komunikaty dla czytników ekranowych 