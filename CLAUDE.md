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
- 4-krokowy wizard (Trasa → Towar → Strony → Dokumenty) z paskiem kroków, walidacją
- Layout aplikacji: Sidebar, Topbar, AppShell
- Strony: Dokumentacja (`/history`), Moje firmy, Abonament, Profil
- **Generowanie PDF po stronie przeglądarki** (html2pdf.js z CDN, bez backendu)
  - `src/generators/generatePdf.jsx` — wspólny silnik React → html2canvas → PDF (jeden dla wszystkich)
  - **118 szablonów JSX** w `src/generators/templates/` (inline styles, 794px, Arial):
    `eu/{common,land,sea}` (9 — odwzorowanie wzorców z `public/templates/eu/`),
    `global/import` (48), `global/cargo` (25), `global/export` (18), `global/special` (18)
  - **DWA rejestry, różne role — nie mylić:**
    - `src/generators/documents.js` — rejestr `DOCUMENTS` (9 wpisów) używany przez **kreator**:
      `{ key, transport, required, show?, name, desc, icon, filename, template }`.
      `getDocsList(transport, bothEU)` filtruje, `generateDocument(doc, data)` woła silnik.
    - `src/data/templateCatalog.js` — `TEMPLATE_CATALOG` (118 wpisów, 1:1 z szablonami JSX):
      `{ key, name, grupa, filename, template, tags }`. Zasila „Puste szablony", wyszukiwarkę
      w Topbarze i pobieranie pustych formularzy. Grupy: `ue/transport/swiadectwo/celne_export/
      celne_import/towary_niebezp/handlowe`.
  - **Puste formularze generowane z JSX, nie z plików w `public/`:**
    `src/utils/blankDocuments.js` (`downloadBlankDocument`, `downloadBlankZip`, `hasBlankSource`)
    + `src/data/blankTemplateMap.js` (`getBlankTemplate` — mostek id z `documentCatalog.js` →
    wpis w `TEMPLATE_CATALOG`). Statyczne PDF-y z `public/templates/` to fallback/wzorzec wizualny.
  - `src/components/layout/TemplateSearch.jsx` — wyszukiwarka szablonów w Topbarze,
    widoczna wyłącznie na zakładce „Dokumentacja" (`/history`)
- **Step 4 wizarda** — lista Wymagane/Opcjonalne, przycisk PDF przy każdym dokumencie,
  stany idle/loading/done/error, 2 przyciski zbiorcze: "Generuj wymagane" + "Generuj wszystkie"
