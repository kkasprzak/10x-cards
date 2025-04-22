# Specyfikacja Modułu Autentykacji

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### a) Strony i Layouty
- Utworzymy oddzielne strony Astro dla:
  * Logowania (/login)
  * Rejestracji (/register)
  * Odzyskiwania hasła (/forgot-password)
- Wykorzystamy osobne layouty:
  * Layout dla stron niezalogowanych (non-auth) z minimalną nawigacją i publicznym dostępem,
  * Layout dla stron zabezpieczonych (auth), który będzie sprawdzał stan sesji (np. poprzez middleware) i uniemożliwiał dostęp do stron chronionych bez autoryzacji.
- Kluczowe zmiany obejmują integrację logiki autoryzacji bezpośrednio w strukturze layoutów, aby nawigacja oraz dostęp do zabezpieczonych komponentów były spójne z wymaganiami bezpieczeństwa.

### b) Komponenty i Formularze
- Formularze rejestracji, logowania i odzyskiwania hasła zostaną zaimplementowane jako komponenty React umieszczone w katalogu `./src/components/auth/`.
- Każdy formularz będzie zarządzał swoim stanem, posiadał walidację pól wejściowych oraz wyświetlał odpowiednie komunikaty o błędach. Przykłady walidacji:
  * Rejestracja: poprawność formatu adresu e-mail, minimalna długość hasła, zgodność pól hasło i potwierdzenie hasła.
  * Logowanie: obecność wymaganych pól oraz wstępna walidacja formatu e-mail.
  * Odzyskiwanie hasła: weryfikacja formatu e-mail.
- Komponenty będą odpowiedzialne za wywoływanie endpointów API, a także aktualizację stanu interfejsu w odpowiedzi na działania użytkownika (np. przekierowanie po poprawnym logowaniu lub wyświetlenie błędu w formularzu).

### c) Scenariusze Użytkownika i Walidacja
- Rejestracja (odniesienie do US-001):
  * Użytkownik wypełnia formularz rejestracyjny (pola: email, hasło, potwierdzenie hasła).
  * Walidacja po stronie klienta obejmuje sprawdzenie formatu e-mail, długości hasła oraz zgodności pól haseł.
  * Po poprawnej rejestracji, konto zostaje aktywowane, a użytkownik automatycznie logowany i przekierowywany do głównej strony aplikacji.
  * W przypadku błędów, użytkownik otrzymuje komunikaty typu:
    - "Niepoprawny format adresu e-mail"
    - "Hasło musi mieć co najmniej X znaków"
    - "Hasła nie są zgodne"

- Logowanie:
  * Użytkownik podaje email i hasło, które są walidowane pod względem obecności oraz podstawowej poprawności formatu.
  * W przypadku nieprawidłowych danych wyświetlany jest komunikat "Nieprawidłowe dane logowania".

- Odzyskiwanie hasła:
  * Użytkownik wprowadza swój adres e-mail.
  * Po walidacji, żądanie resetu hasła jest wysyłane do backendu, który komunikuje się z Supabase w celu wysłania e-maila z linkiem resetującym hasło.
  * Użytkownik otrzymuje komunikaty o sukcesie lub błędach (np. "Wysłano instrukcje resetu hasła" lub "Nie znaleziono konta dla podanego adresu e-mail").

- Wylogowywanie:
  * W głównym layoutcie (auth) zostanie udostępniony przycisk "Wyloguj się" (np. w prawym górnym rogu).
  * Po kliknięciu przycisku aplikacja wywoła żądanie POST do endpointu odpowiedzialnego za zakończenie sesji użytkownika.
  * Po wylogowaniu użytkownik zostanie przekierowany do strony logowania.

### d) Integracja z Backendem
- Strony Astro odpowiedzialne za routing i kontrolę dostępu będą integrować się z endpointami API autoryzacyjnymi.
- Komponenty React wykonają asynchroniczne wywołania do endpointów (np. `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/forgot-password`), przetwarzając odpowiedzi i odpowiednio aktualizując interfejs użytkownika.
- Dodatkowo, strony zabezpieczone muszą weryfikować ważność sesji użytkownika. W przypadku braku autoryzacji, użytkownik zostanie przekierowany do strony logowania.
- Wszystkie endpointy API powinny weryfikować, czy operacje dotyczą danych zalogowanego użytkownika, zapewniając prywatność i bezpieczeństwo.

## 2. LOGIKA BACKENDOWA

