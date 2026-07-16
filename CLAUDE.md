# AmLogistico — Platforma do generowania dokumentów spedycyjnych

## Co to za projekt
Aplikacja webowa do automatycznego generowania dokumentów transportowych
(CMR, Packing List, Faktura handlowa, SAD, Sea Waybill i inne — docelowo 9+ typów).
Użytkownik wypełnia formularz 4-krokowy (typ transportu, trasa, towar, dane firm)
i otrzymuje komplet PDF-ów dopasowany do trasy (UE / poza UE) i typu transportu (drogowy/morski).

## Stack
- **Frontend:** React.js + Tailwind CSS + React Router (w folderze `src/`)
- **Backend:** Node.js + Express 5 (serverless), REST API w folderze **`api/`** (NIE `server/`);
  lokalnie `npm run server` (:3001), na Vercelu funkcja serverless. Gotowe: auth (+ rate-limit) +
  zestawy dokumentów (news/diesel/ecb). Do zrobienia: companies, subscription/Stripe
- **Baza danych:** PostgreSQL na **Neon** + Prisma 6. Tabele gotowe: `users`, `document_sets`.
  Do zrobienia: `companies`, `payments`
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

- **Historia dokumentów + wersje robocze z pełną ścieżką audytową — GOTOWE (2026-07-15):**
  - **Zasada:** PDF-ów NIE trzymamy. Trzymamy `formData` (migawka kreatora) + `engineResult`
    (wynik `getDocsList`); każde „Pobierz" to regeneracja z zapisanych danych tą samą funkcją
    co kreator. Każdy realnie wygenerowany komplet = OSOBNY, nieusuwalny-przez-edycję wpis
    (completed). Edycja NIGDY nie nadpisuje — tworzy nowy wpis z `derivedFromId` = oryginał.
  - `src/services/documentSetsRepo.js` — **jedyna** warstwa persystencji (klucz
    `amlogistico:v1:${userId}:documentSets`). API = kontrakt przyszłego REST:
    `listSets/getSet/saveDraft(upsert)/completeSet(zawsze nowy id)/deleteSet/countByStatus`.
    `StorageQuotaError` z czytelnym komunikatem. Wymiana localStorage→REST = zmiana tego pliku.
  - `src/services/documentGeneration.js` — współdzielone `buildGeneratorData/getDocsForSnapshot/
    generateDocuments/buildEngineResult/buildMeta` (bez duplikacji logiki PDF; używa Step4 i „Pobierz").
  - `src/services/currentUser.js` — mostek `userId` (AuthContext → repo). Brak usera = `local-user`.
  - **Kreator na kontekście:** `WizardContext.jsx` (`WizardProvider`, tryby `create|resume|edit`,
    `isDirty` przez porównanie z baseline, autozapis co 1500 ms). `DocumentWizard.jsx` przepisany
    na kontekst, dynamiczny StepBar (klikalny do `maxStepReached`), Step4 zapisuje po udanym generowaniu.
  - **Autozapis per ścieżka (2026-07-15):** klucz `amlogistico:v1:${userId}:wizardAutosave:${flowType}`
    (osobny slot dla A i B — obie ścieżki mogą być otwarte w dwóch zakładkach naraz i nie nadpisują
    sobie postępu). `readAutosave/clearAutosave` przyjmują `flowType`; jednorazowa migracja starego
    klucza bez sufiksu → `…:wizardAutosave:have_transport`.
  - **Definicje kroków w jednym miejscu:** `src/components/wizard/flowSteps.js` (`FLOWS`,
    `totalSteps` z definicji, walidacja per krok, walidatory route/cargo/parties wyciągnięte do
    współdzielonych stałych). **Dwie ścieżki (2026-07-15):** `have_transport` (4 kroki: Trasa, Towar,
    Strony, Dokumenty) i `find_transport` (6 kroków: + Spedytorzy, Wycena przed Dokumentami).
    `PATH_TO_FLOW = { A→have_transport, B→find_transport }` mapuje parametr `?path=`.
    `DEFAULT_FLOW_TYPE` = `have_transport`.
  - **Render kreatora wg `key` kroku (2026-07-15):** `DocumentWizard` renderuje po
    `flow.steps[currentStep-1].key` (`route/cargo/parties/forwarders/quote/docs`), nie po numerze —
    ta sama sekwencja obsługuje 4 i 6 kroków. `ForwardersStep`/`QuoteStep` to **placeholdery**
    (nagłówek + „Ten krok będzie dostępny wkrótce" + Wstecz/Dalej, „Dalej" zawsze aktywny; zero pól
    i zapisu do `formData`) — realna lista spedytorów i wycena to osobny zakres.
  - **Wybór ścieżki:** `PathSelectPage` (`/wybor-sciezki`) — karty A/B otwierają
    `/new-document?path=A|B` w **nowej zakładce** (`window.open`, strona wyboru zostaje).
    `NewDocumentPage` czyta `?path=`; priorytet flowType: wczytany zestaw (edit/resume/restore) →
    `?path=` (tylko create) → `have_transport`. Wpis „Gotowe formularze" usunięty z sidebara
    (trasa `/new-document` została — obsługuje `?editId=`/`?draftId=`/`?path=`).
  - **Ochrona formularza (ETAP 7):** `UnsavedChangesGuard.jsx` — `useBlocker` (data router) +
    `beforeunload`; modal Zapisz/Odrzuć/Anuluj. Autozapis czyszczony po generowaniu/zapisie/odrzuceniu.
  - **UI:** `DocumentCard` na nowy kształt (badge ścieżki, dynamiczne kroki, „Pobierz/Edytuj/Usuń",
    etykieta „na podstawie zestawu z…"; BEZ „Duplikuj"). `HistoryPage`/`DraftsPage`/`Sidebar`
    przełączone na `useDocumentSets` + `documentSetsRepo`. Modale `ConfirmDialog`.
  - **Posprzątane (2026-07-16):** stare `src/hooks/useDocuments.js` + `src/services/documentsRepository.js`
    (osierocony seed) USUNIĘTE.
  - Zweryfikowane: build zielony + 19/19 niezmienników repo (nieusuwalność completed, derivedFromId,
    resume-delete, namespace per-user, quota). Testy interaktywne guarda/kreatora — do sprawdzenia w przeglądarce.

**Do zrobienia:**
- Panel abonamentu (integracja ze Stripe)
- Ścieżka B kreatora „Szukam transportu" — szkielet 6 kroków gotowy; kroki „Spedytorzy" i „Wycena"
  to placeholdery (do zaimplementowania: lista spedytorów, wycena frachtu, ubezpieczenie)
- Deploy autoryzacji na Vercel (env vary DATABASE_URL/DIRECT_URL/JWT_SECRET) — patrz niżej
- Tabela `companies` w bazie — typ `carrier` (do wyboru z listy zapisanych firm, jak Nadawca/Odbiorca)
- Opcjonalne: dedykowany krok wizarda „Przewoźnik" po wdrożeniu bazy firm

### Backend: auth gotowy (serverless `/api`)
- `api/index.js` — Express 5 (lokalnie `npm run server` na `:3001`, na Vercelu funkcja serverless)
- `api/routes/auth.js` — `POST /api/auth/register|login|logout`, `GET /api/auth/me`
- `api/lib/auth.js` — JWT (jsonwebtoken) w **httpOnly cookie** (`sameSite:lax`, `secure` na prod),
  middleware `requireAuth` gotowe pod kolejne trasy; `api/lib/prisma.js` — singleton
- `api/validation/auth.js` — Zod 4; hasła bcryptjs (salt 12)
- **Newsy na backendzie — GOTOWE (2026-06-23):** `api/routes/news.js` + `api/lib/rss.js`
  - `GET /api/news` — agreguje RSS po stronie serwera (browser User-Agent omija część
    blokad), kategoryzuje (geo/transport), wykrywa alerty, dedupe + sort. Cache w pamięci
    15 min (stale-while-revalidate). Zwraca `{ articles, ticker, updatedAt }`.
    `?refresh=1` → wymusza świeże pobranie z pominięciem cache (używa przycisk „Odśwież")
  - `api/lib/rss.js` — tylko parser RSS 2.0/Atom (regex, bez zależności): `fetchText`,
    `parseFeed`, `mapLimit`. **Kod obrazów (og:image, image-proxy, weserv) USUNIĘTY** —
    zdjęć nie pokazujemy (prawa autorskie), artykuł nie ma już pola `image`
  - **TRYB NAJBEZPIECZNIEJSZY (2026-06-23):** artykuł zwiera tylko **tytuł + link** (geo/transport/
    isAlert/source) — **bez fragmentu opisu** (`description` usunięte z payloadu; w feedzie czytane
    tylko wewnętrznie do detekcji alertów). Linkujemy do oryginału. Cel: minimalizacja reprodukcji tekstu
  - **Źródła: WYŁĄCZNIE bezpośrednie feedy RSS wydawców** (`SOURCES` w news.js,
    `MAX_PER_SOURCE = 18`, ~108 artykułów). Google News RSS USUNIĘTE — patrz niżej.
    - Morski/Świat: FreightWaves, The Loadstar, Splash247, Supply Chain Dive
    - Morski/Polska: **Namiary** (namiary.pl) — Polska×Morski
    - Drogowy/Polska: Truck.pl, **40ton** (40ton.net)
    - Cła: Customs Today, **Global Trade** (globaltrademag.com), Trade.gov (świeżość >rok → 0 art.)
    - **USUNIĘTE (komentarz w news.js):** Lloyd's List („personal, non-commercial use only"),
      JOC (S&P Global — zakaz republikowania), Reuters (ToS zakazuje komercyjnej redystrybucji),
      oraz **wszystkie źródła przez Google News RSS** (Trans.info, Eurologistics, Cła PL) —
      sprawdzone u źródła: nota `<copyright>` feedu = „personal, non-commercial use only" +
      `news.google.com/robots.txt` blokuje `/rss` → komercyjne pobieranie łamie ToS Google
  - **Puste kombinacje** (brak bezpośredniego feedu): **Polska×Cła** i **Świat×Drogowy** —
    front pokazuje `AlertBox` „Brak artykułów dla wybranego filtra" (nie błąd)
  - **Stopka /news** — nota: „Artykuły są własnością ich wydawców. AMLogistico wyświetla
    wyłącznie nagłówki i linki do oryginalnych źródeł RSS."
  - **Ticker:** WYŁĄCZNIE kursy NBP na żywo (EUR/PLN, USD/PLN, EUR/USD). Indeksy WCI/BDI/SCFI
    i Diesel EU **usunięte** z `buildTicker()` — były zahardkodowane i mylące obok „Na żywo".
    WCI (Drewry)/BDI (Baltic Exchange)/SCFI (Shanghai) są licencjonowane — nie pokazywać bez
    licencji/oficjalnego API.
    „Na żywo" w UI pokazuje się tylko gdy ticker ma dane (NBP/diesel)
  - **Cena diesla EU na pasku — GOTOWE (2026-06-24):** osobny endpoint `api/routes/diesel.js`
    (mount `/api/diesel-price`). Pobiera plik „Prices History" z EC Weekly Oil Bulletin
    (link stały + fallback skanujący stronę biuletynu), parsuje przez **SheetJS (`xlsx`)**:
    arkusz „Prices with taxes", kolumna `EU_price_with_tax_diesel` (ważona średnia EU-27,
    z podatkami), najnowszy tydzień, EUR/1000L → EUR/L. Zwraca
    `{ value, date, unit:'EUR/L', source:'EC Oil Bulletin' }` lub `{ value:null, error:'unavailable' }`.
    Fetch 8 s timeout, cache w pamięci 6 h (dane tygodniowe). Front (`NewsPage`): `useEffect` →
    `/api/diesel-price`, dokłada element „⛽ Diesel EU: 1,73 EUR/L (DD.MM.RRRR)" do paska
    (ukryty gdy `value:null`), atrybucja CC BY 4.0 w stopce. Pasek = seamless marquee
    (dwie grupy `min-w-full` + `justify-around`, translateX 0→-100%, 60s linear, pauza na hover,
    separator „ · ") — bez pustej luki niezależnie od liczby elementów
  - **Stopa EBC na pasku — GOTOWE (2026-06-24):** endpoint `api/routes/ecb.js` (`/api/ecb-rate`).
    ECB SDMX (`FM.B.U2.EUR.4F.KR.MRR_FR.LEV`, csvdata, bez klucza) →
    `{value,date,unit:'%',source:'ECB'}`. Fetch 8 s timeout, cache 6 h, try/catch z console.error.
    Front (`NewsPage`): fetch w useEffect, element „Stopa EBC: 2,40% (DD.MM.RRRR)" (ukryty gdy
    `value:null`), atrybucja EBC (CC BY 4.0) w stopce.
    (Brent z EIA był zaczęty, ale USUNIĘTY — klucz „DEMO" zwraca 403, a brak gotowego
    bezklucztowego źródła o czystej licencji komercyjnej. Do ewentualnego powrotu: EIA v2
    seria RBRTE + darmowy klucz w env `EIA_API_KEY`.)
  - **Zdjęcia: NIE pokazujemy cudzych zdjęć z RSS** (prawa autorskie/licencje agencji).
    `NewsImage` renderuje kolorowy placeholder z ikoną kategorii: Morski `bg-blue-900`+statek,
    Drogowy `bg-green-900`+ciężarówka, Cła `bg-yellow-900`+dokument, Alert `bg-red-900`+trójkąt,
    default `bg-gray-800`+gazeta (inline SVG, bez lucide-react)
  - **Front:** `src/pages/NewsPage.jsx` woła wyłącznie `/api/news` (usunięto kliencki
    rss2json + CORS-proxy + og). Przycisk „Odśwież" → `/api/news?refresh=1` (pomija 15-min
    cache serwera). `NewsContext` kropki „nieprzeczytane" też przez `/api/news`.
    **WAŻNE: news wymaga uruchomionego backendu** — lokalnie `npm run dev:full` (front+API)
    lub osobno `npm run server`. Vercel: `/api/news` jako serverless (uwaga na 10s timeout
    przy zimnym cache — rozważyć cron warming)
