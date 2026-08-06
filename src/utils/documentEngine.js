// src/utils/documentEngine.js
// Silnik doboru dokumentów transportowych — 7 warstw.
//
// getDocuments(origin, destination, mode, cargoCategory, flags)          → kształt jak dotąd
// getDocuments(..., { includeMetadata: true, referenceDate })            → kształt rozszerzony
//
// Wsteczna zgodność jest twardym wymogiem: BEZ szóstego argumentu wynik jest
// identyczny z tym, co silnik zwracał przed ETAPEM 1 — wpisy mają wyłącznie
// { id, name_pl, name_en, path, available }, a `warnings` to tablica STRINGÓW.
// Metadane doboru (layer/outputMode/issuerType/blocking) i ostrzeżenia jako
// obiekty pojawiają się dopiero przy includeMetadata: true.

import { documentCatalog } from "../data/documentCatalog";

// ─── WARSTWY ────────────────────────────────────────────────────────────────
// Numer warstwy trafia do wyniku jako `layer` — używa go raport rozbieżności
// (docs/silnik_diff.md), żeby dało się powiedzieć, SKĄD wziął się dokument.
export const LAYERS = {
  TRANSPORT: 1,
  COMMERCIAL: 2,
  EXPORT: 3,
  IMPORT: 4,
  CARGO: 5,
  SPECIAL: 6,
  SANCTIONS: 7,
};

// ─── POCHODZENIE PREFERENCYJNE — JEDNO ŹRÓDŁO PRAWDY ────────────────────────
//
// Trzy REŻIMY, które wykluczają się nawzajem. Dobranie złego dokumentu jest tu
// kosztowniejsze niż niedobranie żadnego, bo eksporter płaci cło mimo umowy.
//
//   PEM            — strefa Pan-Euro-Med: dowodem jest EUR.1 (lub EUR-MED)
//   CUSTOMS_UNION  — unia celna: dowodem jest świadectwo statusu (A.TR), NIE EUR.1
//   REX_SELF_CERT  — nowoczesne FTA: oświadczenie o pochodzeniu na fakturze (REX),
//                    NIE EUR.1 i NIE A.TR
//
// Listy pochodzą z komentarzy źródłowych, które już były w tym pliku (EC Taxation
// & Customs Union). CELOWO nie dopisano tu MX ani CL — umowa z Meksykiem nadal
// opiera się o EUR.1, a chilijska zmieniła się niedawno; oba do potwierdzenia
// u źródła przed dodaniem (patrz docs/silnik_diff.md).
export const PREFERENTIAL_ORIGIN_MAP = {
  PEM: ["CH", "NO", "IS", "LI", "EG", "MA", "TN", "JO", "LB", "IL", "DZ", "PS",
        "RS", "MK", "ME", "AL", "BA", "XK", "FO", "UA", "GE", "MD"],
  CUSTOMS_UNION: ["TR", "AD", "SM"],
  REX_SELF_CERT: ["CA", "JP", "VN", "GB", "KR", "SG", "NZ"],
  EUR_MED: ["MA", "DZ", "TN", "JO", "LB", "EG", "IL", "PS"],
};

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
  GSP: ["IN","VN","PH","ID","TH","PK","BD","LK","KH","MM","KE","TZ","GH",
        "SN","NG","ET","MZ","MA","EG","JO","GE","MD","AZ","AM","UZ","KZ"],
  // Common Transit Convention (poza UE) - tranzyt przez nie = deklaracja T1/T2 w NCTS,
  // TIR NIE jest wymagany. Zrodlo: EUR-Lex / EC Taxation & Customs Union, 2026.
  CTC_NON_EU: ["CH","NO","IS","LI","GB","RS","MK","TR","UA","GE","MD","ME"],
  // Reżimy pochodzenia preferencyjnego — aliasy na PREFERENTIAL_ORIGIN_MAP, żeby
  // istniało JEDNO miejsce do edycji listy krajów.
  EUR1_APPLICABLE: PREFERENTIAL_ORIGIN_MAP.PEM,
  EUR_MED: PREFERENTIAL_ORIGIN_MAP.EUR_MED,
  REX_FTA: PREFERENTIAL_ORIGIN_MAP.REX_SELF_CERT,
  CUSTOMS_UNION: PREFERENTIAL_ORIGIN_MAP.CUSTOMS_UNION,

  // Kraje, dla ktorych SAM list przewozowy CIM nie wystarcza - relacja siega
  // strefy SMGS i wlasciwy jest wspolny list CIM/SMGS (134).
  //
  // CELOWO nie jest to lista czlonkow SMGS. PL, LT, LV i EE sa stronami OBU
  // umow, wiec lista czlonkostwa kazalaby wystawiac CIM/SMGS na trasie PL->DE.
  // Tutaj sa wylacznie kraje, ktorych NIE obejmuje COTIF - jesli zaden z nich
  // nie wystepuje w trasie, zostaje zwykly CIM (27).
  // lista wymaga weryfikacji u zrodla (OSJD)
  SMGS_ONLY: ["CN", "KZ", "UZ", "RU", "BY", "MN", "KG", "TJ", "TM", "AZ", "VN", "KP", "IR"],
};

// ─── KATEGORIE TOWARU STEROWANE ID Z KATALOGU, NIE KATEGORIA SILNIKA ────────
//
// Dwanascie z dziewietnastu kategorii w cargoCategories.js mapuje sie na
// engine 'general' (napoje, paliwa, metale, drewno, budowlanka...), wiec rezimy
// akcyzowe, CBAM i EUDR sa z niej NIEODROZNIALNE. Dlatego te reguly czytaja
// `flags.cargoCategoryId` - surowe id kategorii z katalogu, przekazywane obok
// kategorii silnika. Brak flagi = regula nie odpala (wsteczna zgodnosc).
const CBAM_CATEGORY_IDS = ["metals", "construction", "chemicals", "energy"];
const EUDR_CATEGORY_IDS = ["food_plant", "food_animal", "wood"];
const EXCISE_CATEGORY_IDS = ["beverages", "energy"];
const SENT_CATEGORY_IDS = ["energy", "beverages", "medicines"];

const inGroup = (country, groupName) => GROUPS[groupName]?.includes(country) ?? false;
const isEU = (country) => inGroup(country, "EU");

// Kategorie towaru objęte preferencjami rolnymi — przy unii celnej UE-TR to one
// (obok węgla i stali, których katalog kategorii nie rozróżnia) idą na EUR.1,
// a nie na A.TR.
const AGRI_CATEGORIES = ["food_animal", "food_plant", "live_animals", "organic", "halal", "kosher"];

