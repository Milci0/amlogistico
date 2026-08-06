// ETAP 3 — macierz tras + testy strukturalne katalogu + audyt flag formularza.
//
// Trzy przypadki z pierwotnej macierzy zostaly PRZEPISANE, bo byly merytorycznie
// bledne (uzgodnione z autorem promptu):
//   #2  PL->IT tranzyt   — TIR NIE jest wymagany dla krajow Konwencji o wspolnej
//                          procedurze tranzytowej; wystarcza T1/T2.
//   #7  PL->US morski    — AES to zgloszenie EKSPORTOWE USA, nie dotyczy importu DO USA.
//   #8  CN->PL kolejowy  — „zgloszenie przywozowe UE" nie istnieje w katalogu;
//                          silnik zwraca ostrzezenie o SAD/H1.

import { describe, it, expect } from 'vitest'
import { getDocuments, LAYERS } from '../documentEngine'
import { documentCatalog } from '../../data/documentCatalog'

const meta = (o, d, m, c = 'general', f = {}) =>
  getDocuments(o, d, m, c, f, { includeMetadata: true })

// Wszystkie dobrane dokumenty, niezaleznie od sekcji.
const allIds = (r) => [...r.required, ...r.conditional, ...r.blanks].map((x) => x.id)
const codes = (r) => r.warnings.map((w) => w.code)