- **Zestawy dokumentów w bazie — GOTOWE (2026-07-16):** persystencja Historii/Wersji roboczych
  przeniesiona z localStorage do backendu, żeby działała cross-device (ten sam user, inne urządzenie).
  ZASADA: baza trzyma `formData` (migawkę kreatora), NIE pliki PDF — regeneracja z tego samego
  szablonu JSX na żądanie (bez zmian w silniku/szablonach).
  - `api/routes/documentSets.js` — CRUD za `requireAuth`, `userId` ZAWSZE z tokenu (nigdy z body/query).
    `GET /api/document-sets?status=` (metadane bez `formData`), `GET /:id` (pełny), `POST` (nowy set),
    `PATCH /:id` (autosave draftu / promocja draft→completed), `DELETE /:id`. Cudzy/nieistniejący set = **404**
    (nie 403 — nie ujawnia istnienia). `api/validation/documentSets.js` (Zod, `formData/meta` jako dowolny JSON).
  - `src/config/templateVersion.js` — `TEMPLATE_VERSION = '1.0.0'` doklejane przy KAŻDYM secie (audyt wersji szablonów).
  - **Repo bez zmiany kontraktu:** `src/services/documentSetsRepo.js` — te same nazwy eksportów
    (`listSets/getSet/saveDraft/completeSet/deleteSet/countByStatus`), ale wnętrze woła REST i funkcje
    są teraz **async**. `completeSet` = POST (zawsze nowy id), `saveDraft` = PATCH gdy jest id, inaczej POST.
  - **Konsumenci na async:** hook `useDocumentSets` + nowe `useDocumentSetList`/`useDraftCount`
    (fetch z loading/error, refetch po evencie `documentSets:changed`). `HistoryPage/DraftsPage`
    (loading/error, `derivedDate` z załadowanej listy zamiast osobnego `getSet`), `Sidebar` (licznik draftów),
    `NewDocumentPage` (async ładowanie zestawu źródłowego z bramką loading/błąd/404),
    `WizardContext.saveDraftAndMark`/`UnsavedChangesGuard`/`DocumentWizard.handleGenerate`/
    `BlankTemplatesPage.saveToHistory` — wszystkie `await`.
  - **Migracja:** `src/services/migrateLocalSets.js` — przy pierwszym zalogowaniu przenosi stare sety
    z localStorage (namespace usera + `local-user`) na konto przez POST, czyści klucze, flaga
    `amlogistico_migrated:${userId}`. Wołane z `AuthContext` (po login/register i po hydratacji `/auth/me`).
  - **UWAGA — cookie, nie Bearer:** wbrew pierwotnemu promptowi (który zakładał backend 0% + token
    w localStorage) auth był już gotowy na **httpOnly cookie** — zostawiony bez zmian. Jedyne dozwolone
    użycia localStorage: autozapis kreatora (per-tab best-effort, `WizardContext`) + flaga migracji.
  - Zweryfikowane end-to-end (server na :3001): 401 bez auth, lista bez `formData`, pełny GET z `formData`,
    izolacja kont (B nie widzi setów A → 404 na GET/PATCH/DELETE), identyczny komunikat login (złe hasło =
    nieistniejący email), delete→404 na re-get, `completedAt` przy completed. Build frontendu zielony.
