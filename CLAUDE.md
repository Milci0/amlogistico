# AmLogistico — Platforma do generowania dokumentów spedycyjnych

## Co to za projekt
Aplikacja webowa do automatycznego generowania dokumentów transportowych
(CMR, Packing List, Faktura handlowa, SAD, Sea Waybill i inne — docelowo 9+ typów).
Użytkownik wypełnia formularz 4-krokowy (typ transportu, trasa, towar, dane firm)
i otrzymuje komplet PDF-ów dopasowany do trasy (UE / poza UE) i typu transportu (drogowy/morski).

## Stack
- **Frontend:** React.js + Tailwind CSS + React Router (w folderze `src/`)
- **Backend:** Node.js + Express, REST API (w folderze `server/`) — nie zaczęty
- **Baza danych:** PostgreSQL + Prisma — nie zaczęta
- **Generowanie PDF:** html2pdf.js (CDN, po stronie przeglądarki) — szablony JSX w `src/generators/`
- **Płatności:** Stripe — nie zaczęte

## Szczegółowy plan techniczny — docs/
Sięgaj do tych plików gdy potrzebujesz konkretów (pola dokumentów, endpointy, schemat bazy):
- `docs/1.Frontend.md` — struktura stron, komponenty, nawigacja
- `docs/2.Backend.md` — endpointy API, logika doboru dokumentów, pola CMR/SAD/Packing List
- `docs/3.Baza danych.md` — schemat tabel, relacje, zasady przechowywania danych

## AKTUALNY STATUS

### Frontend: ~80% gotowe
**Zrobione:**
- Landing Page (hero z przyciskiem "Rozpocznij", wizard modal, karty zalet, cennik, stopka)
- 4-krokowy wizard (Trasa → Towar → Strony → Dokumenty) z paskiem kroków, walidacją
- Layout po zalogowaniu: Navbar, Sidebar, AppShell
- Dashboard z metrykami i tabelą dokumentów (dane mockowane)
- Strony: Historia, Moje firmy, Abonament, Ustawienia (szkielet)
- **Generowanie PDF po stronie przeglądarki** (html2pdf.js z CDN, bez backendu)
  - `src/generators/generatePdf.jsx` — wspólny silnik React → html2canvas → PDF (jeden dla wszystkich)
  - Szablony JSX w `src/generators/templates/eu/{common,land,sea}/` — inline styles, 794px, Arial
    (folder odwzorowuje strukturę wzorcowych PDF-ów z `public/templates/eu/`)
  - **`src/generators/documents.js` — centralny rejestr `DOCUMENTS`** (jedyne źródło prawdy):
    każdy dokument to wpis `{ key, transport, required, show?, name, desc, icon, filename, template }`.
    `getDocsList(transport, bothEU)` filtruje listę, `generateDocument(doc, data)` woła silnik.
    Dodanie nowego dokumentu = szablon JSX + 1 wpis w rejestrze (koniec z plikami `fill*.js`)
- **Step 4 wizarda** — lista Wymagane/Opcjonalne, przycisk PDF przy każdym dokumencie,
  stany idle/loading/done/error, 2 przyciski zbiorcze: "Generuj wymagane" + "Generuj wszystkie"