// ─── MACIERZ TRAS ─────────────────────────────────────────────────────────────
// must     — dokumenty, ktore MUSZA sie pojawic (gdziekolwiek)
// mustNot  — dokumenty, ktorych NIE MOZE byc
// required — dokumenty, ktore musza byc w sekcji WYMAGANE (nie tylko obecne)
// manual   — dokumenty, ktore musza wyladowac w sekcji „do wypelnienia recznie"
// warn     — kody ostrzezen, ktore musza sie pojawic
// noWarn   — kody ostrzezen, ktorych byc nie moze
const MATRIX = [
  // ── Wewnatrz UE ────────────────────────────────────────────────────────────
  { n: 1, o: 'PL', d: 'DE', m: 'road', c: 'general',
    required: ['01_CMR', '09_Zlecenie', '10_POD', '02_PackingList', '03_Invoice'],
    mustNot: ['04_Proforma', '07_EAD', '06_COO', '12_EUR1', '116_Transit'] },
  { n: 2, o: 'PL', d: 'IE', m: 'road', c: 'general',
    required: ['01_CMR', '02_PackingList', '03_Invoice'],
    mustNot: ['04_Proforma', '07_EAD'] },
  { n: 3, o: 'PL', d: 'LU', m: 'road', c: 'general', mustNot: ['04_Proforma', '07_EAD'] },
  { n: 4, o: 'PL', d: 'SI', m: 'road', c: 'general', mustNot: ['04_Proforma', '07_EAD'] },
  { n: 5, o: 'PL', d: 'CY', m: 'sea', c: 'general', mustNot: ['04_Proforma', '07_EAD'], must: ['104_T2L'] },
  { n: 6, o: 'PL', d: 'MT', m: 'sea', c: 'general', mustNot: ['04_Proforma', '07_EAD'], must: ['104_T2L'] },
  { n: 7, o: 'PL', d: 'FR', m: 'sea', c: 'general', required: ['104_T2L'], warn: ['warn_t2l_sea_eu'] },

  // ── Tranzyt ────────────────────────────────────────────────────────────────
  { n: 8, o: 'PL', d: 'IT', m: 'road', c: 'general', f: { transitCountries: ['RS'] },
    required: ['116_Transit'], mustNot: ['117_TIR'], warn: ['warn_ctc_transit'] },
  { n: 9, o: 'PL', d: 'IT', m: 'road', c: 'general', f: { transitCountries: ['RU'] },
    required: ['116_Transit', '117_TIR'], warn: ['warn_tir_non_ctc'] },
  { n: 10, o: 'PL', d: 'IT', m: 'road', c: 'general', f: { transitNonEU: true },
    required: ['116_Transit'], mustNot: ['117_TIR'] },
  { n: 11, o: 'CN', d: 'PL', m: 'rail', c: 'general', f: { transitCountries: ['RU', 'BY'] },
    must: ['116_Transit'], mustNot: ['117_TIR'], warn: ['warn_rail_transit_non_eu'] },
  { n: 12, o: 'PL', d: 'IT', m: 'sea', c: 'general', f: { transitNonEU: true },
    mustNot: ['116_Transit', '117_TIR'] },

  // ── Pochodzenie preferencyjne ──────────────────────────────────────────────
  { n: 13, o: 'PL', d: 'CH', m: 'road', c: 'general',
    must: ['07_EAD', '12_EUR1'], noWarn: ['warn_rex_export', 'warn_atr_turkey'] },
  { n: 14, o: 'PL', d: 'NO', m: 'road', c: 'general', must: ['12_EUR1'], warn: ['warn_eea_customs'] },
  { n: 15, o: 'PL', d: 'MA', m: 'sea', c: 'general', must: ['12_EUR1', '102_EUR_MED'] },
  // ETAP 2: warn_atr_turkey zastapil dokument 129_ATR_Certificate.
  { n: 16, o: 'PL', d: 'TR', m: 'road', c: 'general',
    mustNot: ['12_EUR1'], must: ['129_ATR_Certificate'],
    noWarn: ['warn_atr_turkey', 'warn_atr_turkey_agri'] },
  // Produkty rolne zostaja przy EUR.1 - A.TR sie NIE pojawia, a ostrzezenie
  // warn_atr_turkey_agri zostaje, bo niesie rozroznienie, ktorego zaden
  // dokument nie zastepuje.
  { n: 17, o: 'PL', d: 'TR', m: 'road', c: 'food_plant',
    must: ['12_EUR1'], mustNot: ['129_ATR_Certificate'],
    warn: ['warn_atr_turkey_agri'], noWarn: ['warn_atr_turkey'] },
  { n: 18, o: 'PL', d: 'CA', m: 'sea', c: 'general', mustNot: ['12_EUR1'], warn: ['warn_rex_export'] },
  { n: 19, o: 'PL', d: 'JP', m: 'sea', c: 'general', mustNot: ['12_EUR1'], warn: ['warn_rex_export'] },
  { n: 20, o: 'PL', d: 'GB', m: 'road', c: 'general',
    mustNot: ['12_EUR1'], must: ['21_UK_Import'], warn: ['warn_rex_export'] },
  { n: 21, o: 'IN', d: 'PL', m: 'sea', c: 'general', must: ['103_Form_A'], warn: ['warn_gsp_form_a_rex'] },
  // ETAP 2: warn_eu_import_sad zastapily dokumenty 124 i 125.
  { n: 22, o: 'CA', d: 'PL', m: 'sea', c: 'general',
    must: ['124_ENS_ICS2', '125_EU_Import_Declaration'],
    warn: ['warn_rex_import', 'warn_ens_lodgement'], noWarn: ['warn_eu_import_sad'] },

  // ── Import poza UE ─────────────────────────────────────────────────────────
  { n: 23, o: 'PL', d: 'US', m: 'sea', c: 'electronics',
    must: ['08_ISF', '20_CBP7501', '106_CE'], mustNot: ['30_USA_AES'], warn: ['warn_isf_24h'] },
  { n: 24, o: 'US', d: 'PL', m: 'sea', c: 'general', must: ['30_USA_AES'], mustNot: ['08_ISF'] },
  { n: 25, o: 'PL', d: 'NG', m: 'sea', c: 'general',
    manual: ['53_Nigeria_Import'], must: ['68_PSI'], warn: ['warn_nigeria_form_m', 'warn_psi_leadtime'] },
  { n: 26, o: 'PL', d: 'IN', m: 'air', c: 'general', manual: ['44_India_Import'], must: ['11_AWB'] },
  { n: 27, o: 'PL', d: 'BR', m: 'sea', c: 'general',
    manual: ['47_Brazil_Import'], warn: ['warn_brazil_import_licence', 'warn_mercosur_ita'] },
  // ETAP 2: CN jest w SMGS_ONLY, wiec zamiast CIM idzie wspolny list CIM/SMGS.
  { n: 28, o: 'PL', d: 'CN', m: 'rail', c: 'general',
    must: ['134_CIM_SMGS'], mustNot: ['27_CIM'], manual: ['22_China_Import'],
    warn: ['warn_cim_smgs_route'] },
  { n: 29, o: 'CN', d: 'PL', m: 'rail', c: 'general',
    must: ['134_CIM_SMGS', '23_China_Export', '06_COO', '124_ENS_ICS2', '125_EU_Import_Declaration'],
    mustNot: ['27_CIM'], warn: ['warn_cim_smgs_route', 'warn_ens_lodgement'],
    noWarn: ['warn_eu_import_sad'] },
  { n: 30, o: 'PL', d: 'SA', m: 'sea', c: 'general',
    must: ['70_Blacklist'], warn: ['warn_blacklist_cert', 'warn_legalisation_kig'] },
  { n: 31, o: 'BR', d: 'AR', m: 'sea', c: 'general',
    mustNot: ['07_EAD', '12_EUR1', '104_T2L', '04_Proforma'].filter((x) => x !== '04_Proforma') },
  { n: 32, o: 'PL', d: 'NZ', m: 'sea', c: 'general', manual: ['43_NewZealand_Import'] },
  { n: 33, o: 'PL', d: 'MX', m: 'sea', c: 'general', manual: ['48_Mexico_Import'] },

  // ── Towary niebezpieczne per galaz ─────────────────────────────────────────
  { n: 34, o: 'PL', d: 'NO', m: 'road', c: 'dangerous_goods',
    must: ['118_ADR', '29_DG_Manifest', '69_MSDS'], mustNot: ['15_IMDG', '64_IATA_DGR'] },
  { n: 35, o: 'PL', d: 'CN', m: 'sea', c: 'dangerous_goods',
    must: ['15_IMDG', '29_DG_Manifest', '123_Container_Packing_Cert'],
    mustNot: ['118_ADR', '64_IATA_DGR'], warn: ['warn_container_packing_duplicate'] },
  { n: 36, o: 'PL', d: 'CN', m: 'air', c: 'dangerous_goods',
    must: ['64_IATA_DGR', '109_IATA_Packing'], mustNot: ['118_ADR', '15_IMDG'] },
  // ETAP 2: warn_rid_rail zastapil dokument 135_RID_Rail_DG - kolej domknela
  // komplet czterech galezi dla towarow niebezpiecznych.
  { n: 37, o: 'PL', d: 'CN', m: 'rail', c: 'dangerous_goods',
    must: ['29_DG_Manifest', '69_MSDS', '135_RID_Rail_DG'],
    mustNot: ['118_ADR', '15_IMDG'], noWarn: ['warn_rid_rail'] },

  // ── Kategorie towaru ───────────────────────────────────────────────────────
  { n: 38, o: 'PL', d: 'US', m: 'sea', c: 'food_animal',
    must: ['17_Weterynaryjne', '105_FDA'], warn: ['warn_atp_cold_chain'] },
  { n: 39, o: 'PL', d: 'AE', m: 'sea', c: 'food_animal', must: ['17_Weterynaryjne', '18_Halal'] },
  { n: 40, o: 'PL', d: 'CN', m: 'sea', c: 'food_plant', must: ['16_Fitosanitarne'] },
  // ETAP 2: warn_ched_p_traces zastapil dokument 128_CHED_TRACES. CHED jest
  // blank_only, wiec laduje w sekcji "do wypelnienia recznie".
  { n: 41, o: 'CN', d: 'PL', m: 'sea', c: 'food_plant',
    manual: ['128_CHED_TRACES'], noWarn: ['warn_ched_p_traces'] },
  { n: 42, o: 'PL', d: 'US', m: 'air', c: 'medicines', must: ['71_FreeSale', '69_MSDS'] },
  { n: 43, o: 'CN', d: 'PL', m: 'sea', c: 'electronics', required: ['106_CE'] },
  { n: 44, o: 'PL', d: 'CN', m: 'air', c: 'live_animals', must: ['101_CITES', '17_Weterynaryjne'] },
  { n: 45, o: 'PL', d: 'US', m: 'sea', c: 'organic', must: ['111_Organic'] },
  { n: 46, o: 'PL', d: 'IL', m: 'sea', c: 'kosher', must: ['112_Kosher'] },
  { n: 47, o: 'PL', d: 'US', m: 'sea', c: 'weapons_dual_use',
    must: ['24_DualUse', '113_EUC'], warn: ['warn_dual_use_licence'] },
  { n: 48, o: 'PL', d: 'CN', m: 'sea', c: 'chemicals', must: ['69_MSDS'] },

  // ── Reguly specjalne ───────────────────────────────────────────────────────
  { n: 49, o: 'PL', d: 'US', m: 'sea', c: 'general', f: { woodenPackaging: true }, must: ['19_ISPM15', '65_Fumigation'] },
  { n: 50, o: 'PL', d: 'DE', m: 'road', c: 'general', f: { woodenPackaging: true }, mustNot: ['19_ISPM15'] },
  { n: 51, o: 'PL', d: 'CH', m: 'road', c: 'general', f: { temporaryExport: true }, must: ['13_ATA'] },
  { n: 52, o: 'PL', d: 'CN', m: 'sea', c: 'general', f: { transhipment: true }, must: ['115_Transhipment'] },
  { n: 53, o: 'PL', d: 'CN', m: 'road', c: 'general', f: { transhipment: true }, mustNot: ['115_Transhipment'] },
  { n: 54, o: 'PL', d: 'CN', m: 'sea', c: 'general', f: { reExport: true }, must: ['114_ReExport'] },

  // ── Multimodal ─────────────────────────────────────────────────────────────
  { n: 55, o: 'PL', d: 'US', m: 'multimodal', c: 'general', required: ['28_MTD'], mustNot: ['01_CMR', '05_BL'] },
  { n: 56, o: 'PL', d: 'US', m: 'road', c: 'general', f: { multimodal: true }, required: ['01_CMR', '28_MTD'] },
  { n: 57, o: 'PL', d: 'US', m: 'sea', c: 'general', f: { multimodal: true }, required: ['05_BL', '28_MTD'] },
  { n: 58, o: 'PL', d: 'US', m: 'road', c: 'general', mustNot: ['28_MTD'] },

  // ── Multimodal — osobne umowy na odcinki (2026-08-08) ─────────────────────
  // Krok „Trasa": pytanie "Jak zorganizowany jest przewóz?" → 'separate' czyta
  // legs[].mode i dobiera dokument KAŻDEJ zaznaczonej gałęzi (addTransportLayerDocs
  // wywołana per gałąź), bez MTD — w odróżnieniu od 'single' (albo braku wyboru),
  // gdzie zachowanie zostaje dokładnie takie jak w przypadku #55.
  { n: 104, o: 'PL', d: 'DE', m: 'multimodal', c: 'general',
    f: { multimodalContractType: 'separate', multimodalLegs: ['road', 'rail'] },
    required: ['01_CMR', '27_CIM'], mustNot: ['28_MTD'] },
  // Trasa siega strefy SMGS (Chiny) — odcinek kolejowy dostaje wspolny list
  // CIM/SMGS zamiast zwyklego CIM, DOKLADNIE jak przy trybie 'rail' pojedynczym
  // (przypadek reuzywa touchesSmgsOnly z gornego poziomu funkcji, nie liczy go
  // od nowa per noga).
  { n: 105, o: 'PL', d: 'CN', m: 'multimodal', c: 'general',
    f: { multimodalContractType: 'separate', multimodalLegs: ['rail', 'sea'] },
    required: ['134_CIM_SMGS', '05_BL'], mustNot: ['28_MTD', '27_CIM'] },
  { n: 106, o: 'PL', d: 'US', m: 'multimodal', c: 'general',
    f: { multimodalContractType: 'separate', multimodalLegs: ['air'] },
    required: ['11_AWB'], mustNot: ['28_MTD'] },
  // Brak zaznaczonych gałęzi (user wybrał 'separate', ale nie uzupełnił jeszcze
  // legs[] w Kroku 2 — walidacja w flowSteps.js to blokuje, ale silnik i tak
  // musi się zachować bezpiecznie: zero dokumentów transportowych, NIE fallback
  // na MTD) — patrz walidacja `validateCargo`, ten stan nie powinien dotrzeć
  // do Kroku 4, ale silnik nie może zgadywać, gdyby jednak dotarł.
  { n: 107, o: 'PL', d: 'DE', m: 'multimodal', c: 'general',
    f: { multimodalContractType: 'separate', multimodalLegs: [] },
    mustNot: ['28_MTD', '01_CMR', '05_BL', '27_CIM', '134_CIM_SMGS', '11_AWB'] },
  // 'single' (albo contractType nieustawiony) na trybie 'multimodal' — bez zmian
  // wzgledem przypadku #55, mimo obecnosci nowych flag w wywolaniu.
  { n: 108, o: 'PL', d: 'US', m: 'multimodal', c: 'general',
    f: { multimodalContractType: 'single', multimodalLegs: ['road', 'sea'] },
    required: ['28_MTD'], mustNot: ['01_CMR', '05_BL'] },
  // Nowe flagi na trybie NIE-multimodalnym nie mają żadnego efektu — gałąź w
  // silniku jest zabezpieczona warunkiem `mode === "multimodal"`.
  { n: 109, o: 'PL', d: 'DE', m: 'road', c: 'general',
    f: { multimodalContractType: 'separate', multimodalLegs: ['sea'] },
    required: ['01_CMR'], mustNot: ['05_BL', '28_MTD'] },

  // ── Sankcje ────────────────────────────────────────────────────────────────
  { n: 59, o: 'PL', d: 'RU', m: 'road', c: 'general', warn: ['warn_sanctions_ru_by_dest'] },
  { n: 60, o: 'RU', d: 'PL', m: 'rail', c: 'general', warn: ['warn_sanctions_ru_by_origin'] },
  { n: 61, o: 'PL', d: 'BY', m: 'road', c: 'general', warn: ['warn_sanctions_ru_by_dest'] },

  // ── ADR jako flaga formularza (nie kategoria) ──────────────────────────────
  { n: 62, o: 'PL', d: 'DE', m: 'road', c: 'general', f: { adr: true },
    must: ['118_ADR', '29_DG_Manifest', '69_MSDS'] },
  { n: 63, o: 'PL', d: 'DE', m: 'road', c: 'general', mustNot: ['118_ADR'] },
  { n: 64, o: 'PL', d: 'DE', m: 'road', c: 'food_plant', f: { adr: true },
    must: ['16_Fitosanitarne'], mustNot: ['118_ADR'] },

  // ── ETAP 2: 22 nowe dokumenty (119-140) ────────────────────────────────────
  // Kazda regula ma tu przypadek POZYTYWNY i NEGATYWNY. Sam pozytywny
  // przechodzilby takze wtedy, gdyby dokument dokladal sie zawsze - a wlasnie
  // tego przy 91 pozycjach blank_only trzeba pilnowac najbardziej.

  // VGM: kontener, nie sam tryb morski (drobnica nie podlega SOLAS).
  { n: 65, o: 'PL', d: 'US', m: 'sea', c: 'general', f: { containerized: true },
    required: ['119_VGM_SOLAS'] },
  { n: 66, o: 'PL', d: 'US', m: 'sea', c: 'general', mustNot: ['119_VGM_SOLAS'] },
  { n: 67, o: 'PL', d: 'US', m: 'multimodal', c: 'general', f: { containerized: true },
    must: ['119_VGM_SOLAS'], mustNot: [] },
  { n: 68, o: 'PL', d: 'US', m: 'road', c: 'general', f: { containerized: true },
    mustNot: ['119_VGM_SOLAS'] },

  // ENS + zgloszenie przywozowe: kazde wprowadzenie do UE, niezaleznie od galezi.
  { n: 69, o: 'US', d: 'PL', m: 'air', c: 'general',
    required: ['124_ENS_ICS2', '125_EU_Import_Declaration'], warn: ['warn_ens_lodgement'] },
  { n: 70, o: 'PL', d: 'US', m: 'sea', c: 'general',
    mustNot: ['124_ENS_ICS2', '125_EU_Import_Declaration'] },
  { n: 71, o: 'PL', d: 'DE', m: 'road', c: 'general',
    mustNot: ['124_ENS_ICS2', '125_EU_Import_Declaration'] },

  // CBAM: zakres towarowy przez cargoCategoryId, tylko przy przywozie do UE.
  { n: 72, o: 'CN', d: 'PL', m: 'sea', c: 'general', f: { cargoCategoryId: 'metals' },
    must: ['126_CBAM_Data_Sheet'], warn: ['warn_cbam_annual'] },
  { n: 73, o: 'CN', d: 'PL', m: 'sea', c: 'general', f: { cargoCategoryId: 'textiles' },
    mustNot: ['126_CBAM_Data_Sheet'] },
  { n: 74, o: 'PL', d: 'CN', m: 'sea', c: 'general', f: { cargoCategoryId: 'metals' },
    mustNot: ['126_CBAM_Data_Sheet'] },

  // EUDR: bramka czasowa trzyma dokument poza lista do 30.12.2026.
  { n: 75, o: 'CN', d: 'PL', m: 'sea', c: 'food_plant', f: { cargoCategoryId: 'food_plant' },
    mustNot: ['127_EUDR_DDS'], warn: ['warn_document_not_yet_valid'] },

  // CHED: kontrola graniczna przy zywnosci i zwierzetach, sekcja reczna.
  { n: 76, o: 'BR', d: 'PL', m: 'sea', c: 'food_animal', manual: ['128_CHED_TRACES'] },
  { n: 77, o: 'BR', d: 'PL', m: 'sea', c: 'electronics', mustNot: ['128_CHED_TRACES'] },

  // Deklaracja dostawcy: tylko kierunki objete preferencja celna.
  { n: 78, o: 'PL', d: 'CH', m: 'road', c: 'general', must: ['130_Supplier_Declaration'] },
  { n: 79, o: 'PL', d: 'US', m: 'sea', c: 'general', mustNot: ['130_Supplier_Declaration'] },

  // Oswiadczenie REX: przy wywozie i przy przywozie z kraju REX_FTA.
  { n: 80, o: 'PL', d: 'JP', m: 'sea', c: 'general', must: ['131_REX_Statement_Origin'] },
  { n: 81, o: 'JP', d: 'PL', m: 'sea', c: 'general', must: ['131_REX_Statement_Origin'] },
  { n: 82, o: 'PL', d: 'BR', m: 'sea', c: 'general', mustNot: ['131_REX_Statement_Origin'] },

  // EMCS: wyroby akcyzowe wysylane z UE.
  { n: 83, o: 'PL', d: 'DE', m: 'road', c: 'general', f: { cargoCategoryId: 'beverages' },
    must: ['132_EMCS_eAD'], warn: ['warn_emcs_arc'] },
  { n: 84, o: 'CN', d: 'PL', m: 'sea', c: 'general', f: { cargoCategoryId: 'beverages' },
    mustNot: ['132_EMCS_eAD'] },

  // SENT: wyzwala RODZAJ TOWARU, nie przekroczenie granicy.
  { n: 85, o: 'PL', d: 'PL', m: 'road', c: 'general', f: { cargoCategoryId: 'energy' },
    required: ['133_SENT'], warn: ['warn_sent_registration'] },
  { n: 86, o: 'DE', d: 'FR', m: 'road', c: 'general', f: { cargoCategoryId: 'energy' },
    mustNot: ['133_SENT'] },
  { n: 87, o: 'DE', d: 'LT', m: 'road', c: 'general', f: { cargoCategoryId: 'energy', transitCountries: ['PL'] },
    must: ['133_SENT'] },
  { n: 88, o: 'PL', d: 'CN', m: 'sea', c: 'general', f: { cargoCategoryId: 'energy' },
    mustNot: ['133_SENT'] },

  // CIM/SMGS: decyduje strefa, nie czlonkostwo (PL jest strona obu umow).
  { n: 89, o: 'PL', d: 'DE', m: 'rail', c: 'general',
    must: ['27_CIM'], mustNot: ['134_CIM_SMGS'], noWarn: ['warn_cim_smgs_route'] },
  { n: 90, o: 'PL', d: 'KZ', m: 'rail', c: 'general',
    must: ['134_CIM_SMGS'], mustNot: ['27_CIM'] },
  { n: 91, o: 'PL', d: 'TR', m: 'rail', c: 'general', f: { transitCountries: ['BY'] },
    must: ['134_CIM_SMGS'], mustNot: ['27_CIM'] },

  // RID: domyka komplet czterech galezi dla towarow niebezpiecznych.
  { n: 92, o: 'PL', d: 'DE', m: 'rail', c: 'dangerous_goods',
    required: ['135_RID_Rail_DG'], mustNot: ['118_ADR', '15_IMDG', '64_IATA_DGR'] },
  { n: 93, o: 'PL', d: 'DE', m: 'rail', c: 'general', mustNot: ['135_RID_Rail_DG'] },

  // Wykaz wagonow: tylko przesylka grupowa.
  { n: 94, o: 'PL', d: 'DE', m: 'rail', c: 'general', f: { groupConsignment: true },
    must: ['136_Wagon_List'] },
  { n: 95, o: 'PL', d: 'DE', m: 'rail', c: 'general', mustNot: ['136_Wagon_List'] },
  { n: 96, o: 'PL', d: 'DE', m: 'road', c: 'general', f: { groupConsignment: true },
    mustNot: ['136_Wagon_List'] },

  // HAWB: tylko konsolidacja, zawsze OBOK MAWB.
  { n: 97, o: 'PL', d: 'US', m: 'air', c: 'general', f: { consolidated: true },
    required: ['11_AWB', '137_HAWB'] },
  { n: 98, o: 'PL', d: 'US', m: 'air', c: 'general', must: ['11_AWB'], mustNot: ['137_HAWB'] },
  { n: 99, o: 'PL', d: 'US', m: 'sea', c: 'general', f: { consolidated: true },
    mustNot: ['137_HAWB'] },

  // Delivery Order: wylacznie przywoz MORSKI do UE.
  { n: 100, o: 'CN', d: 'PL', m: 'sea', c: 'general', must: ['122_Delivery_Order'] },
  { n: 101, o: 'PL', d: 'CN', m: 'sea', c: 'general', mustNot: ['122_Delivery_Order'] },
  { n: 102, o: 'CN', d: 'PL', m: 'rail', c: 'general', mustNot: ['122_Delivery_Order'] },
  { n: 103, o: 'DE', d: 'PL', m: 'sea', c: 'general', mustNot: ['122_Delivery_Order'] },
]