// ─── OSTRZEŻENIA ────────────────────────────────────────────────────────────
// Każde ostrzeżenie ma STABILNY kod — po nim tłumaczy je translateEngineWarning
// (klucz i18n `errors:engineWarnings.<code>`). Treść po polsku zostaje w kodzie
// jako `message`: jest zapisywana w engineResult starych rekordów i służy za
// zapasowe wyjście, gdy klucza tłumaczenia zabraknie.
const WARNING_SEVERITY = {
  warn_sanctions_ru_by_dest: "critical",
  warn_sanctions_ru_by_origin: "critical",
  warn_dual_use_licence: "critical",
  warn_ched_p_traces: "critical",

  warn_isf_24h: "warning",
  warn_brazil_import_licence: "warning",
  warn_nigeria_form_m: "warning",
  warn_atr_turkey: "warning",
  warn_atr_turkey_agri: "warning",
  warn_rex_export: "warning",
  warn_rex_import: "warning",
  warn_gsp_form_a_rex: "warning",
  warn_rid_rail: "warning",
  warn_blacklist_cert: "warning",
  warn_psi_leadtime: "warning",
  warn_t2l_sea_eu: "warning",
  warn_tir_non_ctc: "warning",
  warn_rail_transit_non_eu: "warning",
  warn_mercosur_ita: "warning",

  warn_sent_registration: "warning",
  warn_ens_lodgement: "warning",

  warn_legalisation_kig: "info",
  warn_ctc_transit: "info",
  warn_atp_cold_chain: "info",
  warn_eu_import_sad: "info",
  warn_eea_customs: "info",
  warn_document_not_yet_valid: "info",
  warn_document_expired: "info",
  warn_container_packing_duplicate: "info",
  warn_cbam_annual: "info",
  warn_emcs_arc: "info",
  warn_cim_smgs_route: "info",
};

// Kody WYCOFANE w ETAPIE 2 - zastapil je realny dokument w wyniku doboru.
// Wpisy zostaja w WARNING_SEVERITY i w tlumaczeniach, bo stare rekordy
// w bazie nadal je niosa; silnik przestal je tylko EMITOWAC.
//   warn_eu_import_sad   -> 125_EU_Import_Declaration
//   warn_ched_p_traces   -> 128_CHED_TRACES
//   warn_rid_rail        -> 135_RID_Rail_DG
//   warn_atr_turkey      -> 129_ATR_Certificate
// warn_atr_turkey_agri ZOSTAJE: niesie rozroznienie A.TR vs EUR.1 dla produktow
// rolnych, czego zaden dokument nie zastepuje.

// ─── WARSTWA 1: TRANSPORT — WYDZIELONA FUNKCJA ──────────────────────────────
//
// Dokumenty przewozowe dla JEDNEJ gałęzi. Wydzielona z getDocuments (2026-08-08),
// żeby trasa multimodalna z osobnymi umowami na odcinki (`multimodalContractType
// === "separate"`) mogła wywołać DOKŁADNIE tę samą regułę per zaznaczona gałąź
// (`multimodalLegs`), zamiast pisać drugie, równoległe mapowanie gałąź→dokument.
// Wywoływana raz dla trybu głównego (jak dotąd) albo raz na każdą gałąź z legs[].
function addTransportLayerDocs(mode, flags, { addRequired, addConditional, warn, touchesSmgsOnly }) {
  switch (mode) {
    case "road":
      addRequired("01_CMR", LAYERS.TRANSPORT, "transport_road");
      addRequired("09_Zlecenie", LAYERS.TRANSPORT, "transport_road");
      addRequired("10_POD", LAYERS.TRANSPORT, "transport_road");
      break;
    case "sea":
      // B/L gdy odbiorca nieznany lub towar negocjowalny; Sea Waybill gdy odbiorca znany
      addRequired("05_BL", LAYERS.TRANSPORT, "transport_sea");
      addConditional("26_SeaWaybill", LAYERS.TRANSPORT, "transport_sea_named_consignee");
      break;
    case "air":
      addRequired("11_AWB", LAYERS.TRANSPORT, "transport_air");
      break;
    case "rail":
      // 27_CIM obejmuje strefe COTIF; gdy trasa siega SMGS, wlasciwy jest
      // wspolny list przewozowy CIM/SMGS zamiast niego (nie obok).
      if (touchesSmgsOnly) {
        addRequired("134_CIM_SMGS", LAYERS.TRANSPORT, "transport_rail_smgs");
        warn(
          "warn_cim_smgs_route",
          "Trasa siega strefy SMGS, wiec zamiast listu CIM wystawia sie wspolny list przewozowy " +
          "CIM/SMGS. Jeden dokument obejmuje odcinek COTIF i odcinek SMGS, bez przepisywania na granicy rezimow."
        );
      } else {
        addRequired("27_CIM", LAYERS.TRANSPORT, "transport_rail");
      }
      break;
    case "multimodal":
      addRequired("28_MTD", LAYERS.TRANSPORT, "transport_multimodal");
      break;
  }

  // VGM - deklaracja zweryfikowanej masy brutto. SOLAS obejmuje KAZDY zapakowany
  // kontener, ale nie ladunek drobnicowy (break-bulk), stad flaga zamiast samego
  // trybu morskiego. Flage wylicza buildEngineFlags z pol kontenerowych migawki.
  if (flags.containerized) {
    if (mode === "sea") {
      addRequired("119_VGM_SOLAS", LAYERS.TRANSPORT, "transport_sea_containerized");
    } else if (mode === "multimodal") {
      // Silnik nie zna etapow trasy multimodalnej, wiec nie wie, czy w ogole
      // jest etap morski - ten sam kompromis co przy ISF.
      addConditional("119_VGM_SOLAS", LAYERS.TRANSPORT, "transport_multimodal_sea_leg");
    }
  }

  // MAWB (11_AWB) wystawia przewoznik lotniczy na cala przesylke; przy
  // konsolidacji spedytor wystawia DODATKOWO HAWB dla kazdego nadawcy.
  // Dokumenty lotnicze trzymamy przy mode === 'air': trasa multimodalna
  // nie musi miec etapu lotniczego (bywa morze + droga).
  if (flags.consolidated) {
    if (mode === "air") {
      addRequired("137_HAWB", LAYERS.TRANSPORT, "transport_air_consolidated");
    } else if (mode === "multimodal") {
      addConditional("137_HAWB", LAYERS.TRANSPORT, "transport_multimodal_air_leg");
    }
  }

  // Wykaz wagonow - zalacznik do listu przewozowego przy przesylce grupowej.
  // Warunkowany flaga, wiec NIE doklada sie do kazdej trasy kolejowej.
  if ((mode === "rail" || mode === "multimodal") && flags.groupConsignment) {
    addConditional("136_Wagon_List", LAYERS.TRANSPORT, "transport_rail_group_consignment");
  }
}

// ─── GŁÓWNA FUNKCJA ───────────────────────────────────────────────────────────

