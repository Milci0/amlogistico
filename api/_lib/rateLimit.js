import rateLimit from 'express-rate-limit'

// Limiter prób uwierzytelnienia: 10 żądań / 15 min / IP — ochrona przed brute-force
// (zgadywaniem haseł) na /auth/login i /auth/register. Współdzielony licznik między
// tymi trasami (jeden instance = jeden bucket per IP).
//
// Uwaga produkcyjna: domyślny store jest w pamięci i na Vercelu resetuje się przy
// każdym cold-startcie oraz nie jest współdzielony między instancjami — to limit
// „best-effort". Twardy limit wymaga zewnętrznego store (np. Redis).
//
// NIE nakładamy limitera na GET /auth/me — ta trasa jest wołana przy każdym starcie
// aplikacji (hydratacja sesji), więc limit 10/15min by ją zablokował.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7', // nagłówki RateLimit-* w odpowiedzi
  legacyHeaders: false,
  message: { error: 'Zbyt wiele prób. Spróbuj ponownie za kilka minut.' },
})