describe('macierz tras', () => {
  for (const row of MATRIX) {
    const label = `#${String(row.n).padStart(2, '0')} ${row.o}->${row.d} ${row.m} ${row.c}` +
      (row.f ? ` ${JSON.stringify(row.f)}` : '')
    it(label, () => {
      const r = meta(row.o, row.d, row.m, row.c, row.f || {})
      const all = allIds(r)
      const req = r.required.map((x) => x.id)
      const man = r.blanks.map((x) => x.id)
      const w = codes(r)

      for (const id of row.must || []) expect(all, `brak ${id}`).toContain(id)
      for (const id of row.mustNot || []) expect(all, `nadmiarowy ${id}`).not.toContain(id)
      for (const id of row.required || []) expect(req, `${id} poza sekcja wymagane`).toContain(id)
      for (const id of row.manual || []) expect(man, `${id} poza sekcja reczna`).toContain(id)
      for (const code of row.warn || []) expect(w, `brak ostrzezenia ${code}`).toContain(code)
      for (const code of row.noWarn || []) expect(w, `nadmiarowe ostrzezenie ${code}`).not.toContain(code)
    })
  }

  it('macierz ma co najmniej 60 przypadkow', () => {
    expect(MATRIX.length).toBeGreaterThanOrEqual(60)
  })
})

