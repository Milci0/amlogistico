// src/utils/documentEngine.js
// Silnik doboru dokumentów transportowych
// Implementuje logikę z document_routing_database.json w 6 warstwach

import { documentCatalog } from "../data/documentCatalog";

// ─── GRUPY KRAJÓW ────────────────────────────────────────────────────────────

const GROUPS = {
  EU: ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU",
       "IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"],
  EEA: ["NO","IS","LI"],
  SCHENGEN_NON_EU: ["NO","IS","LI","CH"],
  UK: ["GB"],
  US: ["US"],
  CA: ["CA"],
  AU: ["AU"],
  CN: ["CN"],
  JP: ["JP"],
  KR: ["KR"],
  BR: ["BR"],
  IN: ["IN"],
  EAEU: ["RU","KZ","BY","AM","KG"],
  TR: ["TR"],
  ZA: ["ZA"],
  AR: ["AR"],
  CL: ["CL"],
  PK: ["PK"],
  PH: ["PH"],
  VN: ["VN"],
  ID: ["ID"],
  TH: ["TH"],
  MY: ["MY"],
  NG: ["NG"],
  KE: ["KE"],
  MA: ["MA"],
  UZ: ["UZ"],
  GE: ["GE"],
  GCC: ["SA","AE","KW","QA","BH","OM"],
  ASEAN: ["SG","MY","TH","ID","VN","PH","MM","KH","LA","BN"],
  MERCOSUR: ["BR","AR","PY","UY"],
  ECOWAS: ["NG","GH","SN","CI","ML","BF","NE","GN","TG","BJ","SL","LR","GM","GW","CV","MR"],
  EAC: ["KE","TZ","UG","RW","BI","SS"],
  AMU: ["MA","DZ","TN","LY","MR"],
  HALAL_REQUIRED: ["SA","AE","KW","QA","BH","OM","MY","ID","PK","EG","TR",
                   "MA","NG","BD","IR","IQ","JO","LB","SY"],
  ISPM15_REQUIRED: ["US","CA","AU","NZ","CN","JP","KR","IN","BR","MX","ZA",
                    "SG","MY","ID","VN","TH","PH","EG","MA","NG","KE","TZ",
                    "AR","CL","CO","PE","EC","PK","BD"],
  BLACKLIST_CERT: ["SA","AE","KW","QA","BH","OM","IQ","LB","SY","LY","YE","DZ"],
  PSI_REQUIRED: ["NG","KE","MZ","CM","SN","CI","TG","BJ","EC"],
  EU_FTA_PARTNERS: ["GB","JP","CA","KR","SG","VN","UA","GE","MD",
                    "MA","TN","JO","LB","EG","IL","TR","MX","CL","CO","PE"],
  EUR_MED: ["MA","DZ","TN","JO","LB","EG","IL","PS"],
  GSP: ["IN","VN","PH","ID","TH","PK","BD","LK","KH","MM","KE","TZ","GH",
        "SN","NG","ET","MZ","MA","EG","JO","GE","MD","AZ","AM","UZ","KZ"],
};

const inGroup = (country, groupName) => GROUPS[groupName]?.includes(country) ?? false;
const isEU = (country) => inGroup(country, "EU");

// ─── GŁÓWNA FUNKCJA ───────────────────────────────────────────────────────────

/**
 * Zwraca listę dokumentów potrzebnych dla danej trasy
 *
 * @param {string} origin       - kod ISO kraju nadania (np. "PL")
 * @param {string} destination  - kod ISO kraju przeznaczenia (np. "US")
 * @param {string} mode         - "road" | "sea" | "air" | "rail" | "multimodal"
 * @param {string} cargoCategory - "general" | "food_animal" | "food_plant" |
 *                                  "dangerous_goods" | "medicines" | "electronics" |
 *                                  "live_animals" | "organic" | "halal" | "kosher" |
 *                                  "chemicals" | "weapons_dual_use"
 * @param {object} flags        - { woodenPackaging, temporaryExport, transhipment, reExport, transitNonEU }
 *
 * @returns {{ required: string[], conditional: string[], warnings: string[] }}
 *   gdzie każdy string to klucz z documentCatalog
 */
