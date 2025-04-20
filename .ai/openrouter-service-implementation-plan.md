# Implementacja usługi OpenRouter - Przewodnik wdrożenia

## 1. Opis usługi
Usługa OpenRouter jest dedykowanym rozwiązaniem umożliwiającym integrację z interfejsem API OpenRouter w celu wspomagania czatów opartych na modelach LLM. Główne zadania usługi obejmują:
- Przygotowanie i formatowanie komunikatów (systemowych i użytkownika) według specyfikacji OpenRouter API.
- Ustanowienie struktury odpowiedzi przy użyciu schematu JSON dla ustrukturyzowanych rezultatów.
- Zarządzanie konfiguracją modelu (nazwa modelu oraz parametry takie jak: parameter, top_p, frequency_penalty, presence_penalty).
- Obsługę błędów w komunikacji oraz zapewnienie bezpieczeństwa, w tym walidację wejść i bezpieczne przechowywanie kluczy API.

## 2. Opis konstruktora
Konstruktor serwisu przyjmuje następujące parametry konfiguracyjne:
- Klucz API, adres URL serwisu oraz inne dane uwierzytelniające (przechowywane w zmiennych środowiskowych).
- Ustawić domyślną nazwę modelu i zestaw parametrów, które będą stosowane w połączeniach z API.
- Umożliwiać konfigurację komunikatu systemowego (role: 'system') oraz użytkownika (role: 'user'). 
- Inicjalizację modułów pomocniczych: API Integration Handler, Message Formatter, Model Configuration Manager, Error Handler oraz Security Module.
- Akceptować opcjonalne parametry inicjalizacyjne, na przykład: timeout, retries. 

## 3. Publiczne metody i pola
**Publiczne metody:**
1. `sendChatMessage(message: string): Promise<ResponseType>`
   - Wysyła komunikat użytkownika do OpenRouter API, pobiera odpowiedź i zwraca ją w przetworzonym formacie. Uwzglednia wczesniej ustawiony komunikat systemowy oraz konfiguracje modelu.
2. `setSystemMessage(message: string): void`
   - Ustawia komunikat systemowy.
3. `setUserMessage(message: string): void`
   - Ustawia komunikat uzytkownika.
4. `setResponseFormat(schema: JSONSchema): void`
   - Konfiguracja schema JSON dla strukturalnych odpowiedzi (response_format).    
5. `setModel(name: string, parameters: ModelParameters): void`
   - Pozwala na wybor modelu (model: [model-name] oraz ustawienie jego parametrow (temparature, top_p, frequency_penalty, presence_penalty)).

**Publiczne pola:**
- `apiKey: string` – Klucz API używany do autoryzacji żądań.
- `defaultModel: string` – Domyślna nazwa modelu.
- `defaultModelParams: { parameter: number, top_p: number, frequency_penalty: number, presence_penalty: number }` – Domyślne parametry modelu.

## 4. Prywatne metody i pola
**Prywatne metody:**
1. `_formatMessage(role: string, content: string): Message`
   - Formatuje dowolny komunikat do struktury wymaganej przez API (np. komunikat systemowy lub użytkownika).
2. `_validatePayload(payload: object): boolean`
   - Waliduje strukturę wysyłanych danych na podstawie zdefiniowanego schematu JSON.
3. `_handleAPIResponse(response: any): Response`
   - Przetwarza odpowiedź z API, zapewniając zgodność z oczekiwanym formatem i strukturą danych.
4. `_logError(error: Error): void`
   - Rejestruje błędy oraz istotne informacje diagnostyczne w systemie logowania.

**Prywatne pola:**
- `_messageQueue: Message[]` – Historia komunikatów wysłanych do API.
- `_config: ModelConfig` – Konfiguracja serwisu zawierająca ustawienia modelu oraz inne parametry połączenia.

## 5. Obsługa błędów
Wdrożone mechanizmy obsługi błędów uwzględniają następujące scenariusze:
1. _Błąd walidacji danych:_
   - Weryfikacja struktury wiadomości przed wysłaniem żądania (_use _validatePayload_). 
2. _Błąd połączenia z API:_
   - Obsługa timeoutów, implementacja mechanizmu ponowień (retry) oraz odpowiednie logowanie.
3. _Błąd niepoprawnych parametrów modelu:_
   - Walidacja konfiguracji przy ustawianiu za pomocą _setModelConfig_, z natychmiastowym zgłaszaniem błędów.
4. _Błąd przetwarzania odpowiedzi:_
   - Mechanizmy walidacji i konwersji odpowiedzi z API, w tym obsługa niestandardowych formatów.

Każdy z tych scenariuszy jest obsługiwany przy użyciu bloków try/catch oraz centralnego systemu logowania błędów, co umożliwia szybkie reagowanie na problemy oraz zapewnienie przyjaznych komunikatów błędów dla użytkownika.

## 6. Kwestie bezpieczeństwa
Wdrożone strategie bezpieczeństwa obejmują:
1. _Bezpieczne przechowywanie kluczy API:_
   - Użycie zmiennych środowiskowych.
2. _Komunikacja przez HTTPS:_
   - Wymóg korzystania z bezpiecznych połączeń podczas komunikacji z OpenRouter API.
3. _Sanityzacja i walidacja danych wejściowych:_
   - Zapobieganie atakom injekcyjnym poprzez dokładną walidację wszystkich danych przesyłanych do usługi.
4. _Rate limiting i monitoring:_
   - Ograniczenie liczby żądań wysyłanych do API oraz monitorowanie podejrzanych aktywności.
5. _Bezpieczne logowanie:_
   - Rejestrowanie błędów bez ujawniania poufnych informacji.

## 7. Plan wdrożenia krok po kroku
1. **Konfiguracja projektu**
   - Zainstaluj wszystkie zależności: Astro, TypeScript, React, Tailwind, Shadcn/ui.
   - Skonfiguruj pliki środowiskowe (.env) zawierające klucze API oraz inne dane konfiguracyjne.

2. **Utworzenie modułów serwisowych**
   - Zaimplementuj API Integration Handler odpowiedzialny za wysyłanie żądań do OpenRouter API oraz odbieranie odpowiedzi.
   - Stwórz Message Formatter, który precyzyjnie formatuje komunikaty dla ról system i user oraz struktury odpowiedzi zgodnie ze schematem JSON.
   - Utwórz Model Configuration Manager do obsługi domyślnych ustawień modelu i jego parametrów.
   - Zaimplementuj centralny Error Handler oraz Security Module dbający o bezpieczeństwo i logowanie.

3. **Integracja z interfejsem użytkownika**
   - Zbuduj przyjazny interfejs użytkownika w Astro/React, umożliwiający wysyłanie wiadomości i prezentację odpowiedzi.
   - Upewnij się, że komunikaty użytkownika są odpowiednio formatowane przed wysyłką.

4. **Wdrożenie obsługi błędów i zabezpieczeń**
   - Dodaj mechanizmy weryfikacji danych (walidacja payload, sanityzacja wejść) oraz centralne logowanie błędów.
   - Skonfiguruj protokoły bezpieczeństwa, takie jak HTTPS, oraz mechanizmy rate limiting.