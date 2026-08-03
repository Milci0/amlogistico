# Raport rozbieżności: stary rejestr kreatora → zunifikowany silnik doboru

> Wygenerowany 2026-08-03 przy unifikacji silnika (Etap 4).
> Porównuje **starą ścieżkę kreatora** (`getDocsList` z `src/generators/documents.js`:
> 9 dokumentów, jeden bool `bothEU`, dwie gałęzie transportu) z **nową**
> (`getDocuments` z `src/utils/documentEngine.js`: 120 dokumentów, 7 warstw,
> pięć gałęzi), na 30 trasach z macierzy testowej.
>
> Sekcja porównawcza niżej jest **wygenerowana z kodu**, nie napisana ręcznie.

**Bilans:** 30 tras · **+103** dokumenty dodane · **−29** usuniętych.

---

## Zmiany ŚWIADOME — to nie są błędy

### 1. PL → DE dostaje WĘŻSZY zestaw niż wcześniej

Wbrew intuicji („nowy silnik zna 120 dokumentów, więc doda") trasa wewnątrz UE
dostaje **mniej** pozycji: 6 → 5.

| | stara ścieżka | nowa ścieżka |
|---|---|---|
| CMR | wymagany | wymagany |
| Packing List, Faktura | wymagane | wymagane |
| Zlecenie transportowe | **opcjonalne** | **wymagane** |
| Protokół odbioru (POD) | **opcjonalne** | **wymagane** |
| Multimodal Transport Document | opcjonalny (zawsze na liście) | **znika** |
| Sea Waybill | nie dotyczy drogi | nie dotyczy |

Dwie rzeczy naraz:

- **Zlecenie i POD awansują na wymagane.** Stary rejestr traktował je jako
  dodatek; w silniku należą do warstwy 1 (transport drogowy) tak samo jak CMR.
- **MTD znika z listy.** Stary rejestr pokazywał go przy KAŻDEJ trasie drogowej
  i morskiej, niezależnie od tego, czy przewóz jest multimodalny. Teraz pojawia
  się tylko wtedy, gdy faktycznie jest multimodalny (patrz punkt 3).

Netto lista jest krótsza, ale każda pozycja na niej coś znaczy.

### 2. Irlandia, Luksemburg, Słowenia, Cypr i Malta przestają dostawać zbędną Fakturę Proforma

**To naprawa błędu, który siedział w produkcji od dawna** — nie zmiana reguły.

`computeBothEU` w `src/services/documentGeneration.js` sprawdzał przynależność do
UE na własnej liście **22 kodów**, w której brakowało `IE`, `LU`, `SI`, `CY`, `MT`.
Silnik ma pełne 27. Skutek: przesyłka Warszawa → Dublin była traktowana jak wywóz
poza Unię i użytkownik dostawał Fakturę Proforma („dokument celny do odprawy
eksportowej"), której przy przewozie wewnątrzunijnym nikt od niego nie oczekuje.

Po unifikacji obowiązuje jedna lista krajów UE — ta w silniku. Pięć państw
przestaje generować zbędny dokument; przy Cyprze i Malcie dochodzi natomiast
**T2L**, który był im należny (dowód unijnego statusu przy przewozie morskim
wewnątrz UE) i którego stara ścieżka nigdy nie dobierała.

### 3. Multimodal Transport Document dochodzi OBOK listu przewozowego, nie zamiast

Stary rejestr trzymał MTD na liście dla każdej trasy drogowej i morskiej, a
checkbox „Transport multimodalny" tylko przełączał go między opcjonalnym
a wymaganym. Silnik nie znał tego checkboxa w ogóle.

Teraz reguła jest jawna i mieszka w warstwie 1 silnika:

- gałąź **Multimodalny** → MTD jako dokument przewozowy tej gałęzi;
- gałąź drogowa/morska **z zaznaczonym checkboxem** → MTD **dodatkowo**, obok CMR
  albo konosamentu (`CMR i MTD`, nie `CMR albo MTD`);
- bez checkboxa → MTD nie pojawia się wcale.

Ta zmiana wyszła przy weryfikacji na produkcyjnej bazie: **7 z 22 zapisanych
zestawów kreatora** miało w komplecie MTD wybrany przez checkbox i po unifikacji
przestałoby się pobierać. Regresja ma własny test.

### 4. Zaznaczenie ADR podnosi towar do kategorii niebezpiecznej

Checkbox „Towar niebezpieczny (ADR)" w kroku „Towar" nie wpływał wcześniej na
dobór w ogóle — sterował wyłącznie widocznością pola klasy ADR.

Teraz, gdy użytkownik wybrał kategorię celną bez własnego profilu ryzyka
(`general`) i zaznaczył ADR, silnik podnosi kategorię do `dangerous_goods`
i dokłada komplet: **manifest ADR (118_ADR), Dangerous Goods Manifest i MSDS**,
a dla gałęzi morskiej i lotniczej odpowiednio IMDG i IATA DGR.

Reguła świadomie mieszka **w silniku**, nie w warstwie przepisującej migawkę na
argumenty. Dzięki temu kreator i „Puste szablony" liczą identycznie. Kategoria
wybrana wprost (np. `food_plant`) nie jest podnoszona — ADR nie kasuje wtedy
świadectwa fitosanitarnego.

---

## Zmiany świadome — pozostałe

### 5. Kolej, transport lotniczy i multimodalny przestają zwracać pustą listę

Stary rejestr znał wyłącznie `road` i `sea`; dla pozostałych gałęzi
`getDocsList` zwracał **pustą tablicę**. W praktyce nie było to widoczne, bo
kreator też oferował tylko dwie gałęzie — ale reguły kolejowe i lotnicze
istniały w silniku i były nieosiągalne z interfejsu.

Po zmianie: `rail` → CIM, `air` → AWB, `multimodal` → MTD, każde z pełną warstwą
handlową, eksportową i importową (patrz trasy `PL → IN lotniczy`,
`CN → PL kolejowy`, `PL → US multimodalny` w sekcji porównawczej: `+7`, `+6`, `+8`).

### 6. ISF 10+2 tylko dla frachtu morskiego

Wyłapane testem strukturalnym (`transportModes` w katalogu vs faktyczny dobór).
Silnik dokładał ISF przy każdym imporcie do USA, także lotniczym, drogowym
i kolejowym. ISF (19 CFR 149) obejmuje wyłącznie ładunek przypływający drogą
morską — fracht lotniczy podlega osobnemu programowi ACAS. Teraz: `sea` →
wymagany, `multimodal` → warunkowy (silnik nie zna etapów trasy, a brak ISF przy
etapie morskim kosztuje), pozostałe gałęzie → brak.

### 7. Dokumenty obcych urzędów przenoszą się do sekcji „Do wypełnienia ręcznie"

90 ze 120 pozycji katalogu ma `outputMode: 'blank_only'` — platforma ich nie
wypełnia, bo nie jest ich wystawcą. Nie znikają z listy, ale przestają udawać
nasz produkt: trafiają do trzeciej sekcji z informacją, kto je wystawia
(np. Form M Nigeria → Central Bank of Nigeria; Bill of Entry Indie → CBIC).

Żaden dokument `blank_only` nie może wylądować w sekcji wymaganych — pilnuje
tego test strukturalny na ośmiu trasach × cztery kategorie towaru.

---

## Rzeczy, których świadomie NIE zmieniono

- **A.TR dla Turcji zostaje ostrzeżeniem, nie dokumentem** — w katalogu nie ma
  ani szablonu JSX, ani pliku PDF świadectwa A.TR. Silnik poprawnie nie oferuje
  EUR.1 dla towarów przemysłowych do Turcji, ale nie ma czym go zastąpić.
- **Meksyk i Chile nie zostały dopisane do reżimu REX.** Umowa z Meksykiem nadal
  opiera się o EUR.1, a chilijska zmieniła się niedawno; obie do potwierdzenia
  u źródła przed zmianą (`PREFERENTIAL_ORIGIN_MAP` w `documentEngine.js`).
- **Brak dokumentu „zgłoszenie przywozowe UE"** — import do Unii silnik obsługuje
  ostrzeżeniem o SAD/H1 składanym przez importera, bo w katalogu nie ma dla niego
  pozycji.
- **`getDocsList` nie został usunięty.** Zostaje oznaczony `@deprecated` jako
  punkt odniesienia dla tego raportu; do skasowania po jego akceptacji. Sam
  rejestr `DOCUMENTS` zostaje na stałe — niesie ręcznie napisane opisy i nazwy
  plików dziewięciu dokumentów kreatora.

---

## Zestawienie zbiorcze

| Trasa | stara | wymagane | opcjonalne | ręcznie | dodane | usunięte |
|---|---|---|---|---|---|---|
| PL -> DE, drogowy, general | 6 | 5 | 0 | 0 | +0 | -1 |
| PL -> IE, drogowy, general | 7 | 5 | 0 | 0 | +0 | -2 |
| PL -> LU, drogowy, general | 7 | 5 | 0 | 0 | +0 | -2 |
| PL -> SI, drogowy, general | 7 | 5 | 0 | 0 | +0 | -2 |
| PL -> CY, morski, general | 6 | 4 | 1 | 0 | +1 | -2 |
| PL -> MT, morski, general | 6 | 4 | 1 | 0 | +1 | -2 |
| PL -> FR, morski, general | 5 | 4 | 1 | 0 | +1 | -1 |
| PL -> CH, drogowy, general | 7 | 7 | 2 | 0 | +3 | -1 |
| PL -> NO, drogowy, general | 7 | 7 | 2 | 0 | +3 | -1 |
| PL -> TR, drogowy, general | 7 | 7 | 1 | 1 | +3 | -1 |
| PL -> TR, drogowy, food_plant | 7 | 7 | 2 | 3 | +6 | -1 |
| PL -> CA, morski, general | 6 | 5 | 2 | 1 | +3 | -1 |
| PL -> GB, drogowy, general | 7 | 7 | 1 | 1 | +3 | -1 |
| PL -> US, morski, electronics | 6 | 5 | 3 | 2 | +5 | -1 |
| US -> PL, morski, general | 6 | 4 | 1 | 1 | +1 | -1 |
| PL -> NG, morski, general | 6 | 5 | 2 | 2 | +4 | -1 |
| PL -> IN, lotniczy, general | 0 | 5 | 1 | 1 | +7 | -0 |
| CN -> PL, kolejowy, general | 0 | 5 | 0 | 1 | +6 | -0 |
| PL -> CN, morski, dangerous_goods | 6 | 8 | 2 | 1 | +6 | -1 |
| PL -> NO, drogowy, dangerous_goods | 7 | 10 | 3 | 0 | +7 | -1 |
| BR -> AR, morski, general | 6 | 4 | 1 | 2 | +2 | -1 |
| PL -> US, multimodalny, general | 0 | 5 | 1 | 2 | +8 | -0 |
| PL -> US, drogowy, general, {"multimodal":true} | 7 | 8 | 1 | 1 | +3 | -0 |
| PL -> US, morski, general, {"multimodal":true} | 6 | 6 | 2 | 2 | +4 | -0 |
| PL -> IT, drogowy, general, {"transitCountries":["RU"]} | 6 | 7 | 1 | 0 | +3 | -1 |
| PL -> IT, drogowy, general, {"transitCountries":["CH"]} | 6 | 6 | 1 | 0 | +2 | -1 |
| PL -> DE, drogowy, general, {"adr":true} | 6 | 8 | 1 | 0 | +4 | -1 |
| PL -> US, morski, general, {"woodenPackaging":true} | 6 | 5 | 2 | 4 | +6 | -1 |
| PL -> US, lotniczy, general | 0 | 5 | 1 | 1 | +7 | -0 |
| PL -> SA, morski, general | 6 | 5 | 3 | 1 | +4 | -1 |

---

## Porównanie trasa po trasie

## PL -> DE, drogowy, general

STARA sciezka (6): 01_CMR, 02_PackingList, 03_Invoice, 09_Zlecenie, 10_POD, 28_MTD
NOWA sciezka (5): wymagane 5 | opcjonalne 0 | recznie 0

USUNIETE:
- 28_MTD (Multimodal Transport Document)

AWANS opcjonalne -> wymagane: 09_Zlecenie, 10_POD

## PL -> IE, drogowy, general

STARA sciezka (7): 01_CMR, 02_PackingList, 03_Invoice, 04_Proforma, 09_Zlecenie, 10_POD, 28_MTD
NOWA sciezka (5): wymagane 5 | opcjonalne 0 | recznie 0

USUNIETE:
- 04_Proforma (Faktura Proforma)
- 28_MTD (Multimodal Transport Document)

AWANS opcjonalne -> wymagane: 09_Zlecenie, 10_POD

## PL -> LU, drogowy, general

STARA sciezka (7): 01_CMR, 02_PackingList, 03_Invoice, 04_Proforma, 09_Zlecenie, 10_POD, 28_MTD
NOWA sciezka (5): wymagane 5 | opcjonalne 0 | recznie 0

USUNIETE:
- 04_Proforma (Faktura Proforma)
- 28_MTD (Multimodal Transport Document)

AWANS opcjonalne -> wymagane: 09_Zlecenie, 10_POD

## PL -> SI, drogowy, general

STARA sciezka (7): 01_CMR, 02_PackingList, 03_Invoice, 04_Proforma, 09_Zlecenie, 10_POD, 28_MTD
NOWA sciezka (5): wymagane 5 | opcjonalne 0 | recznie 0

USUNIETE:
- 04_Proforma (Faktura Proforma)
- 28_MTD (Multimodal Transport Document)

AWANS opcjonalne -> wymagane: 09_Zlecenie, 10_POD

## PL -> CY, morski, general

STARA sciezka (6): 05_BL, 02_PackingList, 03_Invoice, 04_Proforma, 26_SeaWaybill, 28_MTD
NOWA sciezka (5): wymagane 4 | opcjonalne 1 | recznie 0

DODANE:
- 104_T2L (T2L — Dowód Unijnego Statusu Towaru) -> wymagane

USUNIETE:
- 04_Proforma (Faktura Proforma)
- 28_MTD (Multimodal Transport Document)

Ostrzezenia (1): warn_t2l_sea_eu [warning]

## PL -> MT, morski, general

STARA sciezka (6): 05_BL, 02_PackingList, 03_Invoice, 04_Proforma, 26_SeaWaybill, 28_MTD
NOWA sciezka (5): wymagane 4 | opcjonalne 1 | recznie 0

DODANE:
- 104_T2L (T2L — Dowód Unijnego Statusu Towaru) -> wymagane

USUNIETE:
- 04_Proforma (Faktura Proforma)
- 28_MTD (Multimodal Transport Document)

Ostrzezenia (1): warn_t2l_sea_eu [warning]

## PL -> FR, morski, general

STARA sciezka (5): 05_BL, 02_PackingList, 03_Invoice, 26_SeaWaybill, 28_MTD
NOWA sciezka (5): wymagane 4 | opcjonalne 1 | recznie 0

DODANE:
- 104_T2L (T2L — Dowód Unijnego Statusu Towaru) -> wymagane

USUNIETE:
- 28_MTD (Multimodal Transport Document)

Ostrzezenia (1): warn_t2l_sea_eu [warning]

## PL -> CH, drogowy, general

STARA sciezka (7): 01_CMR, 02_PackingList, 03_Invoice, 04_Proforma, 09_Zlecenie, 10_POD, 28_MTD
NOWA sciezka (9): wymagane 7 | opcjonalne 2 | recznie 0

DODANE:
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 12_EUR1 (EUR.1 — Świadectwo Przewozowe) -> opcjonalne

USUNIETE:
- 28_MTD (Multimodal Transport Document)

AWANS opcjonalne -> wymagane: 09_Zlecenie, 10_POD

## PL -> NO, drogowy, general

STARA sciezka (7): 01_CMR, 02_PackingList, 03_Invoice, 04_Proforma, 09_Zlecenie, 10_POD, 28_MTD
NOWA sciezka (9): wymagane 7 | opcjonalne 2 | recznie 0

DODANE:
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 12_EUR1 (EUR.1 — Świadectwo Przewozowe) -> opcjonalne

USUNIETE:
- 28_MTD (Multimodal Transport Document)

AWANS opcjonalne -> wymagane: 09_Zlecenie, 10_POD

Ostrzezenia (1): warn_eea_customs [info]

## PL -> TR, drogowy, general

STARA sciezka (7): 01_CMR, 02_PackingList, 03_Invoice, 04_Proforma, 09_Zlecenie, 10_POD, 28_MTD
NOWA sciezka (9): wymagane 7 | opcjonalne 1 | recznie 1

DODANE:
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 51_Turkey_Import (Deklaracja Importowa Turcja) -> recznie

USUNIETE:
- 28_MTD (Multimodal Transport Document)

AWANS opcjonalne -> wymagane: 09_Zlecenie, 10_POD

Ostrzezenia (1): warn_atr_turkey [warning]

## PL -> TR, drogowy, food_plant

STARA sciezka (7): 01_CMR, 02_PackingList, 03_Invoice, 04_Proforma, 09_Zlecenie, 10_POD, 28_MTD
NOWA sciezka (12): wymagane 7 | opcjonalne 2 | recznie 3

DODANE:
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 12_EUR1 (EUR.1 — Świadectwo Przewozowe) -> opcjonalne
- 51_Turkey_Import (Deklaracja Importowa Turcja) -> recznie
- 16_Fitosanitarne (Świadectwo Fitosanitarne) -> recznie
- 18_Halal (Certyfikat Halal) -> recznie

USUNIETE:
- 28_MTD (Multimodal Transport Document)

AWANS opcjonalne -> wymagane: 09_Zlecenie, 10_POD

Ostrzezenia (2): warn_atr_turkey_agri [warning], warn_atp_cold_chain [info]

## PL -> CA, morski, general

STARA sciezka (6): 05_BL, 02_PackingList, 03_Invoice, 04_Proforma, 26_SeaWaybill, 28_MTD
NOWA sciezka (8): wymagane 5 | opcjonalne 2 | recznie 1

DODANE:
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 42_Canada_Import (B3 — Deklaracja Importowa Kanada) -> recznie

USUNIETE:
- 28_MTD (Multimodal Transport Document)

Ostrzezenia (1): warn_rex_export [warning]

## PL -> GB, drogowy, general

STARA sciezka (7): 01_CMR, 02_PackingList, 03_Invoice, 04_Proforma, 09_Zlecenie, 10_POD, 28_MTD
NOWA sciezka (9): wymagane 7 | opcjonalne 1 | recznie 1

DODANE:
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 21_UK_Import (UK Import Declaration (C88)) -> recznie

USUNIETE:
- 28_MTD (Multimodal Transport Document)

AWANS opcjonalne -> wymagane: 09_Zlecenie, 10_POD

Ostrzezenia (1): warn_rex_export [warning]

## PL -> US, morski, electronics

STARA sciezka (6): 05_BL, 02_PackingList, 03_Invoice, 04_Proforma, 26_SeaWaybill, 28_MTD
NOWA sciezka (10): wymagane 5 | opcjonalne 3 | recznie 2

DODANE:
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 106_CE (CE Declaration of Conformity) -> opcjonalne
- 08_ISF (ISF 10+2 — USA (Importer Security Filing)) -> recznie
- 20_CBP7501 (CBP 7501 — USA Import Entry) -> recznie

USUNIETE:
- 28_MTD (Multimodal Transport Document)

Ostrzezenia (1): warn_isf_24h [warning]

## US -> PL, morski, general

STARA sciezka (6): 05_BL, 02_PackingList, 03_Invoice, 04_Proforma, 26_SeaWaybill, 28_MTD
NOWA sciezka (6): wymagane 4 | opcjonalne 1 | recznie 1

DODANE:
- 30_USA_AES (AES Filing (EEI) — USA) -> recznie

USUNIETE:
- 28_MTD (Multimodal Transport Document)

Ostrzezenia (1): warn_eu_import_sad [info]

## PL -> NG, morski, general

STARA sciezka (6): 05_BL, 02_PackingList, 03_Invoice, 04_Proforma, 26_SeaWaybill, 28_MTD
NOWA sciezka (9): wymagane 5 | opcjonalne 2 | recznie 2

DODANE:
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 53_Nigeria_Import (Form M — Nigeria) -> recznie
- 68_PSI (PSI — Inspekcja Przedwysyłkowa) -> recznie

USUNIETE:
- 28_MTD (Multimodal Transport Document)

Ostrzezenia (2): warn_nigeria_form_m [warning], warn_psi_leadtime [warning]

## PL -> IN, lotniczy, general

STARA sciezka (0): (pusta lista)
NOWA sciezka (7): wymagane 5 | opcjonalne 1 | recznie 1

DODANE:
- 11_AWB (AWB — Lotniczy List Przewozowy) -> wymagane
- 02_PackingList (Packing List — Lista Pakowania) -> wymagane
- 03_Invoice (Faktura Handlowa) -> wymagane
- 04_Proforma (Faktura Proforma) -> wymagane
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 44_India_Import (Bill of Entry — Indie) -> recznie

## CN -> PL, kolejowy, general

STARA sciezka (0): (pusta lista)
NOWA sciezka (6): wymagane 5 | opcjonalne 0 | recznie 1

DODANE:
- 27_CIM (CIM — Kolejowy List Przewozowy) -> wymagane
- 02_PackingList (Packing List — Lista Pakowania) -> wymagane
- 03_Invoice (Faktura Handlowa) -> wymagane
- 04_Proforma (Faktura Proforma) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> wymagane
- 23_China_Export (Chińska Deklaracja Eksportowa) -> recznie

Ostrzezenia (1): warn_eu_import_sad [info]

## PL -> CN, morski, dangerous_goods

STARA sciezka (6): 05_BL, 02_PackingList, 03_Invoice, 04_Proforma, 26_SeaWaybill, 28_MTD
NOWA sciezka (11): wymagane 8 | opcjonalne 2 | recznie 1

DODANE:
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 29_DG_Manifest (Dangerous Goods Manifest) -> wymagane
- 69_MSDS (MSDS — Karta Charakterystyki) -> wymagane
- 15_IMDG (IMDG — Deklaracja Towarów Niebezpiecznych (Morska)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 22_China_Import (Chińska Deklaracja Importowa) -> recznie

USUNIETE:
- 28_MTD (Multimodal Transport Document)

## PL -> NO, drogowy, dangerous_goods

STARA sciezka (7): 01_CMR, 02_PackingList, 03_Invoice, 04_Proforma, 09_Zlecenie, 10_POD, 28_MTD
NOWA sciezka (13): wymagane 10 | opcjonalne 3 | recznie 0

DODANE:
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 29_DG_Manifest (Dangerous Goods Manifest) -> wymagane
- 69_MSDS (MSDS — Karta Charakterystyki) -> wymagane
- 118_ADR (ADR — Manifest Drogowy Towarów Niebezpiecznych) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 12_EUR1 (EUR.1 — Świadectwo Przewozowe) -> opcjonalne
- 14_ADR (ADR — Deklaracja Towarów Niebezpiecznych (Drogowa)) -> opcjonalne

USUNIETE:
- 28_MTD (Multimodal Transport Document)

AWANS opcjonalne -> wymagane: 09_Zlecenie, 10_POD

Ostrzezenia (1): warn_eea_customs [info]

## BR -> AR, morski, general

STARA sciezka (6): 05_BL, 02_PackingList, 03_Invoice, 04_Proforma, 26_SeaWaybill, 28_MTD
NOWA sciezka (7): wymagane 4 | opcjonalne 1 | recznie 2

DODANE:
- 36_Brazil_Export (Registro de Exportação — Brazylia) -> recznie
- 72_Argentina_Import (SIRA — Deklaracja Importowa Argentyna) -> recznie

USUNIETE:
- 28_MTD (Multimodal Transport Document)

## PL -> US, multimodalny, general

STARA sciezka (0): (pusta lista)
NOWA sciezka (8): wymagane 5 | opcjonalne 1 | recznie 2

DODANE:
- 28_MTD (Multimodal Transport Document) -> wymagane
- 02_PackingList (Packing List — Lista Pakowania) -> wymagane
- 03_Invoice (Faktura Handlowa) -> wymagane
- 04_Proforma (Faktura Proforma) -> wymagane
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 20_CBP7501 (CBP 7501 — USA Import Entry) -> recznie
- 08_ISF (ISF 10+2 — USA (Importer Security Filing)) -> recznie

Ostrzezenia (1): warn_isf_24h [warning]

## PL -> US, drogowy, general, {"multimodal":true}

STARA sciezka (7): 01_CMR, 02_PackingList, 03_Invoice, 04_Proforma, 09_Zlecenie, 10_POD, 28_MTD
NOWA sciezka (10): wymagane 8 | opcjonalne 1 | recznie 1

DODANE:
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 20_CBP7501 (CBP 7501 — USA Import Entry) -> recznie

AWANS opcjonalne -> wymagane: 09_Zlecenie, 10_POD

## PL -> US, morski, general, {"multimodal":true}

STARA sciezka (6): 05_BL, 02_PackingList, 03_Invoice, 04_Proforma, 26_SeaWaybill, 28_MTD
NOWA sciezka (10): wymagane 6 | opcjonalne 2 | recznie 2

DODANE:
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 08_ISF (ISF 10+2 — USA (Importer Security Filing)) -> recznie
- 20_CBP7501 (CBP 7501 — USA Import Entry) -> recznie

Ostrzezenia (1): warn_isf_24h [warning]

## PL -> IT, drogowy, general, {"transitCountries":["RU"]}

STARA sciezka (6): 01_CMR, 02_PackingList, 03_Invoice, 09_Zlecenie, 10_POD, 28_MTD
NOWA sciezka (8): wymagane 7 | opcjonalne 1 | recznie 0

DODANE:
- 116_Transit (Transit Declaration T1/T2) -> wymagane
- 117_TIR (Karnet TIR) -> wymagane
- 104_T2L (T2L — Dowód Unijnego Statusu Towaru) -> opcjonalne

USUNIETE:
- 28_MTD (Multimodal Transport Document)

AWANS opcjonalne -> wymagane: 09_Zlecenie, 10_POD

Ostrzezenia (1): warn_tir_non_ctc [warning]

## PL -> IT, drogowy, general, {"transitCountries":["CH"]}

STARA sciezka (6): 01_CMR, 02_PackingList, 03_Invoice, 09_Zlecenie, 10_POD, 28_MTD
NOWA sciezka (7): wymagane 6 | opcjonalne 1 | recznie 0

DODANE:
- 116_Transit (Transit Declaration T1/T2) -> wymagane
- 104_T2L (T2L — Dowód Unijnego Statusu Towaru) -> opcjonalne

USUNIETE:
- 28_MTD (Multimodal Transport Document)

AWANS opcjonalne -> wymagane: 09_Zlecenie, 10_POD

Ostrzezenia (1): warn_ctc_transit [info]

## PL -> DE, drogowy, general, {"adr":true}

STARA sciezka (6): 01_CMR, 02_PackingList, 03_Invoice, 09_Zlecenie, 10_POD, 28_MTD
NOWA sciezka (9): wymagane 8 | opcjonalne 1 | recznie 0

DODANE:
- 29_DG_Manifest (Dangerous Goods Manifest) -> wymagane
- 69_MSDS (MSDS — Karta Charakterystyki) -> wymagane
- 118_ADR (ADR — Manifest Drogowy Towarów Niebezpiecznych) -> wymagane
- 14_ADR (ADR — Deklaracja Towarów Niebezpiecznych (Drogowa)) -> opcjonalne

USUNIETE:
- 28_MTD (Multimodal Transport Document)

AWANS opcjonalne -> wymagane: 09_Zlecenie, 10_POD

## PL -> US, morski, general, {"woodenPackaging":true}

STARA sciezka (6): 05_BL, 02_PackingList, 03_Invoice, 04_Proforma, 26_SeaWaybill, 28_MTD
NOWA sciezka (11): wymagane 5 | opcjonalne 2 | recznie 4

DODANE:
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 08_ISF (ISF 10+2 — USA (Importer Security Filing)) -> recznie
- 20_CBP7501 (CBP 7501 — USA Import Entry) -> recznie
- 19_ISPM15 (ISPM 15 — Certyfikat Opakowań Drewnianych) -> recznie
- 65_Fumigation (Certyfikat Fumigacji) -> recznie

USUNIETE:
- 28_MTD (Multimodal Transport Document)

Ostrzezenia (1): warn_isf_24h [warning]

## PL -> US, lotniczy, general

STARA sciezka (0): (pusta lista)
NOWA sciezka (7): wymagane 5 | opcjonalne 1 | recznie 1

DODANE:
- 11_AWB (AWB — Lotniczy List Przewozowy) -> wymagane
- 02_PackingList (Packing List — Lista Pakowania) -> wymagane
- 03_Invoice (Faktura Handlowa) -> wymagane
- 04_Proforma (Faktura Proforma) -> wymagane
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 20_CBP7501 (CBP 7501 — USA Import Entry) -> recznie

## PL -> SA, morski, general

STARA sciezka (6): 05_BL, 02_PackingList, 03_Invoice, 04_Proforma, 26_SeaWaybill, 28_MTD
NOWA sciezka (9): wymagane 5 | opcjonalne 3 | recznie 1

DODANE:
- 07_EAD (Deklaracja Eksportowa UE (EAD/SAD)) -> wymagane
- 06_COO (Certificate of Origin — Świadectwo Pochodzenia) -> opcjonalne
- 70_Blacklist (Blacklist Certificate) -> opcjonalne
- 50_Saudi_Import (Deklaracja Importowa Arabia Saudyjska) -> recznie

USUNIETE:
- 28_MTD (Multimodal Transport Document)

Ostrzezenia (2): warn_blacklist_cert [warning], warn_legalisation_kig [info]