- **Branding:** logo `AMLogistico` (Sidebar, AppShell)
- **Nowy layout aplikacji (`/app`)** — jasny motyw z zielonym akcentem (emerald):
  - `Sidebar` przepisany: jasny, pogrupowane sekcje (GŁÓWNE/NARZĘDZIA/WIEDZA) z `MENU_GROUPS`,
    badge `Core`/licznik, dół: Ustawienia + Profil (`MENU_BOTTOM` w `data/mockData.js`)
  - `Topbar` (nowy `components/layout/Topbar.jsx`) — dzwonek, menu „…" z wylogowaniem (dropdown),
    ciemny avatar; hamburger mobilny przeniesiony tutaj
  - `AppShell` — aplikacja w zaokrąglonej karcie-„oknie" (border, shadow) na szarym tle
  - **Dashboard usunięty.** Indeks `/app` = `HomePage` (hero „Strona główna": label → nagłówek →
    podtytuł → „Rozpocznij" → 4 karty statystyk `HOME_STATS` → strzałka w dół)
  - **Layout publiczny:** `AppShell` nie jest już za `RequireAuth` — sam wygląd (sidebar/topbar/hero)
    widać też bez logowania. `/` → redirect na `/app`. `RequireAuth` chroni tylko funkcje
    (new-document, history, companies, subscription, settings + placeholdery).
    Topbar: niezalogowany widzi „Zaloguj się/Zarejestruj się", zalogowany — dzwonek/menu/avatar.
    `HomePage` „Rozpocznij": gość → `/login` (z `from`), zalogowany → kreator; gość ma podpowiedź
  - „Rozpocznij" → `/app/new-document`, gdzie `NewDocumentPage` renderuje już realny
    `DocumentWizard` (4-kroki) zamiast dawnej atrapy
  - `PlaceholderPage` + trasy dla nowych pozycji menu (profile/drafts/insurance/routes/incoterms/
    quotation) — „Wycena" (`/quotation`, badge `Core` w menu) to na razie placeholder
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
  - Topbar: dla gościa przyciski → `/login` i `/register`; Sidebar: profil z danymi usera + „Wyloguj"
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
  (w menu bocznym pozycja nazywa się **„Dokumentacja"**, trasa nadal `/history`; na tej zakładce
  Topbar pokazuje dodatkowo `TemplateSearch` — wyszukiwarkę 118 szablonów)
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
    `beforeunload`; Zapisz/Odrzuć/Anuluj. **ZMIANA (2026-07-22):** zamiast modalu na przyciemnionym
    tle (`bg-black/40` + `shadow-xl` dawały na ciemnym motywie brzydką czarną ramkę wokół karty)
    karta stoi **na środku ekranu jak wcześniej i w tym samym rozmiarze** (`max-w-md`, `p-6`,
    3 przyciski w kolumnie), ale **bez przyciemnionego tła** — zamiast nakładki delikatna ramka
    i miękki cień. Kontener `inset-0` ma `pointer-events-none`, sama karta `pointer-events-auto`.
    Renderowana przez **`createPortal` do `document.body`** — kreator siedzi w kontenerach
    z animacją (`animate-page-in`/`StepTransition`), a element z `transform` tworzy blok
    zawierający, przez co `position: fixed` przyczepiało się do kreatora i karta odjeżdżała przy
    scrollowaniu. Nawigacja nadal wstrzymana przez blocker do czasu wyboru akcji. Autozapis czyszczony po generowaniu/zapisie/odrzuceniu.
  - **UI:** `DocumentCard` na nowy kształt (badge ścieżki, dynamiczne kroki, „Pobierz/Edytuj/Usuń",
    etykieta „na podstawie zestawu z…"; BEZ „Duplikuj"). `HistoryPage`/`DraftsPage`/`Sidebar`
    przełączone na `useDocumentSets` + `documentSetsRepo`. Modale `ConfirmDialog`.
  - **Posprzątane (2026-07-16):** stare `src/hooks/useDocuments.js` + `src/services/documentsRepository.js`
    (osierocony seed) USUNIĘTE.
  - Zweryfikowane: build zielony + 19/19 niezmienników repo (nieusuwalność completed, derivedFromId,
    resume-delete, namespace per-user, quota). Testy interaktywne guarda/kreatora — do sprawdzenia w przeglądarce.

- **Profil, rejestracja, zmiana hasła, auto-fill — GOTOWE (2026-07-17):**
  - **Rejestracja** (`RegisterPage.jsx`): pola Imię i nazwisko / Email / Telefon / Hasło / Powtórz
    hasło / Nazwa firmy (opcjonalna) + checkbox regulaminu (wymagany, blokuje przycisk) + checkbox
    marketingowy (opcjonalny, domyślnie odznaczony). Pole VAT usunięte. Zgodność haseł walidowana po
    stronie klienta; błędy per pole przez istniejący mechanizm (AlertBox + `fieldErrors`).
  - **`ProfilePage.jsx`** (trasa `/profile`, `?tab=`) — pod-zakładki: `dane-osobowe` (imię,
    email read-only „służy do logowania", telefon), `firma` (box zachęcający AlertBox info + firma,
    VAT, EORI, adres/kod/miasto/kraj), `preferencje` (waluta EUR/PLN/USD/CHF; język PL aktywny,
    EN `disabled` „wkrótce"), `bezpieczenstwo` (zmiana hasła, stany idle/loading/success/error,
    błędy per pole), `zgody` (checkbox marketingowy + data akceptacji regulaminu read-only). Nieznany
    `?tab=` → `dane-osobowe`. Zapis przez `PATCH /api/profile`, po sukcesie `updateUser` w AuthContext
    (avatar/nudge/auto-fill widzą zmiany bez reloadu). Żaden input nie jest oznaczony jako wymagany.
  - **Merge Profil+Ustawienia:** „Ustawienia" usunięte z `MENU_BOTTOM`; trasa `/settings` → `Navigate`
    na `/profile`; `SettingsPage.jsx` (atrapa demo) **usunięta**. `AuthContext` ma nowe `updateUser`.
  - **Topbar** (`Topbar.jsx`): dropdown avatara rozbudowany (nagłówek: `fullName`+email, „Mój profil"
    →`/profile`, „Abonament"→`/subscription`, „Zmień hasło"→`/profile?tab=bezpieczenstwo`, separator,
    „Wyloguj się"); zamykanie click-outside **i Escape** (`useDismissable`). Dzwonek dostał dropdown
    łączący dwa źródła — nieprzeczytane newsy (`NewsContext`) + **nudge profilu** (klient, gdy
    `user.profileCompleted===false` i nie odrzucony); licznik = suma. Nudge klik →
    `/profile?tab=firma`, „X" zapisuje `amlogistico:v1:${userId}:profileNudgeDismissed` w localStorage
    (jedyne nowe użycie LS); znika na zawsze gdy `profileCompleted===true`.
  - **Auto-fill „Nadawca" w kreatorze** (`DocumentWizard.jsx`, krok `parties`): przy `mode==='create'`
    + `profileCompleted===true` + pusta sekcja Nadawca → automatyczne wypełnienie z profilu
    (`companyName`→name, `vatNumber`→vat, złożony adres) + szary tekst „Wypełnione danymi z Twojego
    profilu…". Przycisk „Wstaw moje dane firmy" (gdy profil kompletny). Gdy `profileCompleted===false`
    → link „uzupełnij dane firmy w profilu". **NIGDY** w `resume`/`edit` (ochrona migawki audytowej).
    **ZMIANA (2026-07-22):** auto-fill NIE wymaga już kompletnego profilu. Bramką jest
    `hasCompanyDataToFill(user)` (≥1 z `companyName/vatNumber/address/city/postalCode/country`),
    a `profileToSenderPatch` zwraca tylko NIEPUSTE pola (częściowe dane nie kasują wpisanych ręcznie).
    Gdy `profileCompleted!==true`, pod auto-wypełnioną sekcją jest link „Uzupełnij resztę danych firmy".
    Domyślna waluta z `user.defaultCurrency` w `WizardProvider` (nowy prop `defaultCurrency`) — tylko
    świeży `create` (edit/resume/restore bez zmian). Build zielony.
- **Kategorie i podkategorie towaru — GOTOWE (2026-07-22):** dawne 5 „rodzajów ładunku”
  (`CARGO_TYPES` duplikowane w `DocumentWizard.jsx` i `BlankTemplatesPage.jsx`) zastąpione
  pełnym katalogiem.
  - **`src/data/cargoCategories.js`** (nowy, jedyne źródło prawdy): `CARGO_CATEGORIES` (19 kategorii:
    id, nazwa PL, ikona lucide, `engine`, `hint`), `CARGO_SUBCATEGORIES` (260 podkategorii:
    `{id, categoryId, name, hsCode, flags[], docs[], warning}`), `CARGO_FLAGS` (37 flag cargo z
    etykietą PL, ikoną i klasą ADR). Helpery: `getCategory/getSubcategories/getSubcategory`
    (`getSubcategories` sortuje **alfabetycznie** przez `localeCompare(…, 'pl')` — w tablicy
    kolejność jest tematyczna, sortowanie tylko na wyjściu, żeby id-ki się nie rozjechały),
    `cargoLabel(cat, sub)` → „Elektronika — Smartfony”, `engineCategoryFor(cat, sub)` → kategoria
    dla `documentEngine.js`, przy czym podkategoria z flagą ADR (dangerous/flammable/corrosive/
    toxic/oxidizing/gas/explosive/radioactive) **podnosi** wynik do `dangerous_goods` (np. wódka
    w kategorii „Napoje”). Pole `docs` (typowe dokumenty per towar) na razie nie jest renderowane —
    zostaje jako podstawa pod przyszłą warstwę silnika „per podkategoria”.
  - **`src/components/cargo/CargoCategoryPicker.jsx`** (nowy, wspólny widget): kafelki kategorii
    w tym samym stylu co wcześniej (emerald przy zaznaczeniu, neutralny w spoczynku — jasny
    i ciemny motyw), siatka `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`, pod nią info-box z `hint`,
    pole „Podkategoria — konkretny towar” jako **combobox z wyszukiwarką** (wzorzec `CountrySelect`:
    klik otwiera listę, wpisywanie filtruje po nazwie **lub kodzie HS**, Escape/klik poza zamyka,
    pozycja „Wyczyść wybór”; akcent emerald zamiast niebieskiego), a po wyborze: pigułki flag cargo
    (ikona + etykieta + klasa ADR) i `AlertBox type="warning"` z ostrzeżeniem eksportowym.
    Ponowny klik w aktywny kafelek czyści wybór.
  - **Kreator (krok „Towar”):** nagłówek „Rodzaj ładunku” → **„Kategoria towaru”**. Kolejność pól:
    kategoria → podkategoria → **dopiero potem** „Nazwa towaru” i „Kod celny (HS/CN)” (wcześniej
    były na górze i wybór podkategorii wyglądał na nadpisywanie wpisanej ręcznie nazwy). Wybór
    podkategorii podpowiada nazwę i kod HS **tylko gdy pole jest puste** — ręczny wpis nigdy nie
    jest nadpisywany.
  - **Stan:** `cargo.cargoType` w migawce zastąpione przez `cargo.cargoCategory` +
    `cargo.cargoSubcategory` (`wizardState.js`). Zestawy zapisane wcześniej mają jeszcze
    `cargoType` — wczytują się bez błędu (pusty wybór kategorii), a `buildGeneratorData` wypełnia
    `data.cargo.cargoType` dla szablonów przez `cargoLabel(...) || cargo.cargoType` (fallback).
  - **Puste szablony:** ten sam widget; silnik dostaje `engineCategoryFor(...)` zamiast dawnej
    mapy 5 opcji, `meta.cargoDescription` w historii = `cargoLabel(...)`.
  - **Uwaga:** dostarczony plik bazy deklarował w `meta` 432 podkategorie, ale realnie zawierał
    260 — tyle jest w katalogu. Dodanie kolejnych = dopisanie wierszy `sub(...)`.
  - Zweryfikowane: `npm run build` zielony + skrypt kontrolny (19 kategorii, 260 podkategorii,
    zero duplikatów id, zero sierot `categoryId`, zero nieznanych flag). **Nie zweryfikowane
    interaktywnie w przeglądarce.**

- **Wspólna lista dokumentów + zapis wersji roboczej per krok — GOTOWE (2026-07-17):**
  - **`src/components/documents/DocumentSelectList.jsx`** (nowy) — jedna lista z checkboxami
    używana przez „Puste szablony" i krok Dokumenty kreatora (Step4 w `DocumentWizard.jsx`, dawniej
    `DocCard`/`DocIcon` lokalne w tym pliku — usunięte). Sekcje Wymagane/Opcjonalne (nagłówek
    „Opcjonalne" zawsze — w Pustych szablonach mapuje się z `result.conditional`), styl wiersza
    zależny od `required` (nie od zaznaczenia): wymagany = zielone tło/ramka + badge „Wymagany"
    (informacyjny, NIE blokuje checkboxa), opcjonalny = białe tło/ramka. Props: `documents
    ({id,namePl,nameEn?,description?,required}), selectedIds (Set), onToggle, actionLabel, onAction,
    disabled, errorMessage, statusFor? (per-doc spinner/gotowe/błąd — używane tylko w Step4),
    actionLoading`. Komunikat pod przyciskiem (nie nad listą) gdy `errorMessage` ustawiony przez
    wywołującego — oba miejsca przekazują ten sam tekst przy 0 zaznaczonych: „Zaznacz co najmniej
    jeden dokument, aby pobrać pliki."
  - **„Puste szablony" (`BlankTemplatesPage.jsx`):** usunięte przyciski „Pobierz”/„Wkrótce" przy
    wierszu; jeden przycisk „Pobierz zaznaczone (ZIP)” na dole. Domyślnie zaznaczone wszystkie
    `required`. Lista pokazuje tylko dokumenty faktycznie do pobrania (`available && hasBlankSource`) —
    afordancja „Wkrótce" zniknęła (nie ma sensu przy zaznaczaniu zbiorczym). Zapis do historii
    (`completeSet`, `kind:'blank'`) bez zmian, niezależny od zaznaczenia ZIP-a.
  - **Krok 4/6 kreatora (Step4):** checkbox dokumentu wymaganego jest teraz odznaczalny (usunięty
    `locked`/`disabled`/`readOnly`) — badge „Wymagany" zostaje jako informacja.
  - **ETAP 6 — moment zapisu wersji roboczej przepisany na model „status = f(krok)":**
    `WizardContext.jsx` ma teraz `activeRecordIdRef` (jeden rekord na sesję kreatora) i
    `persistProgress(step, snapshot)`, wołane automatycznie w `useEffect` przy KAŻDEJ zmianie kroku
    (Dalej/Wstecz/klik w StepBar) — status liczony z pozycji (`step>=totalSteps` → `completed`,
    inaczej `draft`), niezależnie od kierunku (cofnięcie z kroku dokumentów na wcześniejszy
    **przywraca** `draft` na tym samym rekordzie — symetrycznie). Nowa funkcja repo
    `upsertProgress(id, partial, status)` w `documentSetsRepo.js` (PATCH gdy jest id, inaczej POST;
    404→fallback POST) — **zastąpiła** `saveDraft` (usunięta, była duplikatem). `completeSet` zostaje,
    używana tylko przez „Puste szablony" (jednorazowy zapis, nie przechodzi przez kroki kreatora).
    - `create`: rekord nie istnieje w bazie, dopóki user nie ruszy się z kroku 1.
    - `resume`: kontynuuje ISTNIEJĄCY draft (ten sam id) — koniec z „nowy rekord + deleteSet starego"
      przy generowaniu.
    - `edit`: NOWA kopia (`derivedFromId`=oryginał) tworzona **natychmiast po otwarciu edytora**
      (edit startuje od razu na ostatnim kroku, więc pierwszy zapis to już `completed`); dziedziczy
      `selectedDocs` oryginału, dopóki user nie wygeneruje na nowo.
    - „Generuj dokumenty" (Step4.handleGenerate) już NIE woła `completeSet`/`deleteSet` — woła nowe
      `wiz.recordGenerated(keys)`, które PATCH-uje TEN SAM rekord (już `completed` od wejścia na
      krok) z realnie wybranym kompletem.
    - Toast (nowy `src/components/ui/Toast.jsx`, samo-znikający w rogu ekranu) pokazuje się
      WYŁĄCZNIE gdy zapis kończy się statusem `draft` — nigdy na kroku dokumentów ani po generowaniu.
    - Znana konsekwencja (zgodna ze specyfikacją): jeśli user wejdzie na krok dokumentów i porzuci
      kreator bez kliknięcia „Generuj", w „Gotowe dokumenty" zostaje rekord `completed` z 0
      dokumentami (`selectedDocs: []`) — to zamierzone zachowanie modelu „status = f(kroku)", nie bug.
    - **WYCOFANE (2026-07-17):** automatyczny zapis „przy KAŻDEJ zmianie kroku" oraz toast „Zapisano
      wersję roboczą" USUNIĘTE (na życzenie użytkownika — kliknięcie „Rozpocznij"/„Edytuj" nie może
      tworzyć wpisów, a w trybie DEV `StrictMode` dublował zapis edit → 2 kopie). `WizardContext.jsx`
      nie ma już `useEffect([step])`, `showToast` ani renderu `<Toast>`. Sam plik `ui/Toast.jsx`
      został skasowany podczas czystki 2026-07-22 (patrz niżej). Wersja robocza powstaje TYLKO
      przez alert wyjścia (`UnsavedChangesGuard` → `saveDraftAndMark`, pojawia się wyłącznie gdy
      `isDirty`, tj. gdy user coś wpisał), a `completed` — przez „Generuj" (`recordGenerated`).
      Skutki: (1) wejście w „Edytuj" bez zmian NIE tworzy żadnego wpisu; (2) znika też opisana wyżej
      „konsekwencja" z pustym `completed`. `persistProgress`/`upsertProgress`/`recordGenerated`
      zostają bez zmian. Niewidoczny autozapis do `localStorage` (odzysk po zamknięciu karty) — bez
      zmian, nie tworzy wpisu w historii i nie pokazuje toastu.
    - **WYJĄTEK dodany (2026-07-17):** krok „Dokumenty" (ostatni) auto-zapisuje do historii
      NATYCHMIAST przy wejściu — nie dopiero po kliknięciu przycisku pobierania. `Step4` w
      `DocumentWizard.jsx` ma `useEffect` (raz na mount, `autoSavedRef`) wołający
      `wiz.recordGenerated(Array.from(selected))` z domyślnym zaznaczeniem (wymagane dokumenty) —
      zapisuje `completed` z pełnym `formData`, zanim user cokolwiek pobierze. Kliknięcie przycisku
      pobierania później aktualizuje TEN SAM rekord realnie pobranym kompletem. **Wyłączone dla
      `mode==='edit'`** (edit startuje już na tym kroku — auto-zapis od razu przy otwarciu utworzyłby
      zbędną kopię bez żadnej zmiany usera; tam kopia powstaje tylko przy realnym pobraniu/edycji).
      Przycisk przemianowany: „Generuj dokumenty"→„Pobierz wybrane dokumenty" (edit: „Wygeneruj jako
      nowy dokument"→„Pobierz jako nowy dokument"), bo faktycznie generuje PDF-y i od razu je pobiera
      (`html2pdf`) — nazwa „Generuj" myliła co do momentu zapisu.
  - **ETAP 7 — rozwijana lista w Historii/Wersjach roboczych:** `DocumentCard.jsx` — chevron zamieniony
    na `ChevronRight` z lucide-react (już używane w repo) zamiast ręcznego SVG, `aria-expanded` +
    `aria-label` „Pokaż/Ukryj dokumenty". **Nowość:** lista zestawów (`GET /document-sets`) nie niesie
    `formData`/`engineResult` (oszczędność transferu na backendzie — bez zmian), więc rozwinięcie
    doładowuje pełny zestaw leniwie przez `getSet(id)` (cache w stanie komponentu, jeden fetch na
    kartę). Wersje robocze: lista dokumentów liczona na żywo z `formData` przez
    `getDocsForSnapshot` (ten sam silnik co Step4) — pokazuje projekcję wymagane+opcjonalne, każdy
    wiersz z szarym „Niewygenerowany" zamiast przycisku „Pobierz". Gotowe zestawy: bez zmian
    (`selectedDocs` + `engineResult.docs`, przycisk „Pobierz”/„Pobierz ponownie" per dokument).
  - Zweryfikowane: build frontendu zielony. **Nie zweryfikowane w przeglądarce** (brak w tej sesji
    narzędzia do interaktywnego testu UI) — przed uznaniem za w pełni gotowe warto ręcznie przejść:
    kreator krok po kroku (toast na 1-3/1-5, brak na 4/6), cofanie z kroku dokumentów (draft wraca),
    edit→shadow copy, rozwijanie wierszy w Historii/Wersjach roboczych.

- **Odświeżenie wizualne kroku „Dokumenty" (Step4) — GOTOWE (2026-07-17):** wyłącznie warstwa UI,
  bez zmian logiki/silnika/katalogu/szablonów PDF.
  - **Typografia:** Inter faktycznie ładowany (`@fontsource/inter` 400/500/600/700 w `main.jsx`) —
    `body` deklarowało `'Inter'`, ale font nie był dołączony (spadał na `system-ui`). `index.css`:
    dodane `-webkit-font-smoothing: antialiased` + `-moz-osx-font-smoothing`. W markupie Step4
    `font-semibold`→`font-medium` (karta ubezpieczenia, link „do historii"). Szablony PDF (Arial,
    794px) NIETKNIĘTE.
  - **Pasek kroków (StepBar):** trzy jednoznaczne stany (ukończony=zielone kółko z ✓, aktywny=
    jasnozielone tło + obwódka `border-[1.5px] border-emerald-500` + kółko z numerem w zieleni,
    przyszły=szare). Wszystkie chipy mają `border-[1.5px]` → zmiana stanu nie przesuwa layoutu.
  - **Karta „Podsumowanie zlecenia":** `rounded-2xl`, nagłówek z badge **Kompletne/Niekompletne**
    (kompletność = walidatory kroków ≠ „docs" z `flowSteps` — bez nowej walidacji), siatka
    `grid-cols-1 md:grid-cols-2` (separatory przez `gap-px` na `bg-gray-100`), helper
    `formatSummaryValue(v)` → „Nie podano" (jasnoszary) zamiast myślnika, ikony kontekstowe
    (Truck/Ship, ArrowRight, CheckCircle2/AlertTriangle z lucide). Waga i Wartość łączą się w jedną
    komórkę gdy oba puste.
  - **Przejścia kroków:** `src/components/StepTransition.jsx` (fade+slide 200 ms, `prefers-reduced-
    motion` przez `motion-reduce:*`); root kreatora owija render kroków (pasek kroków poza animacją).
  - **Przycisk „Generuj":** repo miał już spinner+disabled we współdzielonym `DocumentSelectList`
    (nie tworzono osobnego `GenerateButton.jsx` — byłby dublem); dodany tylko opcjonalny
    `loadingLabel` („Generowanie...") i waga przycisku `font-semibold`→`font-medium`.
  - **Uwaga (repo≠prompt):** akcenty to **emerald** (nie `green-600`), tło `#f8fafc` (nie „kremowe"),
    Tailwind **v4** (`@theme` w `index.css`, brak `tailwind.config.js`). Zweryfikowane: `npm run build`
    zielony; `git diff` bez zmian w `generators/templates`, `documentEngine.js`, `documentCatalog.js`.
    **Nie zweryfikowane interaktywnie w przeglądarce.**

- **Poprawki UX kreatora/profilu/historii (2026-07-17):** wyłącznie warstwa UI/UX.
  - **Podpowiedzi pól:** usunięte `hint` pod polami przy wypełnianiu (kreator: HS, NIP/VAT; profil:
    email, EORI, „min. 8 znaków"). Zostawione info-boxy reagujące na wybór (rodzaj towaru, Incoterms)
    i podpowiedzi na stronach z filtrami (Puste szablony, News).
  - **Data załadunku / ETA:** klik w całe pole `type="date"` otwiera natywny kalendarz
    (`openDatePicker` → `showPicker()`), nie tylko ikonka.
  - **Historia — klik w kartę:** cała lewa część `DocumentCard` (strzałka+badge+tytuł) jest teraz
    klikalna i rozwija listę dokumentów (chevron zmieniony z `<button>` na wizualny `<span>`, `role=
    button`+klawiatura na wrapperze). Licznik „X dokumentów" był już wcześniej (`selectedDocs.length`);
    wpisy z „0 dokumentów" to fantomy ze starego buga auto-zapisu edycji (patrz niżej) — nowe już nie
    powstają, można je usunąć.
  - **„Bez domyślnej waluty":** `ProfilePage` — nowa opcja „Nie ustawiaj (bez domyślnej waluty)"
    (`value=""`), **domyślna** (`user.defaultCurrency || ''`; PATCH zamienia `''`→`null`). Gdy brak
    domyślnej waluty, kreator NIC nie podpowiada: `createEmptySnapshot` ma teraz `currency:''` i
    `freightCurrency:''`, selecty waluty w kroku „Towar" dostały pustą opcję „—", a `WizardProvider`
    ustawia obie waluty tylko gdy profil ma `defaultCurrency` (wtedy wypełnia cargo+freight spójnie).

- **Incoterms → „Użyj w nowym zleceniu" (2026-07-21):** `IncotermsPage.jsx` — w panelu szczegółów
  (`DetailPanel`) przycisk „Użyj w nowym zleceniu" (styl jak `HomePage` „Rozpocznij": biały,
  obramowany), widoczny od razu pod nagłówkiem. Klik: `setPendingIncoterm(code)` (nowy
  `src/services/pendingIncoterm.js`, sessionStorage, jednorazowy „bilet") + nawigacja jak
  `handleStart` w `HomePage` (zalogowany → `/wybor-sciezki`, gość → `/login` z `from`). Użytkownik
  wybiera ścieżkę A/B na `PathSelectPage` jak zwykle → `/new-document?path=`.
  `WizardContext.jsx` (`WizardProvider`, tylko `mode==='create'`): `peekPendingIncoterm()` doklejane
  do `terms.incoterms` w POCZĄTKOWYM `snapshot`, ale celowo NIE do `baseline` — formularz startuje
  jako `isDirty`, więc `UnsavedChangesGuard` (już istniejący, bez zmian) zapyta o zapis wersji
  roboczej, jeśli user wyjdzie/zamknie kartę bez generowania, nawet gdy nic więcej nie wypełnił.
  Bilet czyszczony (`clearPendingIncoterm`) w efekcie przy montowaniu providera (create), żeby
  kolejny świeży kreator w tej karcie go nie odziedziczył. Zweryfikowane: `npm run build` zielony.
  **Nie zweryfikowane interaktywnie w przeglądarce.**

- **FIX: pobieranie z Historii nie działało dla żadnego zestawu (2026-07-21):** `GET /document-sets`
  (lista) celowo NIE niesie `formData`/`engineResult` (`toClientListItem` je odcina — oszczędność
  transferu), a `HistoryPage` przekazywał ten OKROJONY obiekt listy prosto do generowania. Skutek:
  - zestawy kreatora (`kind=null`) → `generateDocuments(undefined, keys)` → `buildGeneratorData`
    destrukturyzował `undefined` → **rzut** → „Nie udało się pobrać dokumentów";
  - zestawy „Puste szablony" (`kind='blank'`) → `set.engineResult` = `undefined` → lista docs `[]`
    → **pusty ZIP** (~22 B) pobierany po cichu.
  Rozwinięcie karty działało, bo `DocumentCard` sam dociągał pełny zestaw przez `getSet(id)` — ale
  handlery pobierania nigdy tego nie robiły. **Fix:** `HistoryPage` ma helper `loadFull(set)` (zwraca
  `set`, jeśli ma już `formData`, inaczej `getSet(set.id)`), wołany w `handleDownload` i
  `handleDownloadOne` przed regeneracją; `DocumentCard.handleDocDownload` przekazuje `fullSet||set`
  (unika drugiego fetchu). Dane w bazie były cały czas OK (per-konto, bez limitu czasu, cross-device
  — potwierdzone: konto usera miało 13 completed). Zweryfikowane E2E (Playwright + zalogowana sesja):
  zestaw kreatora → 3 realne PDF-y (~200 KB), zestawy blank → ZIP-y 2+ MB, pojedynczy dokument z
  rozwiniętej karty → realny PDF, 0 błędów konsoli.

- **FIX + zmiana reguł nudge'a „Uzupełnij dane firmy" (2026-07-21):** `src/utils/profileNudge.js`
  (nowy) + `Topbar.jsx` (dzwonek). Dwa problemy:
  1. **Nudge wracał po każdym odświeżeniu mimo kliknięcia X** — klucz odrzucenia liczony był z
     `getCurrentUserId()`, które podczas hydratacji sesji (`/auth/me`) zwraca jeszcze `'local-user'`
     (efekt ustawiający realne `userId` w `AuthContext` odpala się PO pierwszym renderze dzwonka).
     Zapis i odczyt trafiały w różne klucze. **Fix:** klucz oparty na `user.id` (prop dzwonka) —
     stabilny.
  2. **Brakowało reguły „częściowo wypełniony profil → nie nagabuj"** — jedyną bramką było
     `profileCompleted===false`, a `profileCompleted` jest `true` dopiero przy KOMPLETNYM adresie firmy
     (`companyName+address+city+postalCode+country`). Nowa logika w `profileNudge.js`:
     - `hasStartedProfile(user)` = ≥1 pole osobowe (`fullName/phone`, bez email) I ≥1 pole firmy
       (`companyName/vatNumber/eoriNumber/address/city/postalCode/country`) → nudge **NIGDY więcej**.
     - `snoozeNudge(userId)` / `isNudgeSnoozed(userId)` — po X nudge **uśpiony na 7 dni** (klucz
       `amlogistico:v1:${userId}:profileNudgeSnoozedUntil` = timestamp „pokaż znowu po"), potem może
       wrócić. Zastąpiło stary permanentny boolean `…:profileNudgeDismissed`.
     - `shouldShowNudge(user)` = user istnieje && !hasStartedProfile && !isNudgeSnoozed.
     Dzwonek: `showNudge` przez `useMemo([user, nudgeBump])`, `dismissNudge` woła `snoozeNudge` + bump.
  Uwaga: `fullName`/`phone` są wymagane przy rejestracji, więc w praktyce reguła 1 sprowadza się do
  „≥1 pole firmy wypełnione → koniec nudge'a". Zweryfikowane: test jednostkowy logiki (6/6) + E2E
  Playwright (zalogowana sesja): konto bez firmy → nudge widoczny → X → znika → **po reloadzie NIE
  wraca** + snooze w localStorage; konto z 1 polem firmy → nudge w ogóle się nie pokazuje.
  - **Redesign dropdownu powiadomień (2026-07-21, warstwa UI):** `Topbar.jsx` — dropdown `w-80`,
    `rounded-2xl`, `shadow-xl`, nagłówek z badge „N nowe". Nudge jako karta z gradientowym akcentem
    (emerald), ikoną firmy w gradientowym kafelku, tytułem „Dokończ konfigurację firmy", zachęcającym
    tekstem i wyraźnym CTA „Uzupełnij profil →" + secondary „Później" (oba wołają odpowiednio
    `openNudge`/`dismissNudge`). „X" w rogu = „Przypomnij później" (ten sam `dismissNudge` → 7-dniowy
    snooze). Wiersz newsów ujednolicony (ikona w kafelku, spójny layout). Pusty stan z ikoną dzwonka.
    Zweryfikowane wizualnie (Playwright, jasny + ciemny motyw) — bez zmian logiki.
  - **Newsy WYPISANE z dzwonka (2026-07-22):** karta „Nowe artykuły w Newsach" i udział newsów
    w liczniku USUNIĘTE z `Topbar.jsx` (nie ma tam już `useNews`). Dzwonek ma dwa źródła:
    powiadomienia z serwera + nudge profilu. Nowe artykuły sygnalizuje wyłącznie **czerwona kropka
    przy pozycji „Newsy" w Sidebarze** (`hasUnread` z `NewsContext`, czyszczone przez `markRead()`
    przy wejściu na `/news` — bez zmian). `MenuLink` renderuje kropkę także przy **zwiniętym**
    pasku (na ikonie, z obwódką `ring`) — wcześniej znikała.

- **System powiadomień admin→konto (2026-07-21) — GOTOWE:** możliwość wysłania powiadomienia z
  panelu admina na konkretne konto (po emailu) lub do wszystkich; odbiorca widzi je w dzwonku na
  dowolnym urządzeniu (per-konto, przez backend). To TRZECIE źródło dzwonka obok newsów i nudge'a.
  - **Baza:** model `Notification` w `schema.prisma` (relacja do `User`, `onDelete: Cascade`,
    `@@index([userId, readAt])`, pola `type`(info/success/warning)/`title`/`body`/`ctaLabel`/`ctaUrl`/
    `readAt`/`createdAt`) + flaga `User.isAdmin` (`@default(false)`, nadawana RĘCZNIE w Prisma Studio —
    brak UI do zarządzania adminami). Wgrane `prisma db push` + `generate`.
  - **Backend (nowe pliki tylko w `_`-folderach — limit 12 funkcji Vercel):** `api/_routes/notifications.js`
    (CRUD wg `documentSets.js`, `router.use(requireAuth)`, wszystko scope'owane `req.userId`):
    `GET /` (moje), `PATCH /:id/read`, `POST /read-all`, `DELETE /:id`, oraz `POST /` **z
    `requireAdmin`** (wysyłka: `target:'user'` → 1 wpis / `target:'all'` → fan-out `createMany` po
    wpisie na konto). `api/_validation/notifications.js` (Zod, refine: email wymagany dla target=user,
    CTA komplet-albo-nic). `requireAdmin` w `api/_lib/auth.js` (ładuje usera, sprawdza `isAdmin` — JWT
    nosi tylko userId). Montaż w `index.js`. `isAdmin` dodane do `publicUser()`/`publicProfile()`.
  - **Front:** `src/services/notificationsRepo.js` (api.*, emituje `notifications:changed`),
    `src/hooks/useNotifications.js` (refetch na mount/event/`window focus`, `unreadCount`). Dzwonek
    (`Topbar.jsx`): `count = unreadCount + news + nudge`; karty powiadomień z serwera na górze listy
    (kafelek wg typu, kropka nieprzeczytania, treść, opcjonalny przycisk CTA, „X"=usuń); klik karty =
    `markRead` + nawigacja do `ctaUrl`; „Oznacz wszystkie jako przeczytane" gdy są nieprzeczytane.
    Karty READ zostają widoczne (przyciemnione) — dlatego pusty stan zależy od realnej zawartości, nie
    od `count`. `src/pages/AdminNotificationsPage.jsx` (formularz: odbiorca konkretny/wszyscy, typ,
    tytuł, treść, opcjonalne CTA + **podgląd na żywo**; błędy per pole z 400/404). Trasa
    `/admin/powiadomienia` za nowym `RequireAdmin.jsx` (nie-admin → redirect na `/`). Link
    „Administracja → Powiadomienia" w `Sidebar.jsx` renderowany tylko gdy `user.isAdmin`.
  - **Obsługa:** raz ustaw `is_admin=true` swojemu kontu w Prisma Studio → pojawia się pozycja w
    menu → `/admin/powiadomienia` → wpisujesz i wysyłasz. Świadome uproszczenia: fan-out przy „wszyscy",
    brak push (odświeżanie na focus/event), bez maili, admin nadawany ręcznie.
  - Zweryfikowane: backend E2E (10/10 — 403 dla nie-admina, izolacja kont, mark read, 404 cudzego,
    broadcast=liczba kont) + front E2E Playwright (panel+wysyłka, badge, karta, „oznacz wszystkie",
    persist po reloadzie, „X" usuwa, nie-admin redirect + brak linku), build zielony. Stan testowy
    (powiadomienia + isAdmin) posprzątany po testach.

- **Czystka tekstów i martwego kodu — GOTOWE (2026-07-22):**
  - **Myślniki „—" usunięte z tekstów UI** (104 wystąpienia w `src/`). Zamiana kontekstowa,
    nie mechaniczna: zdanie z małą literą po myślniku → przecinek; etykieta + doprecyzowanie →
    nawias („ADR (towary niebezpieczne)", „Celne (eksport)"); skrót + rozwinięcie → dwukropek;
    zakresy liczbowe („7–10 dni", „2–8°C", „0–14 lat") → dywiz; placeholdery pustej wartości
    `'—'` → `'-'` (`DocumentCard`, `ProfilePage`, selecty w kreatorze — uwaga: porównanie
    `=== '-'` w `formatSummaryValue` w `DocumentWizard.jsx` musi zostać spójne z tym, co renderują
    komponenty). **NIETKNIĘTE celowo:** nazwy dokumentów (`name_pl` w `documentCatalog.js`,
    `name` w `templateCatalog.js`), wszystkie szablony PDF w `src/generators/templates/`
    (myślnik jest tam elementem odwzorowania oryginalnych formularzy) i komentarze w kodzie.
  - **Usunięty martwy kod (10 plików):** `src/pages/LandingPage.jsx` (nieroutowana od czasu
    przejścia na layout `/app`) wraz z jej jedynymi konsumentami — całym folderem
    `src/components/landing/` (HeroSection, HowItWorksSection, FeaturesSection, PricingSection,
    Footer, WizardModal) i `src/components/layout/Navbar.jsx`; `src/components/ui/Toast.jsx`
    (toast wycofany 2026-07-17); `src/utils/sortDocuments.js` (nieimportowany).
    **Zostawione:** `src/components/wizard/index.js` — wygląda na osierocony barrel, ale jest
    używany przez import katalogowy `from '../components/wizard'` w `NewDocumentPage.jsx`.
  - Zweryfikowane: `npm run build` zielony po obu operacjach. **Nie zweryfikowane interaktywnie
    w przeglądarce.**

**Do zrobienia:**
- Panel abonamentu (integracja ze Stripe)
- Ścieżka B kreatora „Szukam transportu" — szkielet 6 kroków gotowy; kroki „Spedytorzy" i „Wycena"
  to placeholdery (do zaimplementowania: lista spedytorów, wycena frachtu, ubezpieczenie)
- Deploy autoryzacji na Vercel (env vary DATABASE_URL/DIRECT_URL/JWT_SECRET) — patrz niżej
- Tabela `companies` w bazie — typ `carrier` (do wyboru z listy zapisanych firm, jak Nadawca/Odbiorca)
- Opcjonalne: dedykowany krok wizarda „Przewoźnik" po wdrożeniu bazy firm
- Reset hasła przez email („nie pamiętam hasła") — wymaga skonfigurowanego serwisu mailowego
- Angielskie szablony JSX — po dodaniu odblokować opcję EN w `ProfilePage` (Preferencje → język)
- Strony `/regulamin` i `/polityka-prywatnosci` (linki w rejestracji na razie `href="#"`)

### Backend: auth gotowy (serverless `/api`)
- `api/index.js` — Express 5 (lokalnie `npm run server` na `:3001`, na Vercelu funkcja serverless)
- `api/_routes/auth.js` — `POST /api/auth/register|login|logout`, `GET /api/auth/me`
- `api/_lib/auth.js` — JWT (jsonwebtoken) w **httpOnly cookie** (`sameSite:lax`, `secure` na prod),
  middleware `requireAuth` gotowe pod kolejne trasy; `api/_lib/prisma.js` — singleton
- `api/_validation/auth.js` — Zod 4; hasła bcryptjs (salt 12)
- **Newsy na backendzie — GOTOWE (2026-06-23):** `api/_routes/news.js` + `api/_lib/rss.js`
  - `GET /api/news` — agreguje RSS po stronie serwera (browser User-Agent omija część
    blokad), kategoryzuje (geo/transport), wykrywa alerty, dedupe + sort. Cache w pamięci
    15 min (stale-while-revalidate). Zwraca `{ articles, ticker, updatedAt }`.
    `?refresh=1` → wymusza świeże pobranie z pominięciem cache (używa przycisk „Odśwież")
  - `api/_lib/rss.js` — tylko parser RSS 2.0/Atom (regex, bez zależności): `fetchText`,
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
  - **Cena diesla EU na pasku — GOTOWE (2026-06-24):** osobny endpoint `api/_routes/diesel.js`
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
  - **Stopa EBC na pasku — GOTOWE (2026-06-24):** endpoint `api/_routes/ecb.js` (`/api/ecb-rate`).
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
  - `api/_routes/documentSets.js` — CRUD za `requireAuth`, `userId` ZAWSZE z tokenu (nigdy z body/query).
    `GET /api/document-sets?status=` (metadane bez `formData`), `GET /:id` (pełny), `POST` (nowy set),
    `PATCH /:id` (autosave draftu / promocja draft→completed), `DELETE /:id`. Cudzy/nieistniejący set = **404**
    (nie 403 — nie ujawnia istnienia). `api/_validation/documentSets.js` (Zod, `formData/meta` jako dowolny JSON).
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
- **Profil użytkownika + zmiana hasła — GOTOWE (2026-07-17):** minimalizacja rejestracji, dane
  rozszerzone przeniesione do opcjonalnego profilu.
  - `api/_routes/profile.js` (mount `/api/profile`, oba za `requireAuth`, `userId` ZAWSZE z tokenu):
    `GET /api/profile` (dane profilu bez `passwordHash`), `PATCH /api/profile` (aktualizacja
    `fullName/phone/companyName/vatNumber/eoriNumber/address/city/postalCode/country/defaultCurrency/
    preferredLanguage/marketingConsent`; `email` NIE edytowalny — pomijany; puste stringi → `null`).
    Po zapisie przelicza `profileCompleted` = `true` tylko gdy komplet
    `companyName+address+city+postalCode+country` (VAT/EORI/preferencje NIE wliczają się).
    `api/_validation/profile.js` (Zod, wszystkie pola opcjonalne/partial).
  - `POST /api/auth/change-password` (za `requireAuth` + `authLimiter`): Zod
    (`newPassword` min 8, `===confirmPassword`, `!==currentPassword`); zły `currentPassword` → **400**
    z błędem pod polem `currentPassword` (ten sam kształt co login/register); po zmianie hasła
    wystawia NOWE cookie JWT (user zostaje zalogowany). Reset przez email NIE zrobiony (brak mailera).
  - `publicUser()` w `api/_routes/auth.js` rozszerzony o pola profilu (`fullName`, `phone`,
    `profileCompleted`, `defaultCurrency`, adres firmy itd.) — front ma je od razu z `/auth/me`
    bez dodatkowego zapytania (auto-fill nadawcy, nudge, domyślna waluta).
  - Rejestracja (`api/_validation/auth.js` + handler): `fullName` (min 3, wymagane), `phone`
    (wymagane, format międzynarodowy), `termsAccepted` (`z.literal(true)` — bez zgody 400),
    `marketingConsent` (opcjonalne, default false), `companyName` **opcjonalne**. Handler zapisuje
    `termsAcceptedAt = new Date()` (nie sam boolean). Zweryfikowane end-to-end (server :3001): T1–T7 zielone.
- **Rate-limit `/auth/*` — GOTOWE (2026-07-16):** `api/_lib/rateLimit.js` (`express-rate-limit`,
  10 żądań / 15 min / IP) nałożony na `POST /auth/login` i `/auth/register` (wspólny bucket per IP).
  **NIE** na `GET /auth/me` (wołane przy każdym starcie appki → limit by je zablokował).
  `app.set('trust proxy', 1)` w `api/index.js` (realne IP za proxy Vercela). Store w pamięci =
  best-effort na serverless (twardy limit → zewnętrzny store/Redis). Zweryfikowane: 10×401 → 429.
- Endpointy companies/subscription, Stripe — jeszcze nie zaczęte
- **Uwaga env:** firmowy proxy → `npm` wymaga `NODE_OPTIONS=--use-system-ca`.
  Prisma przypięta do **6.x** (Prisma 7 usunęło `url=env()` w schemacie — wymaga driver-adapterów)

### Baza danych: users na Neonie (Prisma 6 + PostgreSQL)
- `prisma/schema.prisma` — model `User` (`@@map("users")`, snake_case przez `@map`)
- **Pola profilu (2026-07-17):** dodane do `User` (wszystkie **nullable** — tabela ma rekordy,
  wymagalność egzekwuje Zod): `fullName`, `phone`, `termsAcceptedAt`, `marketingConsent` (default
  false), `profileCompleted` (default false), `eoriNumber`, `address`, `city`, `postalCode`,
  `country`, `defaultCurrency`, `preferredLanguage` (default `"PL"`). `companyName` zmienione na
  **opcjonalne** (`String?`). Wgrane `prisma db push` (additive) + `generate`.
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
- Lista krajów UE: stała `EU_CODES` w `src/services/documentGeneration.js`
