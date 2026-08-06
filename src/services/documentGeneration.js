// ── Współdzielona warstwa doboru + generowania dokumentów ──────────────────────
//
// JEDNO miejsce, które: liczy listę dokumentów (getDocsList), buduje ładunek dla
// szablonów (buildGeneratorData) i generuje PDF-y (generateDocuments). Używa tego
// zarówno krok 4 kreatora, jak i „Pobierz" w historii — dzięki czemu regeneracja
// z zapisanego formData daje DOKŁADNIE ten sam komplet co pierwotny.
//
// UWAGA: nie duplikować logiki generowania PDF nigdzie indziej — wołać stąd.

import { DOCUMENTS } from '../generators/documents'
import { generatePdf } from '../generators/generatePdf'
import { withDraftBanner, draftBannerText } from '../generators/draftBanner'
import { COUNTRIES } from '../data/mockData'
import { documentCatalog } from '../data/documentCatalog'
import { getBlankTemplate } from '../data/blankTemplateMap'
import { toCatalogId, toCatalogIds } from '../data/documentIdAliases'
import { cargoLabel, engineCategoryFor } from '../data/cargoCategories'
import { getUnitType } from '../data/cargoUnits'
import { getDocuments } from '../utils/documentEngine'
import { downloadBlankDocument } from '../utils/blankDocuments'
import { normalizeSnapshot } from '../components/wizard/wizardState'

// Rodzaj pojazdu drogowego (Plandeka/Chłodnia/Mroźnia, Krok 3 kreatora) — PL
// zostaje jedynym źródłem wartości w UI (checkbox/toggle), ale dokumenty
// Grupy A (Zlecenie, TIR Carnet) pokazują PL/EN jak reszta ich etykiet, więc
// dokładamy tu odpowiednik EN zamiast wpisywać go na sztywno w szablonach.
const VEHICLE_TYPE_EN = {
  'Plandeka': 'Tarpaulin (curtainsider)',
  'Chłodnia': 'Refrigerated (reefer)',
  'Mroźnia': 'Freezer',
}

// Lista kodów UE — spójna z DocumentWizard/EU_CODES.
const EU_CODES = [
  'PL', 'DE', 'FR', 'NL', 'BE', 'CZ', 'SK', 'AT', 'IT', 'ES', 'PT', 'SE', 'DK',
  'FI', 'HU', 'RO', 'BG', 'HR', 'GR', 'EE', 'LV', 'LT',
]

export function computeBothEU(route) {
  const from = COUNTRIES.find((c) => c.code === route.fromCountry)
  const to = COUNTRIES.find((c) => c.code === route.toCountry)
  return !!(from && to && EU_CODES.includes(from.code) && EU_CODES.includes(to.code))
}

// ── Migawka → argumenty silnika doboru ─────────────────────────────────────────
// Kreator i „Puste szablony" wołają TEN SAM silnik (utils/documentEngine.js).
// Wcześniej kreator miał własny, 9-dokumentowy rejestr z jednym boolem `bothEU`.

