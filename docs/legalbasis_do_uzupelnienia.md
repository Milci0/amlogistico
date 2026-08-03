# `legalBasis: null` — do uzupełnienia ręcznie

> Etap 1 promptu „Unifikacja silnika doboru" (2026-08-03).
> 71 ze 120 wpisów w [`src/data/documentCatalog.js`](../src/data/documentCatalog.js)
> ma `legalBasis: null`. **Nie zgadywaliśmy** — zgodnie z zasadą z promptu pole
> zostaje puste, dopóki podstawy nie potwierdzi ktoś, kto ją zna.

Dwie różne przyczyny pustego pola, wymagające różnych działań:

| Grupa | Ile | Co z tym zrobić |
|---|---|---|
| **A. Podstawa prawna nie istnieje** | 20 | Zostawić `null` na stałe. To dokumenty handlowe, umowne albo certyfikaty prywatne — nie mają aktu prawnego. |
| **B. Podstawa istnieje, ale niezweryfikowana** | 51 | Uzupełnić po weryfikacji u źródła (kodeksy celne krajów trzecich). |

---

## A. Podstawa prawna nie istnieje — zostawić `null`

Dokumenty handlowe i umowne oraz certyfikaty wystawiane przez podmioty prywatne.
Wpisanie tu czegokolwiek byłoby konfabulacją.

| id | Nazwa | Dlaczego brak podstawy |
|---|---|---|
| `02_PackingList` | Packing List | dokument handlowy, wymóg umowny/praktyka |
| `04_Proforma` | Faktura Proforma | dokument informacyjny, nie księgowy |
| `09_Zlecenie` | Zlecenie Transportowe | umowa cywilnoprawna między stronami |
| `10_POD` | Protokół Odbioru (POD) | pokwitowanie umowne |
| `29_DG_Manifest` | Dangerous Goods Manifest | manifest zbiorczy; podstawy są przy dokumentach źródłowych (ADR/IMDG/DGR) |
| `63_Insurance` | Certyfikat Ubezpieczenia Cargo | umowa ubezpieczenia (Instytutowe Klauzule Ładunkowe to warunki, nie prawo) |
| `65_Fumigation` | Certyfikat Fumigacji | wymóg kraju przywozu lub kontrahenta, brak jednego aktu |
| `66_WeightCertificate` | Świadectwo Wagi | dokument handlowy (odrębna sprawa: VGM wg SOLAS VI/2 to inny dokument) |
| `67_QualityInspection` | Świadectwo Kontroli Jakości | wymóg umowny |
| `70_Blacklist` | Blacklist Certificate | wymóg administracyjny państw Ligi Arabskiej, brak wspólnego aktu |
| `107_Radiation` | Radiation Non-Contamination Certificate | wymóg kraju przywozu, zmienny |
| `110_NonGMO` | Non-GMO Certificate | wymóg kontraktowy |
| `114_ReExport` | Re-Export Certificate | procedura krajowa, różna w każdym państwie |
| `115_Transhipment` | Transhipment Declaration | dokument operatorski |
| `18_Halal` | Certyfikat Halal | certyfikat religijny, jednostka akredytowana |
| `112_Kosher` | Kosher Certificate | certyfikat religijny |
| `71_FreeSale` | Free Sale Certificate (leki) | procedura krajowa organu farmaceutycznego |
| `108_PhytoImport` | Phytosanitary Import Permit | pozwolenie krajowe, podstawa po stronie kraju przywozu |
| `113_EUC` | End User Certificate (Military) | wymóg kraju końcowego użytkownika |

## B. Podstawa istnieje — do weryfikacji u źródła

Kodeksy i ustawy celne państw trzecich. Wszystkie mają wypełnione pole
`authority` (organ jest pewny), brakuje tylko odwołania do aktu.

**Deklaracje eksportowe (10):**
`35_Korea_Export`, `36_Brazil_Export`, `38_UAE_Export`, `39_Saudi_Export`,
`40_Turkey_Export`, `41_SouthAfrica_Export`, `97_Argentina_Export`,
`98_Chile_Export`, `99_Pakistan_Export`, `100_Philippines_Export`

**Deklaracje importowe (41):**
`46_Korea_Import`, `47_Brazil_Import`, `48_Mexico_Import`, `49_UAE_Import`,
`50_Saudi_Import`, `51_UAE_Import`, `51_Turkey_Import`, `52_SouthAfrica_Import`,
`53_Nigeria_Import`, `54_Kenya_Import`, `55_Egypt_Import`, `56_Singapore_Import`,
`57_Malaysia_Import`, `58_Indonesia_Import`, `59_Vietnam_Import`,
`60_Thailand_Import`, `72_Argentina_Import`, `73_Chile_Import`,
`74_Colombia_Import`, `75_Peru_Import`, `76_Ecuador_Import`,
`77_Pakistan_Import`, `78_Bangladesh_Import`, `79_SriLanka_Import`,
`80_Philippines_Import`, `81_Myanmar_Import`, `82_Cambodia_Import`,
`83_Morocco_Import`, `84_Algeria_Import`, `85_Tunisia_Import`,
`86_Ghana_Import`, `87_Senegal_Import`, `88_Tanzania_Import`,
`89_Ethiopia_Import`, `90_Jordan_Import`, `91_Israel_Import`, `92_Iraq_Import`,
`93_Lebanon_Import`, `94_Kazakhstan_Import`, `95_Uzbekistan_Import`,
`96_Georgia_Import`, `43_NewZealand_Import`

Dla porównania — podstawy, które **udało się** ustalić pewnie i są już wpisane:
UE (UKC 952/2013), USA (19 CFR 149 / 141-142, 15 CFR 30), Wielka Brytania
(Taxation (Cross-border Trade) Act 2018), Kanada (Customs Act sec. 32 i 95),
Australia (Customs Act 1901 sec. 68 i 113), Chiny (Customs Law art. 24),
Japonia (Customs Act art. 67), Indie (Customs Act 1962 sec. 46 i 50),
FDA (21 CFR part 1 subpart I).

---

## Uwaga o `validFrom` / `validTo`

Wszystkie 120 wpisów mają dziś `null`/`null` — w katalogu nie ma dokumentu
z znanym oknem obowiązywania. Mechanizm bramkowania po dacie (Etap 2.2) jest
sterowany katalogiem, więc zadziała od razu, gdy pierwszy taki wpis się pojawi
(kandydat: certyfikat pochodzenia w formacie EU-Mercosur iTA od 01.05.2026 —
dziś obsługiwany tylko jako ostrzeżenie w `documentEngine.js`).
