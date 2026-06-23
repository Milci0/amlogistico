// src/data/documentCatalog.js
// Katalog dokumentów transportowych używanych przez silnik doboru (documentEngine.js).
// Klucze (np. "44_India_Import") to stabilne identyfikatory używane w logice silnika —
// NIE są tożsame z numerem pliku PDF. `path` wskazuje fizyczny plik w public/templates/.
//
// path:      ścieżka w public/templates/ (null = plik jeszcze nie wgrany)
// available: czy PDF fizycznie istnieje i można go pobrać
//
// UWAGA — rozjazd numeracji: numer w kluczu katalogu bywa inny niż numer pliku PDF
// (pliki nadano wg innej kolejności). Dlatego `path` mapujemy wg ZNACZENIA (kraju),
// a nie wg prefiksu klucza. Np. "44_India_Import" → plik 22 (Bill of Entry India).

export const documentCatalog = {

  // ─── TRANSPORT DROGOWY ───────────────────────────────────────────
  "01_CMR": {
    name_pl: "CMR — List Przewozowy",
    name_en: "CMR Consignment Note",
    path: "/templates/eu/land/01_CMR_List_Przewozowy.pdf",
    available: true,
  },
  "09_Zlecenie": {
    name_pl: "Zlecenie Transportowe",
    name_en: "Transport Order",
    path: "/templates/eu/land/09_Zlecenie_Transportowe.pdf",
    available: true,
  },
  "10_POD": {
    name_pl: "Protokół Odbioru (POD)",
    name_en: "Proof of Delivery",
    path: "/templates/eu/land/10_Protokol_Odbioru_POD.pdf",
    available: true,
  },

  // ─── TRANSPORT MORSKI ────────────────────────────────────────────
  "05_BL": {
    name_pl: "Bill of Lading — Konosament",
    name_en: "Bill of Lading",
    path: "/templates/eu/sea/05_Bill_of_Lading.pdf",
    available: true,
  },
  "26_SeaWaybill": {
    name_pl: "Sea Waybill — Morski List Przewozowy",
    name_en: "Sea Waybill",
    path: "/templates/eu/sea/26_Sea_Waybill.pdf",
    available: true,
  },

  // ─── TRANSPORT LOTNICZY ──────────────────────────────────────────
  "11_AWB": {
    name_pl: "AWB — Lotniczy List Przewozowy",
    name_en: "Air Waybill",
    path: "/templates/global/special/11_AWB_Lotniczy_List_Przewozowy.pdf",
    available: true,
  },

  // ─── TRANSPORT KOLEJOWY ──────────────────────────────────────────
  "27_CIM": {
    name_pl: "CIM — Kolejowy List Przewozowy",
    name_en: "CIM Rail Consignment Note",
    path: "/templates/global/special/27_CIM_Kolejowy_List_Przewozowy.pdf",
    available: true,
  },

  // ─── MULTIMODAL ──────────────────────────────────────────────────
  "28_MTD": {
    name_pl: "Multimodal Transport Document",
    name_en: "Multimodal Transport Document",
    path: "/templates/eu/common/28_Multimodal_Transport_Document.pdf",
    available: true,
  },

  // ─── HANDLOWE (zawsze) ───────────────────────────────────────────
  "02_PackingList": {
    name_pl: "Packing List — Lista Pakowania",
    name_en: "Packing List",
    path: "/templates/eu/common/02_Packing_List.pdf",
    available: true,
  },
  "03_Invoice": {
    name_pl: "Faktura Handlowa",
    name_en: "Commercial Invoice",
    path: "/templates/eu/common/03_Faktura_Handlowa.pdf",
    available: true,
  },
  "04_Proforma": {
    name_pl: "Faktura Proforma",
    name_en: "Proforma Invoice",
    path: "/templates/eu/common/04_Faktura_Proforma.pdf",
    available: true,
  },

  // ─── EKSPORT ─────────────────────────────────────────────────────
  "07_EAD": {
    name_pl: "Deklaracja Eksportowa UE (EAD/SAD)",
    name_en: "EU Export Declaration (EAD)",
    path: "/templates/global/export/07_Deklaracja_Eksportowa_EU.pdf",
    available: true,
  },
  "31_UK_Export": {
    name_pl: "UK Export Declaration (NES)",
    name_en: "UK Export Declaration",
    path: "/templates/global/export/31_UK_Export_Declaration.pdf",
    available: true,
  },
  "30_USA_AES": {
    name_pl: "AES Filing (EEI) — USA",
    name_en: "USA AES Export Filing",
    path: "/templates/global/export/30_USA_AES_Export.pdf",
    available: true,
  },
  "33_Canada_Export": {
    name_pl: "B13A — Deklaracja Eksportowa Kanada",
    name_en: "Canada B13A Export Declaration",
    path: "/templates/global/export/33_Canada_B13A_Export.pdf",
    available: true,
  },
  "32_Australia_Export": {
    name_pl: "Export Declaration N30 — Australia",
    name_en: "Australia Export Declaration",
    path: "/templates/global/export/32_Australia_Export_Declaration.pdf",
    available: true,
  },
  "23_China_Export": {
    name_pl: "Chińska Deklaracja Eksportowa",
    name_en: "China Customs Export Declaration",
    path: "/templates/global/export/23_China_Export_Declaration.pdf",
    available: true,
  },
  "34_Japan_Export": {
    name_pl: "Japońska Deklaracja Eksportowa",
    name_en: "Japan Export Declaration",
    path: "/templates/global/export/34_Japan_Export_Declaration.pdf",
    available: true,
  },
  "35_Korea_Export": {
    name_pl: "Koreańska Deklaracja Eksportowa",
    name_en: "Korea Export Declaration",
    path: "/templates/global/export/35_Korea_Export_Declaration.pdf",
    available: true,
  },
  "36_Brazil_Export": {
    name_pl: "Registro de Exportação — Brazylia",
    name_en: "Brazil Siscomex Export",
    path: "/templates/global/export/36_Brazil_Siscomex_Export.pdf",
    available: true,
  },
  "37_India_Export": {
    name_pl: "Shipping Bill — Indie",
    name_en: "India Shipping Bill",
    path: "/templates/global/export/37_India_Shipping_Bill.pdf",
    available: true,
  },
  "38_UAE_Export": {
    name_pl: "Deklaracja Eksportowa ZEA",
    name_en: "UAE Export Declaration",
    path: "/templates/global/export/38_UAE_Export_Declaration.pdf",
    available: true,
  },
  "39_Saudi_Export": {
    name_pl: "Deklaracja Eksportowa Arabia Saudyjska",
    name_en: "Saudi Arabia Export Declaration",
    path: "/templates/global/export/39_Saudi_Arabia_Export_Declaration.pdf",
    available: true,
  },

  // ─── IMPORT ──────────────────────────────────────────────────────
  "08_ISF": {
    name_pl: "ISF 10+2 — USA (Importer Security Filing)",
    name_en: "ISF 10+2 USA",
    path: "/templates/global/import/08_ISF_10plus2_USA.pdf",
    available: true,
  },
  "20_CBP7501": {
    name_pl: "CBP 7501 — USA Import Entry",
    name_en: "CBP Form 7501",
    path: "/templates/global/import/20_CBP7501_USA_Import.pdf",
    available: true,
  },
  "21_UK_Import": {
    name_pl: "UK Import Declaration (C88)",
    name_en: "UK C88 Import Declaration",
    path: "/templates/global/import/21_UK_C88_Import_Declaration.pdf",
    available: true,
  },
  "22_China_Import": {
    name_pl: "Chińska Deklaracja Importowa",
    name_en: "China Customs Import Declaration",
    // Brak dedykowanego pliku importowego dla CN → fallback na generyczną deklarację UE/SAD.
    path: "/templates/global/export/07_Deklaracja_Eksportowa_EU.pdf",
    available: true,
  },
  "42_Canada_Import": {
    name_pl: "B3 — Deklaracja Importowa Kanada",
    name_en: "Canada B3 Import Declaration",
    // Plik kanadyjski ma numer 44 (rozjazd numeracji klucz↔plik).
    path: "/templates/global/import/44_Canada_CBSA_B3_Import.pdf",
    available: true,
  },
  "43_Australia_Import": {
    name_pl: "Deklaracja Importowa Australia",
    name_en: "Australia Import Declaration",
    // Plik australijski ma numer 42 (rozjazd numeracji klucz↔plik).
    path: "/templates/global/import/42_Australia_Import_N10.pdf",
    available: true,
  },
  "44_India_Import": {
    name_pl: "Bill of Entry — Indie",
    name_en: "India Bill of Entry",
    // Plik indyjski ma numer 22 (rozjazd numeracji klucz↔plik).
    path: "/templates/global/import/22_Bill_of_Entry_India.pdf",
    available: true,
  },
  "45_Japan_Import": {
    name_pl: "Deklaracja Importowa Japonia",
    name_en: "Japan Import Declaration",
    path: "/templates/global/import/45_Japan_Import_Declaration.pdf",
    available: true,
  },
  "46_Korea_Import": {
    name_pl: "Deklaracja Importowa Korea",
    name_en: "Korea Import Declaration",
    path: "/templates/global/import/46_Korea_Import_Declaration.pdf",
    available: true,
  },
  "47_Brazil_Import": {
    name_pl: "DI — Declaração de Importação Brazylia",
    name_en: "Brazil Import Declaration",
    path: "/templates/global/import/47_Brazil_DI_Siscomex_Import.pdf",
    available: true,
  },
  "50_Saudi_Import": {
    name_pl: "Deklaracja Importowa Arabia Saudyjska",
    name_en: "Saudi Arabia Import Declaration",
    path: "/templates/global/import/50_Saudi_Arabia_Import_Declaration.pdf",
    available: true,
  },
  "51_UAE_Import": {
    name_pl: "Deklaracja Importowa ZEA",
    name_en: "UAE Import Declaration",
    // Plik ZEA ma numer 49 (rozjazd numeracji klucz↔plik).
    path: "/templates/global/import/49_UAE_Import_Declaration.pdf",
    available: true,
  },
  "53_Nigeria_Import": {
    name_pl: "Form M — Nigeria",
    name_en: "Nigeria Form M Import",
    path: "/templates/global/import/53_Nigeria_Form_M_Import.pdf",
    available: true,
  },
  "83_Morocco_Import": {
    name_pl: "DUM — Deklaracja Importowa Maroko",
    name_en: "Morocco Import Declaration",
    path: "/templates/global/import/83_Morocco_DUM_Import.pdf",
    available: true,
  },
  "84_Algeria_Import": {
    name_pl: "DED — Deklaracja Importowa Algieria",
    name_en: "Algeria Import Declaration",
    path: "/templates/global/import/84_Algeria_Import_DED.pdf",
    available: true,
  },
  "85_Tunisia_Import": {
    name_pl: "Deklaracja Importowa Tunezja",
    name_en: "Tunisia Import Declaration",
    path: "/templates/global/import/85_Tunisia_Import_DD.pdf",
    available: true,
  },
  "43_NewZealand_Import": {
    name_pl: "Deklaracja Importowa Nowa Zelandia",
    name_en: "New Zealand Import Entry",
    path: "/templates/global/import/43_New_Zealand_Import_Entry.pdf",
    available: true,
  },
  "48_Mexico_Import": {
    name_pl: "Pedimento Aduanal — Meksyk",
    name_en: "Mexico Import Pedimento",
    path: "/templates/global/import/48_Mexico_Pedimento_Aduanal.pdf",
    available: true,
  },
  "51_Turkey_Import": {
    name_pl: "Deklaracja Importowa Turcja",
    name_en: "Turkey Import Declaration",
    path: "/templates/global/import/51_Turkey_Import_Declaration.pdf",
    available: true,
  },
  "52_SouthAfrica_Import": {
    name_pl: "SAD500 — Deklaracja Importowa RPA",
    name_en: "South Africa SAD500 Import",
    path: "/templates/global/import/52_South_Africa_SAD500_Import.pdf",
    available: true,
  },
  "54_Kenya_Import": {
    name_pl: "Zgłoszenie Celne — Kenia",
    name_en: "Kenya Customs Entry",
    path: "/templates/global/import/54_Kenya_Customs_Entry.pdf",
    available: true,
  },
  "55_Egypt_Import": {
    name_pl: "Deklaracja Importowa Egipt",
    name_en: "Egypt Import Declaration",
    path: "/templates/global/import/55_Egypt_Import_Declaration.pdf",
    available: true,
  },
  "56_Singapore_Import": {
    name_pl: "Deklaracja Importowa Singapur",
    name_en: "Singapore Import Declaration",
    path: "/templates/global/import/56_Singapore_Import_Declaration.pdf",
    available: true,
  },
  "57_Malaysia_Import": {
    name_pl: "K1 — Deklaracja Importowa Malezja",
    name_en: "Malaysia K1 Import",
    path: "/templates/global/import/57_Malaysia_K1_Import.pdf",
    available: true,
  },
  "58_Indonesia_Import": {
    name_pl: "PIB — Deklaracja Importowa Indonezja",
    name_en: "Indonesia PIB Import",
    path: "/templates/global/import/58_Indonesia_PIB_Import.pdf",
    available: true,
  },
  "59_Vietnam_Import": {
    name_pl: "Deklaracja Importowa Wietnam",
    name_en: "Vietnam Import Declaration",
    path: "/templates/global/import/59_Vietnam_Import_Declaration.pdf",
    available: true,
  },
  "60_Thailand_Import": {
    name_pl: "Deklaracja Importowa Tajlandia",
    name_en: "Thailand Import Declaration",
    path: "/templates/global/import/60_Thailand_Import_Declaration.pdf",
    available: true,
  },
  "72_Argentina_Import": {
    name_pl: "SIRA — Deklaracja Importowa Argentyna",
    name_en: "Argentina SIRA Import",
    path: "/templates/global/import/72_Argentina_Import_SIRA.pdf",
    available: true,
  },
  "73_Chile_Import": {
    name_pl: "DIN — Deklaracja Importowa Chile",
    name_en: "Chile DIN Import",
    path: "/templates/global/import/73_Chile_Import_DIN.pdf",
    available: true,
  },
  "74_Colombia_Import": {
    name_pl: "DIAN — Deklaracja Importowa Kolumbia",
    name_en: "Colombia DIAN Import",
    path: "/templates/global/import/74_Colombia_Import_DIAN.pdf",
    available: true,
  },
  "75_Peru_Import": {
    name_pl: "DUA (SUNAT) — Deklaracja Importowa Peru",
    name_en: "Peru SUNAT Import",
    path: "/templates/global/import/75_Peru_SUNAT_Import_DUA.pdf",
    available: true,
  },
  "76_Ecuador_Import": {
    name_pl: "DAI (SENAE) — Deklaracja Importowa Ekwador",
    name_en: "Ecuador SENAE Import",
    path: "/templates/global/import/76_Ecuador_SENAE_Import_DAI.pdf",
    available: true,
  },
  "77_Pakistan_Import": {
    name_pl: "WeBOC — Deklaracja Importowa Pakistan",
    name_en: "Pakistan WeBOC Import",
    path: "/templates/global/import/77_Pakistan_WeBOC_Import.pdf",
    available: true,
  },
  "78_Bangladesh_Import": {
    name_pl: "Bill of Entry — Bangladesz",
    name_en: "Bangladesh Bill of Entry",
    path: "/templates/global/import/78_Bangladesh_Bill_of_Entry.pdf",
    available: true,
  },
  "79_SriLanka_Import": {
    name_pl: "Bill of Entry — Sri Lanka",
    name_en: "Sri Lanka Bill of Entry",
    path: "/templates/global/import/79_Sri_Lanka_Bill_of_Entry.pdf",
    available: true,
  },
  "80_Philippines_Import": {
    name_pl: "BOC — Deklaracja Importowa Filipiny",
    name_en: "Philippines BOC Import",
    path: "/templates/global/import/80_Philippines_BOC_Import.pdf",
    available: true,
  },
  "81_Myanmar_Import": {
    name_pl: "Deklaracja Importowa Mjanma",
    name_en: "Myanmar Import Declaration",
    path: "/templates/global/import/81_Myanmar_Import_Declaration.pdf",
    available: true,
  },
  "82_Cambodia_Import": {
    name_pl: "Deklaracja Importowa Kambodża",
    name_en: "Cambodia Import Declaration",
    path: "/templates/global/import/82_Cambodia_Import_Declaration.pdf",
    available: true,
  },
  "86_Ghana_Import": {
    name_pl: "ICUMS — Deklaracja Importowa Ghana",
    name_en: "Ghana ICUMS Import",
    path: "/templates/global/import/86_Ghana_ICUMS_Import.pdf",
    available: true,
  },
  "87_Senegal_Import": {
    name_pl: "Deklaracja Importowa Senegal",
    name_en: "Senegal Import Declaration",
    path: "/templates/global/import/87_Senegal_Import_Declaration.pdf",
    available: true,
  },
  "88_Tanzania_Import": {
    name_pl: "TRA — Deklaracja Importowa Tanzania",
    name_en: "Tanzania TRA Import",
    path: "/templates/global/import/88_Tanzania_TRA_Import.pdf",
    available: true,
  },
  "89_Ethiopia_Import": {
    name_pl: "ERCA — Deklaracja Importowa Etiopia",
    name_en: "Ethiopia ERCA Import",
    path: "/templates/global/import/89_Ethiopia_ERCA_Import.pdf",
    available: true,
  },
  "90_Jordan_Import": {
    name_pl: "Zgłoszenie Celne — Jordania",
    name_en: "Jordan Customs Import",
    path: "/templates/global/import/90_Jordan_Customs_Import.pdf",
    available: true,
  },
  "91_Israel_Import": {
    name_pl: "Deklaracja Importowa Izrael",
    name_en: "Israel Import Declaration",
    path: "/templates/global/import/91_Israel_Import_Declaration.pdf",
    available: true,
  },
  "92_Iraq_Import": {
    name_pl: "Zgłoszenie Celne — Irak",
    name_en: "Iraq Customs Import",
    path: "/templates/global/import/92_Iraq_Customs_Import.pdf",
    available: true,
  },
  "93_Lebanon_Import": {
    name_pl: "Zgłoszenie Celne — Liban",
    name_en: "Lebanon Customs Import",
    path: "/templates/global/import/93_Lebanon_Customs_Import.pdf",
    available: true,
  },
  "94_Kazakhstan_Import": {
    name_pl: "Zgłoszenie Celne — Kazachstan",
    name_en: "Kazakhstan Customs Import",
    path: "/templates/global/import/94_Kazakhstan_Customs_Import.pdf",
    available: true,
  },
  "95_Uzbekistan_Import": {
    name_pl: "Zgłoszenie Celne — Uzbekistan",
    name_en: "Uzbekistan Customs Import",
    path: "/templates/global/import/95_Uzbekistan_Customs_Import.pdf",
    available: true,
  },
  "96_Georgia_Import": {
    name_pl: "Zgłoszenie Celne — Gruzja",
    name_en: "Georgia Customs Import",
    path: "/templates/global/import/96_Georgia_Customs_Import.pdf",
    available: true,
  },

  // ─── ŚWIADECTWA POCHODZENIA ───────────────────────────────────────
  "06_COO": {
    name_pl: "Certificate of Origin — Świadectwo Pochodzenia",
    name_en: "Certificate of Origin",
    path: "/templates/global/cargo/06_Certificate_of_Origin.pdf",
    available: true,
  },
  "12_EUR1": {
    name_pl: "EUR.1 — Świadectwo Przewozowe",
    name_en: "EUR.1 Movement Certificate",
    path: "/templates/global/special/12_EUR1_Swiadectwo_Przewozowe.pdf",
    available: true,
  },
  "102_EUR_MED": {
    name_pl: "EUR-MED — Świadectwo Pochodzenia",
    name_en: "EUR-MED Certificate",
    path: "/templates/global/special/102_EUR_MED_Certificate.pdf",
    available: true,
  },
  "103_Form_A": {
    name_pl: "Form A — GSP Certificate of Origin",
    name_en: "Form A GSP Certificate",
    path: "/templates/global/special/103_Form_A_GSP_Certificate.pdf",
    available: true,
  },

  // ─── SANITARNE / WETERYNARYJNE ────────────────────────────────────
  "16_Fitosanitarne": {
    name_pl: "Świadectwo Fitosanitarne",
    name_en: "Phytosanitary Certificate",
    path: "/templates/global/cargo/16_Swiadectwo_Fitosanitarne.pdf",
    available: true,
  },
  "17_Weterynaryjne": {
    name_pl: "Świadectwo Weterynaryjne",
    name_en: "Veterinary Certificate",
    path: "/templates/global/cargo/17_Swiadectwo_Weterynaryjne.pdf",
    available: true,
  },
  "108_PhytoImport": {
    name_pl: "Phytosanitary Import Permit",
    name_en: "Phytosanitary Import Permit",
    path: "/templates/global/cargo/108_Phytosanitary_Import_Permit.pdf",
    available: true,
  },
  "105_FDA": {
    name_pl: "FDA Prior Notice — Żywność (USA)",
    name_en: "FDA Prior Notice",
    path: "/templates/global/cargo/105_FDA_Prior_Notice_USA_Food.pdf",
    available: true,
  },

  // ─── TOWARY NIEBEZPIECZNE ─────────────────────────────────────────
  "29_DG_Manifest": {
    name_pl: "Dangerous Goods Manifest",
    name_en: "Dangerous Goods Manifest",
    path: "/templates/global/cargo/29_Dangerous_Goods_Manifest.pdf",
    available: true,
  },
  "69_MSDS": {
    name_pl: "MSDS — Karta Charakterystyki",
    name_en: "MSDS Safety Data Sheet",
    path: "/templates/global/cargo/69_MSDS_Karta_Charakterystyki.pdf",
    available: true,
  },
  "118_ADR": {
    name_pl: "ADR — Manifest Drogowy Towarów Niebezpiecznych",
    name_en: "ADR Road Dangerous Goods Manifest",
    path: "/templates/global/cargo/118_DG_Road_Manifest_ADR.pdf",
    available: true,
  },
  "64_IATA_DGR": {
    name_pl: "IATA DGR — Deklaracja Towarów Niebezpiecznych (Lotnicza)",
    name_en: "IATA Dangerous Goods Declaration",
    path: "/templates/global/cargo/64_IATA_DGR_Air_DangerousGoods.pdf",
    available: true,
  },
  "109_IATA_Packing": {
    name_pl: "IATA DG Packing Certificate",
    name_en: "IATA DG Packing Certificate",
    path: "/templates/global/cargo/109_IATA_DG_Packing_Certificate.pdf",
    available: true,
  },

  // ─── SPECJALNE / CERTYFIKATY ──────────────────────────────────────
  "13_ATA": {
    name_pl: "Karnet ATA — Eksport Tymczasowy",
    name_en: "ATA Carnet",
    path: "/templates/global/special/13_ATA_Carnet_Czasowy_Wywoz.pdf",
    available: true,
  },
  "18_Halal": {
    name_pl: "Certyfikat Halal",
    name_en: "Halal Certificate",
    path: "/templates/global/cargo/18_Certyfikat_Halal.pdf",
    available: true,
  },
  "19_ISPM15": {
    name_pl: "ISPM 15 — Certyfikat Opakowań Drewnianych",
    name_en: "ISPM 15 Wood Packaging Certificate",
    path: "/templates/global/cargo/19_ISPM15_Opakowania_Drewniane.pdf",
    available: true,
  },
  "63_Insurance": {
    name_pl: "Certyfikat Ubezpieczenia Cargo",
    name_en: "Insurance Certificate",
    path: "/templates/global/special/63_Insurance_Certificate.pdf",
    available: true,
  },
  "68_PSI": {
    name_pl: "PSI — Inspekcja Przedwysyłkowa",
    name_en: "Pre-Shipment Inspection Certificate",
    path: "/templates/global/special/68_PSI_Pre_Shipment_Inspection.pdf",
    available: true,
  },
  "70_Blacklist": {
    name_pl: "Blacklist Certificate",
    name_en: "Blacklist Certificate",
    path: "/templates/global/special/70_Blacklist_Certificate.pdf",
    available: true,
  },
  "71_FreeSale": {
    name_pl: "Free Sale Certificate — Leki",
    name_en: "Free Sale Certificate",
    path: "/templates/global/cargo/71_Free_Sale_Certificate.pdf",
    available: true,
  },
  "104_T2L": {
    name_pl: "T2L — Dowód Unijnego Statusu Towaru",
    name_en: "T2L Union Status Document",
    path: "/templates/global/special/104_T2L_Union_Status_Document.pdf",
    available: true,
  },
  "106_CE": {
    name_pl: "CE Declaration of Conformity",
    name_en: "CE Declaration of Conformity",
    path: "/templates/global/cargo/106_CE_Declaration_of_Conformity.pdf",
    available: true,
  },
  "110_NonGMO": {
    name_pl: "Non-GMO Certificate",
    name_en: "Non-GMO Certificate",
    path: "/templates/global/cargo/110_Non_GMO_Certificate.pdf",
    available: true,
  },
  "111_Organic": {
    name_pl: "Organic Certificate",
    name_en: "Organic Certificate",
    path: "/templates/global/cargo/111_Organic_Certificate.pdf",
    available: true,
  },
  "112_Kosher": {
    name_pl: "Kosher Certificate",
    name_en: "Kosher Certificate",
    path: "/templates/global/cargo/112_Kosher_Certificate.pdf",
    available: true,
  },
  "113_EUC": {
    name_pl: "End User Certificate (Military)",
    name_en: "End User Certificate",
    path: "/templates/global/special/113_End_User_Certificate_Military.pdf",
    available: true,
  },
  "114_ReExport": {
    name_pl: "Re-Export Certificate",
    name_en: "Re-Export Certificate",
    path: "/templates/global/special/114_Re_Export_Certificate.pdf",
    available: true,
  },
  "115_Transhipment": {
    name_pl: "Transhipment Declaration",
    name_en: "Transhipment Declaration",
    path: "/templates/global/special/115_Transhipment_Declaration.pdf",
    available: true,
  },
  "116_Transit": {
    name_pl: "Transit Declaration T1/T2",
    name_en: "Transit Declaration T1/T2",
    path: "/templates/global/special/116_Transit_Declaration_T1_T2.pdf",
    available: true,
  },
  "117_TIR": {
    name_pl: "Karnet TIR",
    name_en: "TIR Carnet",
    path: "/templates/global/special/117_TIR_Carnet.pdf",
    available: true,
  },
  "107_Radiation": {
    name_pl: "Radiation Non-Contamination Certificate",
    name_en: "Radiation Certificate",
    path: "/templates/global/cargo/107_Radiation_Non_Contamination_Certificate.pdf",
    available: true,
  },
  "101_CITES": {
    name_pl: "CITES — Import Permit (Żywe Zwierzęta)",
    name_en: "CITES Import Permit",
    path: "/templates/global/cargo/101_CITES_Import_Permit.pdf",
    available: true,
  },
  "24_DualUse": {
    name_pl: "Licencja Dual-Use",
    name_en: "Dual-Use Export Licence",
    path: "/templates/global/special/24_Dual_Use_Licencja_Eksportowa.pdf",
    available: true,
  },
};