// Migawka → flagi silnika. TU NIE MA ŻADNEJ REGUŁY DOBORU — wyłącznie przepisanie
// pól formularza na nazwy, które rozumie silnik. Każda reguła (np. „ADR podnosi
// kategorię do towarów niebezpiecznych") mieszka w documentEngine.js, żeby kreator
// i „Puste szablony" liczyły identycznie.
//
// UWAGA: pola oznaczone (*) nie mają dziś odpowiednika w kreatorze — ustawia je
// tylko formularz „Pustych szablonów". Odczyt zostaje, bo jest nieszkodliwy
// i zadziała od razu, gdy pole pojawi się w migawce.
function buildEngineFlags(s) {
  return {
    // Checkbox „Transport multimodalny" (krok „Trasa") i checkbox ADR (krok
    // „Towar", gałąź drogowa) — obie reguły egzekwuje silnik.
    multimodal: !!s.route.multimodal,
    // Pytanie „Jak zorganizowany jest przewóz?" (krok „Trasa", tylko gałąź
    // multimodal) — 'single' → MTD jak dotąd, 'separate' → dokument per gałąź
    // z legs[], patrz addTransportLayerDocs w documentEngine.js. legs[].mode
    // zostaje spłaszczone do samych trybów (silnik nie potrzebuje carrier/from/to
    // dla doboru dokumentów — te pola idą tylko na wydruk MTD/listów per odcinek).
    multimodalContractType: s.multimodal?.contractType || null,
    multimodalLegs: (s.multimodal?.legs || []).map((l) => l.mode).filter(Boolean),
    adr: !!s.road?.adr,
    woodenPackaging: !!s.cargo.woodenPackaging, // (*)
    temporaryExport: !!s.cargo.temporaryExport, // (*)
    transhipment: !!s.sea.transhipment, // (*)
    reExport: !!s.cargo.reExport, // (*)
    transitNonEU: !!s.route.transitNonEU, // (*)
    transitCountries: Array.isArray(s.route.transitCountries) ? s.route.transitCountries : [], // (*)

    // ETAP 2 Promptu 2 — flagi gałęzi, które wpływają na dobór.
    //
    // `containerized` NIE jest osobnym polem formularza. SOLAS obejmuje każdy
    // ZAPAKOWANY KONTENER, ale nie ładunek drobnicowy, a użytkownik i tak
    // deklaruje kontener numerem lub typem w kroku „Towar" (gałąź morska).
    // Wyprowadzamy więc flagę z tego, co już wpisał, zamiast dokładać checkbox.
    containerized: !!(s.sea?.containerNo || s.sea?.containerType),
    consolidated: !!s.air?.consolidated,
    groupConsignment: !!s.rail?.groupConsignment,

    // SUROWE id kategorii z cargoCategories.js, obok kategorii silnika.
    // Dwanaście z dziewiętnastu kategorii mapuje się na `general`, więc akcyzy,
    // CBAM i EUDR nie da się z niej odróżnić (patrz komentarz w silniku).
    cargoCategoryId: s.cargo.cargoCategory || '',
  }
}

// Pełny wynik silnika dla migawki: { required, conditional, blanks, warnings }.
export function getEngineResultForSnapshot(snapshot) {
  const s = normalizeSnapshot(snapshot)
  return getDocuments(
    s.route.fromCountry,
    s.route.toCountry,
    s.route.transport,
    engineCategoryFor(s.cargo.cargoCategory, s.cargo.cargoSubcategory),
    buildEngineFlags(s),
    { includeMetadata: true }
  )
}

// Opis dokumentu w liście kreatora. Dziewięć dokumentów z dawnego rejestru ma
// ręcznie napisane `desc` — szkoda je stracić; reszta dostaje nazwę angielską.
const LEGACY_DESC = Object.fromEntries(DOCUMENTS.map((d) => [toCatalogId(d.key), d.desc]))
const LEGACY_FILENAME = Object.fromEntries(DOCUMENTS.map((d) => [toCatalogId(d.key), d.filename]))

// Nazwa pobieranego pliku. Dla dziewięciu dokumentów kreatora zostaje dotychczasowa
// (CMR.pdf, Faktura_Handlowa.pdf); dla pozostałych bierzemy nazwę z katalogu
// szablonów, zdejmując sufiks „_pusty" (ten sam plik służy jako pusty formularz).
function filenameFor(catalogId, template) {
  if (LEGACY_FILENAME[catalogId]) return LEGACY_FILENAME[catalogId]
  const blank = template?.filename || `${catalogId}.pdf`
  return blank.replace(/_pusty(?=\.pdf$)/, '')
}

// Wpis silnika → wpis listy dokumentów kreatora.
function toWizardDoc(entry, section) {
  const catalog = documentCatalog[entry.id] || {}
  const template = getBlankTemplate(entry.id)
  return {
    key: entry.id,
    name: catalog.name_pl || entry.name_pl,
    nameEn: catalog.name_en || entry.name_en,
    desc: LEGACY_DESC[entry.id] || catalog.name_en || '',
    required: section === 'required',
    section,
    outputMode: entry.outputMode,
    issuerType: entry.issuerType,
    authority: catalog.authority || null,
    blocking: entry.blocking,
    layer: entry.layer,
    filename: filenameFor(entry.id, template),
    template: template?.template || null,
  }
}