- **Rate-limit `/auth/*` — GOTOWE (2026-07-16):** `api/lib/rateLimit.js` (`express-rate-limit`,
  10 żądań / 15 min / IP) nałożony na `POST /auth/login` i `/auth/register` (wspólny bucket per IP).
  **NIE** na `GET /auth/me` (wołane przy każdym starcie appki → limit by je zablokował).
  `app.set('trust proxy', 1)` w `api/index.js` (realne IP za proxy Vercela). Store w pamięci =
  best-effort na serverless (twardy limit → zewnętrzny store/Redis). Zweryfikowane: 10×401 → 429.
- Endpointy companies/subscription, Stripe — jeszcze nie zaczęte
- **Uwaga env:** firmowy proxy → `npm` wymaga `NODE_OPTIONS=--use-system-ca`.
  Prisma przypięta do **6.x** (Prisma 7 usunęło `url=env()` w schemacie — wymaga driver-adapterów)

### Baza danych: users na Neonie (Prisma 6 + PostgreSQL)
- `prisma/schema.prisma` — model `User` (`@@map("users")`, snake_case przez `@map`)
- Hosting **Neon**; `.env`: `DATABASE_URL` (pooled, `-pooler`) + `DIRECT_URL` (direct, do migracji)
- Schema wgrana przez `npx prisma db push`; podgląd `npx prisma studio`
- **Tabela `document_sets` — GOTOWA (2026-07-16):** model `DocumentSet` w `schema.prisma`
  (relacja do `User`, `onDelete: Cascade`, `@@index([userId, status])`, kolumny odwzorowują obiekt
  z `documentSetsRepo.js` + `templateVersion` + `kind` dla setów z pustych szablonów). Wgrana przez
  `prisma db push` (additive). `prisma generate` wymaga zatrzymanego serwera (EPERM na query engine dll
  gdy `npm run server` działa).
- Tabele companies/payments — jeszcze nie zaczęte (schema w `docs/3.Baza danych.md`)

## Zasady pracy
- Przed większymi zmianami przedstaw krótki plan
- Po zakończeniu sesji zaktualizuj sekcję "AKTUALNY STATUS"
- Logika doboru dokumentów (TIR+EU vs TIR+poza-UE vs Morski) jest w `docs/2.Backend.md`
- Lista krajów UE: stała `EU_CODES` w `src/components/wizard/DocumentWizard.jsx`