/**
 * Zwraca listę dokumentów potrzebnych dla danej trasy.
 *
 * @param {string} origin        - kod ISO kraju nadania (np. "PL")
 * @param {string} destination   - kod ISO kraju przeznaczenia (np. "US")
 * @param {string} mode          - "road" | "sea" | "air" | "rail" | "multimodal"
 * @param {string} cargoCategory - "general" | "food_animal" | "food_plant" |
 *                                 "dangerous_goods" | "medicines" | "electronics" |
 *                                 "live_animals" | "organic" | "halal" | "kosher" |
 *                                 "chemicals" | "weapons_dual_use"
 * @param {object} flags         - { adr, multimodal, woodenPackaging, temporaryExport,
 *                                   transhipment, reExport, transitNonEU, transitCountries }
 *   Każda flaga formularza, która wpływa na dobór, MUSI być tutaj — reguła nie może
 *   mieszkać w warstwie adaptera migawki, bo wtedy kreator i „Puste szablony"
 *   policzyłyby inaczej. Pilnuje tego test „audyt flag" w documentEngine.matrix.test.js.
 * @param {object} [options]     - { referenceDate = new Date(), includeMetadata = false }
 *
 * @returns {object}
 *   includeMetadata: false (domyślnie)
 *     { required: Doc[], conditional: Doc[], warnings: string[] }
 *     Doc = { id, name_pl, name_en, path, available }
 *
 *   includeMetadata: true
 *     { required: MetaDoc[], conditional: MetaDoc[], blanks: MetaDoc[], warnings: Warning[] }
 *     MetaDoc = Doc + { layer, reason|condition, outputMode, issuerType, blocking }
 *     Warning = { code, severity, message, params }
 *     Dokumenty o outputMode 'blank_only' są PRZENOSZONE z required/conditional
 *     do `blanks` — platforma ich nie wypełnia, więc nie są naszym produktem.
 */
