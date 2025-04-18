# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Interfejs użytkownika jest zbudowany wokół widoku generowania fiszek dostępnego po autoryzacji. Struktura obejmuje widoki uwierzytelniania, generowania fiszek, listy fiszek z modalem edycji, panel oraz widok sesji powtórek. Całość korzysta z responsywnego designu opartego na Tailwind, gotowych komponentów ShadCN/UI oraz systemu zarządzania stanem, wykorzystującego React kontekst i hooki React. 

## 2. Lista widoków

### 2.1. Logowanie
- **Ścieżka widoku:** `/login`
- **Główny cel:** Uwierzytelnienie użytkownika.
- **Kluczowe informacje do wyświetlenia:** Formularz logowania z polami email i hasło, link do rejestracji, komunikaty o błędach (inline dla krytycznych, toasty dla mniej krytycznych).
- **Kluczowe komponenty widoku:** Formularz, pola input, przycisk logowania, system walidacji.
- **Uwagi dot. UX, dostępności i bezpieczeństwa:** Formularz musi być responsywny, dostępny dla czytników ekranu oraz przesyłać dane w sposób bezpieczny (np. szyfrowanie haseł).

### 2.2. Rejestracja
- **Ścieżka widoku:** `/register`
- **Główny cel:** Utworzenie nowego konta użytkownika.
- **Kluczowe informacje do wyświetlenia:** Formularz rejestracji zawierający pola email, hasło oraz potwierdzenie hasła, informacje o polityce prywatności.
- **Kluczowe komponenty widoku:** Formularz, pola input, przycisk rejestracji, walidacja formularza, komunikaty o błędach.
- **Uwagi dot. UX, dostępności i bezpieczeństwa:** Intuicyjna walidacja w czasie rzeczywistym, dostępność dla użytkowników korzystających z narzędzi wspomagających oraz bezpieczne przesyłanie danych.

### 2.3. Generowanie fiszek
- **Ścieżka widoku:** `/generate`
- **Główny cel:** Umożliwia użytkownikowi generowanie propozycji fiszek przez AI i ich rewizję (Zaakceptuj, edytuj lub odrzuć) 
- **Kluczowe informacje do wyświetlenia:** Pole wprowadzania tekstu, lista propozycji fiszek wygenerowanych przez AI, przyciski akceptacji, edycji lub odrzucenia. 
- **Kluczowe komponenty widoku:** Komponent wejścia tekstowego, przycisk generuj fiszki, lista fiszek, przyciski akcji (zapisz wszystkie, zapisz zaakceptowane), wskaźnik ładowania (skeleton), komunikaty o błędy. 
- **Uwagi dot. UX, dostępności i bezpieczeństwa:** Jasny podział na sekcje, wizualne wskazanie trwania operacji, walidacja danych przed wysłaniem do API, obsługa błędów inline.

### 2.4. Lista fiszek. 
- **Ścieżka widoku:** `/flashcards`
- **Główny cel:** Przegląd, edycja lub usuwanie fiszek. 
- **Kluczowe informacje do wyświetlenia:** Lista zapisanych fiszek z informacjami o pytaniu i odpowiedzi.
- **Kluczowe komponenty widoku:** Lista elementów, komponent, modal edycji, przyciski usuwania, potwierdzenie operacji.
- **Uwagi dot. UX, dostępności i bezpieczeństwa:** Czytelny układ listy, dostępność klawiaturowa modyfikacji, potwierdzenie usunięcia.

### 2.5. Modal edycji fiszki
- **Ścieżka widoku:** Wyświetlany nad widokiem listy 
- **Główny cel:** Umożliwienie edycji fiszek z walidacją danych bez zapisu w czasie rzeczywistym. 
- **Kluczowe informacje do wyświetlenia:** Formularz edycji fiszki. Pola "przód" i "tył". Komunikaty walidacyjne. 
- **Kluczowe komponenty widoku:** Modal z formularzem, przyciski "zapisz" i "anuluj". 
- **Uwagi dot. UX, dostępności i bezpieczeństwa:** Intuicyjny modal, dostępność dla czytników ekranu, walidacja danych po stronie klienta. 
 
