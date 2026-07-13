# Manifest konwersji formularzy PDF → szablony JSX

> Inwentarz: 118 plików PDF w `public/templates/` (stan 2026-07-13).
> Zasady pracy: **jeden dokument na przebieg**, źródłem prawdy dla konwencji są
> szablony UE (patrz `docs/slownik_zmiennych.md`).

**Statusy:** `DONE` — szablon istnieje · `TODO` — do konwersji · `BLOCKED` — PDF nieczytelny (powód w uwagach)

**Grupy:** celne_export · celne_import · transport · swiadectwo · towary_niebezp · finansowe · inne

**Schemat katalogów dla nowych szablonów** (odwzorowuje `public/templates/`, tak jak
`eu/{common,land,sea}` odwzorowuje wzorce UE):

```
src/generators/templates/global/export/   ← deklaracje eksportowe
src/generators/templates/global/import/   ← deklaracje importowe
src/generators/templates/global/cargo/    ← świadectwa i dokumenty towarowe
src/generators/templates/global/special/  ← transportowe, finansowe, specjalne
```

Nazwy plików: PascalCase + `Template.jsx`, tylko ASCII (np. `UkC88ImportTemplate.jsx`).
Kolumna `plik_html` wypełniana dopiero przy statusie DONE.

| nr | plik_zrodlowy | nazwa | grupa | status | plik_html | uwagi |
|---|---|---|---|---|---|---|
| 01 | eu/land/01_CMR_List_Przewozowy.pdf | CMR — List Przewozowy | transport | DONE | src/generators/templates/eu/land/CmrTemplate.jsx | wzorzec UE |
| 02 | eu/common/02_Packing_List.pdf | Packing List — Lista Pakowania | inne | DONE | src/generators/templates/eu/common/PackingListTemplate.jsx | wzorzec UE |
| 03 | eu/common/03_Faktura_Handlowa.pdf | Faktura Handlowa | finansowe | DONE | src/generators/templates/eu/common/FakturaHandlowaTemplate.jsx | wzorzec UE |
| 04 | eu/common/04_Faktura_Proforma.pdf | Faktura Proforma | finansowe | DONE | src/generators/templates/eu/common/FakturaProformaTemplate.jsx | wzorzec UE |
| 05 | eu/sea/05_Bill_of_Lading.pdf | Bill of Lading — Konosament | transport | DONE | src/generators/templates/eu/sea/BillOfLadingTemplate.jsx | wzorzec UE |
| 06 | global/cargo/06_Certificate_of_Origin.pdf | Certificate of Origin — Świadectwo Pochodzenia | swiadectwo | DONE | src/generators/templates/global/cargo/CertificateOfOriginTemplate.jsx | Wprowadziło 2 nowe zatwierdzone zmienne do słownika: `data.transportMeans` (poz. 3) i `data.cargo.quantity` (poz. 10, odrębne od `packages`). Dokument w pełni podpięty, bez pustych pól. |
| 07 | global/export/07_Deklaracja_Eksportowa_EU.pdf | Deklaracja Eksportowa UE (EAD/SAD) | celne_export | DONE | src/generators/templates/global/export/EadSadExportTemplate.jsx | W katalogu służy też jako fallback importu CN. Wprowadziło 4 nowe zatwierdzone zmienne `data.customs.*` (eori, procedureCode, exitOffice, permitNo) — patrz słownik. Pole "MRN" świadomie zostawione jako pusta ramka (nadaje je system AES po złożeniu, nie użytkownik) — nie dodane do słownika. |
| 08 | global/import/08_ISF_10plus2_USA.pdf | ISF 10+2 — USA (Importer Security Filing) | celne_import | DONE | src/generators/templates/global/import/Isf10Plus2Template.jsx | Nowy klucz `data.sea.etd` (symetryczny do `sea.eta`). Propozycje bez odpowiednika (zostawione puste, patrz zbiorczy raport partii 08-17): Buyer, Importer of Record, Manufacturer, Ship to Party, Container Stuffing Location, Consolidator, Bond No. (odpowiada wcześniejszemu kandydatowi `guaranteeNo`). |
| 09 | eu/land/09_Zlecenie_Transportowe.pdf | Zlecenie Transportowe | transport | DONE | src/generators/templates/eu/land/ZlecenieTemplate.jsx | wzorzec UE |
| 10 | eu/land/10_Protokol_Odbioru_POD.pdf | Protokół Odbioru (POD) | transport | DONE | src/generators/templates/eu/land/PODTemplate.jsx | wzorzec UE |
| 11 | global/special/11_AWB_Lotniczy_List_Przewozowy.pdf | AWB — Lotniczy List Przewozowy | transport | DONE | src/generators/templates/global/special/AwbTemplate.jsx | Brak nowych kluczy. Propozycje bez odpowiednika, zostawione puste: `data.receiver.phone` (asymetria wobec `sender.phone`), Agent IATA No., oraz drugorzędne pola frachtowe lotnicze (Rate Class, Commodity Item No., Chargeable Weight, Rate/Charge, Declared Value for Carriage, Amount of Insurance) — patrz zbiorczy raport. |
| 12 | global/special/12_EUR1_Swiadectwo_Przewozowe.pdf | EUR.1 — Świadectwo Przewozowe | swiadectwo | DONE | src/generators/templates/global/special/Eur1Template.jsx | Brak nowych kluczy — pełna konwersja istniejącymi zmiennymi. Sekcja "Wiza urzędu celnego" i Nr świadectwa świadomie puste (wypełnia urząd, jak MRN w 07). |
| 13 | global/special/13_ATA_Carnet_Czasowy_Wywoz.pdf | Karnet ATA — Eksport Tymczasowy | inne | DONE | src/generators/templates/global/special/AtaCarnetTemplate.jsx | Brak nowych kluczy. "Ważny do" i "Nr karnetu" świadomie puste (nadawane zewnętrznie). "Wystawiła" reużywa stałego tekstu KIG (jak w 06). |
| 14 | global/cargo/14_ADR_Towary_Niebezpieczne_Droga.pdf | ADR — Deklaracja Towarów Niebezpiecznych (Drogowa) | towary_niebezp | DONE | src/generators/templates/global/cargo/AdrDeclarationTemplate.jsx | Nowy klucz `data.vehicle.driverCertNo`. `data.vehicle.adrClass` (pole łączone "klasa/UN" z wizarda) pokazane w kolumnie "Nr UN" — patrz uwaga architektoniczna w zbiorczym raporcie (mode-agnostic DG classification). Reszta kolumn DG (Kod klas., Grupa pak., Etykiety, Kod tun., Opakowanie) bez odpowiednika — puste. |
| 15 | global/cargo/15_IMDG_Towary_Niebezpieczne_Morze.pdf | IMDG — Deklaracja Towarów Niebezpiecznych (Morska) | towary_niebezp | DONE | src/generators/templates/global/cargo/ImdgDeclarationTemplate.jsx | Brak nowych kluczy (celowo — UN No./Class zostawione puste, patrz uwaga architektoniczna w zbiorczym raporcie: potrzebny wspólny namespace DG niezależny od trybu transportu). Tare Weight, Flash Point, Marine Pollutant, EmS No., Packing Group, Package type/cert., Segregation bez odpowiednika — puste. |
| 16 | global/cargo/16_Swiadectwo_Fitosanitarne.pdf | Świadectwo Fitosanitarne | swiadectwo | DONE | src/generators/templates/global/cargo/PhytosanitaryCertificateTemplate.jsx | Brak nowych kluczy. Punkt wejścia, Nazwa handlowa produktu, sekcja "Zastosowane traktowanie" bez odpowiednika — puste (niska istotność, patrz zbiorczy raport). |
| 17 | global/cargo/17_Swiadectwo_Weterynaryjne.pdf | Świadectwo Weterynaryjne | swiadectwo | DONE | src/generators/templates/global/cargo/VeterinaryCertificateTemplate.jsx | Brak nowych kluczy — reużyto `data.vehicle.tempFrom/tempTo` (jak w Zleceniu). Gatunek, Część/postać, Nr partii, Data prod./ważności, Kod TRACES, Nr świad. wet. bez odpowiednika — puste (niska istotność). |
| 18 | global/cargo/18_Certyfikat_Halal.pdf | Certyfikat Halal | swiadectwo | DONE | src/generators/templates/global/cargo/HalalCertificateTemplate.jsx | Brak nowych kluczy. Jednostka certyfikująca, Nr akredytacji, Nr zakładu, nazwa arabska/kod produktu/kategoria/nr partii, checkboxy — bez odpowiednika, puste (do uzupełnienia później). |
| 19 | global/cargo/19_ISPM15_Opakowania_Drewniane.pdf | ISPM 15 — Certyfikat Opakowań Drewnianych | swiadectwo | DONE | src/generators/templates/global/cargo/Ispm15CertificateTemplate.jsx | Brak nowych kluczy. `data.sender` użyty tylko dla "Zleceniodawca (eksporter)" — "Producent opakowań" (odrębny podmiot, producent palet) bez odpowiednika, puste. Specyfikacja techniczna drewna (gatunek, wymiary, nr partii, cert. obróbki) bez odpowiednika, puste. |
| 20 | global/import/20_CBP7501_USA_Import.pdf | CBP 7501 — USA Import Entry | celne_import | DONE | src/generators/templates/global/import/Cbp7501Template.jsx | Brak nowych kluczy. Entry No./Type/Port Code/Date, Importer of Record, Bond No., MID, cła (Duty/ADD/CVD/Tax/MPF/HMF/TOTAL DUE) bez odpowiednika — puste, do uzupełnienia później (dużo pól specyficznych dla CBP, celowo bez inwencji). |
| 21 | global/import/21_UK_C88_Import_Declaration.pdf | UK Import Declaration (C88) | celne_import | DONE | src/generators/templates/global/import/UkC88ImportTemplate.jsx | Brak nowych kluczy — reużyto `data.customs.eori` (tu: EORI importera UK, nie eksportera jak w 07) i `data.customs.procedureCode`. MRN, Declarant, Invoice No., Preference, Duty/VAT rates bez odpowiednika — puste. |
| 22 | global/import/22_Bill_of_Entry_India.pdf | Bill of Entry — Indie | celne_import | DONE | src/generators/templates/global/import/BillOfEntryIndiaTemplate.jsx | klucz katalogu: 44_India_Import. Brak nowych kluczy. Port Code, BE No., GSTIN, BCD/IGST rates, CHA — bez odpowiednika, puste. |
| 23 | global/export/23_China_Export_Declaration.pdf | Chińska Deklaracja Eksportowa | celne_export | DONE | src/generators/templates/global/export/ChinaExportDeclarationTemplate.jsx | Brak nowych kluczy. Nr zgłoszenia, USCC Code, Nr rejestracji celnej, metoda płatności — bez odpowiednika, puste. Chińskie nagłówki tabeli w źródłowym PDF nieczytelne (kwadraciki) — odtworzone z etykiet EN. |
| 24 | global/special/24_Dual_Use_Licencja_Eksportowa.pdf | Licencja Dual-Use | inne | DONE | src/generators/templates/global/special/DualUseLicenceTemplate.jsx | Brak nowych kluczy — reużyto `data.customs.eori`. Nr licencji, Organ wystawiający, Intermediate consignee, Kod ECN/ECCN, Lista kontrolna bez odpowiednika — puste. |
| 25 | global/cargo/25_CITES_Zezwolenie.pdf | CITES — Zezwolenie | swiadectwo | BLOCKED | | brak wpisu w documentCatalog.js — czeka na ustalenie klucza (osobno od 101_CITES_Import_Permit) |
| 26 | eu/sea/26_Sea_Waybill.pdf | Sea Waybill — Morski List Przewozowy | transport | DONE | src/generators/templates/eu/sea/SeaWaybillTemplate.jsx | wzorzec UE |
| 27 | global/special/27_CIM_Kolejowy_List_Przewozowy.pdf | CIM — Kolejowy List Przewozowy | transport | DONE | src/generators/templates/global/special/CimRailWaybillTemplate.jsx | Brak nowych kluczy. Nr wagonu, Typ wagonu, Ładowność — bez odpowiednika (specyficzne kolejowe), puste. |
| 28 | eu/common/28_Multimodal_Transport_Document.pdf | Multimodal Transport Document | transport | DONE | src/generators/templates/eu/common/MultimodalTemplate.jsx | wzorzec UE |
| 29 | global/cargo/29_Dangerous_Goods_Manifest.pdf | Dangerous Goods Manifest | towary_niebezp | TODO | | |
| 30 | global/export/30_USA_AES_Export.pdf | AES Filing (EEI) — USA | celne_export | TODO | | |
| 31 | global/export/31_UK_Export_Declaration.pdf | UK Export Declaration (NES) | celne_export | TODO | | |
| 32 | global/export/32_Australia_Export_Declaration.pdf | Export Declaration N30 — Australia | celne_export | TODO | | |
| 33 | global/export/33_Canada_B13A_Export.pdf | B13A — Deklaracja Eksportowa Kanada | celne_export | TODO | | |
| 34 | global/export/34_Japan_Export_Declaration.pdf | Japońska Deklaracja Eksportowa | celne_export | TODO | | |
| 35 | global/export/35_Korea_Export_Declaration.pdf | Koreańska Deklaracja Eksportowa | celne_export | TODO | | |
| 36 | global/export/36_Brazil_Siscomex_Export.pdf | Registro de Exportação — Brazylia | celne_export | TODO | | |
| 37 | global/export/37_India_Shipping_Bill.pdf | Shipping Bill — Indie | celne_export | TODO | | |
| 38 | global/export/38_UAE_Export_Declaration.pdf | Deklaracja Eksportowa ZEA | celne_export | TODO | | |
| 39 | global/export/39_Saudi_Arabia_Export_Declaration.pdf | Deklaracja Eksportowa Arabia Saudyjska | celne_export | TODO | | |
| 40 | global/export/40_Turkey_Export_Declaration.pdf | Deklaracja Eksportowa Turcja | celne_export | TODO | | |
| 41 | global/export/41_South_Africa_Export_DA550.pdf | Deklaracja Eksportowa RPA (DA 550) | celne_export | TODO | | |
| 42 | global/import/42_Australia_Import_N10.pdf | Deklaracja Importowa Australia (N10) | celne_import | TODO | | klucz katalogu: 43_Australia_Import |
| 43 | global/import/43_New_Zealand_Import_Entry.pdf | Deklaracja Importowa Nowa Zelandia | celne_import | TODO | | klucz katalogu: 43_NewZealand_Import |
| 44 | global/import/44_Canada_CBSA_B3_Import.pdf | B3 — Deklaracja Importowa Kanada | celne_import | TODO | | klucz katalogu: 42_Canada_Import |
| 45 | global/import/45_Japan_Import_Declaration.pdf | Deklaracja Importowa Japonia | celne_import | TODO | | |
| 46 | global/import/46_Korea_Import_Declaration.pdf | Deklaracja Importowa Korea | celne_import | TODO | | |
| 47 | global/import/47_Brazil_DI_Siscomex_Import.pdf | DI — Declaração de Importação Brazylia | celne_import | TODO | | |
| 48 | global/import/48_Mexico_Pedimento_Aduanal.pdf | Pedimento Aduanal — Meksyk | celne_import | TODO | | |
| 49 | global/import/49_UAE_Import_Declaration.pdf | Deklaracja Importowa ZEA | celne_import | TODO | | |
| 50 | global/import/50_Saudi_Arabia_Import_Declaration.pdf | Deklaracja Importowa Arabia Saudyjska | celne_import | TODO | | |
| 51 | global/import/51_Turkey_Import_Declaration.pdf | Deklaracja Importowa Turcja | celne_import | TODO | | |
| 52 | global/import/52_South_Africa_SAD500_Import.pdf | SAD500 — Deklaracja Importowa RPA | celne_import | TODO | | |
| 53 | global/import/53_Nigeria_Form_M_Import.pdf | Form M — Nigeria | celne_import | TODO | | |
| 54 | global/import/54_Kenya_Customs_Entry.pdf | Zgłoszenie Celne — Kenia | celne_import | TODO | | |
| 55 | global/import/55_Egypt_Import_Declaration.pdf | Deklaracja Importowa Egipt | celne_import | TODO | | |
| 56 | global/import/56_Singapore_Import_Declaration.pdf | Deklaracja Importowa Singapur | celne_import | TODO | | |
| 57 | global/import/57_Malaysia_K1_Import.pdf | K1 — Deklaracja Importowa Malezja | celne_import | TODO | | |
| 58 | global/import/58_Indonesia_PIB_Import.pdf | PIB — Deklaracja Importowa Indonezja | celne_import | TODO | | |
| 59 | global/import/59_Vietnam_Import_Declaration.pdf | Deklaracja Importowa Wietnam | celne_import | TODO | | |
| 60 | global/import/60_Thailand_Import_Declaration.pdf | Deklaracja Importowa Tajlandia | celne_import | TODO | | |
| 61 | global/special/61_Letter_of_Credit_LC.pdf | Letter of Credit (L/C) | finansowe | BLOCKED | | brak wpisu w documentCatalog.js — czeka na ustalenie klucza |
| 62 | global/special/62_Bank_Guarantee.pdf | Bank Guarantee — Gwarancja Bankowa | finansowe | BLOCKED | | brak wpisu w documentCatalog.js — czeka na ustalenie klucza |
| 63 | global/special/63_Insurance_Certificate.pdf | Certyfikat Ubezpieczenia Cargo | finansowe | TODO | | |
| 64 | global/cargo/64_IATA_DGR_Air_DangerousGoods.pdf | IATA DGR — Deklaracja Towarów Niebezpiecznych (Lotnicza) | towary_niebezp | TODO | | |
| 65 | global/cargo/65_Fumigation_Certificate.pdf | Certyfikat Fumigacji | swiadectwo | TODO | | |
| 66 | global/cargo/66_Weight_Certificate.pdf | Weight Certificate — Świadectwo Wagi | swiadectwo | BLOCKED | | brak wpisu w documentCatalog.js — czeka na ustalenie klucza |
| 67 | global/cargo/67_Quality_Inspection_Certificate.pdf | Quality Inspection Certificate | swiadectwo | BLOCKED | | brak wpisu w documentCatalog.js — czeka na ustalenie klucza |
| 68 | global/special/68_PSI_Pre_Shipment_Inspection.pdf | PSI — Inspekcja Przedwysyłkowa | swiadectwo | TODO | | |
| 69 | global/cargo/69_MSDS_Karta_Charakterystyki.pdf | MSDS — Karta Charakterystyki | towary_niebezp | TODO | | |
| 70 | global/special/70_Blacklist_Certificate.pdf | Blacklist Certificate | swiadectwo | TODO | | |
| 71 | global/cargo/71_Free_Sale_Certificate.pdf | Free Sale Certificate — Leki | swiadectwo | TODO | | |
| 72 | global/import/72_Argentina_Import_SIRA.pdf | SIRA — Deklaracja Importowa Argentyna | celne_import | TODO | | |
| 73 | global/import/73_Chile_Import_DIN.pdf | DIN — Deklaracja Importowa Chile | celne_import | TODO | | |
| 74 | global/import/74_Colombia_Import_DIAN.pdf | DIAN — Deklaracja Importowa Kolumbia | celne_import | TODO | | |
| 75 | global/import/75_Peru_SUNAT_Import_DUA.pdf | DUA (SUNAT) — Deklaracja Importowa Peru | celne_import | TODO | | |
| 76 | global/import/76_Ecuador_SENAE_Import_DAI.pdf | DAI (SENAE) — Deklaracja Importowa Ekwador | celne_import | TODO | | |
| 77 | global/import/77_Pakistan_WeBOC_Import.pdf | WeBOC — Deklaracja Importowa Pakistan | celne_import | TODO | | |
| 78 | global/import/78_Bangladesh_Bill_of_Entry.pdf | Bill of Entry — Bangladesz | celne_import | TODO | | |
| 79 | global/import/79_Sri_Lanka_Bill_of_Entry.pdf | Bill of Entry — Sri Lanka | celne_import | TODO | | |
| 80 | global/import/80_Philippines_BOC_Import.pdf | BOC — Deklaracja Importowa Filipiny | celne_import | TODO | | |
| 81 | global/import/81_Myanmar_Import_Declaration.pdf | Deklaracja Importowa Mjanma | celne_import | TODO | | |
| 82 | global/import/82_Cambodia_Import_Declaration.pdf | Deklaracja Importowa Kambodża | celne_import | TODO | | |
| 83 | global/import/83_Morocco_DUM_Import.pdf | DUM — Deklaracja Importowa Maroko | celne_import | TODO | | |
| 84 | global/import/84_Algeria_Import_DED.pdf | DED — Deklaracja Importowa Algieria | celne_import | TODO | | |
| 85 | global/import/85_Tunisia_Import_DD.pdf | Deklaracja Importowa Tunezja | celne_import | TODO | | |
| 86 | global/import/86_Ghana_ICUMS_Import.pdf | ICUMS — Deklaracja Importowa Ghana | celne_import | TODO | | |
| 87 | global/import/87_Senegal_Import_Declaration.pdf | Deklaracja Importowa Senegal | celne_import | TODO | | |
| 88 | global/import/88_Tanzania_TRA_Import.pdf | TRA — Deklaracja Importowa Tanzania | celne_import | TODO | | |
| 89 | global/import/89_Ethiopia_ERCA_Import.pdf | ERCA — Deklaracja Importowa Etiopia | celne_import | TODO | | |
| 90 | global/import/90_Jordan_Customs_Import.pdf | Zgłoszenie Celne — Jordania | celne_import | TODO | | |
| 91 | global/import/91_Israel_Import_Declaration.pdf | Deklaracja Importowa Izrael | celne_import | TODO | | |
| 92 | global/import/92_Iraq_Customs_Import.pdf | Zgłoszenie Celne — Irak | celne_import | TODO | | |
| 93 | global/import/93_Lebanon_Customs_Import.pdf | Zgłoszenie Celne — Liban | celne_import | TODO | | |
| 94 | global/import/94_Kazakhstan_Customs_Import.pdf | Zgłoszenie Celne — Kazachstan | celne_import | TODO | | |
| 95 | global/import/95_Uzbekistan_Customs_Import.pdf | Zgłoszenie Celne — Uzbekistan | celne_import | TODO | | |
| 96 | global/import/96_Georgia_Customs_Import.pdf | Zgłoszenie Celne — Gruzja | celne_import | TODO | | |
| 97 | global/export/97_Argentina_Export_Declaration.pdf | Deklaracja Eksportowa Argentyna | celne_export | TODO | | |
| 98 | global/export/98_Chile_Export_Declaration.pdf | Deklaracja Eksportowa Chile | celne_export | TODO | | |
| 99 | global/export/99_Pakistan_Export_Declaration.pdf | Deklaracja Eksportowa Pakistan | celne_export | TODO | | |
| 100 | global/export/100_Philippines_Export_Declaration.pdf | Deklaracja Eksportowa Filipiny | celne_export | TODO | | |
| 101 | global/cargo/101_CITES_Import_Permit.pdf | CITES — Import Permit (Żywe Zwierzęta) | swiadectwo | TODO | | |
| 102 | global/special/102_EUR_MED_Certificate.pdf | EUR-MED — Świadectwo Pochodzenia | swiadectwo | TODO | | |
| 103 | global/special/103_Form_A_GSP_Certificate.pdf | Form A — GSP Certificate of Origin | swiadectwo | TODO | | |
| 104 | global/special/104_T2L_Union_Status_Document.pdf | T2L — Dowód Unijnego Statusu Towaru | inne | TODO | | |
| 105 | global/cargo/105_FDA_Prior_Notice_USA_Food.pdf | FDA Prior Notice — Żywność (USA) | celne_import | TODO | | |
| 106 | global/cargo/106_CE_Declaration_of_Conformity.pdf | CE Declaration of Conformity | swiadectwo | TODO | | |
| 107 | global/cargo/107_Radiation_Non_Contamination_Certificate.pdf | Radiation Non-Contamination Certificate | swiadectwo | TODO | | |
| 108 | global/cargo/108_Phytosanitary_Import_Permit.pdf | Phytosanitary Import Permit | swiadectwo | TODO | | |
| 109 | global/cargo/109_IATA_DG_Packing_Certificate.pdf | IATA DG Packing Certificate | towary_niebezp | TODO | | |
| 110 | global/cargo/110_Non_GMO_Certificate.pdf | Non-GMO Certificate | swiadectwo | TODO | | |
| 111 | global/cargo/111_Organic_Certificate.pdf | Organic Certificate | swiadectwo | TODO | | |
| 112 | global/cargo/112_Kosher_Certificate.pdf | Kosher Certificate | swiadectwo | TODO | | |
| 113 | global/special/113_End_User_Certificate_Military.pdf | End User Certificate (Military) | swiadectwo | TODO | | |
| 114 | global/special/114_Re_Export_Certificate.pdf | Re-Export Certificate | inne | TODO | | |
| 115 | global/special/115_Transhipment_Declaration.pdf | Transhipment Declaration | inne | TODO | | |
| 116 | global/special/116_Transit_Declaration_T1_T2.pdf | Transit Declaration T1/T2 | inne | TODO | | |
| 117 | global/special/117_TIR_Carnet.pdf | Karnet TIR | inne | TODO | | |
| 118 | global/cargo/118_DG_Road_Manifest_ADR.pdf | ADR — Manifest Drogowy Towarów Niebezpiecznych | towary_niebezp | TODO | | |

## Podsumowanie

| grupa | DONE | TODO | BLOCKED |
|---|---|---|---|
| celne_export | 2 | 16 | 0 |
| celne_import | 4 | 45 | 0 |
| transport | 9 | 0 | 0 |
| swiadectwo | 6 | 14 | 3 |
| towary_niebezp | 2 | 5 | 0 |
| finansowe | 2 | 1 | 2 |
| inne | 2 | 5 | 0 |
| **razem** | **27** | **86** | **5** |