export function getDocuments(origin, destination, mode, cargoCategory = "general", flags = {}, options = {}) {
  const { referenceDate = new Date(), includeMetadata = false } = options;

  // id -> { layer, reason } / { layer, condition }. Pierwszy wpis wygrywa, żeby
  // dokument dodany w warstwie 1 nie „przeskoczył" do warstwy 5 przy powtórce.
  const required = new Map();
  const conditional = new Map();
  const warnings = [];

  const addRequired = (id, layer, reason) => {
    if (!required.has(id)) required.set(id, { layer, reason });
  };
  const addConditional = (id, layer, condition) => {
    if (!conditional.has(id)) conditional.set(id, { layer, condition });
  };
  const warn = (code, message, params = {}) => {
    warnings.push({ code, severity: WARNING_SEVERITY[code] || "warning", message, params });
  };

  // Checkbox ADR (krok „Towar", gałąź drogowa) deklaruje towar niebezpieczny
  // niezależnie od wybranej kategorii celnej — użytkownik może wybrać „Napoje"
  // i zaznaczyć ADR dla spirytusu. Reguła MUSI żyć tutaj, nie w warstwie
  // adaptera migawki: inaczej „Puste szablony" i kreator liczyłyby inaczej
  // (dokładnie ta pułapka, przez którą checkbox multimodalny wypadł z silnika).
  const effectiveCategory =
    flags.adr && cargoCategory === "general" ? "dangerous_goods" : cargoCategory;

  // Normalizacja krajow tranzytowych (nowe zrodlo prawdy) + wstecznosc
  const transitCountries = Array.isArray(flags.transitCountries) ? flags.transitCountries : [];
  const tc = classifyTransit(transitCountries);
  // transitNonEU: jezeli podano kraje tranzytowe, wyliczamy automatycznie;
  // w przeciwnym razie honorujemy stary, reczny flag (wstecznosc).
  const transitNonEU = transitCountries.length > 0 ? tc.transitNonEU : !!flags.transitNonEU;

  // Trasa siega strefy SMGS, jesli kraj docelowy ALBO ktorykolwiek tranzytowy
  // jest poza COTIF. Kraj nadania celowo pominiety: przesylka z Chin do Polski
  // i z Polski do Chin potrzebuje tego samego listu przewozowego.
  const touchesSmgsOnly =
    inGroup(destination, "SMGS_ONLY") ||
    transitCountries.some((c) => inGroup(c, "SMGS_ONLY")) ||
    inGroup(origin, "SMGS_ONLY");

  // ── WARSTWA 1: TRANSPORT ──────────────────────────────────────────
  const layer1Ctx = { addRequired, addConditional, warn, touchesSmgsOnly };

  // Multimodal z OSOBNYMI umowami na odcinki (krok „Trasa" → pytanie o strukturę
  // umowy, wybór B): dokument właściwy KAŻDEJ zaznaczonej gałęzi, bez MTD.
  // `mode` na tym poziomie to nadal "multimodal" (transport gałęzi głównej) —
  // dopiero flagi z legs[] różnicują zachowanie, więc reguła backward-compat
  // niżej (flags.multimodal && mode !== "multimodal") się tu NIE odpala.
  if (mode === "multimodal" && flags.multimodalContractType === "separate") {
    const legModes = Array.isArray(flags.multimodalLegs) ? flags.multimodalLegs : [];
    for (const legMode of legModes) {
      addTransportLayerDocs(legMode, flags, layer1Ctx);
    }
  } else {
    addTransportLayerDocs(mode, flags, layer1Ctx);
  }

  // NIEWPIETE CELOWO - decyzja z 2026-08-04, nie przeoczenie:
  //   120_Booking_Confirmation, 121_Cargo_Manifest_Sea (morskie)
  //   138_SLI_Air, 139_Consignor_Security_Decl, 140_Air_Cargo_Manifest (lotnicze)
  //
  // To dokumenty OPERACYJNE przewoznika i agenta, a nie zestaw kompletowany
  // przez spedytora. Kazdy dokladalby sie do KAZDEJ trasy swojej galezi, a przy
  // 91 pozycjach blank_only w katalogu problemem jest nadmiar, nie niedobor.
  // Pozostaja osiagalne przez wyszukiwarke szablonow i „Puste szablony".
  //
  // Warunek powrotu: 139_Consignor_Security_Decl warto wpiac przy pierwszym
  // realnym uzytkowniku lotniczym - deklaracja bezpieczenstwa jest wymogiem
  // rozporzadzenia, nie wygoda. Pelne uzasadnienie: docs/silnik_diff.md.

  // Przesyłka jedzie JEDNĄ gałęzią, ale jest częścią łańcucha multimodalnego
  // (checkbox „Transport multimodalny" w kroku „Trasa"). Dokument MTD dochodzi
  // wtedy OBOK listu przewozowego tej gałęzi — CMR i MTD, nie CMR albo MTD.
  //
  // Reguła istniała wcześniej wyłącznie w rejestrze kreatora
  // (`required: ({multimodal}) => !!multimodal`) i nie miała odpowiednika
  // w silniku. Bez niej zestawy zapisane z zaznaczonym checkboxem przestałyby
  // się pobierać — wykryte na 7 realnych rekordach w bazie.
  if (flags.multimodal && mode !== "multimodal") {
    addRequired("28_MTD", LAYERS.TRANSPORT, "transport_part_of_multimodal");
  }

  // ── WARSTWA 2: HANDLOWE (zawsze) ─────────────────────────────────
  addRequired("02_PackingList", LAYERS.COMMERCIAL, "commercial_always");
  addRequired("03_Invoice", LAYERS.COMMERCIAL, "commercial_always");

  // Proforma zawsze przy wysyłce poza EU lub gdy celna
  if (!isEU(origin) || !isEU(destination)) {
    addRequired("04_Proforma", LAYERS.COMMERCIAL, "commercial_cross_customs");
  }

  // ── WARSTWA 3: EKSPORT ───────────────────────────────────────────
  if (isEU(origin) && !isEU(destination)) {
    addRequired("07_EAD", LAYERS.EXPORT, "export_from_eu");

    // Certificate of Origin - zawsze sensowny jako warunkowy przy eksporcie poza UE
    addConditional("06_COO", LAYERS.EXPORT, "export_origin_proof");

    // EUR.1 / EUR-MED - tylko dla partnerow, ktorych umowa nadal je przewiduje (strefa PEM itd.)
    if (inGroup(destination, "EUR1_APPLICABLE")) {
      addConditional("12_EUR1", LAYERS.EXPORT, "preferential_origin_pem");
    }
    if (inGroup(destination, "EUR_MED")) {
      addConditional("102_EUR_MED", LAYERS.EXPORT, "preferential_origin_eurmed");
    }

    // REX / deklaracja pochodzenia na fakturze - nowoczesne FTA (CETA, Japonia, Wietnam, UK, Korea...)
    // Tu NIE wystawia sie EUR.1. Od ETAPU 2 obok ostrzezenia idzie realny
    // dokument z trescia oswiadczenia do przeniesienia na fakture.
    if (inGroup(destination, "REX_FTA")) {
      addConditional("131_REX_Statement_Origin", LAYERS.EXPORT, "preferential_origin_rex");
      warn(
        "warn_rex_export",
        "Eksport do " + destination + ": preferencyjne pochodzenie deklaruje sie na fakturze " +
        "(system REX / deklaracja pochodzenia), a nie przez EUR.1. Do 6000 EUR moze ja wystawic " +
        "kazdy eksporter; powyzej - tylko zarejestrowany/upowazniony eksporter (REX).",
        { country: destination }
      );
    }

    // Deklaracja dostawcy - dowod statusu pochodzenia w lancuchu dostaw,
    // podstawa do pozniejszego wystawienia EUR.1, A.TR albo oswiadczenia REX.
    // Zawezona do kierunkow objetych PREFERENTIAL_ORIGIN_MAP: bez preferencji
    // celnej ten dokument niczego nie zmienia, a doklada pozycje do listy.
    const hasPreferentialRegime =
      inGroup(destination, "EUR1_APPLICABLE") ||
      inGroup(destination, "REX_FTA") ||
      inGroup(destination, "CUSTOMS_UNION");
    if (hasPreferentialRegime) {
      addConditional("130_Supplier_Declaration", LAYERS.EXPORT, "supplier_origin_evidence");
    }

    // Unia celna UE-TR. Dla towarow przemyslowych w wolnym obrocie wlasciwe jest
    // swiadectwo A.TR (brak szablonu -> samo ostrzezenie). Produkty rolne oraz
    // wegiel i stal (EWWiS) ida jednak na EUR.1 — dlatego rozgalezienie po kategorii.
    if (destination === "TR") {
      if (AGRI_CATEGORIES.includes(effectiveCategory)) {
        addConditional("12_EUR1", LAYERS.EXPORT, "preferential_origin_customs_union_agri");
        warn(
          "warn_atr_turkey_agri",
          "Eksport do Turcji (unia celna UE-TR): dla produktow rolnych preferencje potwierdza " +
          "EUR.1, a nie A.TR. Swiadectwo A.TR dotyczy towarow przemyslowych w wolnym obrocie.",
          {}
        );
      } else {
        // ETAP 2: szablon A.TR juz istnieje, wiec zamiast ostrzezenia
        // (warn_atr_turkey) dokladamy realny dokument.
        addRequired("129_ATR_Certificate", LAYERS.EXPORT, "customs_union_free_circulation");
      }
    }
  }

  if (inGroup(origin, "UK") && !inGroup(destination, "UK")) {
    addRequired("31_UK_Export", LAYERS.EXPORT, "export_from_uk");
  }

  if (inGroup(origin, "US") && !inGroup(destination, "US")) {
    addRequired("30_USA_AES", LAYERS.EXPORT, "export_from_us");
  }

  if (inGroup(origin, "CA") && !inGroup(destination, "CA")) {
    addRequired("33_Canada_Export", LAYERS.EXPORT, "export_from_ca");
  }

  if (inGroup(origin, "AU") && !inGroup(destination, "AU")) {
    addRequired("32_Australia_Export", LAYERS.EXPORT, "export_from_au");
  }

  if (inGroup(origin, "CN") && !inGroup(destination, "CN")) {
    addRequired("23_China_Export", LAYERS.EXPORT, "export_from_cn");
    addRequired("06_COO", LAYERS.EXPORT, "export_from_cn");
  }

  if (inGroup(origin, "JP") && !inGroup(destination, "JP")) {
    addRequired("34_Japan_Export", LAYERS.EXPORT, "export_from_jp");
  }

  if (inGroup(origin, "KR") && !inGroup(destination, "KR")) {
    addRequired("35_Korea_Export", LAYERS.EXPORT, "export_from_kr");
  }

  if (inGroup(origin, "BR") && !inGroup(destination, "BR")) {
    addRequired("36_Brazil_Export", LAYERS.EXPORT, "export_from_br");
  }

  if (inGroup(origin, "IN") && !inGroup(destination, "IN")) {
    addRequired("37_India_Export", LAYERS.EXPORT, "export_from_in");
  }

  if (inGroup(origin, "GCC")) {
    if (!inGroup(destination, "GCC")) {
      if (origin === "SA") addRequired("39_Saudi_Export", LAYERS.EXPORT, "export_from_sa");
      if (origin === "AE") addRequired("38_UAE_Export", LAYERS.EXPORT, "export_from_ae");
    }
  }

  if (inGroup(origin, "TR") && !inGroup(destination, "TR")) addRequired("40_Turkey_Export", LAYERS.EXPORT, "export_from_tr");
  if (inGroup(origin, "ZA") && !inGroup(destination, "ZA")) addRequired("41_SouthAfrica_Export", LAYERS.EXPORT, "export_from_za");
  if (inGroup(origin, "AR") && !inGroup(destination, "AR")) addRequired("97_Argentina_Export", LAYERS.EXPORT, "export_from_ar");
  if (inGroup(origin, "CL") && !inGroup(destination, "CL")) addRequired("98_Chile_Export", LAYERS.EXPORT, "export_from_cl");
  if (inGroup(origin, "PK") && !inGroup(destination, "PK")) addRequired("99_Pakistan_Export", LAYERS.EXPORT, "export_from_pk");
  if (inGroup(origin, "PH") && !inGroup(destination, "PH")) addRequired("100_Philippines_Export", LAYERS.EXPORT, "export_from_ph");
  // TODO: VN, ID, TH, MY, NG, KE, MA — brak pliku PDF szablonu eksportowego

  // ── WARSTWA 4: IMPORT ────────────────────────────────────────────
  // 07_EAD to deklaracja eksportowa z UE — NIE dodajemy jej tutaj.

  // Wprowadzenie towaru na obszar celny UE. ETAP 2 zastapil tu ostrzezenia
  // (warn_eu_import_sad, warn_ched_p_traces) realnymi dokumentami.
  if (!isEU(origin) && isEU(destination)) {
    addRequired("124_ENS_ICS2", LAYERS.IMPORT, "entry_to_eu");
    addRequired("125_EU_Import_Declaration", LAYERS.IMPORT, "import_to_eu_free_circulation");
    warn(
      "warn_ens_lodgement",
      "Deklaracje skrocona przywozowa (ENS) sklada PRZEWOZNIK w systemie ICS2 PRZED przybyciem towaru. " +
      "Termin zalezy od galezi transportu, a brak ENS zatrzymuje przesylke na granicy."
    );

    // CBAM - karta danych emisyjnych od dostawcy. Warunkowa, bo katalog kategorii
    // nie rozroznia szesciu grup objetych rozporzadzeniem z dokladnoscia do towaru.
    if (CBAM_CATEGORY_IDS.includes(flags.cargoCategoryId)) {
      addConditional("126_CBAM_Data_Sheet", LAYERS.IMPORT, "import_cbam_scope");
      warn(
        "warn_cbam_annual",
        "CBAM nie jest zgloszeniem skladanym przy przesylce - importer rozlicza sie ROCZNIE. " +
        "Zakres: cement, zelazo i stal, aluminium, nawozy, energia elektryczna, wodor. " +
        "Prog zwolnienia to 50 ton towarow rocznie na importera."
      );
    }

    // EUDR - dokument obowiazkowy dla towarow w zakresie rozporzadzenia.
    // Bramka czasowa (validFrom w katalogu) przeniesie go do ostrzezen,
    // dopoki obowiazek nie wejdzie w zycie.
    if (EUDR_CATEGORY_IDS.includes(flags.cargoCategoryId)) {
      addRequired("127_EUDR_DDS", LAYERS.IMPORT, "import_eudr_scope");
    }

    // CHED - wspolny zdrowotny dokument wejscia. Wystawia go organ na granicznym
    // punkcie kontroli, wiec trafia do sekcji "do wypelnienia recznie".
    if (["food_animal", "food_plant", "live_animals"].includes(effectiveCategory)) {
      addRequired("128_CHED_TRACES", LAYERS.IMPORT, "import_eu_border_control");
    }

    // Delivery Order - zlecenie wydania towaru z terminalu w porcie przeznaczenia.
    // WYLACZNIE przy przywozie morskim: przy wywozie z UE port docelowy lezy poza
    // Unia i dokument wystawia tamtejszy agent, wiec dla naszego uzytkownika
    // nie ma zastosowania.
    if (mode === "sea") {
      addConditional("122_Delivery_Order", LAYERS.IMPORT, "import_eu_sea_release");
    }
  }

  if (inGroup(destination, "UK")) {
    addRequired("21_UK_Import", LAYERS.IMPORT, "import_to_uk");
  }

  if (inGroup(destination, "US")) {
    // ISF 10+2 obejmuje WYŁĄCZNIE ładunek przypływający do USA drogą morską
    // (19 CFR 149). Fracht lotniczy podlega osobnemu programowi (ACAS), a droga
    // i kolej z Kanady/Meksyku mają własne procedury — dokładanie tam ISF było
    // błędem (wyłapane testem strukturalnym transportModes).
    if (mode === "sea") {
      addRequired("08_ISF", LAYERS.IMPORT, "import_to_us_sea");
      warn("warn_isf_24h", "ISF 10+2 musi być złożony minimum 24h przed załadunkiem na statek w porcie wyjścia.");
    } else if (mode === "multimodal") {
      // Przewóz multimodalny do USA prawie zawsze ma etap morski, ale silnik nie
      // zna etapów — stąd warunkowo, nie obowiązkowo.
      addConditional("08_ISF", LAYERS.IMPORT, "import_to_us_multimodal_sea_leg");
      warn("warn_isf_24h", "ISF 10+2 musi być złożony minimum 24h przed załadunkiem na statek w porcie wyjścia.");
    }
    addRequired("20_CBP7501", LAYERS.IMPORT, "import_to_us");
  }

  if (inGroup(destination, "CN")) {
    addRequired("22_China_Import", LAYERS.IMPORT, "import_to_cn");
  }

  if (inGroup(destination, "CA")) {
    addRequired("42_Canada_Import", LAYERS.IMPORT, "import_to_ca");
  }

  if (inGroup(destination, "AU")) {
    addRequired("43_Australia_Import", LAYERS.IMPORT, "import_to_au");
  }

  if (inGroup(destination, "IN")) {
    addRequired("44_India_Import", LAYERS.IMPORT, "import_to_in");
  }

  if (inGroup(destination, "JP")) {
    addRequired("45_Japan_Import", LAYERS.IMPORT, "import_to_jp");
  }

  if (inGroup(destination, "KR")) {
    addRequired("46_Korea_Import", LAYERS.IMPORT, "import_to_kr");
  }

  if (inGroup(destination, "BR")) {
    addRequired("47_Brazil_Import", LAYERS.IMPORT, "import_to_br");
    warn("warn_brazil_import_licence", "Licencja importowa (LI) Brazylia może być wymagana przed wysyłką, sprawdź z importerem.");
  }

  // Kraje z dedykowanym plikiem deklaracji importowej — jedna mapa zamiast łańcucha ifów.
  const IMPORT_BY_COUNTRY = {
    SA: "50_Saudi_Import", AE: "49_UAE_Import", NG: "53_Nigeria_Import",
    MA: "83_Morocco_Import", DZ: "84_Algeria_Import", TN: "85_Tunisia_Import",
    MX: "48_Mexico_Import", TR: "51_Turkey_Import", ZA: "52_SouthAfrica_Import",
    KE: "54_Kenya_Import", EG: "55_Egypt_Import", SG: "56_Singapore_Import",
    MY: "57_Malaysia_Import", ID: "58_Indonesia_Import", VN: "59_Vietnam_Import",
    TH: "60_Thailand_Import", AR: "72_Argentina_Import", CL: "73_Chile_Import",
    CO: "74_Colombia_Import", PE: "75_Peru_Import", EC: "76_Ecuador_Import",
    PK: "77_Pakistan_Import", BD: "78_Bangladesh_Import", LK: "79_SriLanka_Import",
    PH: "80_Philippines_Import", MM: "81_Myanmar_Import", KH: "82_Cambodia_Import",
    GH: "86_Ghana_Import", SN: "87_Senegal_Import", TZ: "88_Tanzania_Import",
    ET: "89_Ethiopia_Import", JO: "90_Jordan_Import", IL: "91_Israel_Import",
    IQ: "92_Iraq_Import", LB: "93_Lebanon_Import", KZ: "94_Kazakhstan_Import",
    UZ: "95_Uzbekistan_Import", GE: "96_Georgia_Import", NZ: "43_NewZealand_Import",
  };
  if (IMPORT_BY_COUNTRY[destination]) {
    addRequired(IMPORT_BY_COUNTRY[destination], LAYERS.IMPORT, "import_to_" + destination.toLowerCase());
  }
  if (destination === "NG") {
    warn("warn_nigeria_form_m", "Form M (Nigeria) musi być uzyskany przez importera PRZED wysyłką.");
  }

  // GSP — Form A wystawiany przez kraj rozwijajacy sie przy eksporcie DO UE
  if (!isEU(origin) && isEU(destination) && inGroup(origin, "GSP")) {
    addConditional("103_Form_A", LAYERS.IMPORT, "gsp_preferential_origin");
    warn(
      "warn_gsp_form_a_rex",
      "GSP: Form A jest stopniowo zastepowany przez oswiadczenie o pochodzeniu w systemie REX. " +
      "Sprawdz, czy kraj wysylki nadal wystawia Form A, czy juz przeszedl na REX."
    );
  }

  // ── WARSTWA 5: KATEGORIA TOWARU ──────────────────────────────────
  switch (effectiveCategory) {
    case "food_animal":
      addRequired("17_Weterynaryjne", LAYERS.CARGO, "cargo_food_animal");
      if (inGroup(destination, "HALAL_REQUIRED")) {
        addRequired("18_Halal", LAYERS.CARGO, "cargo_halal_market");
      }
      if (inGroup(destination, "US")) {
        addRequired("105_FDA", LAYERS.CARGO, "cargo_food_to_us"); // FDA Prior Notice
      }
      break;

    case "food_plant":
      addRequired("16_Fitosanitarne", LAYERS.CARGO, "cargo_food_plant");
      if (inGroup(destination, "HALAL_REQUIRED")) {
        addConditional("18_Halal", LAYERS.CARGO, "cargo_halal_market");
      }
      if (inGroup(destination, "US")) {
        addConditional("105_FDA", LAYERS.CARGO, "cargo_food_to_us");
      }
      break;

    case "dangerous_goods":
      addRequired("29_DG_Manifest", LAYERS.CARGO, "cargo_dangerous");
      addRequired("69_MSDS", LAYERS.CARGO, "cargo_dangerous");
      if (mode === "road") {
        addRequired("118_ADR", LAYERS.CARGO, "cargo_dangerous_road");
        addConditional("14_ADR", LAYERS.CARGO, "cargo_dangerous_road_legacy"); // starsza deklaracja ADR per-przesyłka
      }
      if (mode === "sea") {
        addRequired("15_IMDG", LAYERS.CARGO, "cargo_dangerous_sea");
        // Swiadectwo pakowania kontenera (IMDG 5.4.2). Ta sama tresc jest
        // sekcja laczonego formularza IMO/FIATA DGD, wiec przy obu dokumentach
        // naraz uzytkownik dostaje ponizej wyjasnienie, ze to wybor formy.
        addRequired("123_Container_Packing_Cert", LAYERS.CARGO, "cargo_dangerous_sea_packing");
        warn(
          "warn_container_packing_duplicate",
          "Jesli korzystasz z laczonego formularza IMO/FIATA DGD, sekcja Container Packing Certificate " +
          "jest juz jego czescia - osobny dokument nie jest wtedy wymagany."
        );
      }
      if (mode === "air") {
        addRequired("64_IATA_DGR", LAYERS.CARGO, "cargo_dangerous_air");
        addRequired("109_IATA_Packing", LAYERS.CARGO, "cargo_dangerous_air");
      }
      if (mode === "rail") {
        // ETAP 2: RID domknal komplet czterech galezi. Wczesniej bylo tu samo
        // ostrzezenie warn_rid_rail, bo szablon nie istnial.
        addRequired("135_RID_Rail_DG", LAYERS.CARGO, "cargo_dangerous_rail");
      }
      break;

    case "medicines":
      addRequired("71_FreeSale", LAYERS.CARGO, "cargo_medicines");
      addRequired("69_MSDS", LAYERS.CARGO, "cargo_medicines");
      break;

    case "electronics":
      if (isEU(destination)) {
        addRequired("106_CE", LAYERS.CARGO, "cargo_electronics_to_eu");
      } else {
        addConditional("106_CE", LAYERS.CARGO, "cargo_electronics");
      }
      break;

    case "live_animals":
      addRequired("101_CITES", LAYERS.CARGO, "cargo_live_animals");
      addRequired("17_Weterynaryjne", LAYERS.CARGO, "cargo_live_animals");
      break;

    case "organic":
      addRequired("111_Organic", LAYERS.CARGO, "cargo_organic");
      break;

    case "halal":
      addRequired("18_Halal", LAYERS.CARGO, "cargo_halal");
      break;

    case "kosher":
      addRequired("112_Kosher", LAYERS.CARGO, "cargo_kosher");
      break;

    case "weapons_dual_use":
      addRequired("24_DualUse", LAYERS.CARGO, "cargo_dual_use");
      addRequired("113_EUC", LAYERS.CARGO, "cargo_dual_use");
      warn("warn_dual_use_licence", "Licencja Dual-Use (rozp. UE 2021/821) musi być uzyskana PRZED wysyłką.");
      break;

    case "chemicals":
      addRequired("69_MSDS", LAYERS.CARGO, "cargo_chemicals");
      break;
  }

  // ── WARSTWA 5b: AKCYZA I TOWARY WRAZLIWE (sterowane id kategorii) ──
  // Te rezimy sa nieodrozninalne z poziomu kategorii SILNIKA (napoje i paliwa
  // mapuja sie na 'general'), wiec czytaja surowe id z katalogu kategorii.

  // EMCS - przemieszczanie wyrobow akcyzowych. Dotyczy obrotu wewnatrzunijnego
  // oraz wywozu z UE, dopoki towar nie opusci obszaru celnego Unii.
  if (EXCISE_CATEGORY_IDS.includes(flags.cargoCategoryId) && isEU(origin)) {
    addConditional("132_EMCS_eAD", LAYERS.CARGO, "excise_movement");
    warn(
      "warn_emcs_arc",
      "Wyroby akcyzowe w procedurze zawieszenia poboru akcyzy przemieszcza sie z dokumentem e-AD " +
      "w systemie EMCS. Numer ARC nadaje system po przyjeciu projektu dokumentu - przewoz nie moze " +
      "ruszyc przed jego uzyskaniem."
    );
  }

  // SENT - polski system monitorowania. Wyzwala go RODZAJ TOWARU, nie trasa:
  // obowiazuje takze w przewozie wylacznie krajowym. Warunek dotyczy Polski
  // w dowolnym miejscu trasy.
  const touchesPL =
    origin === "PL" || destination === "PL" || transitCountries.includes("PL");
  if (
    SENT_CATEGORY_IDS.includes(flags.cargoCategoryId) &&
    touchesPL &&
    (mode === "road" || mode === "rail" || mode === "multimodal")
  ) {
    addRequired("133_SENT", LAYERS.CARGO, "sent_monitored_goods");
    warn(
      "warn_sent_registration",
      "Towar podlega monitorowaniu SENT. Zgloszenie sklada sie w rejestrze na PUESC PRZED rozpoczeciem " +
      "przewozu i dotyczy takze przewozu wylacznie krajowego."
    );
  }

  // ── WARSTWA 6: REGUŁY SPECJALNE ─────────────────────────────────
  // Drewniane opakowania
  if (flags.woodenPackaging && inGroup(destination, "ISPM15_REQUIRED")) {
    addRequired("19_ISPM15", LAYERS.SPECIAL, "wooden_packaging");
  }

  // Eksport tymczasowy
  if (flags.temporaryExport) {
    addRequired("13_ATA", LAYERS.SPECIAL, "temporary_export");
  }

  // Blacklist Certificate (kraje GCC i bliskowschodnie) — warunkowy, zależy od towaru/podmiotu
  if (inGroup(destination, "BLACKLIST_CERT")) {
    addConditional("70_Blacklist", LAYERS.SPECIAL, "blacklist_market");
    warn("warn_blacklist_cert", "Blacklist Certificate może być wymagany przez urząd celny kraju docelowego. Skonsultuj z lokalnym agentem celnym.");
    warn("warn_legalisation_kig", "Faktura i CoO wymagają legalizacji przez KIG i ambasadę, planuj 7-10 dni roboczych.");
  }

  // PSI — inspekcja przedwysyłkowa
  if (inGroup(destination, "PSI_REQUIRED")) {
    addRequired("68_PSI", LAYERS.SPECIAL, "psi_required_market");
    warn("warn_psi_leadtime", "PSI (inspekcja przedwysyłkowa) wymagana, planuj 3-5 dni roboczych.");
  }

  // T2L — dowód unijnego statusu przy morskim EU→EU
  if (mode === "sea" && isEU(origin) && isEU(destination)) {
    addRequired("104_T2L", LAYERS.SPECIAL, "union_status_sea_intra_eu");
    warn("warn_t2l_sea_eu", "T2L wymagany przy morskim transporcie wewnątrz UE, bez niego towar traktowany jako import spoza UE w porcie docelowym.");
  }

  // T2L — EU→EU tranzytem przez non-EU (np. IE→PL przez UK/CH)
  if (isEU(origin) && isEU(destination) && transitNonEU) {
    addConditional("104_T2L", LAYERS.SPECIAL, "union_status_transit_non_eu");
  }

  // Fumigation — dla food_plant lub drewniane opakowania do krajów ISPM15
  if ((effectiveCategory === "food_plant" || flags.woodenPackaging) && inGroup(destination, "ISPM15_REQUIRED")) {
    addConditional("65_Fumigation", LAYERS.SPECIAL, "fumigation_ispm15_market");
  }

  // Tranzyt przez kraj spoza UE — droga i kolej.
  // Procedura tranzytowa (T1/T2 w NCTS) obowiązuje w obu gałęziach. Karnet TIR jest
  // instrumentem WYŁĄCZNIE drogowym (Konwencja TIR wymaga zatwierdzonego pojazdu),
  // więc przy kolei zostaje samo ostrzeżenie o procedurze kraju trzeciego.
  if ((mode === "road" || mode === "rail") && transitNonEU) {
    addRequired("116_Transit", LAYERS.SPECIAL, "transit_non_eu");

    if (mode === "road" && tc.needsTIR) {
      addRequired("117_TIR", LAYERS.SPECIAL, "transit_non_ctc");
      warn(
        "warn_tir_non_ctc",
        "Trasa przez kraj spoza Konwencji o wspolnej procedurze tranzytowej (" +
        tc.nonCTC.join(", ") + "). Wymagany Karnet TIR (transport drogowy, pojazd zatwierdzony TIR, gwarancja celna). " +
        "TIR nie obejmuje alkoholu i wyrobow tytoniowych.",
        { countries: tc.nonCTC.join(", ") }
      );
    } else if (mode === "rail" && tc.needsTIR) {
      warn(
        "warn_rail_transit_non_eu",
        "Trasa kolejowa przez kraj spoza Konwencji o wspolnej procedurze tranzytowej (" +
        tc.nonCTC.join(", ") + "). Karnet TIR nie ma zastosowania w transporcie kolejowym; " +
        "wymagana procedura tranzytowa kraju trzeciego, uzgodniona z przewoznikiem kolejowym.",
        { countries: tc.nonCTC.join(", ") }
      );
    } else if (tc.ctc.length > 0) {
      warn(
        "warn_ctc_transit",
        "Tranzyt przez kraj CTC (" + tc.ctc.join(", ") + "). Wystarcza deklaracja tranzytowa T1/T2 w NCTS " +
        "z zabezpieczeniem celnym; Karnet TIR nie jest konieczny.",
        { countries: tc.ctc.join(", ") }
      );
    }
  }

  // Re-eksport
  if (flags.reExport) {
    addRequired("114_ReExport", LAYERS.SPECIAL, "re_export");
  }

  // Przeładunek morski
  if (flags.transhipment && mode === "sea") {
    addRequired("115_Transhipment", LAYERS.SPECIAL, "transhipment_sea");
  }

  // ── WARSTWA 7: SANKCJE I OSTRZEŻENIA KRYTYCZNE ──────────────────

  // Sankcje UE — Rosja i Białoruś (Rozp. 833/2014 i 765/2006)
  if (destination === "RU" || destination === "BY") {
    warn("warn_sanctions_ru_by_dest", "UWAGA SANKCJE: Trasa do Rosji/Białorusi podlega sankcjom UE. Sprawdź listę towarów zakazanych: Rozporządzenie UE 833/2014 (Rosja) i 765/2006 (Białoruś) przed wysyłką. Wiele kategorii towarów jest zakazanych lub wymaga specjalnego zezwolenia eksportowego.");
  }
  if (origin === "RU" || origin === "BY") {
    warn("warn_sanctions_ru_by_origin", "UWAGA SANKCJE: Import z Rosji/Białorusi do UE podlega sankcjom UE. Sprawdź listę zakazanych importów przed zawarciem kontraktu.");
  }

  // CHED-P/TRACES: ostrzezenie warn_ched_p_traces WYCOFANE w ETAPIE 2 -
  // zastapil je dokument 128_CHED_TRACES dodawany w warstwie 4.

  // ATP — łańcuch chłodniczy dla żywności (Konwencja ATP)
  if (effectiveCategory === "food_animal" || effectiveCategory === "food_plant") {
    warn("warn_atp_cold_chain", "Żywność wymaga zachowania łańcucha chłodniczego: mrożona max −18°C, schłodzona 0-4°C. Transport musi spełniać wymagania Konwencji ATP. Dołącz zapis temperatury z rejestratora danych.");
  }

  // EU-Mercosur iTA (od 01.05.2026) — obie strony handlu
  if ((inGroup(origin, "MERCOSUR") && isEU(destination)) ||
      (isEU(origin) && inGroup(destination, "MERCOSUR"))) {
    warn("warn_mercosur_ita", "Od 01.05.2026 obowiązuje Umowa EU-Mercosur (iTA). Sprawdź wymagania dotyczące nowych certyfikatów pochodzenia. EC Notice 2026/875. Może być wymagany zaktualizowany format COO.");
  }

  // Import do UE: ostrzezenie warn_eu_import_sad WYCOFANE w ETAPIE 2 -
  // zastapil je dokument 125_EU_Import_Declaration w warstwie 4.

  // REX / deklaracja pochodzenia przy imporcie do UE z krajow FTA
  if (isEU(destination) && !isEU(origin) && inGroup(origin, "REX_FTA")) {
    addConditional("131_REX_Statement_Origin", LAYERS.IMPORT, "preferential_origin_rex_import");
    warn(
      "warn_rex_import",
      "Import z " + origin + " do UE: importer moze ubiegac sie o preferencyjna " +
      "stawke celna na podstawie umowy FTA. Eksporter musi dolaczyc deklaracje " +
      "pochodzenia na fakturze (system REX / statement on origin). " +
      "Do 6000 EUR moze ja wystawic kazdy eksporter; powyzej, tylko zarejestrowany " +
      "eksporter REX lub upowazniony eksporter (AE).",
      { country: origin }
    );
  }

  // EOG (NO/IS/LI) — poza obszarem celnym UE
  if (inGroup(destination, "EEA")) {
    warn("warn_eea_customs", "Norwegia/Islandia/Liechtenstein należą do EOG, ale nie do obszaru celnego UE. EAD wymagana jak przy eksporcie poza UE. Brak ceł dzięki umowie EOG, formalności celne są jednak obowiązkowe.");
  }

  // ── DEDUPLIKACJA: usuń z conditional to co już jest w required ────
  required.forEach((_, id) => conditional.delete(id));

  // ── BRAMKA CZASOWA: validFrom/validTo z katalogu ──────────────────
  // Dokument, który jeszcze nie obowiązuje (albo już nie obowiązuje), znika
  // z listy i zamienia się w ostrzeżenie. Mechanizm jest sterowany KATALOGIEM —
  // dodanie daty do wpisu wystarczy, kodu silnika nie trzeba ruszać.
  applyDateGate(required, referenceDate, warn);
  applyDateGate(conditional, referenceDate, warn);

  // ── BUDUJ WYNIK ──────────────────────────────────────────────────
  if (!includeMetadata) {
    return {
      required: buildLegacyList(required),
      conditional: buildLegacyList(conditional),
      warnings: warnings.map((w) => w.message),
    };
  }

  const blanks = [];
  const requiredOut = [];
  const conditionalOut = [];

  for (const [id, info] of required) {
    const doc = buildMetaDoc(id, info, "reason");
    if (!doc) continue;
    (doc.outputMode === "blank_only" ? blanks : requiredOut).push(doc);
  }
  for (const [id, info] of conditional) {
    const doc = buildMetaDoc(id, info, "condition");
    if (!doc) continue;
    (doc.outputMode === "blank_only" ? blanks : conditionalOut).push(doc);
  }

  return { required: requiredOut, conditional: conditionalOut, blanks, warnings };
}

