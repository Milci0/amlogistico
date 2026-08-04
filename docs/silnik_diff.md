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


---

# Etap 2 Promptu 2: wpiecie 22 nowych dokumentow w silnik

> Wygenerowany 2026-08-04. Porownuje silnik **sprzed Etapu 2** (wersja z `HEAD`,
> wyciagnieta przez `git show` i uruchomiona obok nowej) z wersja **po wpieciu**,
> na 44 trasach obejmujacych wszystkie nowe reguly.
>
> Sekcja „Porownanie trasa po trasie" jest **wygenerowana z kodu**, nie napisana recznie.
> Katalog dokumentow byl w obu przebiegach ten sam (142 wpisy), wiec roznice pochodza
> wylacznie ze zmian w `documentEngine.js`.

Tras porównanych: **44**, zmienionych: **29**.
Dokumentów dodanych: **+60**, usuniętych: **−4**.

| dokument | na ilu trasach doszedł |
|---|---|
| 124_ENS_ICS2 — ENS — Deklaracja skrócona przywozowa | 9 |
| 125_EU_Import_Declaration — Zgłoszenie celne przywozowe UE | 9 |
| 130_Supplier_Declaration — Deklaracja dostawcy | 8 |
| 122_Delivery_Order — Zlecenie wydania towaru (Delivery Order) | 7 |
| 131_REX_Statement_Origin — Oświadczenie o pochodzeniu (REX) | 4 |
| 134_CIM_SMGS — CIM/SMGS — Wspólny list przewozowy | 4 |
| 132_EMCS_eAD — e-AD / e-SAD — Elektroniczny dokument administracyjny (EMCS) | 4 |
| 133_SENT — Zgłoszenie SENT | 3 |
| 129_ATR_Certificate — Świadectwo A.TR | 2 |
| 119_VGM_SOLAS — VGM — Deklaracja zweryfikowanej masy brutto | 2 |
| 135_RID_Rail_DG — RID — Dokument przewozowy towarów niebezpiecznych (kolej) | 2 |
| 128_CHED_TRACES — CHED — Wspólny zdrowotny dokument wejścia | 2 |
| 137_HAWB — HAWB — Lotniczy list przewozowy spedytora | 1 |
| 123_Container_Packing_Cert — Świadectwo pakowania kontenera | 1 |
| 136_Wagon_List — Wykaz wagonów | 1 |
| 126_CBAM_Data_Sheet — CBAM — Karta danych emisyjnych | 1 |

| dokument | na ilu trasach zniknął |
|---|---|
| 27_CIM — CIM — Kolejowy List Przewozowy | 4 |

---

## Zmiany SWIADOME

### 1. CIM/SMGS to ZAMIANA, nie dodanie

Jedyny dokument, ktory na czterech trasach **znika** (`27_CIM`), znika dlatego,
ze zastepuje go `134_CIM_SMGS`. Przesylka nie dostaje dwoch listow przewozowych.

Regula opiera sie o `GROUPS.SMGS_ONLY` — liste krajow **poza COTIF**, a nie liste
czlonkow SMGS. To rozroznienie jest istotne: Polska, Litwa, Lotwa i Estonia sa
stronami OBU umow, wiec lista czlonkostwa kazalaby wystawiac CIM/SMGS na trasie
PL → DE. Utrwala to trasa #89 w macierzy (`PL → DE rail` musi dac `27_CIM`
i NIE moze dac `134_CIM_SMGS`).

**Lista wymaga weryfikacji u zrodla (OSJD)** — komentarz stoi przy stalej w kodzie.

### 2. Cztery ostrzezenia zastapione dokumentami

| ostrzezenie (wycofane) | zastapione przez |
|---|---|
| `warn_eu_import_sad` | `125_EU_Import_Declaration` |
| `warn_ched_p_traces` | `128_CHED_TRACES` |
| `warn_rid_rail` | `135_RID_Rail_DG` |
| `warn_atr_turkey` | `129_ATR_Certificate` |

Kazde z nich mowilo „potrzebujesz dokumentu, ktorego nie mamy". Skoro dokument
juz jest, ostrzezenie bylo tylko szumem.

**`warn_atr_turkey_agri` ZOSTAJE.** Nie duplikuje zadnego dokumentu — niesie
rozroznienie A.TR vs EUR.1 dla produktow rolnych oraz wyrobow wegla i stali,
czyli informacje, ktorej sam dokument nie przekazuje.

Kody wycofanych ostrzezen **zostaja** w `WARNING_SEVERITY` i w tlumaczeniach
(`errors:engineWarnings.*`). Rekordy zapisane w bazie przed ta zmiana nadal je
niosa i musza sie otwierac.

### 3. EUDR NIE pojawia sie jako dokument i tak ma byc

