# Plan testów

## 1. Wprowadzenie
### Cel planu testów  
Zapewnienie wysokiej jakości i niezawodności aplikacji Astro+React+Supabase poprzez kompleksowe pokrycie testami kluczowych funkcjonalności, UI i integracji z bazą.

### Zakres testowania  
- Warstwa frontend (komponenty Astro, React)  
- Warstwa backend (API endpoints w `src/pages/api`)  
- Integracja z Supabase (klient, zapytania)  
- Middleware i mechanizmy ochrony tras  
- Wydajność podstawowych operacji
- Bezpieczeństwo aplikacji i danych

## 2. Strategia testowania
### Podejście do testowania  
1. Testy jednostkowe – izolowane funkcje, helpery, komponenty React.  
2. Testy integracyjne – połączenia z Supabase Local Development, testy API endpoints.  
3. Testy end-to-end – scenariusze użytkownika w przeglądarce (Playwright).  
4. Testy wydajnościowe – pomiary ładowania i obciążenia API.
5. Testy bezpieczeństwa – skanowanie podatności, analiza zależności, testowanie uwierzytelniania.

### Rodzaje testów do przeprowadzenia  
- Jednostkowe (Vitest + React Testing Library)  
- Integracyjne (Vitest + MSW + Supabase Local Development)  
- E2E (Playwright Test)  
- Wydajnościowe (k6 + Lighthouse CI)
- Bezpieczeństwa (OWASP ZAP, Snyk, dedykowane testy RLS)

## 3. Środowisko testowe
### Wymagania sprzętowe i programowe  
- Node.js >= 20, npm lub pnpm  
- Supabase Local Development (Docker)  
- Przeglądarka Chromium do E2E  
- CI runner z dostępem do Docker (opcjonalnie)

### Konfiguracja środowiska  
1. `cp .env.example .env.test` i uzupełnić zmienne dla testów.  
2. Uruchomić Supabase Local Development: `npx supabase start`.  
3. Zainstalować zależności: `npm ci`.  
4. Skonfigurować test runner (`vitest.config.ts`, `playwright.config.ts`).

## 4. Przypadki testowe

| ID   | Obszar          | Opis                                                                 | Priorytet |
|------|-----------------|----------------------------------------------------------------------|-----------|
| TC-01| Auth ‑ UI       | Logowanie z poprawnymi danymi → przekierowanie do dashboardu         | Wysoki    |
| TC-02| Auth ‑ UI       | Rejestracja z niepoprawnym emailem → komunikat walidacji             | Średni    |
| TC-03| Auth ‑ API      | POST `/api/auth/login` wartości poprawne → status 200 + token        | Wysoki    |
| TC-04| Auth ‑ API      | POST `/api/auth/login` błędne dane → status 401 + komunikat          | Wysoki    |
| TC-05| CRUD ‑ Tworzenie| Tworzenie rekordu z poprawnymi danymi (UI + API)                     | Wysoki    |
| TC-06| CRUD ‑ Odczyt   | Pobranie listy rekordów przy pustej i pełnej bazie                   | Wysoki    |
| TC-07| CRUD ‑ Edycja   | Edycja istniejącego rekordu i walidacja rollbacku przy błędzie       | Średni    |
| TC-08| CRUD ‑ Usuwanie | Usuwanie rekordu → usunięcie w bazie i w UI                          | Średni    |
| TC-09| UI ‑ Komponenty | Render komponentu listy (loading, empty, error, z danymi)            | Średni    |
| TC-10| Responsywność   | UI na mobile, tablet, desktop                                        | Niski     |
| TC-11| Middleware      | Próba dostępu do `/dashboard` bez sesji → przekierowanie na login     | Wysoki    |
| TC-12| Wydajność       | Ładowanie strony głównej < 1s przy 1 k żądań/s                       | Niski     |
| TC-13| Bezpieczeństwo  | Sprawdzenie podatności XSS w formularzach                            | Wysoki    |
| TC-14| Bezpieczeństwo  | Weryfikacja polityki haseł i mechanizmów lockout                     | Wysoki    |
| TC-15| Bezpieczeństwo  | Test Row Level Security w Supabase                                   | Wysoki    |
| TC-16| Bezpieczeństwo  | Analiza nagłówków HTTP security                                      | Średni    |