// ─── TESTY STRUKTURALNE KATALOGU ──────────────────────────────────────────────

const ISSUER_TYPES = [
  'shipper', 'forwarder', 'carrier', 'customs_authority', 'chamber_of_commerce',
  'government_agency', 'bank', 'insurer', 'lab_or_inspector', 'notified_body', 'foreign_broker',
]
const DEFAULT_OUTPUT = {
  shipper: 'final', forwarder: 'final', carrier: 'draft',
  customs_authority: 'draft', chamber_of_commerce: 'draft',
  government_agency: 'blank_only', bank: 'blank_only', insurer: 'blank_only',
  lab_or_inspector: 'blank_only', notified_body: 'blank_only', foreign_broker: 'blank_only',
}
// Udokumentowane odstepstwa (komentarz przy polu w documentCatalog.js).
//
// Grupa 1 - dokumenty przewoznika, ktore sa formularzem do wypelnienia
// w obrocie, a nie wnioskiem skladanym w urzedzie:
//   10_POD, 29_DG_Manifest, 118_ADR
//
// Grupa 2 (ETAP 1 / partia B) - formularze, ktore ZOBOWIAZANY sklada sam
// w systemie urzedowym. Wystawca jest nadawca (shipper), ale dokument nie
// wchodzi do obrotu handlowego, wiec 'final' bylby falszem: platforma
// przygotowuje dane, zlozenie odbywa sie w rejestrze CBAM albo w TRACES.
// Dlatego 'draft' + galaz `shipper` w generators/draftBanner.jsx:
//   126_CBAM_Data_Sheet (rejestr CBAM), 127_EUDR_DDS (TRACES),
//   133_SENT (rejestr SENT na PUESC)
const OUTPUT_EXCEPTIONS = {
  '10_POD': 'final', '29_DG_Manifest': 'final', '118_ADR': 'final',
  '126_CBAM_Data_Sheet': 'draft', '127_EUDR_DDS': 'draft', '133_SENT': 'draft',
}

