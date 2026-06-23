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
- **Spójność generatora PDF — GOTOWE (2026-06-22):**
  - `src/utils/formatDate.js` — `formatDocumentDate(date, includeTime?)`: jedyna funkcja dat,
    format DD.MM.RRRR (pl-PL), obsługuje Date / ISO string "YYYY-MM-DD" / datetime z godziną;
    zastąpiła wszystkie `new Date().toLocaleDateString('pl-PL')` i surowe `data.loadDate`
    we wszystkich 9 szablonach
  - `data.carrier` — single source of truth dla przewoźnika w CMR, Zleceniu i POD
    (`{ name, address, vatNumber, contact, phone }`); wypełniany z Kroku 3 wizarda (sekcja "Przewoźnik")
  - `data.carrierLegs.{preCarriage,mainCarriage,onCarriage}` — osobna struktura dla
    Multimodal Transport Document; kolumna Carrier wypełniana per-etap trasy
  - Sanity check w trybie DEV: `console.log` carrier przy każdym generowaniu (Step4)
- **Rozszerzony formularz wizarda — GOTOWE (2026-06-22):**
  - **Krok 3 "Strony"** — dodana sekcja „Przewoźnik" (wymagana, te same pola co Nadawca/Odbiorca);
    walidacja: przejście do Kroku 4 wymaga wypełnienia nazwy dla wszystkich trzech stron
  - **Krok 2 "Towar"** — trzy nowe sekcje:
    - „Warunki przewozu" (oba typy) — Incoterms (dropdown), koszt frachtu + waluta, termin płatności
    - „Pojazd i warunki drogowe" (tylko `road`) — typ pojazdu (Plandeka/Chłodnia/Mroźnia), temperatura
      od/do (pokazuje się gdy Chłodnia/Mroźnia), checkbox ADR + klasa ADR/UN (gdy ADR=tak),
      nr rejestracyjny pojazdu (opcjonalne)
    - „Szczegóły kontenera i rejsu" (tylko `sea`) — typ kontenera, Container No., Seal No.,
      Marks & Nos, Vessel, Voyage No., Booking No., warunki frachtu (Prepaid/Collect)
  - **Nowe slajsy stanu** w root komponencie: `road` (initRoad), `sea` (initSea), `terms` (initTerms)
  - **Nowe pola w formData** (Step 4 → szablony):
    - `data.vehicle.{type,tempFrom,tempTo,adr,adrClass,reg}` → CMR (Incoterms + nr rej.), Zlecenie
    - `data.sea.{bookingNo,freightTerms}` → BillOfLading (Booking No., Freight Terms), SeaWaybill
    - `data.cargo.{incoterms,containerType,containerNo,sealNo,marksNos,vessel,voyageNo}` → szablony morskie
    - `data.terms.{freightPrice,freightCurrency,paymentDays}` → Zlecenie, FakturaHandlowa, FakturaProforma
  - **Zaktualizowane szablony:** CmrTemplate, ZlecenieTemplate, BillOfLadingTemplate,
    SeaWaybillTemplate, FakturaHandlowaTemplate, FakturaProformaTemplate
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
- **Dobór i pobieranie pustych formularzy PDF — GOTOWE (2026-06-23):**
  - `src/data/documentCatalog.js` — katalog dokumentów (klucze typu `"44_India_Import"`,
    pola `{name_pl, name_en, path, available}`). UWAGA: numer w kluczu ≠ numer pliku PDF —
    `path` mapowany wg ZNACZENIA (kraju), nie prefiksu. Wszystkie wpisy `available:true`;
    `22_China_Import` → fallback na `07` (brak pliku importowego CN); dodano `105_FDA`
  - `src/utils/documentEngine.js` — `getDocuments(origin, destination, mode, cargoCategory, flags)`
    → `{required, conditional, warnings}` (6 warstw: transport / handlowe / eksport / import /
    kategoria towaru / reguły specjalne). Helpery `getRouteLabel`, `isCrossCustoms`
  - **Strona „Puste szablony" przerobiona** (`src/pages/BlankTemplatesPage.jsx`, trasa
    `/blank-templates`): formularz trasa + środek transportu (road/sea/air/rail/multimodal) +
    kategoria towaru (12 opcji) + 4 flagi (woodenPackaging/temporaryExport/transhipment/reExport)
    → sekcje Wymagane (czerwona) / Warunkowe (żółta) / ostrzeżenia (`AlertBox`). Każdy dokument:
    „Pobierz" (`window.open(path)`) lub „Wkrótce" (gdy `available:false`)
  - „Pobierz wszystkie jako ZIP" — `jszip` + `file-saver`: fetch dostępnych dokumentów wymaganych,
    paczka `dokumenty_${origin}_${destination}.zip`
  - **Tranzyt poza UE (2026-06-23):** w formularzu (tylko `mode==='road'`) toggle TAK/NIE
    „Czy transport przejeżdża przez kraje spoza UE?" → stan `transitNonEU`, przekazywany do silnika
    jako `flags.transitNonEU`. Warstwa 6: TIR (`117`) + Transit (`116`) są teraz **required** gdy
    `road && transitNonEU` (zastąpiło stary warunek oparty na isEU origin/destination)
  - **Rozszerzono warstwę 4 (import) o 33 kraje** z dedykowanymi plikami (MX, TR, ZA, KE, EG, SG,
    MY, ID, VN, TH, AR, CL, CO, PE, EC, PK, BD, LK, PH, MM, KH, GH, SN, TZ, ET, JO, IL, IQ, LB, KZ,
    UZ, GE, NZ) + odpowiadające wpisy w `documentCatalog.js` (path zweryfikowany na dysku)
  - **Uwaga:** większość nowych krajów importowych NIE jest jeszcze w liście `COUNTRIES`
    (`src/data/mockData.js`), więc nie da się ich wybrać w dropdownie — reguły działają, ale do
    użycia trzeba dodać kraje do `COUNTRIES`. Pozostałe PDF-y z `public/templates/` bez warunku
    w silniku można podpiąć analogicznie wg specyfikacji

**Do zrobienia:**
- Panel abonamentu (integracja ze Stripe)
- Podmiana `NewDocumentPage` na `DocumentWizard`
- Deploy autoryzacji na Vercel (env vary DATABASE_URL/DIRECT_URL/JWT_SECRET) — patrz niżej
- Tabela `companies` w bazie — typ `carrier` (do wyboru z listy zapisanych firm, jak Nadawca/Odbiorca)
- Opcjonalne: dedykowany krok wizarda „Przewoźnik" po wdrożeniu bazy firm

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
