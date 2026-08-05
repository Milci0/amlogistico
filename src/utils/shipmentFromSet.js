// Przesyłka w zakładce „Śledzenie ładunku" to PROJEKCJA zestawu dokumentów
// (DocumentSet) — zero nowej tabeli, zero duplikacji danych, te same zasady
// dostępu (per-user, requireAuth) co reszta zestawów w Dokumentacji.
//
// Edycja zestawu = nowy DocumentSet (derivedFromId=oryginał — istniejący model
// audytowy, nie coś dodanego na potrzeby tej funkcji) → dedupeEditedSets()
// pokazuje tylko najnowszą wersję łańcucha, więc „edycja aktualizuje przesyłkę".
// Usunięcie zestawu = zniknięcie wpisu, bo wpis nie istnieje osobno.

// Status liczony WYŁĄCZNIE z dat, które faktycznie mamy — bez zgadywania
// „opóźniona". Kreator NIE zbiera żadnej daty dostawy (sprawdzone w
// CmrTemplate.jsx i ZlecenieTemplate.jsx — pola „Data dostawy" / „Planowana
// data dostawy" to puste, ręcznie wypełniane boxy na wydruku, niepowiązane
// z żadnym polem formularza), więc „dostarczona" może wynikać WYŁĄCZNIE
// z ręcznego potwierdzenia (meta.shipment.delivered).
export function computeShipmentStatus({ loadDate, eta, delivered }) {
  if (delivered) return 'delivered'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const load = loadDate ? new Date(loadDate) : null
  const etaDate = eta ? new Date(eta) : null
  if (load && load > today) return 'planned'
  if (etaDate && etaDate < today) return 'eta_passed'
  if (load) return 'in_transit'
  return 'planned'
}

// Mapowanie statusu ShipsGo → nasz status. Priorytet: status KONTENERA nad
// statusem PRZESYŁKI (śledzimy jeden konkretny kontener, więc jego status
// bywa dokładniejszy — potwierdzone na realnym przykładzie, gdzie
// shipment.status=DISCHARGED, ale containers[0].status już EMPTY_RETURN,
// czyli o etap dalej).
//
// UWAGA — mapa NIEPEŁNA, celowo: mamy potwierdzone tylko te trzy wartości
// (2026-08-06). ShipsGo nie publikuje pełnego wykazu statusów. Nierozpoznana
// wartość → zwracamy null, wywołujący spada wtedy na computeShipmentStatus
// (logika dat) zamiast zgadywać nowy kubełek.
const SHIPSGO_STATUS_MAP = {
  EMPTY_RETURN: 'delivered',
  DISCHARGED: 'discharged',
  ARRIVED: 'in_destination_port',
}

export function mapShipsgoStatus(containerStatus, shipmentStatus) {
  return SHIPSGO_STATUS_MAP[containerStatus] || SHIPSGO_STATUS_MAP[shipmentStatus] || null
}

// DocumentSet → widok karty/szczegółów przesyłki, albo null gdy set nie
// reprezentuje realnej przesyłki:
//  - kind:'blank' (zestaw z „Pustych szablonów") — to pobranie formularzy,
//    nie rezerwacja konkretnego transportu
//  - status !== 'completed' — tylko ukończone zestawy tworzą wpis (ustalone
//    z użytkownikiem: wersje robocze zostają wyłącznie w Dokumentacji)
//  - brak meta.transportMode — set bez trasy (nie powinno się zdarzyć dla
//    completed, ale defensywnie pomijamy)
export function toShipmentSummary(set) {
  if (set.kind || set.status !== 'completed') return null
  const m = set.meta || {}
  if (!m.transportMode) return null

  const s = m.shipment || {}
  // Fallback dla zestawów zapisanych PRZED dodaniem meta.shipment (2026-08-06):
  // meta.transportDate to ten sam route.loadDate, tylko pod starą nazwą klucza
  // — dzięki temu starsze zestawy też dostają poprawny status, tylko bez
  // szczegółów rejsu (kontener/statek), których po prostu nie zapisano.
  const loadDate = s.loadDate || m.transportDate || ''
  const branch = s.multimodal ? 'multimodal' : m.transportMode
  const delivered = !!s.delivered
  const shipsgo = s.shipsgo || null

  // Priorytet statusu: ręczne potwierdzenie usera > mapowany status ShipsGo >
  // nasza logika dat. User zawsze może wiedzieć więcej niż my ALBO niż API.
  const shipsgoStatus = shipsgo ? mapShipsgoStatus(shipsgo.containerStatus, shipsgo.status) : null
  const status = delivered
    ? 'delivered'
    : shipsgoStatus || computeShipmentStatus({ loadDate, eta: s.eta, delivered: false })

  return {
    id: set.id,
    branch,
    status,
    delivered,
    route: {
      fromCity: s.fromCity || '',
      fromCountry: m.routeFrom || '',
      toCity: s.toCity || '',
      toCountry: m.routeTo || '',
    },
    dates: { loadDate, eta: s.eta || '' },
    voyage: {
      vessel: s.vessel || '',
      voyageNo: s.voyageNo || '',
      containerNo: s.containerNo || '',
      sealNo: s.sealNo || '',
      bookingNo: s.bookingNo || '',
      flag: s.flag || '',
      containerType: s.containerType || '',
      freightTerms: s.freightTerms || '',
    },
    cargo: {
      cargoCategory: s.cargoCategory || '',
      cargoSubcategory: s.cargoSubcategory || '',
      packages: s.packages || '',
      packageType: s.packageType || '',
      weight: s.weight || '',
    },
    cargoDescription: m.cargoDescription || '',
    // Snapshot ShipsGo (jeśli włączone dla tej przesyłki) — surowy, do
    // wyświetlenia osi czasu wzbogaconej o movements i plakietki źródła.
    // null, gdy śledzenie nigdy nie zostało włączone dla tego zestawu.
    shipsgo,
    createdAt: set.createdAt,
    updatedAt: set.updatedAt,
  }
}

// Odfiltrowuje zestawy, które zostały „przykryte" nowszą edycją (są czyimś
// derivedFromId w tej samej liście) — zostaje tylko najnowsza wersja łańcucha.
// Wywołaj PRZED toShipmentSummary, na surowych DocumentSet (nie na projekcjach).
export function dedupeEditedSets(sets) {
  const superseded = new Set(sets.map((s) => s.derivedFromId).filter(Boolean))
  return sets.filter((s) => !superseded.has(s.id))
}

// Buduje pełną listę przesyłek z surowych zestawów usera (najnowsze pierwsze).
export function buildShipments(sets) {
  return dedupeEditedSets(sets)
    .map(toShipmentSummary)
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}