// Płaska lista dokumentów dla migawki — kontrakt bez zmian (tablica), zmieniło się
// tylko źródło: silnik 7-warstwowy zamiast 9-elementowego rejestru. `section`
// rozdziela wymagane / opcjonalne / do wypełnienia ręcznie.
export function getDocsForSnapshot(snapshot) {
  const result = getEngineResultForSnapshot(snapshot)
  return [
    ...result.required.map((e) => toWizardDoc(e, 'required')),
    ...result.conditional.map((e) => toWizardDoc(e, 'optional')),
    ...result.blanks.map((e) => toWizardDoc(e, 'manual')),
  ]
}

// ── Etapy przewozu multimodalnego → wiersze tabeli MTD ─────────────────────────
//
// Zastępuje dawne trzy stałe sloty (preCarriage/mainCarriage/onCarriage)
// wypełniane ślepo wg indeksu/liczby etapów, bez patrzenia na tryb czy
// geografię. Nowa reguła:
//
//   - dokładnie 3 etapy               → Pre-carriage / Main-carriage / On-carriage
//     (struktura stała, tak jak w oryginalnym MTD — niezależna od trybu)
//   - inna liczba etapów, JEST sea/air → pierwszy znaleziony etap sea/air to
//     Main-carriage; wszystko przed nim to Pre-carriage (numerowane gdy >1),
//     wszystko po nim to On-carriage (numerowane gdy >1)
//   - inna liczba etapów, BRAK sea/air → sekwencyjne „Leg 1", „Leg 2"... BEZ
//     etykiet Pre/Main/On — te mają sens tylko względem głównego odcinka
//     morskiego/lotniczego (MTD bywa weryfikowany wg UCP 600), więc wymuszanie
//     ich przy czysto drogowo-kolejowym łańcuchu byłoby mylące
//
// Place of Receipt = „Skąd" pierwszego wiersza, Place of Delivery = „Dokąd"
// ostatniego — zawsze, niezależnie od wariantu. POL/POD (Port of Loading/
// Discharge) mają sens wyłącznie przy Main-carriage, więc pojawiają się TYLKO
// tam; w wariancie „Leg 1/2/3" zostają puste na wszystkich wierszach.
// „Dokąd" etapu N i „Skąd" etapu N+1 to ten sam punkt przeładunku — gdy jedno
// jest puste, bierzemy drugie.
//
// Brak etapów w ogóle traktujemy jak wariant „bez sea/air": jeden neutralny
// wiersz „Leg 1" z przewoźnikiem z Kroku „Strony" (dotychczasowy fallback).
function buildTransportLegRows(multimodal, carrier) {
  const legs = (multimodal?.legs || []).filter((l) => l && (l.carrier || l.from || l.to || l.mode))
  const fallbackCarrier = { carrierName: carrier.name, carrierAddress: carrier.address, carrierVatNumber: carrier.vat }
  const carrierFrom = (leg) => ({ carrierName: leg?.carrier || '', carrierAddress: '', carrierVatNumber: '' })

  if (legs.length === 0) {
    return [{
      label: 'Leg 1',
      mode: '',
      placeOfReceipt: '',
      pol: '',
      pod: '',
      placeOfDelivery: '',
      ...fallbackCarrier,
    }]
  }

  const boundaryBefore = (i) => (i === 0 ? legs[0].from || '' : (legs[i - 1].to || legs[i].from || ''))
  const boundaryAfter = (i) => (i === legs.length - 1 ? legs[i].to || '' : (legs[i].to || legs[i + 1].from || ''))

  const mkRow = (label, i, isMain) => ({
    label,
    mode: legs[i].mode || '',
    placeOfReceipt: '',
    pol: isMain ? boundaryBefore(i) : '',
    pod: isMain ? boundaryAfter(i) : '',
    placeOfDelivery: '',
    ...carrierFrom(legs[i]),
  })

  let rows
  if (legs.length === 3) {
    rows = [mkRow('Pre-carriage', 0, false), mkRow('Main-carriage', 1, true), mkRow('On-carriage', 2, false)]
  } else {
    const mainIdx = legs.findIndex((l) => l.mode === 'sea' || l.mode === 'air')
    if (mainIdx === -1) {
      rows = legs.map((_, i) => mkRow(`Leg ${i + 1}`, i, false))
    } else {
      const preLegs = legs.slice(0, mainIdx)
      const onLegs = legs.slice(mainIdx + 1)
      rows = [
        ...preLegs.map((_, i) => mkRow(preLegs.length > 1 ? `Pre-carriage ${i + 1}` : 'Pre-carriage', i, false)),
        mkRow('Main-carriage', mainIdx, true),
        ...onLegs.map((_, i) => mkRow(onLegs.length > 1 ? `On-carriage ${i + 1}` : 'On-carriage', mainIdx + 1 + i, false)),
      ]
    }
  }

  rows[0].placeOfReceipt = legs[0].from || ''
  rows[rows.length - 1].placeOfDelivery = legs[legs.length - 1].to || ''
  return rows
}

