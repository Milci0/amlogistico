import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Dev: żądania /api lecą do lokalnego backendu (npm run server na :3001).
    // Front i API na tym samym originie (localhost:5173) → httpOnly cookie
    // działa first-party także lokalnie.
    // Regex (nie zwykły prefiks) wyklucza /api/_... - foldery z podkreślnikiem
    // (api/_lib, api/_routes, api/_validation, api/_config) to wg konwencji
    // Vercela pliki wewnętrzne, nigdy trasy backendu. Bez tego wyjątku import
    // modułu z api/_lib bezpośrednio w kodzie front-endowym (np.
    // src/utils/senderProfileFill.js -> api/_lib/companyDataStatus.js) w dev
    // mode trafiał pod proxy zamiast zostać obsłużony przez Vite jako zwykły
    // plik JS - 404 z Express i biała strona (import modułu w przeglądarce
    // się wywalał).
    proxy: {
      '^/api/(?!_)': 'http://localhost:3001',
    },
  },
  // Testy jednostkowe silnika doboru (src/utils/__tests__). Środowisko 'node' —
  // testowana jest czysta logika, nie komponenty; nie potrzeba jsdom.
  test: {
    environment: 'node',
    // api/ dolaczone od 2026-08-06: logika sledzenia kontenerow (walidacja ISO 6346,
    // przycinanie odpowiedzi ShipsGo, podpis webhooka) mieszka po stronie serwera,
    // a jest wystarczajaco samodzielna, zeby testowac ja bez bazy i bez sieci.
    include: ['src/**/__tests__/**/*.test.{js,jsx}', 'api/**/__tests__/**/*.test.js'],
  },
})
