# Inwentarz twardego polskiego tekstu w dokumentach PDF

> Powstał w Etapie 0 promptu „Unifikacja silnika doboru" (2026-08-03).
> **To jest inwentarz, nie plan naprawy.** Nic z tej listy nie jest zakresem
> unifikacji silnika — dokument ma służyć przyszłej pracy nad angielskimi
> wersjami dokumentów.
>
> Zakres: wartości i etykiety, które trafiają do wygenerowanego PDF-a po polsku
> **niezależnie od języka interfejsu** (przełącznik `amlogistico:v1:lang`).

---

## A. Potwierdzenie: klucze `formData` są niezależne od języka interfejsu

Etykiety pól idą z i18next, klucze zapisu są literałami w kodzie. Rozejście
widać w każdej sekcji kreatora. Przykłady wprost z repo:

| Etykieta (i18n) | Klucz zapisu (literał) | Miejsce |
|---|---|---|
| `t('parties.sender')` | `parties.sender.name` | [DocumentWizard.jsx:644](../src/components/wizard/DocumentWizard.jsx#L644) i [:646](../src/components/wizard/DocumentWizard.jsx#L646) |
| `t('parties.companyName')` | `upd('name', …)` | [DocumentWizard.jsx:527-528](../src/components/wizard/DocumentWizard.jsx#L527-L528) |
| `t('cargo.hsCode')` | `d.hsCode` | [DocumentWizard.jsx:279-280](../src/components/wizard/DocumentWizard.jsx#L279-L280) |
| `t('route.cityPort')` | `d.fromCity` | [DocumentWizard.jsx:201-202](../src/components/wizard/DocumentWizard.jsx#L201-L202) |
| `t('cargo.road.types.${vt}')` | `r.vehicleType = vt` (literał PL) | [DocumentWizard.jsx:360](../src/components/wizard/DocumentWizard.jsx#L360) i [:366](../src/components/wizard/DocumentWizard.jsx#L366) |

Kształt migawki jest zadeklarowany raz, po angielsku, w
[wizardState.js](../src/components/wizard/wizardState.js) i nie zależy od `i18n.language`.
**Wniosek: przełączenie interfejsu na EN nie zmienia ani jednego klucza w `formData`.**

Wyjątek godny uwagi (ostatni wiersz tabeli): przy `VEHICLE_TYPES` etykieta idzie
z tłumaczeń, ale **wartość** zapisywana do stanu to polski literał.

---

## B. Wartości płynące do szablonów PDF jako twardy polski tekst

Źródło: [`buildGeneratorData`](../src/services/documentGeneration.js) — jedyne
przejście migawka → ładunek szablonu.

| # | Pole ładunku | Skąd polski tekst | Czy jest odpowiednik EN | Renderowane przez |
|---|---|---|---|---|
| 1 | `data.vehicle.type` | `VEHICLE_TYPES = ['Plandeka','Chłodnia','Mroźnia']`, [DocumentWizard.jsx:30](../src/components/wizard/DocumentWizard.jsx#L30) | **TAK** — `data.vehicle.typeEn` z `VEHICLE_TYPE_EN` w [documentGeneration.js:19-23](../src/services/documentGeneration.js#L19-L23) | `ZlecenieTemplate` (para „PL / EN"), `TirCarnetTemplate` (para „PL / EN") |
| 2 | `data.cargo.packageTypeName` | `CARGO_UNIT_GROUPS[].units[].name` w [cargoUnits.js](../src/data/cargoUnits.js) (Paleta, Karton, Skrzynia, Worek, Beczka, Rolka, Sztuka, Zestaw, …) | **TAK** — `packageTypeNameEn` + `packageTypeUnCode` (UN/ECE Rec 21) | 10 szablonów; **PL bez EN** w `ZlecenieTemplate:165` i `PhytosanitaryCertificateTemplate:125` |
| 3 | `data.cargo.cargoType` | `cargoLabel(cargoCategory, cargoSubcategory)` → „Elektronika — Smartfony" ([cargoCategories.js](../src/data/cargoCategories.js)) | NIE | **ŻADEN** — `grep -r cargoType src/generators/templates/` = 0 trafień. Pole jest w ładunku, ale martwe. |
| 4 | `data.sea.freightTerms` | `['Prepaid','Collect']` | n/d (angielski literał) | szablony morskie |
| 5 | pola stron, `cargoName`, `notes`, `sea.flag` | tekst wpisany przez użytkownika | n/d | wszystkie |

Uwaga do #3: CLAUDE.md opisuje `cargoLabel()` jako „kanoniczny PL
w `meta.cargoDescription` migawki audytowej". W kodzie tak jest **wyłącznie**
dla zestawów z „Pustych szablonów"
([BlankTemplatesPage.jsx:115](../src/pages/BlankTemplatesPage.jsx#L115)).
Zestawy z kreatora dostają w `meta.cargoDescription` surowe `cargo.cargoName`
wpisane przez użytkownika ([documentGeneration.js:159](../src/services/documentGeneration.js#L159)).

---

## C. Polski poza ładunkiem danych

### C1. Nazwy pobieranych plików

| Co | Wartość | Plik |
|---|---|---|
| Prefiks dokumentu wypełnionego | `Wypelniony_` | [documents.js:99](../src/generators/documents.js#L99) |
| Prefiks pustego formularza | `Pusty_` | [blankDocuments.js](../src/utils/blankDocuments.js) |
| Nazwy plików kreatora | `CMR.pdf`, `Faktura_Handlowa.pdf`, `Faktura_Proforma.pdf`, `Zlecenie_Transportowe.pdf`, `Protokol_Odbioru_POD.pdf`, `Packing_List.pdf`, `Bill_of_Lading.pdf`, `Sea_Waybill.pdf`, `Multimodal_Transport_Document.pdf` | `DOCUMENTS[].filename` |
| Nazwy wpisów w ZIP-ie pustych | `Pusty_` + `documentCatalog[id].name_pl` (np. „Pusty_CMR — List Przewozowy.pdf") | `blankFilename()` |
| Nazwa ZIP-a | `dokumenty_${origin}_${destination}.zip` | [BlankTemplatesPage.jsx:150](../src/pages/BlankTemplatesPage.jsx#L150), [HistoryPage.jsx:75](../src/pages/HistoryPage.jsx#L75) |

### C2. Format daty

`formatDocumentDate()` ([formatDate.js](../src/utils/formatDate.js)) używa locale
`pl-PL` **zawsze** — DD.MM.RRRR, niezależnie od `data.language`. To decyzja
formatu, nie tekstu, ale przy dokumentach anglojęzycznych będzie widoczna.

### C3. Etykiety wewnątrz szablonów

| Grupa | Liczba | Stan |
|---|---|---|
| Wszystkie szablony JSX | 118 | — |
| Czytają `data.language` / `isEn` | 75 | mają wariant EN |
| **Ignorują `data.language`** | **43** | tekst zaszyty na stałe |
| — w tym **wszystkie 9 szablonów UE** używanych przez kreator | 9 | patrz niżej |

**Wszystkie 9 dokumentów kreatora nie reaguje na preferencję języka:**
`CmrTemplate`, `ZlecenieTemplate`, `PODTemplate`, `PackingListTemplate`,
`FakturaHandlowaTemplate`, `FakturaProformaTemplate`, `MultimodalTemplate`,
`BillOfLadingTemplate`, `SeaWaybillTemplate`.

Część z nich jest z założenia **dwujęzyczna w treści formularza** (CMR:
„MIĘDZYNARODOWY LIST PRZEWOZOWY / CONSIGNMENT NOTE · FRACHTBRIEF · LETTRE DE
VOITURE", „1. Nadawca (Sender / Absender / Expéditeur)") — to odwzorowanie
oryginalnego druku CMR, nie brak tłumaczenia. Ale nagłówki własne
(np. „Konwencja CMR — Genewa 1956", „Nr / No.", „Data / Date:") oraz cała
`ZlecenieTemplate` i `PODTemplate` są PL-only.

Praktyczny skutek: ustawienie **Profil → Preferencje → język dokumentów = EN**
(dziś zablokowane, „wkrótce") wpłynęłoby na 75 szablonów `global/*`,
a na 0 dokumentów, które faktycznie generuje kreator.

### C4. Wspólny słownik etykiet tabeli towarów

[`docLabels.js`](../src/utils/docLabels.js) — 6 etykiet (`Lp.`, `Kod HS`,
`Ilość`, `Jedn.`, `Waga kg`, `Wartość`) z parą PL/EN sterowaną `data.language`.
To jedyna zbudowana warstwa dwujęzyczna w szablonach. **Działa poprawnie.**

### C5. Ostrzeżenia silnika doboru

`documentEngine.js` zwraca gotowe polskie zdania; tłumaczone dopiero przy
renderze przez [`translateEngineWarning.js`](../src/utils/translateEngineWarning.js)
(18 zdań stałych + 4 wzorce regex). **Do PDF nie trafiają** — pokazywane
wyłącznie w UI. Ujęte tu dla kompletności obrazu.

---

## D. Podsumowanie — co blokuje dokumenty po angielsku

1. **9 szablonów kreatora nie ma warstwy językowej** (C3) — to główna blokada.
2. Nazwy plików i wpisów w ZIP-ie są po polsku (C1) — niezależnie od treści PDF-a.
3. Data zawsze w formacie `pl-PL` (C2).
4. Dwie wartości danych renderują się po polsku bez pary EN mimo istnienia
   odpowiednika: `packageTypeName` w `ZlecenieTemplate` i
   `PhytosanitaryCertificateTemplate` (B#2).
5. `data.cargo.cargoType` jest martwym polem (B#3) — do usunięcia albo do użycia,
   ale nie w tym zakresie.