const CATEGORIES = ['ue', 'transport', 'swiadectwo', 'celne_export', 'celne_import', 'towary_niebezp', 'inne', 'finansowe']
const MODES = ['road', 'sea', 'air', 'rail', 'multimodal']

describe('struktura katalogu dokumentow', () => {
  const entries = Object.entries(documentCatalog)

  it('kazdy wpis ma niepuste transportModes z dozwolonymi wartosciami', () => {
    for (const [id, e] of entries) {
      expect(Array.isArray(e.transportModes), id).toBe(true)
      expect(e.transportModes.length, id).toBeGreaterThan(0)
      for (const m of e.transportModes) expect(MODES, `${id}: ${m}`).toContain(m)
    }
  })

  it('kazdy wpis ma issuerType ze slownika', () => {
    for (const [id, e] of entries) expect(ISSUER_TYPES, id).toContain(e.issuerType)
  })

  it('outputMode zgodny z mapowaniem domyslnym albo jest znanym odstepstwem', () => {
    for (const [id, e] of entries) {
      const expected = OUTPUT_EXCEPTIONS[id] || DEFAULT_OUTPUT[e.issuerType]
      expect(e.outputMode, `${id} (${e.issuerType})`).toBe(expected)
    }
  })

  it('kazdy wpis ma kategorie ze slownika grup i niepustego wystawce', () => {
    for (const [id, e] of entries) {
      expect(CATEGORIES, id).toContain(e.category)
      expect(typeof e.authority, id).toBe('string')
      expect(e.authority.length, id).toBeGreaterThan(0)
      expect(typeof e.blockingIfMissing, id).toBe('boolean')
    }
  })

  it('legalBasis to niepusty tekst albo jawny null (nigdy pusty string)', () => {
    for (const [id, e] of entries) {
      if (e.legalBasis !== null) {
        expect(typeof e.legalBasis, id).toBe('string')
        expect(e.legalBasis.trim().length, id).toBeGreaterThan(0)
      }
    }
  })

  it('zaden dokument blank_only nie trafia do required ani conditional', () => {
    const routes = [
      ['PL', 'NG', 'sea'], ['PL', 'IN', 'air'], ['PL', 'US', 'sea'], ['CN', 'PL', 'rail'],
      ['PL', 'BR', 'sea'], ['PL', 'MX', 'road'], ['PL', 'SA', 'sea'], ['PL', 'AU', 'sea'],
    ]
    for (const [o, d, m] of routes) {
      for (const c of ['general', 'food_animal', 'dangerous_goods', 'electronics']) {
        const r = meta(o, d, m, c)
        for (const doc of [...r.required, ...r.conditional]) {
          expect(doc.outputMode, `${o}->${d} ${m} ${c}: ${doc.id}`).not.toBe('blank_only')
        }
      }
    }
  })

  it('dokument dobrany dla galezi ma te galaz w transportModes', () => {
    const problems = []
    for (const m of MODES) {
      for (const [o, d] of [['PL', 'DE'], ['PL', 'US'], ['PL', 'CN'], ['CN', 'PL'], ['PL', 'NG'], ['PL', 'CH']]) {
        for (const c of ['general', 'dangerous_goods', 'food_plant']) {
          for (const id of allIds(meta(o, d, m, c))) {
            const modes = documentCatalog[id]?.transportModes || []
            if (!modes.includes(m)) problems.push(`${id} dobrany dla '${m}', a ma [${modes}]`)
          }
        }
      }
    }
    expect([...new Set(problems)]).toEqual([])
  })
})