## 5. Harmonogram testów

| Faza                   | Czas trwania       |
|------------------------|--------------------|
| Konfiguracja i setup   | 1 dzień            |
| Testy jednostkowe      | 2 dni              |
| Testy integracyjne     | 2 dni              |
| Testy E2E              | 3 dni              |
| Testy wydajnościowe    | 1 dzień            |
| Testy bezpieczeństwa   | 2 dni              |
| Raportowanie i poprawki| 2 dni              |

## 6. Kryteria akceptacji
- 100% krytycznych testów jednostkowych i integracyjnych zielone.  
- Żaden krytyczny błąd w scenariuszach E2E.  
- Wyniki wydajnościowe mieszczą się w akceptowalnych granicach.  
- Brak otwartych blockerów krytycznych.
- Brak wysokiego ryzyka w skanach bezpieczeństwa.

## 7. Raportowanie i śledzenie błędów
- Narzędzie: GitHub Issues (label: `bug/test`).  
- Pipeline CI: automatyczne generowanie raportów testów (JUnit, HTML, Lighthouse).  
- Proces eskalacji: błędy krytyczne → natychmiastowe hotfixy, pozostałe w backlogu.
- Raporty skanów bezpieczeństwa z priorytetyzacją znalezisk.

## 8. Zasoby
- Zespół QA: 1–2 osoby (frontend + backend).  
- Developerzy wsparcia: 2 osoby do analizy błędów.  
- Specjalista security: 1 osoba (w razie potrzeby).
- Narzędzia: Vitest, React Testing Library, MSW, Playwright Test, k6, Lighthouse CI, OWASP ZAP, Snyk, Supabase Local Development.

## 9. Ryzyka i plany awaryjne

| Ryzyko                                     | Plan awaryjny                                             |
|--------------------------------------------|-----------------------------------------------------------|
| Problemy z Supabase Local Development      | Testy integracyjne w sandboxie Supabase w chmurze        |
| Problemy z wydajnością na CI runnerach     | Delegacja wydajności do oddzielnego środowiska testowego |
| Niska jakość danych testowych              | Generatory fikcyjnych danych / mocki                     |
| Fałszywe alarmy w testach bezpieczeństwa   | Weryfikacja manualna i whitelist dla false positives     |

## 10. Testy bezpieczeństwa

### 10.1 Narzędzia do testów bezpieczeństwa
- **OWASP ZAP**: skanowanie podatności aplikacji (XSS, CSRF, SQL Injection)
- **Snyk**: analiza zależności i skanowanie kodu
- **helmet.js + CSP Tester**: weryfikacja nagłówków bezpieczeństwa
- **Dedykowane testy RLS**: weryfikacja Row Level Security w Supabase

### 10.2 Strategia testów bezpieczeństwa
1. **Automatyczne skanowanie** - w procesie CI/CD
2. **Analiza zależności** - codzienne skanowanie repozytorium
3. **Testy uwierzytelniania** - brute force, wycieki informacji, 2FA
4. **Testy uprawnień** - weryfikacja izolacji danych między użytkownikami
5. **Testy API** - ataki injection, weryfikacja tokenów, rate limiting

### 10.3 Przypadki testowe bezpieczeństwa

| ID   | Obszar               | Opis                                                        | Narzędzie     |
|------|----------------------|-------------------------------------------------------------|---------------|
| SEC-01| Auth                | Testowanie brute force z rate-limiting                       | Skrypt własny |
| SEC-02| API                 | Automatyczne skanowanie podatności API                       | OWASP ZAP     |
| SEC-03| Zależności          | Skanowanie podatności w zależnościach                        | Snyk          |
| SEC-04| CSP                 | Testowanie Content Security Policy                           | CSP Evaluator |
| SEC-05| Supabase RLS        | Weryfikacja izolacji danych między użytkownikami             | Skrypt własny |
| SEC-06| Tokeny JWT          | Weryfikacja payload i algorytmów podpisu                     | jwt-cracker   |

> Dokument zaktualizowany o nowoczesne technologie i rozszerzone testy bezpieczeństwa dla aplikacji Astro, React, TypeScript, Tailwind oraz Supabase. 