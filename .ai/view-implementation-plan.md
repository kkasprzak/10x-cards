# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest umożliwienie użytkownikowi przesłania treści wejściowej do usługi AI, która generuje propozycje fiszek. Endpoint przyjmuje tekst wejściowy, waliduje długość (1000–10000 znaków) oraz wysyła zapytanie do zewnętrznej usługi LLM. Wynikiem jest zapis sesji generacji w bazie danych oraz zwrócenie wygenerowanych propozycji fiszek wraz z liczbą wygenerowanych propozycji.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** /generations
- **Parametry/Request Body:**
  - **source_text** (wymagane): Tekst wejściowy do generowania fiszek. Musi zawierać od 1000 do 10000 znaków.

## 3. Wykorzystywane typy
- **GenerateFlashcardsCommand:** DTO zawierające właściwość `source_text`.
- **GenerationCreateResponseDto:** DTO zawierający:
  - `generation_id`: identyfikator sesji generacji
  - `flashcards_proposals`: lista propozycji fiszek (każda zgodna z modelem `FlashcardProposalDto`)
  - `generated_count`: liczba wygenerowanych propozycji

## 4. Szczegóły odpowiedzi
- **Statusy:**
  - 200 OK lub 201 Created – w przypadku powodzenia
  - 400 Bad Request – dla nieprawidłowych danych wejściowych (np. złej długości tekstu)
  - 401 Unauthorized – gdy użytkownik nie jest autoryzowany
  - 500 Internal Server Error – w przypadku błędów po stronie serwera
- **Struktura odpowiedzi:** JSON zawierający:
  - `generation_id`
  - `flashcards_proposals` (lista fiszek z polami: `id`, `front`, `back`, `source`)
  - `generated_count`

## 5. Przepływ danych
1. Odbiór żądania przez endpoint `/generations`.
2. Weryfikacja uwierzytelnienia użytkownika (JWT z Supabase Auth).
3. Walidacja danych wejściowych z pomocą biblioteki `zod`:
   - Sprawdzenie, czy `source_text` jest obecny.
   - Walidacja, że długość `source_text` mieści się w przedziale 1000–10000 znaków.
4. Przekazanie zweryfikowanych danych do serwisu (np. `generation.service`):
   - Wywołanie metody serwisowej odpowiedzialnej za komunikację z zewnętrzną usługą AI.
   - Pomiar czasu generacji (generation_duration).
5. Zapis sesji generacji w tabeli `generations` z odpowiednimi polami (w tym `user_id`, `model`, `generated_count`, `source_text_hash`, `source_text_length`, `generation_duration`).
6. W zależności od wyniku:
   - W przypadku sukcesu: zwrócenie wygenerowanych propozycji fiszek.
   - W przypadku niepowodzenia: zapisanie błędu do tabeli `generation_error_logs` i przekazanie odpowiedniego komunikatu błędu.

## 6. Względy bezpieczeństwa
- **Autoryzacja:** Endpoint wymaga autoryzacji poprzez JWT; użytkownik musi być poprawnie uwierzytelniony.
- **RLS:** Dostęp do rekordów w tabelach `generations` i `generation_error_logs` regulowany przez polityki RLS (user_id = auth.uid()).
- **Walidacja danych:** Upewnienie się, że `source_text` mieści się w określonym przedziale długości, aby nie dopuścić do nadużyć.
- **Bezpieczeństwo klucza API:** Jeśli używamy zewnętrznej usługi AI, należy zadbać o bezpieczne przechowywanie i używanie kluczy API.

## 7. Obsługa błędów
- **400 Bad Request:** Zwracane przy:
  - Braku `source_text` w żądaniu
  - Nieprawidłowej długości `source_text` (mniej niż 1000 lub więcej niż 10000 znaków)
- **401 Unauthorized:** Gdy użytkownik nie posiada ważnego tokena JWT.
- **500 Internal Server Error:** W przypadku błędów przy wywołaniu zewnętrznej usługi AI lub innych nieoczekiwanych błędów server-side. W takim przypadku szczegóły błędu powinny być logowane, a rekord błędu zapisany w tabeli `generation_error_logs`.

## 8. Rozważania dotyczące wydajności
- **Timeout do wywołania AI** Ustalany maksymalny czas oczekiwania na odpowiedź na 60 sekund
- **Indexowanie:** Wykorzystanie indeksów na kolumnach `user_id` w tabeli `generations` i `generation_error_logs` w celu zoptymalizowania zapytań.
- **Rate Limiting:** Rozważenie wprowadzenia limitu wywołań endpointu, aby zapobiec przeciążeniu systemu.

## 9. Etapy wdrożenia
1. **Utworzenie Endpointu:** 
   - Stworzenie pliku API (np. `src/pages/api/generations.ts`) dla obsługi żądania POST.
2. **Implementacja Walidacji:** 
   - Zastosowanie Zod lub innej biblioteki walidacyjnej do sprawdzania długości `source_text` oraz innych parametrów.
3. **Autoryzacja:** 
   - Upewnienie się, że operacje są wykonywane na kontekście użytkownika (poprzez `context.locals.supabase` lub odpowiedni mechanizm).
4. **Implementacja Logiki Biznesowej:** 
   - Wyodrębnienie logiki do serwisu odpowiedzialnego za komunikację z zewnętrzną usługą AI (`generation.service`). Serwis ma za zadania:
     - Integrację z zewnętrznym serwisem AI
     - Obsługuję logikę zapisu do tabeli `generations` oraz rejestracji błędów `generation_error_logs`
5. **Integracja z Zewnętrzną Usługą AI:** 
   - Wywołanie API LLM i obsługa czasu generacji oraz potencjalnych błędów.
6. **Zapis do Bazy Danych:** 
   - Insert danych do tabeli `generations` oraz, w razie potrzeby, zapis błędów do tabeli `generation_error_logs`.
7. **Generowanie Odpowiedzi:** 
   - Przygotowanie odpowiedzi JSON zawierającej `generation_id`, `flashcards_proposals` i `generated_count`.
8. **Testy i Weryfikacja:** 
   - Przeprowadzenie testów jednostkowych i integracyjnych dla endpointu, w tym scenariuszy błędów.
9. **Code Review i Deployment:** 
   - Przegląd kodu przez zespół oraz wdrożenie na środowisko testowe i produkcyjne. 