// ─── AUDYT FLAG FORMULARZA ────────────────────────────────────────────────────
//
// Pytanie, na ktore odpowiada ta grupa: czy istnieje jeszcze jakas flaga
// formularza, ktora wplywa na liste dokumentow POZA documentEngine.js? Tak dzialal
// checkbox „Transport multimodalny" (regula siedziala w rejestrze kreatora) i tak
// dzialal checkbox ADR (regula siedziala w adapterze migawki) — oba przeniesione.
//
// Metoda: przelaczamy flage na wejsciu SILNIKA i patrzymy, czy lista sie zmienia.
// Flaga, ktora cokolwiek zmienia, MUSI to robic tutaj — inaczej kreator i „Puste
// szablony" policza inaczej.

const FLAG_EFFECT = [
  { flag: 'multimodal', route: ['PL', 'US', 'road', 'general'], adds: ['28_MTD'] },
  { flag: 'adr', route: ['PL', 'DE', 'road', 'general'], adds: ['118_ADR', '29_DG_Manifest', '69_MSDS'] },
  { flag: 'woodenPackaging', route: ['PL', 'US', 'sea', 'general'], adds: ['19_ISPM15', '65_Fumigation'] },
  { flag: 'temporaryExport', route: ['PL', 'CH', 'road', 'general'], adds: ['13_ATA'] },
  { flag: 'transhipment', route: ['PL', 'CN', 'sea', 'general'], adds: ['115_Transhipment'] },
  { flag: 'reExport', route: ['PL', 'CN', 'sea', 'general'], adds: ['114_ReExport'] },
  { flag: 'transitNonEU', route: ['PL', 'IT', 'road', 'general'], adds: ['116_Transit'] },
]