// ─── BUDOWANIE WYNIKU ────────────────────────────────────────────────────────

// Kształt sprzed ETAPU 1 — świadomie NIE rozlewamy tu całego wpisu katalogu,
// żeby brak szóstego argumentu dawał dokładnie to, co dawniej.
function buildLegacyList(map) {
  const out = [];
  for (const id of map.keys()) {
    const c = documentCatalog[id];
    if (!c?.name_pl) continue; // pomiń nieznane id
    out.push({ id, name_pl: c.name_pl, name_en: c.name_en, path: c.path, available: c.available });
  }
  return out;
}

function buildMetaDoc(id, info, extraKey) {
  const c = documentCatalog[id];
  if (!c?.name_pl) return null;
  return {
    id,
    name_pl: c.name_pl,
    name_en: c.name_en,
    path: c.path,
    available: c.available,
    layer: info.layer,
    [extraKey]: extraKey === "reason" ? info.reason : info.condition,
    outputMode: c.outputMode,
    issuerType: c.issuerType,
    blocking: c.blockingIfMissing,
  };
}

// Data z katalogu ('YYYY-MM-DD') → Date w północy UTC. Zwraca null dla pustych.
function parseCatalogDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function applyDateGate(map, referenceDate, warn) {
  for (const id of [...map.keys()]) {
    const c = documentCatalog[id];
    if (!c) continue;
    const from = parseCatalogDate(c.validFrom);
    const to = parseCatalogDate(c.validTo);
    if (from && from > referenceDate) {
      map.delete(id);
      warn(
        "warn_document_not_yet_valid",
        "Dokument „" + c.name_pl + "” zacznie obowiązywać dopiero od " + c.validFrom +
        ". Do tego czasu nie jest wymagany.",
        { document: c.name_pl, date: c.validFrom }
      );
    } else if (to && to < referenceDate) {
      map.delete(id);
      warn(
        "warn_document_expired",
        "Dokument „" + c.name_pl + "” przestał obowiązywać " + c.validTo +
        ". Sprawdź, czy zastąpił go inny dokument.",
        { document: c.name_pl, date: c.validTo }
      );
    }
  }
}

