// Kształt migawki (snapshot) stanu kreatora = formData zapisywane w DocumentSet.
// W pełni serializowalny: bez File, bez funkcji, daty jako string z <input type=date>.
// 1:1 z tym, co konsumuje documentGeneration.buildGeneratorData.

function emptyParty() {
  return { name: '', vat: '', address: '', contact: '', phone: '', iban: '', swift: '', bank: '' }
}

// ── Slajsy per gałąź transportu ────────────────────────────────────────────────
// Każda gałąź ma własny slajs; przełączenie gałęzi czyści slajs poprzedniej
// (patrz SLICE_INITIALIZERS + hasBranchData poniżej), żeby w migawce audytowej
// nie zostawały dane środka transportu, którym przesyłka ostatecznie nie jedzie.

export function initRoad() {
  return { vehicleType: '', tempFrom: '', tempTo: '', adr: false, adrClass: '', vehicleReg: '' }
}

export function initSea() {
  return {
    containerType: '',
    containerNo: '',
    sealNo: '',
    marksNos: '',
    vessel: '',
    voyageNo: '',
    bookingNo: '',
    freightTerms: 'Prepaid',
    eta: '',
    flag: '',
  }
}

export function initRail() {
  return {
    stationFrom: '',
    stationTo: '',
    groupConsignment: false,
    wagonNumbers: [],
  }
}

export function initAir() {
  return {
    airportFrom: '',
    airportTo: '',
    consolidated: false,
    knownConsignor: false,
    chargeableWeightKg: '',
  }
}

export function initMultimodalLeg(order) {
  return { order, mode: '', from: '', to: '', carrier: '' }
}

export function initMultimodal() {
  return { legs: [initMultimodalLeg(1)] }
}

export function initTerms() {
  return { incoterms: '', freightPrice: '', freightCurrency: '', paymentDays: '' }
}

// Gałąź transportu → klucz slajsu i jego inicjalizator. Jedno miejsce, z którego
// korzystają: czyszczenie przy przełączeniu gałęzi, normalizacja i walidacja.
export const SLICE_INITIALIZERS = {
  road: initRoad,
  sea: initSea,
  rail: initRail,
  air: initAir,
  multimodal: initMultimodal,
}

export const TRANSPORT_MODES = Object.keys(SLICE_INITIALIZERS)

export function createEmptySnapshot() {
  return {
    route: {
      transport: 'road',
      fromCountry: 'PL',
      fromCity: '',
      toCountry: 'DE',
      toCity: '',
      loadDate: '',
      multimodal: false,
    },
    cargo: {
      cargoName: '',
      hsCode: '',
      // Kategoria + podkategoria z data/cargoCategories.js. Zestawy zapisane przed
      // 2026-07-22 mają zamiast tego pole `cargoType` (5 dawnych rodzajów ładunku) —
      // stare migawki wczytują się bez zmian, po prostu z pustym wyborem kategorii.
      cargoCategory: '',
      cargoSubcategory: '',
      weight: '',
      weightNet: '',
      volume: '',
      packages: '',
      packageType: '',
      value: '',
      currency: '',
      notes: '',
    },
    parties: { sender: emptyParty(), receiver: emptyParty(), carrier: emptyParty() },
    road: initRoad(),
    sea: initSea(),
    rail: initRail(),
    air: initAir(),
    multimodal: initMultimodal(),
    terms: initTerms(),
  }
}

export function cloneSnapshot(snapshot) {
  return JSON.parse(JSON.stringify(snapshot))
}

// Czy w slajsie gałęzi jest cokolwiek wpisanego (odróżnia „user nic nie ruszał"
// od „user wypełnił i zaraz straci"). Pola boolean liczą się tylko gdy true,
// `freightTerms` ma wartość domyślną, więc porównujemy do świeżego slajsu.
export function hasBranchData(mode, slice) {
  const init = SLICE_INITIALIZERS[mode]
  if (!init || !slice) return false
  const fresh = init()
  return Object.keys(fresh).some((key) => {
    const value = slice[key]
    const base = fresh[key]
    // Tablice porownujemy po ZAWARTOSCI, nie po dlugosci: multimodal startuje
    // z jednym pustym etapem, wiec sam licznik nie wykrylby, ze user go wypelnil.
    if (Array.isArray(base)) return JSON.stringify(value ?? []) !== JSON.stringify(base)
    if (typeof base === 'boolean') return value === true && base === false
    return String(value ?? '') !== String(base ?? '')
  })
}

// ── Normalizacja wczytanej migawki ─────────────────────────────────────────────
// Zestawy zapisane przed dodaniem gałęzi kolej/lotnicza/multimodalna nie mają
// slajsów `rail`/`air`/`multimodal`. Bez tego kroku wejście w taki zestaw
// wywalałoby kreator na `snapshot.rail.stationFrom` (odczyt z undefined).
// Scalamy więc zapisane dane NA pusty szkielet: brakujące pola dostają wartości
// domyślne, a wszystko, co user kiedyś wpisał, zostaje nietknięte.
export function normalizeSnapshot(raw) {
  const empty = createEmptySnapshot()
  if (!raw || typeof raw !== 'object') return empty

  const mergeParty = (key) => ({ ...empty.parties[key], ...(raw.parties?.[key] || {}) })

  const legs = Array.isArray(raw.multimodal?.legs) && raw.multimodal.legs.length > 0
    ? raw.multimodal.legs.map((leg, i) => ({ ...initMultimodalLeg(i + 1), ...leg }))
    : empty.multimodal.legs

  return {
    route: { ...empty.route, ...(raw.route || {}) },
    cargo: { ...empty.cargo, ...(raw.cargo || {}) },
    parties: {
      sender: mergeParty('sender'),
      receiver: mergeParty('receiver'),
      carrier: mergeParty('carrier'),
    },
    road: { ...empty.road, ...(raw.road || {}) },
    sea: { ...empty.sea, ...(raw.sea || {}) },
    rail: { ...empty.rail, ...(raw.rail || {}) },
    air: { ...empty.air, ...(raw.air || {}) },
    multimodal: { ...empty.multimodal, ...(raw.multimodal || {}), legs },
    terms: { ...empty.terms, ...(raw.terms || {}) },
  }
}