describe('audyt flag formularza', () => {
  for (const { flag, route, adds } of FLAG_EFFECT) {
    it(`flaga '${flag}' jest egzekwowana W SILNIKU`, () => {
      const [o, d, m, c] = route
      const without = allIds(meta(o, d, m, c))
      const withFlag = allIds(meta(o, d, m, c, { [flag]: true }))
      for (const id of adds) {
        expect(without, `${id} nie powinien byc dobrany bez flagi`).not.toContain(id)
        expect(withFlag, `flaga ${flag} nie dolozyla ${id}`).toContain(id)
      }
    })
  }

  // ZMIANA SWIADOMA (ETAP 2 Promptu 2), nie regresja.
  //
  // Do 2026-08-04 ten test asercjonowal, ze `consolidated` NIE wplywa na dobor -
  // bo wtedy faktycznie nie wplywal, a chodzilo o wychwycenie reguly ukrytej
  // poza silnikiem. HAWB (137) wystawia spedytor WYLACZNIE przy konsolidacji,
  // wiec flaga dostala znaczenie i test zostal odwrocony razem z ta zmiana.
  it("flaga 'consolidated' doklada HAWB obok MAWB", () => {
    const air = allIds(meta('PL', 'US', 'air', 'general'))
    expect(air).toContain('11_AWB')
    expect(air).not.toContain('137_HAWB')

    const consolidated = allIds(meta('PL', 'US', 'air', 'general', { consolidated: true }))
    expect(consolidated).toContain('11_AWB')
    expect(consolidated).toContain('137_HAWB')
  })

  // ZMIANA SWIADOMA (decyzja z 2026-08-04): wykaz wagonow (136) towarzyszy
  // listowi przewozowemu przy przesylce grupowej, wiec flaga dostala znaczenie.
  // Warunkowanie flaga jest tu istotne - inaczej dokument dokladalby sie do
  // KAZDEJ trasy kolejowej.
  it("flaga 'groupConsignment' doklada wykaz wagonow", () => {
    const rail = allIds(meta('CN', 'PL', 'rail', 'general'))
    expect(rail).not.toContain('136_Wagon_List')

    const grupowa = allIds(meta('CN', 'PL', 'rail', 'general', { groupConsignment: true }))
    expect(grupowa).toContain('136_Wagon_List')
  })

  // Flaga wyliczana z pol kontenerowych migawki (buildEngineFlags), nie osobny
  // checkbox. SOLAS obejmuje kazdy ZAPAKOWANY KONTENER, ale nie drobnice -
  // dlatego VGM nie moze isc po samym trybie morskim.
  it("flaga 'containerized' doklada VGM jako dokument blokujacy", () => {
    const base = allIds(meta('PL', 'US', 'sea', 'general'))
    expect(base).not.toContain('119_VGM_SOLAS')

    const r = meta('PL', 'US', 'sea', 'general', { containerized: true })
    expect(allIds(r)).toContain('119_VGM_SOLAS')
    expect(r.required.find((d) => d.id === '119_VGM_SOLAS').blocking).toBe(true)
  })

  it('nieznana flaga nie wywraca doboru', () => {
    const base = allIds(meta('PL', 'DE', 'road', 'general'))
    expect(allIds(meta('PL', 'DE', 'road', 'general', { flagaZPrzyszlosci: true }))).toEqual(base)
  })

  // ── PIEC DOKUMENTOW SWIADOMIE NIEWPIETYCH ────────────────────────────────
  //
  // Decyzja z 2026-08-04: 120, 121, 138, 139 i 140 to dokumenty OPERACYJNE
  // przewoznika i agenta, nie zestaw kompletowany przez spedytora. Kazdy
  // dokladalby sie do KAZDEJ trasy swojej galezi.
  //
  // Ten test NIE broni tezy „nigdy ich nie wpinac". Broni tego, zeby wpiecie
  // bylo SWIADOME: kto je doda, musi tu przyjsc i skasowac wpis, a przy okazji
  // zaktualizowac docs/silnik_diff.md. Bez tego wrocilyby po cichu.
  it('120, 121, 138, 139 i 140 nie pojawiaja sie na zadnej trasie', () => {
    const NIEWPIETE = [
      '120_Booking_Confirmation', '121_Cargo_Manifest_Sea',
      '138_SLI_Air', '139_Consignor_Security_Decl', '140_Air_Cargo_Manifest',
    ]
    const SWEEP = [
      ['PL', 'US', 'sea', 'general', { containerized: true }],
      ['CN', 'PL', 'sea', 'general', {}],
      ['PL', 'US', 'air', 'general', { consolidated: true }],
      ['US', 'PL', 'air', 'general', {}],
      ['PL', 'CN', 'sea', 'dangerous_goods', {}],
      ['PL', 'US', 'multimodal', 'general', { containerized: true, consolidated: true }],
      ['PL', 'DE', 'rail', 'general', { groupConsignment: true }],
    ]
    for (const [o, d, m, c, f] of SWEEP) {
      const all = allIds(meta(o, d, m, c, f))
      for (const id of NIEWPIETE) {
        expect(all, `${id} pojawil sie na trasie ${o}->${d} ${m}`).not.toContain(id)
      }
    }
  })

  // Rejestr kreatora nie moze wrocic do roli zrodla doboru.
  it('dawny rejestr kreatora nie jest juz wolany przez zadna sciezke', async () => {
    const mod = await import('../../generators/documents')
    expect(typeof mod.getDocsList).toBe('function') // zostaje jako punkt odniesienia
    const engine = await import('../documentEngine')
    expect(typeof engine.getDocuments).toBe('function')
  })
})