// ─── HELPER: czy trasa przekracza granicę celną ───────────────────────────────
export function isCrossCustoms(origin, destination) {
  return !(isEU(origin) && isEU(destination));
}

// ─── HELPER: publiczny alias isEU dla formularza ─────────────────────────────
export const isEUCountry = (country) => isEU(country);

/**
 * Klasyfikuje kraje tranzytowe.
 * @param {string[]} transitCountries - kody ISO, np. ["BG","RS"]
 * @returns {{ eu: string[], nonEU: string[], ctc: string[], nonCTC: string[],
 *             transitNonEU: boolean, needsTIR: boolean }}
 */
export function classifyTransit(transitCountries = []) {
  const eu = transitCountries.filter(c => isEU(c));
  const nonEU = transitCountries.filter(c => !isEU(c));
  const ctc = nonEU.filter(c => inGroup(c, "CTC_NON_EU"));
  const nonCTC = nonEU.filter(c => !inGroup(c, "CTC_NON_EU"));
  return {
    eu, nonEU, ctc, nonCTC,
    transitNonEU: nonEU.length > 0,
    // TIR wlasciwy tylko gdy na trasie jest kraj spoza UE i spoza CTC
    needsTIR: nonCTC.length > 0,
  };
}

// ─── HELPER: etykieta grupy dla UI ──────────────────────────────────────────
export function getRouteLabel(origin, destination) {
  if (isEU(origin) && isEU(destination)) return "Wewnątrz UE";
  if (isEU(origin)) return "Eksport z UE";
  if (isEU(destination)) return "Import do UE";
  return "Poza UE";
}