// Język dokumentu — JEDNO źródło prawdy, przekazywane w dół do buildGeneratorData
// zamiast każdy szablon miałby sam decydować, skąd wziąć preferencję usera.
// Niezależne od języka interfejsu (osobne ustawienie w Profil → Preferencje).
// Nieznana/pusta wartość => 'PL' (m.in. stare zapisane zestawy bez tego pola).
function normalizeLanguage(language) {
  return language === 'EN' ? 'EN' : 'PL'
}

// Migawka kreatora → płaski ładunek konsumowany przez szablony JSX.
// (Mapowanie przeniesione 1:1 z dawnego Step4 — nie zmieniać kształtu bez zmiany szablonów.)
export function buildGeneratorData(rawSnapshot, language) {
  // normalizeSnapshot: „Pobierz" w Historii regeneruje z zapisanego formData, a
  // zestawy sprzed dodania gałęzi kolejowej/lotniczej/multimodalnej nie mają tych
  // slajsów. Bez uzupełnienia braków destrukturyzacja dawałaby undefined i pierwsze
  // odwołanie (rail.stationFrom) rzucałoby przy generowaniu STAREGO dokumentu.
  const snapshot = normalizeSnapshot(rawSnapshot)
  const { route, cargo, parties, road, sea, rail, air, multimodal, terms } = snapshot
  // Typ jednostki ładunku (PLT/CTN/…) rozwiązany raz do PL/EN nazwy + kodu
  // UN/ECE Rec 21, żeby szablony PDF nie musiały same importować cargoUnits.js.
  const unitType = getUnitType(cargo.packageType)
  return {
    language: normalizeLanguage(language),
    transport: route.transport,
    multimodal: route.multimodal,
    fromCountry: route.fromCountry,
    fromCity: route.fromCity,
    toCountry: route.toCountry,
    toCity: route.toCity,
    loadDate: route.loadDate,
    cargo: {
      name: cargo.cargoName,
      hsCode: cargo.hsCode,
      // `cargoType` zostaje w ładunku dla szablonów; dla nowych zestawów wypełnia je
      // etykieta kategorii/podkategorii, dla starych — dawny 5-elementowy rodzaj ładunku.
      cargoType: cargoLabel(cargo.cargoCategory, cargo.cargoSubcategory) || cargo.cargoType || '',
      cargoCategory: cargo.cargoCategory || '',
      cargoSubcategory: cargo.cargoSubcategory || '',
      weight: cargo.weight,
      weightNet: cargo.weightNet,
      volume: cargo.volume,
      packages: cargo.packages,
      packageType: cargo.packageType || '',
      packageTypeName: unitType?.name || '',
      packageTypeNameEn: unitType?.nameEn || '',
      packageTypeUnCode: unitType?.unCode || '',
      value: cargo.value,
      currency: cargo.currency,
      notes: cargo.notes,
      incoterms: terms.incoterms,
      containerType: sea.containerType,
      containerNo: sea.containerNo,
      sealNo: sea.sealNo,
      marksNos: sea.marksNos,
      vessel: sea.vessel,
      voyageNo: sea.voyageNo,
    },
    sender: { ...parties.sender, country: route.fromCountry },
    receiver: { ...parties.receiver, country: route.toCountry },
    carrier: {
      name: parties.carrier.name,
      address: parties.carrier.address,
      vatNumber: parties.carrier.vat,
      contact: parties.carrier.contact,
      phone: parties.carrier.phone,
    },
    carrierLegs: { rows: buildTransportLegRows(multimodal, parties.carrier) },
    vehicle: {
      type: road.vehicleType,
      typeEn: VEHICLE_TYPE_EN[road.vehicleType] || '',
      tempFrom: road.tempFrom,
      tempTo: road.tempTo,
      adr: road.adr,
      adrClass: road.adrClass,
      reg: road.vehicleReg,
    },
    sea: {
      bookingNo: sea.bookingNo,
      freightTerms: sea.freightTerms,
      eta: sea.eta,
      flag: sea.flag,
    },
    rail: {
      stationFrom: rail.stationFrom,
      stationTo: rail.stationTo,
      groupConsignment: rail.groupConsignment,
      // Szablon CIM ma jedno pole na wagony — lista trafia jako tekst rozdzielony przecinkami.
      wagonNumbers: (rail.wagonNumbers || []).filter(Boolean).join(', '),
    },
    air: {
      airportFrom: air.airportFrom,
      airportTo: air.airportTo,
      consolidated: air.consolidated,
      knownConsignor: air.knownConsignor,
      chargeableWeightKg: air.chargeableWeightKg,
    },
    terms: {
      freightPrice: terms.freightPrice,
      freightCurrency: terms.freightCurrency,
      paymentDays: terms.paymentDays,
    },
  }
}