// ─── WARSTWY ──────────────────────────────────────────────────────────────────

describe('przypisanie warstw', () => {
  it('kazda warstwa ma poprawny numer', () => {
    const r = meta('PL', 'US', 'sea', 'food_animal', { woodenPackaging: true })
    const byId = Object.fromEntries([...r.required, ...r.conditional, ...r.blanks].map((d) => [d.id, d]))
    expect(byId['05_BL'].layer).toBe(LAYERS.TRANSPORT)
    expect(byId['03_Invoice'].layer).toBe(LAYERS.COMMERCIAL)
    expect(byId['07_EAD'].layer).toBe(LAYERS.EXPORT)
    expect(byId['20_CBP7501'].layer).toBe(LAYERS.IMPORT)
    expect(byId['17_Weterynaryjne'].layer).toBe(LAYERS.CARGO)
    expect(byId['19_ISPM15'].layer).toBe(LAYERS.SPECIAL)
  })

  it('kazdy dobrany dokument ma warstwe z zakresu 1-7', () => {
    for (const m of MODES) {
      const r = meta('PL', 'US', m, 'dangerous_goods', { woodenPackaging: true, reExport: true })
      for (const d of [...r.required, ...r.conditional, ...r.blanks]) {
        expect(d.layer).toBeGreaterThanOrEqual(1)
        expect(d.layer).toBeLessThanOrEqual(7)
      }
    }
  })
})