### 2.6. Panel użytkownika
- **Ścieżka widoku:** `/profile`
- **Główny cel:** Prezentacja podstawowych informacji o profilu użytkownika oraz umożliwienie zarządzania kontem.
- **Kluczowe informacje do wyświetlenia:** Dane kontaktowe, informacje profilowe, opcje edycji i zarządzania kontem, przycisk wylogowania.
- **Kluczowe komponenty widoku:** Formularz edycji profilu, przyciski akcji.
- **Uwagi dot. UX, dostępności i bezpieczeństwa:** Bezpieczne wylogowanie, łatwy dostęp do ustawień, prosty i czytelny interfejs.

### 2.7. Sesja powtórkowa
- **Ścieżka widoku:** `/session`
- **Główny cel:** Umożliwienie nauki poprzez sesję powtórek zgodnie z algorytmem powtórek.
- **Kluczowe informacje do wyświetlenia:** Treść fiszki (przód, a po interakcji tył), przyciski do oceny stopnia opanowania fiszki.
- **Kluczowe komponenty widoku:** Komponent fiszki, przyciski interakcji, wskaźniki postępu sesji, opcje oceniania.
- **Uwagi dot. UX, dostępności i bezpieczeństwa:** Szybka zmiana stanów fiszki (od pytania do odpowiedzi), intuicyjne sterowanie, dostępność na urządzeniach mobilnych i desktopowych.

## 3. Mapa podróży użytkownika

1. Użytkownik rozpoczyna podróż od ekranu logowania lub rejestracji.
2. Po pomyślnej autoryzacji trafia do widoku generowania fiszek.
3. Użytkownik wprowadza tekst do generowania fiszek i inicjuje proces generacji. 
4. API zwraca propozycje fiszek, które są prezentowane na widoku generowania. 
5. Użytkownik przegląda propozycję i decyduje, które fiszki zaakceptować, edytować lub odrzucić (Opcjonalne otwarcie modala edycji). 
6. Użytkownik zatwierdza wybrane fiszki i dokonuje zbiorczego zapisu poprzez interakcję z API.
7. Następnie użytkownik przechodzi do widoku „moje fiszki”, gdzie może przeglądać, edytować lub usuwać fiszki. 
8. Użytkownik korzysta z nawigacji, aby odwiedzić panel użytkownika oraz opcjonalnie rozpocząć sesję powtórek.
9. W przypadku błędów, np. walidacji problemów z API, użytkownik otrzymuje komunikaty in-line. 

## 4. Układ i struktura nawigacji

- **Główna nawigacja:** Dostępna jako górne menu w layout strony po zalogowaniu. 
- **Elementy nawigacyjne:** Linki do widoków: "generowanie fiszek", "moje fiszki", "sesja nauki", "profil" oraz przycisk wylogowania. 
- **Responsywność:** W widoku mobilnym nawigacja przekształca się w menu hamburger, umożliwiając łatwy dostęp do pozostałych widoków.
- **Przepływ:** Nawigacja umożliwia bezproblemowe przechodzenie między widokami, zachowując kontekst użytkownika i jego dane sesyjne. 

## 5. Kluczowe komponenty

- **Formularze uwierzytelniania:** Komponenty logowania i rejestracji z obsługą walidacji.
- **Komponent generowania fiszek:** Z polem tekstowym i przyciskiem uruchamiającym proces generacji ze wskaźnikiem ładowania.
- **Lista fiszek:** Interaktywny komponent wyświetlający listę fiszek z opcjami edycji i usuwania.
- **modal edycji:** Komponent umożliwiający edycję fiszek z walidacją danych przed zatwierdzeniem.
- **Toast notifications:** Komponent do wyświetlania komunikatów o sukcesach i błędach. 
- **Menu nawigacji:** Elementy nawigacyjne ułatwiające przemieszczanie się między widokami. 
- **Komponent sesji powtórek:** Interaktywny układ wyświetlania fiszek podczas sesji nauki z mechanizmem oceny. 