// Serializowalny obraz doboru dokumentów zapisywany w DocumentSet.engineResult.
// (lista niesie też komponenty szablonów — te odrzucamy, zostają metadane.)
// `required` zostaje polem boolowskim, bo po nim dzieli listę DocumentCard —
// także w rekordach zapisanych przed unifikacją.
export function buildEngineResult(snapshot) {
  const result = getEngineResultForSnapshot(snapshot)
  return {
    docs: getDocsForSnapshot(snapshot).map((d) => ({
      key: d.key,
      name: d.name,
      desc: d.desc,
      icon: 'doc',
      filename: d.filename,
      required: d.required,
      section: d.section,
      outputMode: d.outputMode,
    })),
    warnings: result.warnings,
  }
}

// Metadane karty/wyszukiwarki. `documentLanguage` zapisywany tu (nie tylko użyty
// przy generowaniu), żeby regeneracja/pobranie STAREGO zestawu z historii
// odtwarzała dokument w JĘZYKU, w którym powstał — a nie w aktualnej preferencji
// profilu, która mogła się od tamtej pory zmienić (ten sam powód co templateVersion).
//
// `shipment` — podsumowanie do karty przesyłki w zakładce „Śledzenie ładunku"
// (2026-08-06). Zero nowych pól w kreatorze — WYŁĄCZNIE to, co user już wpisał
// (route/sea/cargo), skopiowane tu, żeby lista `/tracking` nie musiała dociągać
// pełnego `formData` dla każdego zestawu (lista zwraca `meta` bez `formData`).
// `delivered` NIE jest tu inicjalizowane — ustawiane wyłącznie przez
// documentSetsRepo.markDelivered() (ręczne potwierdzenie, bo kreator nie zbiera
// żadnej daty dostawy — sprawdzone w CmrTemplate/ZlecenieTemplate, te pola są
// puste na wydruku).
export function buildMeta(snapshot, language) {
  return {
    routeFrom: snapshot.route.fromCountry,
    routeTo: snapshot.route.toCountry,
    transportMode: snapshot.route.transport,
    cargoDescription: snapshot.cargo.cargoName,
    transportDate: snapshot.route.loadDate,
    documentLanguage: normalizeLanguage(language),
    shipment: {
      fromCity: snapshot.route.fromCity,
      toCity: snapshot.route.toCity,
      multimodal: !!snapshot.route.multimodal,
      loadDate: snapshot.route.loadDate,
      eta: snapshot.sea.eta || '',
      vessel: snapshot.sea.vessel || '',
      voyageNo: snapshot.sea.voyageNo || '',
      containerNo: snapshot.sea.containerNo || '',
      sealNo: snapshot.sea.sealNo || '',
      bookingNo: snapshot.sea.bookingNo || '',
      flag: snapshot.sea.flag || '',
      containerType: snapshot.sea.containerType || '',
      freightTerms: snapshot.sea.freightTerms || '',
      cargoCategory: snapshot.cargo.cargoCategory || '',
      cargoSubcategory: snapshot.cargo.cargoSubcategory || '',
      packages: snapshot.cargo.packages || '',
      packageType: snapshot.cargo.packageType || '',
      weight: snapshot.cargo.weight || '',
    },
  }
}