Na trasie `CN → PL sea food_plant` (kakao) `127_EUDR_DDS` **nie wchodzi na liste**.
Zamiast niego jest ostrzezenie `warn_document_not_yet_valid` o severity `info`.

To nie jest luka w regule, tylko dzialanie bramki czasowej: obowiazek wchodzi
w zycie 30.12.2026 dla duzych i srednich operatorow. Bramka jest sterowana polem
`validFrom` w katalogu, wiec 30.12.2026 dokument wskoczy do `required` bez zmiany
kodu. Test `ETAP 2 — kryteria akceptacyjne` sprawdza OBA stany (przed i po dacie).

### 4. Cztery rezimy sterowane id kategorii, nie kategoria silnika

CBAM, EUDR, akcyza (EMCS) i SENT czytaja **`flags.cargoCategoryId`** — surowe id
z `cargoCategories.js` — a nie kategorie silnika. Powod jest twardy: **12 z 19
kategorii mapuje sie na `general`** (napoje, paliwa, metale, drewno, budowlanka),
wiec z kategorii silnika tych rezimow nie da sie odroznic.

Konsekwencja, ktora warto znac: **zakres jest przyblizony kategoria, nie kodem CN.**
Rozporzadzenia definiuja zakres kodami CN; regula trafia w kategorie towaru.
Dlatego CBAM jest `conditional`, a nie `required` — uzytkownik decyduje. Precyzyjne
dopasowanie wymagaloby przekazania `cargo.hsCode` do silnika i list kodow.

Bez flagi reguly milcza, wiec rekordy sprzed kategorii towaru (majace `cargoType`,
nie `cargoCategory`) nie zaczynaja dostawac dokumentow akcyzowych. Jest na to test.

### 5. Odstepstwo od numeracji warstw z promptu