export function getDocuments(origin, destination, mode, cargoCategory = "general", flags = {}) {
  const required = new Set();
  const conditional = new Set();
  const warnings = [];

  // ── WARSTWA 1: TRANSPORT ──────────────────────────────────────────
  switch (mode) {
    case "road":
      required.add("01_CMR");
      required.add("09_Zlecenie");
      required.add("10_POD");
      break;
    case "sea":
      // B/L gdy odbiorca nieznany lub towar negocjowalny; Sea Waybill gdy odbiorca znany
      required.add("05_BL");
      conditional.add("26_SeaWaybill"); // alternatywa dla B/L
      break;
    case "air":
      required.add("11_AWB");
      break;
    case "rail":
      required.add("27_CIM");
      break;
    case "multimodal":
      required.add("28_MTD");
      break;
  }

  // ── WARSTWA 2: HANDLOWE (zawsze) ─────────────────────────────────
  required.add("02_PackingList");
  required.add("03_Invoice");

  // Proforma zawsze przy wysyłce poza EU lub gdy celna
  if (!isEU(origin) || !isEU(destination)) {
    required.add("04_Proforma");
  }

  // ── WARSTWA 3: EKSPORT ───────────────────────────────────────────
  if (isEU(origin) && !isEU(destination)) {
    required.add("07_EAD");

    // EUR.1 gdy cel ma FTA z UE
    if (inGroup(destination, "EU_FTA_PARTNERS")) {
      conditional.add("12_EUR1");
    }
    // EUR-MED dla krajów śródziemnomorskich
    if (inGroup(destination, "EUR_MED")) {
      conditional.add("102_EUR_MED");
    }
    // Certificate of Origin gdy cel poza UE
    conditional.add("06_COO");
  }

  if (inGroup(origin, "UK") && !inGroup(destination, "UK")) {
    required.add("31_UK_Export");
  }

  if (inGroup(origin, "US") && !inGroup(destination, "US")) {
    required.add("30_USA_AES");
  }

  if (inGroup(origin, "CA") && !inGroup(destination, "CA")) {
    required.add("33_Canada_Export");
  }

  if (inGroup(origin, "AU") && !inGroup(destination, "AU")) {
    required.add("32_Australia_Export");
  }

  if (inGroup(origin, "CN") && !inGroup(destination, "CN")) {
    required.add("23_China_Export");
    required.add("06_COO");
  }

  if (inGroup(origin, "JP") && !inGroup(destination, "JP")) {
    required.add("34_Japan_Export");
  }

  if (inGroup(origin, "KR") && !inGroup(destination, "KR")) {
    required.add("35_Korea_Export");
  }

  if (inGroup(origin, "BR") && !inGroup(destination, "BR")) {
    required.add("36_Brazil_Export");
  }

  if (inGroup(origin, "IN") && !inGroup(destination, "IN")) {
    required.add("37_India_Export");
  }

  if (inGroup(origin, "GCC")) {
    if (!inGroup(destination, "GCC")) {
      if (origin === "SA") required.add("39_Saudi_Export");
      if (origin === "AE") required.add("38_UAE_Export");
    }
  }

  if (inGroup(origin, "TR") && !inGroup(destination, "TR")) required.add("40_Turkey_Export");
  if (inGroup(origin, "ZA") && !inGroup(destination, "ZA")) required.add("41_SouthAfrica_Export");
  if (inGroup(origin, "AR") && !inGroup(destination, "AR")) required.add("97_Argentina_Export");
  if (inGroup(origin, "CL") && !inGroup(destination, "CL")) required.add("98_Chile_Export");
  if (inGroup(origin, "PK") && !inGroup(destination, "PK")) required.add("99_Pakistan_Export");
  if (inGroup(origin, "PH") && !inGroup(destination, "PH")) required.add("100_Philippines_Export");
  // TODO: VN, ID, TH, MY, NG, KE, MA — brak pliku PDF szablonu eksportowego

  // ── WARSTWA 4: IMPORT ────────────────────────────────────────────
  // 07_EAD to deklaracja eksportowa z UE — NIE dodajemy jej tutaj.
  // Import do UE (CN→PL, US→DE itp.) obsługuje importer przez AIS;
  // gdy pojawi się szablon EU Import Declaration, dodaj nowy klucz.

  if (inGroup(destination, "UK")) {
    required.add("21_UK_Import");
  }

  if (inGroup(destination, "US")) {
    required.add("08_ISF");
    required.add("20_CBP7501");
    if (mode === "sea") {
      warnings.push("ISF 10+2 musi być złożony minimum 24h przed załadunkiem na statek w porcie wyjścia.");
    }
  }

  if (inGroup(destination, "CN")) {
    required.add("22_China_Import");
  }

  if (inGroup(destination, "CA")) {
    required.add("42_Canada_Import");
  }

  if (inGroup(destination, "AU")) {
    required.add("43_Australia_Import");
  }

  if (inGroup(destination, "IN")) {
    required.add("44_India_Import");
  }

  if (inGroup(destination, "JP")) {
    required.add("45_Japan_Import");
  }

  if (inGroup(destination, "KR")) {
    required.add("46_Korea_Import");
  }

  if (inGroup(destination, "BR")) {
    required.add("47_Brazil_Import");
    warnings.push("Licencja importowa (LI) Brazylia może być wymagana przed wysyłką — sprawdź z importerem.");
  }

  if (destination === "SA") required.add("50_Saudi_Import");
  if (destination === "AE") required.add("51_UAE_Import");
  if (destination === "NG") {
    required.add("53_Nigeria_Import");
    warnings.push("Form M (Nigeria) musi być uzyskany przez importera PRZED wysyłką.");
  }
  if (destination === "MA") required.add("83_Morocco_Import");
  if (destination === "DZ") required.add("84_Algeria_Import");
  if (destination === "TN") required.add("85_Tunisia_Import");

  // Pozostałe kraje z dedykowanym plikiem deklaracji importowej
  if (destination === "MX") required.add("48_Mexico_Import");
  if (destination === "TR") required.add("51_Turkey_Import");
  if (destination === "ZA") required.add("52_SouthAfrica_Import");
  if (destination === "KE") required.add("54_Kenya_Import");
  if (destination === "EG") required.add("55_Egypt_Import");
  if (destination === "SG") required.add("56_Singapore_Import");
  if (destination === "MY") required.add("57_Malaysia_Import");
  if (destination === "ID") required.add("58_Indonesia_Import");
  if (destination === "VN") required.add("59_Vietnam_Import");
  if (destination === "TH") required.add("60_Thailand_Import");
  if (destination === "AR") required.add("72_Argentina_Import");
  if (destination === "CL") required.add("73_Chile_Import");
  if (destination === "CO") required.add("74_Colombia_Import");
  if (destination === "PE") required.add("75_Peru_Import");
  if (destination === "EC") required.add("76_Ecuador_Import");
  if (destination === "PK") required.add("77_Pakistan_Import");
  if (destination === "BD") required.add("78_Bangladesh_Import");
  if (destination === "LK") required.add("79_SriLanka_Import");
  if (destination === "PH") required.add("80_Philippines_Import");
  if (destination === "MM") required.add("81_Myanmar_Import");
  if (destination === "KH") required.add("82_Cambodia_Import");
  if (destination === "GH") required.add("86_Ghana_Import");
  if (destination === "SN") required.add("87_Senegal_Import");
  if (destination === "TZ") required.add("88_Tanzania_Import");
  if (destination === "ET") required.add("89_Ethiopia_Import");
  if (destination === "JO") required.add("90_Jordan_Import");
  if (destination === "IL") required.add("91_Israel_Import");
  if (destination === "IQ") required.add("92_Iraq_Import");
  if (destination === "LB") required.add("93_Lebanon_Import");
  if (destination === "KZ") required.add("94_Kazakhstan_Import");
  if (destination === "UZ") required.add("95_Uzbekistan_Import");
  if (destination === "GE") required.add("96_Georgia_Import");
  if (destination === "NZ") required.add("43_NewZealand_Import");

  // GSP — Form A wystawiany przez kraj rozwijający się przy eksporcie DO UE
  if (!isEU(origin) && isEU(destination) && inGroup(origin, "GSP")) {
    conditional.add("103_Form_A");
  }

  // ── WARSTWA 5: KATEGORIA TOWARU ──────────────────────────────────
  switch (cargoCategory) {
    case "food_animal":
      required.add("17_Weterynaryjne");
      if (inGroup(destination, "HALAL_REQUIRED")) {
        required.add("18_Halal");
      }
      if (inGroup(destination, "US")) {
        required.add("105_FDA"); // FDA Prior Notice
      }
      break;

    case "food_plant":
      required.add("16_Fitosanitarne");
      if (inGroup(destination, "HALAL_REQUIRED")) {
        conditional.add("18_Halal");
      }
      if (inGroup(destination, "US")) {
        conditional.add("105_FDA");
      }
      break;

    case "dangerous_goods":
      required.add("29_DG_Manifest");
      required.add("69_MSDS");
      if (mode === "road") {
        required.add("118_ADR");
        conditional.add("14_ADR"); // starsza deklaracja ADR per-przesyłka
      }
      if (mode === "sea") {
        required.add("15_IMDG");
      }
      if (mode === "air") {
        required.add("64_IATA_DGR");
        required.add("109_IATA_Packing");
      }
      if (mode === "rail") {
        // Brak szablonu RID — TODO: dodać plik RID gdy będzie dostępny
        warnings.push("Transport kolejowy towarów niebezpiecznych podlega Regulaminowi RID. Wymagane: DG Manifest + MSDS + dokumenty RID od przewoźnika kolejowego.");
      }
      break;

    case "medicines":
      required.add("71_FreeSale");
      required.add("69_MSDS");
      break;

    case "electronics":
      if (isEU(destination)) {
        required.add("106_CE");
      } else {
        conditional.add("106_CE");
      }
      break;

    case "live_animals":
      required.add("101_CITES");
      required.add("17_Weterynaryjne");
      break;

    case "organic":
      required.add("111_Organic");
      break;

    case "halal":
      required.add("18_Halal");
      break;

    case "kosher":
      required.add("112_Kosher");
      break;

    case "weapons_dual_use":
      required.add("24_DualUse");
      required.add("113_EUC");
      warnings.push("Licencja Dual-Use (rozp. UE 2021/821) musi być uzyskana PRZED wysyłką.");
      break;

    case "chemicals":
      required.add("69_MSDS");
      break;
  }

  // ── WARSTWA 6: REGUŁY SPECJALNE ─────────────────────────────────
  // Drewniane opakowania
  if (flags.woodenPackaging && inGroup(destination, "ISPM15_REQUIRED")) {
    required.add("19_ISPM15");
  }

  // Eksport tymczasowy
  if (flags.temporaryExport) {
    required.add("13_ATA");
  }

  // Blacklist Certificate (kraje GCC i bliskowschodnie) — warunkowy, zależy od towaru/podmiotu
  if (inGroup(destination, "BLACKLIST_CERT")) {
    conditional.add("70_Blacklist");
    warnings.push("Blacklist Certificate może być wymagany przez urząd celny kraju docelowego. Skonsultuj z lokalnym agentem celnym.");
    warnings.push("Faktura i CoO wymagają legalizacji przez KIG i ambasadę — planuj 7–10 dni roboczych.");
  }

  // PSI — inspekcja przedwysyłkowa
  if (inGroup(destination, "PSI_REQUIRED")) {
    required.add("68_PSI");
    warnings.push("PSI (inspekcja przedwysyłkowa) wymagana — planuj 3–5 dni roboczych.");
  }

  // T2L — dowód unijnego statusu przy morskim EU→EU
  if (mode === "sea" && isEU(origin) && isEU(destination)) {
    required.add("104_T2L");
    warnings.push("T2L wymagany przy morskim transporcie wewnątrz UE — bez niego towar traktowany jako import spoza UE w porcie docelowym.");
  }

  // T2L — EU→EU tranzytem przez non-EU (np. IE→PL przez UK)
  if (isEU(origin) && isEU(destination) && flags.transitNonEU) {
    conditional.add("104_T2L");
  }

  // Fumigation — dla food_plant lub drewniane opakowania do krajów ISPM15
  if ((cargoCategory === "food_plant" || flags.woodenPackaging) && inGroup(destination, "ISPM15_REQUIRED")) {
    conditional.add("65_Fumigation");
  }

  // TIR Carnet i Transit Declaration — transport drogowy przez non-EU
  if (mode === "road" && flags.transitNonEU) {
    required.add("117_TIR");
    required.add("116_Transit");
  }

  // Re-eksport
  if (flags.reExport) {
    required.add("114_ReExport");
  }

  // Przeładunek morski
  if (flags.transhipment && mode === "sea") {
    required.add("115_Transhipment");
  }

  // ── WARSTWA 7: SANKCJE I OSTRZEŻENIA KRYTYCZNE ──────────────────

  // Sankcje UE — Rosja i Białoruś (Rozp. 833/2014 i 765/2006)
  if (destination === "RU" || destination === "BY") {
    warnings.push("UWAGA SANKCJE: Trasa do Rosji/Białorusi podlega sankcjom UE. Sprawdź listę towarów zakazanych: Rozporządzenie UE 833/2014 (Rosja) i 765/2006 (Białoruś) przed wysyłką. Wiele kategorii towarów jest zakazanych lub wymaga specjalnego zezwolenia eksportowego.");
  }
  if (origin === "RU" || origin === "BY") {
    warnings.push("UWAGA SANKCJE: Import z Rosji/Białorusi do UE podlega sankcjom UE. Sprawdź listę zakazanych importów przed zawarciem kontraktu.");
  }

  // CHED-P/TRACES — pre-notyfikacja przy imporcie żywności do UE
  if (isEU(destination) && !isEU(origin) && (cargoCategory === "food_animal" || cargoCategory === "food_plant")) {
    warnings.push("Import żywności do UE wymaga pre-notyfikacji CHED-P w systemie TRACES NT minimum 24h przed przybyciem do portu. Obowiązek spoczywa na importerze UE. Kontrola weterynaryjna na Border Control Post (BCP) jest obowiązkowa — brak CHED-P = zatrzymanie towaru.");
  }

  // ATP — łańcuch chłodniczy dla żywności (Konwencja ATP)
  if (cargoCategory === "food_animal" || cargoCategory === "food_plant") {
    warnings.push("Żywność wymaga zachowania łańcucha chłodniczego: mrożona max −18°C, schłodzona 0–4°C. Transport musi spełniać wymagania Konwencji ATP. Dołącz zapis temperatury z rejestratora danych.");
  }

  // EU-Mercosur iTA (od 01.05.2026) — obie strony handlu
  if ((inGroup(origin, "MERCOSUR") && isEU(destination)) ||
      (isEU(origin) && inGroup(destination, "MERCOSUR"))) {
    warnings.push("Od 01.05.2026 obowiązuje Umowa EU-Mercosur (iTA). Sprawdź wymagania dotyczące nowych certyfikatów pochodzenia — EC Notice 2026/875. Może być wymagany zaktualizowany format COO.");
  }

  // Import do UE — zgłoszenie celne SAD/H1
  if (!isEU(origin) && isEU(destination)) {
    warnings.push("Import do UE wymaga złożenia zgłoszenia celnego (SAD/H1) do wolnego obrotu przez importera lub licencjonowanego agenta celnego w kraju przeznaczenia. Cło i VAT naliczane przy odprawie celnej.");
  }

  // EOG (NO/IS/LI) — poza obszarem celnym UE
  if (inGroup(destination, "EEA")) {
    warnings.push("Norwegia/Islandia/Liechtenstein należą do EOG, ale nie do obszaru celnego UE. EAD wymagana jak przy eksporcie poza UE. Brak ceł dzięki umowie EOG — formalności celne są jednak obowiązkowe.");
  }

  // ── DEDUPLIKACJA: usuń z conditional to co już jest w required ────
  required.forEach(id => conditional.delete(id));

  // ── BUDUJ WYNIK ──────────────────────────────────────────────────
  const buildDocList = (ids) =>
    [...ids].map(id => ({
      id,
      ...documentCatalog[id],
    })).filter(doc => doc.name_pl); // pomiń nieznane id

  return {
    required: buildDocList(required),
    conditional: buildDocList(conditional),
    warnings,
  };
}

// ─── HELPER: czy trasa przekracza granicę celną ───────────────────────────────
export function isCrossCustoms(origin, destination) {
  return !(isEU(origin) && isEU(destination));
}

// ─── HELPER: etykieta grupy dla UI ──────────────────────────────────────────
export function getRouteLabel(origin, destination) {
  if (isEU(origin) && isEU(destination)) return "Wewnątrz UE";
  if (isEU(origin)) return "Eksport z UE";
  if (isEU(destination)) return "Import do UE";
  return "Poza UE";
}