// Prefiks nazwy pliku dla dokumentów wygenerowanych z danymi — odróżnia je od
// pustych formularzy („Pusty_", patrz src/utils/blankDocuments.js).
const FILLED_PREFIX = 'Wypelniony_'

// Generuje JEDEN dokument. Dokument o outputMode 'draft' dostaje nagłówek
// zależny od tego, KTO go wystawia (patrz generators/draftBanner.jsx).
// Dokument 'blank_only' nie jest wypełniany danymi użytkownika — pobieramy
// sam pusty formularz, bo platforma nie jest jego wystawcą.
async function generateOne(doc, data) {
  if (doc.outputMode === 'blank_only') {
    await downloadBlankDocument(doc.key, doc.name)
    return
  }
  if (!doc.template) throw new Error(`Brak szablonu JSX dla dokumentu ${doc.key}`)

  const banner = draftBannerText(doc, data.language)
  const Component = banner ? withDraftBanner(doc.template, banner) : doc.template
  await generatePdf(Component, data, `${FILLED_PREFIX}${doc.filename}`)
}

// Generuje wybrane dokumenty z migawki. onStatus(key, 'loading'|'done'|'error')
// pozwala kreatorowi pokazywać status na żywo. Zwraca { failed: [key...] } —
// nie rzuca, aby jeden błędny szablon nie wywalił reszty.
//
// ALIAS ID (krytyczne): `keys` bywa listą `selectedDocs` wprost z bazy, a zestawy
// zapisane przed unifikacją mają tam stare klucze rejestru kreatora ('cmr',
// 'packing'). Bez przemapowania filtr nie trafiłby w nic i funkcja zwróciłaby
// { failed: [] } — czyli UDANE pobranie zera plików, bez żadnego komunikatu.
// Tędy prowadzą OBIE ścieżki pobierania z Historii: handleDownload (cały zestaw)
// i handleDownloadOne (pojedynczy wiersz rozwiniętej karty, do którego wchodzi
// DocumentCard.handleDocDownload).
export async function generateDocuments(snapshot, keys, onStatus, language) {
  const data = buildGeneratorData(snapshot, language)
  const wanted = toCatalogIds(keys)
  const docs = getDocsForSnapshot(snapshot).filter((d) => wanted.includes(d.key))
  const failed = []
  for (const doc of docs) {
    onStatus?.(doc.key, 'loading')
    try {
      await generateOne(doc, data)
      onStatus?.(doc.key, 'done')
    } catch (err) {
      console.error('Błąd generowania PDF:', doc.key, err)
      onStatus?.(doc.key, 'error')
      failed.push(doc.key)
    }
  }
  return { failed }
}

// Diagnostyka dla wywołujących: które z zapisanych id NIE mają pokrycia w bieżącym
// doborze. Pusty wynik generowania przestaje być cichy — HistoryPage może pokazać
// komunikat zamiast udawać sukces.
export function findUnresolvedDocIds(snapshot, keys) {
  const available = new Set(getDocsForSnapshot(snapshot).map((d) => d.key))
  return toCatalogIds(keys).filter((id) => !available.has(id))
}