Prompt umieszczal `129`/`130`/`131` w „warstwie 6". Trafily do warstw **3 (eksport)**
i **4 (import)** — tam, gdzie od zawsze mieszka cala logika pochodzenia
preferencyjnego (EUR.1, EUR-MED, REX, A.TR). Rozbicie jej na dwa miejsca byloby
gorsze niz odstepstwo od numeracji. Warstwa 6 („reguly specjalne") zostala nietknieta.

`130_Supplier_Declaration` zostala dodatkowo **zawezona** do kierunkow objetych
`PREFERENTIAL_ORIGIN_MAP`. Bez preferencji celnej deklaracja dostawcy niczego nie
zmienia, a dokladala pozycje do kazdego eksportu z UE.

---

## Siedem dokumentow poza specyfikacja Etapu 2: decyzja

Przy pisaniu Etapu 2 siedem nowych dokumentow nie mialo reguly w specyfikacji.
Wpiecie ich wszystkich zostalo najpierw zrobione, a potem **cofniete** — kazdy
dokladal pozycje do KAZDEJ trasy swojej galezi. Decyzja zapadla 2026-08-04.

| dokument | decyzja | regula / uzasadnienie |
|---|---|---|
| `136_Wagon_List` | **wpiety** | `rail`/`multimodal` + `flags.groupConsignment`. Warunkowany flaga, wiec nie doklada sie do kazdej trasy kolejowej. |
| `122_Delivery_Order` | **wpiety** | wylacznie **przywoz morski do UE**. Przy wywozie port docelowy lezy poza Unia i dokument wystawia tamtejszy agent — dla naszego uzytkownika nie ma zastosowania. |
| `120_Booking_Confirmation` | niewpiety | dokument operacyjny przewoznika |
| `121_Cargo_Manifest_Sea` | niewpiety | dokument operacyjny armatora i agenta statku |
| `138_SLI_Air` | niewpiety | instrukcja nadawcy dla spedytora, obieg wewnetrzny |
| `139_Consignor_Security_Decl` | niewpiety | patrz warunek powrotu nizej |
| `140_Air_Cargo_Manifest` | niewpiety | dokument operacyjny przewoznika lotniczego |

**Dlaczego piec zostaje poza silnikiem.** To dokumenty operacyjne przewoznika
i agenta, a nie zestaw kompletowany przez spedytora. Przy **91 pozycjach
`blank_only`** w katalogu problemem jest nadmiar, nie niedobor: kazda pozycja
dolozona do kazdej trasy obniza wartosc calej listy. Pozostaja osiagalne przez
wyszukiwarke szablonow w Topbarze i przez „Puste szablony".

**Warunek powrotu.** `139_Consignor_Security_Decl` warto wpiac **przy pierwszym
realnym uzytkowniku lotniczym**. Deklaracja bezpieczenstwa nadawcy jest wymogiem
rozporzadzenia wykonawczego (UE) 2015/1998, a nie wygoda — inaczej niz pozostala
czworka. Proponowana regula: `mode === 'air'`, warunkowy, plus ostrzezenie
o koniecznosci potwierdzenia statusu bezpieczenstwa (`SPX`/`SCO`/`SHR`).

**To nie jest przeoczenie i nie da sie tego cofnac po cichu.** Pilnuja tego dwa
miejsca: komentarz `NIEWPIETE CELOWO` w warstwie transportowej silnika oraz test
`120, 121, 138, 139 i 140 nie pojawiaja sie na zadnej trasie` w macierzy. Kto je
wepnie, musi skasowac ten test i wrocic do tej sekcji.

---

## Porownanie trasa po trasie (wygenerowane z kodu)

### PL → CH · road · general
- **+** 130_Supplier_Declaration (Deklaracja dostawcy)

### PL → NO · road · general
- **+** 130_Supplier_Declaration (Deklaracja dostawcy)

### PL → GB · road · general
- **+** 131_REX_Statement_Origin (Oświadczenie o pochodzeniu (REX)); 130_Supplier_Declaration (Deklaracja dostawcy)

### PL → TR · road · general
- **+** 129_ATR_Certificate (Świadectwo A.TR); 130_Supplier_Declaration (Deklaracja dostawcy)
- ostrzeżenia **−** `warn_atr_turkey`

### PL → TR · road · food_plant
- **+** 130_Supplier_Declaration (Deklaracja dostawcy)

### PL → TR · rail · general · {"transitCountries":["BY"]}
- **+** 134_CIM_SMGS (CIM/SMGS — Wspólny list przewozowy); 129_ATR_Certificate (Świadectwo A.TR); 130_Supplier_Declaration (Deklaracja dostawcy)
- **−** 27_CIM (CIM — Kolejowy List Przewozowy)
- ostrzeżenia **+** `warn_cim_smgs_route`
- ostrzeżenia **−** `warn_atr_turkey`

### PL → CA · sea · general
- **+** 131_REX_Statement_Origin (Oświadczenie o pochodzeniu (REX)); 130_Supplier_Declaration (Deklaracja dostawcy)

### PL → JP · sea · general
- **+** 131_REX_Statement_Origin (Oświadczenie o pochodzeniu (REX)); 130_Supplier_Declaration (Deklaracja dostawcy)

### PL → US · sea · general · {"containerized":true}
- **+** 119_VGM_SOLAS (VGM — Deklaracja zweryfikowanej masy brutto)

### PL → US · air · general · {"consolidated":true}
- **+** 137_HAWB (HAWB — Lotniczy list przewozowy spedytora)

### PL → US · multimodal · general · {"containerized":true}
- **+** 119_VGM_SOLAS (VGM — Deklaracja zweryfikowanej masy brutto)

### PL → CN · sea · dangerous_goods
- **+** 123_Container_Packing_Cert (Świadectwo pakowania kontenera)
- ostrzeżenia **+** `warn_container_packing_duplicate`

### PL → CN · rail · dangerous_goods
- **+** 134_CIM_SMGS (CIM/SMGS — Wspólny list przewozowy); 135_RID_Rail_DG (RID — Dokument przewozowy towarów niebezpiecznych (kolej))
- **−** 27_CIM (CIM — Kolejowy List Przewozowy)
- ostrzeżenia **+** `warn_cim_smgs_route`
- ostrzeżenia **−** `warn_rid_rail`

### PL → DE · rail · dangerous_goods
- **+** 135_RID_Rail_DG (RID — Dokument przewozowy towarów niebezpiecznych (kolej))
- ostrzeżenia **−** `warn_rid_rail`

### PL → DE · rail · general · {"groupConsignment":true}
- **+** 136_Wagon_List (Wykaz wagonów)

### PL → KZ · rail · general
- **+** 134_CIM_SMGS (CIM/SMGS — Wspólny list przewozowy)
- **−** 27_CIM (CIM — Kolejowy List Przewozowy)
- ostrzeżenia **+** `warn_cim_smgs_route`

### CN → PL · rail · general
- **+** 134_CIM_SMGS (CIM/SMGS — Wspólny list przewozowy); 124_ENS_ICS2 (ENS — Deklaracja skrócona przywozowa); 125_EU_Import_Declaration (Zgłoszenie celne przywozowe UE)
- **−** 27_CIM (CIM — Kolejowy List Przewozowy)
- ostrzeżenia **+** `warn_cim_smgs_route`, `warn_ens_lodgement`
- ostrzeżenia **−** `warn_eu_import_sad`

### CN → PL · sea · general
- **+** 124_ENS_ICS2 (ENS — Deklaracja skrócona przywozowa); 125_EU_Import_Declaration (Zgłoszenie celne przywozowe UE); 122_Delivery_Order (Zlecenie wydania towaru (Delivery Order))
- ostrzeżenia **+** `warn_ens_lodgement`
- ostrzeżenia **−** `warn_eu_import_sad`

### CN → PL · sea · food_plant · {"cargoCategoryId":"food_plant"}
- **+** 124_ENS_ICS2 (ENS — Deklaracja skrócona przywozowa); 125_EU_Import_Declaration (Zgłoszenie celne przywozowe UE); 122_Delivery_Order (Zlecenie wydania towaru (Delivery Order)); 128_CHED_TRACES (CHED — Wspólny zdrowotny dokument wejścia)
- ostrzeżenia **+** `warn_ens_lodgement`, `warn_document_not_yet_valid`
- ostrzeżenia **−** `warn_ched_p_traces`, `warn_eu_import_sad`

### CN → PL · sea · general · {"cargoCategoryId":"metals"}
- **+** 124_ENS_ICS2 (ENS — Deklaracja skrócona przywozowa); 125_EU_Import_Declaration (Zgłoszenie celne przywozowe UE); 126_CBAM_Data_Sheet (CBAM — Karta danych emisyjnych); 122_Delivery_Order (Zlecenie wydania towaru (Delivery Order))
- ostrzeżenia **+** `warn_ens_lodgement`, `warn_cbam_annual`
- ostrzeżenia **−** `warn_eu_import_sad`

### CN → PL · sea · general · {"cargoCategoryId":"textiles"}
- **+** 124_ENS_ICS2 (ENS — Deklaracja skrócona przywozowa); 125_EU_Import_Declaration (Zgłoszenie celne przywozowe UE); 122_Delivery_Order (Zlecenie wydania towaru (Delivery Order))
- ostrzeżenia **+** `warn_ens_lodgement`
- ostrzeżenia **−** `warn_eu_import_sad`

### US → PL · air · general
- **+** 124_ENS_ICS2 (ENS — Deklaracja skrócona przywozowa); 125_EU_Import_Declaration (Zgłoszenie celne przywozowe UE)
- ostrzeżenia **+** `warn_ens_lodgement`
- ostrzeżenia **−** `warn_eu_import_sad`

### BR → PL · sea · food_animal
- **+** 124_ENS_ICS2 (ENS — Deklaracja skrócona przywozowa); 125_EU_Import_Declaration (Zgłoszenie celne przywozowe UE); 122_Delivery_Order (Zlecenie wydania towaru (Delivery Order)); 128_CHED_TRACES (CHED — Wspólny zdrowotny dokument wejścia)
- ostrzeżenia **+** `warn_ens_lodgement`
- ostrzeżenia **−** `warn_ched_p_traces`, `warn_eu_import_sad`

### JP → PL · sea · general
- **+** 124_ENS_ICS2 (ENS — Deklaracja skrócona przywozowa); 125_EU_Import_Declaration (Zgłoszenie celne przywozowe UE); 122_Delivery_Order (Zlecenie wydania towaru (Delivery Order)); 131_REX_Statement_Origin (Oświadczenie o pochodzeniu (REX))
- ostrzeżenia **+** `warn_ens_lodgement`
- ostrzeżenia **−** `warn_eu_import_sad`

### IN → PL · sea · general
- **+** 124_ENS_ICS2 (ENS — Deklaracja skrócona przywozowa); 125_EU_Import_Declaration (Zgłoszenie celne przywozowe UE); 122_Delivery_Order (Zlecenie wydania towaru (Delivery Order))
- ostrzeżenia **+** `warn_ens_lodgement`
- ostrzeżenia **−** `warn_eu_import_sad`

### PL → DE · road · general · {"cargoCategoryId":"beverages"}
- **+** 133_SENT (Zgłoszenie SENT); 132_EMCS_eAD (e-AD / e-SAD — Elektroniczny dokument administracyjny (EMCS))
- ostrzeżenia **+** `warn_emcs_arc`, `warn_sent_registration`

### PL → PL · road · general · {"cargoCategoryId":"energy"}
- **+** 133_SENT (Zgłoszenie SENT); 132_EMCS_eAD (e-AD / e-SAD — Elektroniczny dokument administracyjny (EMCS))
- ostrzeżenia **+** `warn_emcs_arc`, `warn_sent_registration`

### DE → FR · road · general · {"cargoCategoryId":"energy"}
- **+** 132_EMCS_eAD (e-AD / e-SAD — Elektroniczny dokument administracyjny (EMCS))
- ostrzeżenia **+** `warn_emcs_arc`

### DE → LT · road · general · {"cargoCategoryId":"energy","transitCountries":["PL"]}
- **+** 133_SENT (Zgłoszenie SENT); 132_EMCS_eAD (e-AD / e-SAD — Elektroniczny dokument administracyjny (EMCS))
- ostrzeżenia **+** `warn_emcs_arc`, `warn_sent_registration`