### a) Struktura Endpointów API
- Endpointy API umieszczone w katalogu `./src/pages/api/auth/`:
  * `register.ts` – obsługuje rejestrację użytkownika: przyjmuje dane, waliduje, wywołuje odpowiednia metode w serwisie `auth.services.ts` i zwraca odpowiedź.
  * `login.ts` – obsługuje logowanie użytkownika: przyjmuje dane logowania, wykonuje weryfikację i wywołuje odpowiednia metode w serwisie `auth.services.ts`.
  * `forgot-password.ts` – obsługuje żądania resetowania hasła: waliduje adres e-mail i wywołuje mechanizm resetu hasła w serwisie `auth.services.ts`.
  * `logout.ts` – obsługuje wylogowywanie: przyjmowanie żądania POST, wywołanie odpowiedzniej metody odpowiedzialnej za wylogowanie w serwisie `auth.services.ts`.
  
### b) Mechanizm Walidacji i Obsługi Wyjątków
- Walidacja danych wejściowych zostanie zaimplementowana przy użyciu bibliotek typu Zod. Każdy endpoint sprawdzi poprawność danych i w przypadku błędów zwróci status 400 wraz z opisem problemów.
- Stosowane będą bloki try-catch do wychwytywania wyjątków, logowania błędów oraz zwracania odpowiednich kodów HTTP (np. 401 dla nieautoryzowanych prób, 500 dla błędów serwera).

### c) Integracja z Astro i Renderowanie Stron Server-Side
- Strony, które wymagają autoryzacji, będą renderowane po stronie serwera z wykorzystaniem istniejącej konfiguracji Astro (zgodnie z `astro.config.mjs`).
- Middleware lub bezpośrednia logika w stronach Astro będzie sprawdzała stan sesji użytkownika przed udostępnieniem chronionych treści. Wykorzystamy metody `supabase.auth.getSession` oraz `supabase.auth.getUser` dostępne w Supabase.

## 3. SYSTEM AUTENTYKACJI

### a) Wykorzystanie Supabase Auth
- W projekcie wykorzystamy Supabase Auth do implementacji:
  * Rejestracji: za pomocą metody `supabase.auth.signUp` Supabase, która tworzy nowe konto użytkownika.
  * Logowania: za pomocą metody `supabase.auth.signInWithPassword`, która uwierzytelnia użytkownika i zarządza sesją.
  * Resetowania hasła: wysyłania e-maila resetującego hasło, korzystając z mechanizmów Supabase `supabase.auth.resetPasswordForEmail`.
  * Wylogowywania: za pomoca metody `supabase.auth.signOut`
- Sesja użytkownika będzie zarzadzania przez Supabase, z obsługą sprawdzania autentykacji zarówno na poziomie stron Astro, jak i w komponentach React (np. przy pomocy metod `supabase.auth.getSession` i `supabase.auth.getUser`). Pod spodem poniewaz sesja musi byc utrzymywana na backendzie uzywany bedzie mechanizm ciasteczek.

### b) Moduły, Serwisy i Kontrakty
- Komponenty UI (w React):
  * `LoginForm` – formularz logowania
  * `RegisterForm` – formularz rejestracji
  * `ForgotPasswordForm` – formularz odzyskiwania hasła
- Serwis autentykacji (`src/lib/services/auth.service.ts`):
  * Metody: `login`, `register`, `forgotPassword`, `logout`, które komunikują się z Supabase oraz odpowiednimi endpointami API.
- Modele danych:
  * Kontrakt użytkownika definiujący m.in. pola: email, hasło, potwierdzenie hasła oraz ewentualne dodatkowe informacje wymagane w procesie rejestracji.
- Endpointy API:
  * Realizujące komunikację pomiędzy front-endem a Supabase Auth, ze standardowym schematem przyjmowania danych, walidacji, obsługi błędów oraz zwracania odpowiednich odpowiedzi.

## Podsumowanie
Specyfikacja modułu autentykacji została zaprojektowana w celu zapewnienia:
- Wyraźnego podziału odpowiedzialności pomiędzy warstwę frontend (Astro + React) a backend (API i Supabase Auth).
- Spójności interfejsu użytkownika zgodnie z istniejącą dokumentacją i konfiguracją projektu.
- Bezpiecznego oraz efektywnego zarządzania procesami rejestracji, logowania, wylogowywania i resetowania haseł.
- Łatwości rozbudowy funkcjonalności w przyszłości dzięki modularnej architekturze i przejrzystemu kontraktowi między komponentami, serwisami a endpointami API. 