- **Branding:** logo `AMLogistico` (Navbar, Sidebar, AppShell, Footer)
- **Nowy layout aplikacji (`/app`)** — jasny motyw z zielonym akcentem (emerald):
  - `Sidebar` przepisany: jasny, pogrupowane sekcje (GŁÓWNE/NARZĘDZIA/WIEDZA) z `MENU_GROUPS`,
    badge `Core`/licznik, dół: Ustawienia + Profil (`MENU_BOTTOM` w `data/mockData.js`)
  - `Topbar` (nowy `components/layout/Topbar.jsx`) — dzwonek, menu „…" z wylogowaniem (dropdown),
    ciemny avatar; hamburger mobilny przeniesiony tutaj
  - `AppShell` — aplikacja w zaokrąglonej karcie-„oknie" (border, shadow) na szarym tle
  - **Dashboard usunięty.** Indeks `/app` = `HomePage` (hero „Strona główna": label → nagłówek →
    podtytuł → „Rozpocznij" → 3 karty statystyk `HOME_STATS` → strzałka w dół)
  - **Layout publiczny:** `AppShell` nie jest już za `RequireAuth` — sam wygląd (sidebar/topbar/hero)
    widać też bez logowania. `/` → redirect na `/app`. `RequireAuth` chroni tylko funkcje
    (new-document, history, companies, subscription, settings + placeholdery).
    Topbar: niezalogowany widzi „Zaloguj się/Zarejestruj się", zalogowany — dzwonek/menu/avatar.
    `HomePage` „Rozpocznij": gość → `/login` (z `from`), zalogowany → kreator; gość ma podpowiedź
  - „Rozpocznij" → `/app/new-document`, gdzie `NewDocumentPage` renderuje już realny
    `DocumentWizard` (4-kroki) zamiast dawnej atrapy
  - Stara marketingowa `LandingPage` nie jest już routowana (plik zostaje, niewykorzystany)
  - `PlaceholderPage` + trasy dla nowych pozycji menu (profile/drafts/insurance/routes/incoterms)
- Oryginalne szablony PDF (9 plików) w `public/templates/eu/` jako wzorzec wizualny
- **Responsywność (RWD):** wizard działa na telefonie/tablecie
  - `WizardModal` — `min-h-0` na scrollowalnym body (naprawia brak przewijania na mobile —
    klasyczny bug flexa), mniejsze paddingi i większy `max-h` na małych ekranach
  - `DocumentWizard` — siatki `grid-cols-1 sm:grid-cols-2` / `grid-cols-2 sm:grid-cols-3`,
    `StepBar` ukrywa etykiety na mobile (zostają numery), przyciski zbiorcze Step 4 stackują się
- **PDF cross-device:** `generatePdf.jsx` wymusza render desktopowy w html2canvas
  (`windowWidth: 794`, `width: 794`, zmierzona wysokość) — naprawia ucinanie prawej strony
  na węższych ekranach; czeka na `document.fonts.ready`; `try/finally` sprząta kontener;
  `preloadHtml2Pdf()` przy montażu wizardu; na iOS Safari PDF otwiera się w nowej karcie
  (obejście blokady pobierania po await)

- **Autoryzacja (logowanie/rejestracja) — GOTOWE:**
  - Strony `src/pages/LoginPage.jsx` i `RegisterPage.jsx` (wspólny `components/auth/AuthShell.jsx`,
    styl spójny z wizardem), obsługa błędów 401/409/400 (per pole) przez `AlertBox`
  - `src/auth/AuthContext.jsx` — provider sesji (hydratacja przez `GET /api/auth/me` na starcie),
    `login/register/logout`; `src/lib/api.js` — fetch wrapper z `credentials:'include'` + `ApiError`
  - `src/components/auth/RequireAuth.jsx` — chroni `/app/*` (redirect na `/login`, zapamiętuje `from`)
  - `App.jsx` — root layout z `AuthProvider`, trasy `/login` `/register`, guard na `/app`
  - Navbar: przyciski → `/login` i `/register`; Sidebar: profil z danymi usera + „Wyloguj"
  - Dev: proxy `/api` → `:3001` w `vite.config.js`; `vercel.json` routuje `/api/*` do funkcji

**Do zrobienia:**
- Panel abonamentu (integracja ze Stripe)
- Podmiana `NewDocumentPage` na `DocumentWizard`
- Deploy autoryzacji na Vercel (env vary DATABASE_URL/DIRECT_URL/JWT_SECRET) — patrz niżej

### Backend: auth gotowy (serverless `/api`)
- `api/index.js` — Express 5 (lokalnie `npm run server` na `:3001`, na Vercelu funkcja serverless)
- `api/routes/auth.js` — `POST /api/auth/register|login|logout`, `GET /api/auth/me`
- `api/lib/auth.js` — JWT (jsonwebtoken) w **httpOnly cookie** (`sameSite:lax`, `secure` na prod),
  middleware `requireAuth` gotowe pod kolejne trasy; `api/lib/prisma.js` — singleton
- `api/validation/auth.js` — Zod 4; hasła bcryptjs (salt 12)
- Endpointy documents/companies/subscription, Stripe, rate-limiting — jeszcze nie zaczęte
- **Uwaga env:** firmowy proxy → `npm` wymaga `NODE_OPTIONS=--use-system-ca`.
  Prisma przypięta do **6.x** (Prisma 7 usunęło `url=env()` w schemacie — wymaga driver-adapterów)

### Baza danych: users na Neonie (Prisma 6 + PostgreSQL)
- `prisma/schema.prisma` — model `User` (`@@map("users")`, snake_case przez `@map`)
- Hosting **Neon**; `.env`: `DATABASE_URL` (pooled, `-pooler`) + `DIRECT_URL` (direct, do migracji)
- Schema wgrana przez `npx prisma db push`; podgląd `npx prisma studio`
- Tabele companies/document_sets/payments — jeszcze nie zaczęte (schema w `docs/3.Baza danych.md`)

## Zasady pracy
- Przed większymi zmianami przedstaw krótki plan
- Po zakończeniu sesji zaktualizuj sekcję "AKTUALNY STATUS"
- Logika doboru dokumentów (TIR+EU vs TIR+poza-UE vs Morski) jest w `docs/2.Backend.md`
- Lista krajów UE: stała `EU_CODES` w `src/components/wizard/DocumentWizard.jsx`
