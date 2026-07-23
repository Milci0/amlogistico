// Singleton klienta Anthropic. Klucz WYŁĄCZNIE po stronie serwera (ANTHROPIC_API_KEY
// z .env / env Vercela) — nigdy nie trafia do bundla frontendu.
import Anthropic from '@anthropic-ai/sdk'

let client = null

export function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Brak ANTHROPIC_API_KEY w zmiennych środowiskowych')
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return client
}

// Modele:
// 1a (klasyfikacja z listy kandydatów, bez web_search) → Sonnet 5. Haiku okazał się
//    zbyt słaby na rozróżnianiu postaci towaru mimo identycznego opisu tekstowego
//    (np. świeże vs suszone jabłka: 0808 vs 0813 — Haiku 4/5 razy wybierał suszone;
//    Sonnet stabilnie trafia). Prompt niesie tylko krótkie etykiety HS-6, więc 1a input
//    jest mały (~350-1100 tok) i koszt pozostaje ~0.1-0.4¢ (poniżej progu trasy UE-UE).
// 1b (taryfa kraju docelowego przez web_search) → Sonnet 5 (Haiku nie obsługuje web_search).
export const MODEL_CLASSIFY = 'claude-sonnet-5'
export const MODEL_WEB_SEARCH = 'claude-sonnet-5'
// Stawki $/1M tokenów per model (do logu kosztowego).
export const MODEL_RATES = {
  'claude-sonnet-5': { in: 3, out: 15 },
  'claude-haiku-4-5': { in: 1, out: 5 },
}
