// Prefiksy własnościowe kontenerów (BIC / ISO 6346) → rozpoznana linia żeglugowa
// LUB leasingodawca + link do trackera. WYŁĄCZNIE podpowiedź linku — zero
// integracji/API, zero przechowywania wpisanych numerów.
//
// type: 'carrier' — kontener własny linii, prefiks jednoznacznie wskazuje
//       przewoźnika → bezpośredni link do JEJ trackera.
// type: 'lessor'  — kontener firmy leasingowej (Triton, Textainer, Florens...) —
//       może być obsługiwany przez DOWOLNĄ linię. NIE zgadujemy przewoźnika,
//       pokazujemy tylko nazwę leasingodawcy i kierujemy do agregatorów.
//
// Kody własnościowe bywają przenoszone przy przejęciach — jeśli coś tu
// przestanie się zgadzać, zaktualizuj ten plik (świadomie trzymany osobno od
// komponentu, bo lista będzie żyła własnym życiem).
//
// Zweryfikowane 2026-08-05 WYŁĄCZNIE przez rejestr bic-code.org (bic-code.org/bic-codes/{kod}/),
// krzyżowo potwierdzone drugim źródłem tam, gdzie było to możliwe.
//
// Świadomie NIE dodano (znaleziono w BIC, ale powiązanie z przewoźnikiem
// niepewne — lepszy brak wpisu niż złe skierowanie, patrz notatka w PR):
//   EITU → "GAINING ENTERPRISE S.A." (Panama) — pojawia się w nieoficjalnych
//     listach jako prefiks Evergreen, ale BIC nie potwierdza tej nazwy jako
//     spółki z grupy Evergreen. Pominięty.
//
// trackerUrl (tylko type:'carrier'):
//   - funkcja (code) => url  → potwierdzony, zaobserwowany wzorzec URL danego
//     przewoźnika z numerem kontenera w adresie (link prowadzi od razu do wyniku)
//   - string                 → brak potwierdzonego wzorca URL z numerem w adresie,
//     link prowadzi do strony głównej trackera (użytkownik wkleja numer sam)
// homeUrl (tylko type:'carrier', opcjonalne) — strona główna trackera BEZ
//   podstawionego numeru; używana przy wyszukiwaniu po NAZWIE przewoźnika,
//   gdy nie mamy żadnego numeru do podstawienia. Dla carrierów, gdzie
//   trackerUrl jest już samym stringiem (stroną główną), homeUrl nie jest
//   potrzebne — resolveHomeUrl() spada wtedy na trackerUrl.
export const CARRIERS = {
  maersk: {
    type: 'carrier',
    name: 'Maersk',
    trackerUrl: 'https://www.maersk.com/tracking/',
  },
  msc: {
    type: 'carrier',
    name: 'MSC',
    trackerUrl: 'https://www.msc.com/en/track-a-shipment',
  },
  cma_cgm: {
    type: 'carrier',
    name: 'CMA CGM',
    homeUrl: 'https://www.cma-cgm.com/ebusiness/tracking',
    trackerUrl: (code) => `https://www.cma-cgm.com/ebusiness/tracking/detail/${code}`,
  },
  hapag: {
    type: 'carrier',
    name: 'Hapag-Lloyd',
    trackerUrl: 'https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html',
  },
  cosco: {
    type: 'carrier',
    name: 'COSCO',
    homeUrl: 'https://elines.coscoshipping.com/ebusiness/cargoTracking',
    trackerUrl: (code) => `https://elines.coscoshipping.com/ebusiness/cargoTracking?trackingType=CONTAINER&number=${code}`,
  },
  one: {
    type: 'carrier',
    name: 'ONE',
    homeUrl: 'https://ecomm.one-line.com/one-ecom/manage-shipment/cargo-tracking',
    trackerUrl: (code) => `https://ecomm.one-line.com/one-ecom/manage-shipment/cargo-tracking?trakNoParam=${code}`,
  },
  evergreen: {
    type: 'carrier',
    name: 'Evergreen',
    trackerUrl: 'https://ct.shipmentlink.com/servlet/TDB1_CargoTracking.do',
  },
  oocl: {
    type: 'carrier',
    name: 'OOCL',
    trackerUrl: 'https://www.oocl.com/eng/ourservices/eservices/cargotracking/pages/cargotracking.aspx',
  },
  yangming: {
    type: 'carrier',
    name: 'Yang Ming',
    trackerUrl: 'https://e-solution.yangming.com/e-service/track_trace/track_trace_cargo_tracking.aspx',
  },
  hmm: {
    type: 'carrier',
    name: 'HMM',
    trackerUrl: 'https://www.hmm21.com/e-service/general/trackNTrace/TrackNTrace.do',
  },
  zim: {
    type: 'carrier',
    name: 'ZIM',
    homeUrl: 'https://www.zim.com/tools/track-a-shipment',
    // Parametr obserwowany w realnym URL-u (zim.com/tools/track-a-shipment?blnumber1=...)
    // nazywa się "blnumber1" — nienazwany jednoznacznie pod kontenery, ale
    // przyjmuje numer w formacie kontenerowym w zaobserwowanym przykładzie.
    trackerUrl: (code) => `https://www.zim.com/tools/track-a-shipment?blnumber1=${code}`,
  },
  // ── Leasingodawcy — kontener może jeździć pod dowolną linią, nie zgadujemy ──
  triton: { type: 'lessor', name: 'Triton' },
  textainer: { type: 'lessor', name: 'Textainer' },
  florens: { type: 'lessor', name: 'Florens Asset Management' },
  cosco_shipping_development: { type: 'lessor', name: 'COSCO Shipping Development' },
}

// Prefiks (4 znaki: 3-literowy kod właściciela + litera kategorii U/J/Z) → klucz w CARRIERS.
export const CONTAINER_PREFIXES = {
  // Maersk — MSKU/MRKU/MAEU zweryfikowane wcześniej; MMAU/MCAU/MNBU dodane
  // 2026-08-05 (BIC: wszystkie trzy zarejestrowane na "Maersk A/S", Dania).
  MSKU: 'maersk', MRKU: 'maersk', MAEU: 'maersk', MMAU: 'maersk', MCAU: 'maersk', MNBU: 'maersk',
  // MSC — MSDU dodane 2026-08-05 (BIC: "MSC - Mediterranean Shipping Company S.A.").
  MSCU: 'msc', MEDU: 'msc', MSDU: 'msc',
  // CMA CGM — CGMU już było; ECMU/AMCU dodane 2026-08-05 (BIC: obie na "CMA-CGM").
  CMAU: 'cma_cgm', CGMU: 'cma_cgm', ECMU: 'cma_cgm', AMCU: 'cma_cgm',
  // Hapag-Lloyd — HLBU/HAMU dodane 2026-08-05 (BIC: obie na "Hapag Lloyd A.G").
  HLCU: 'hapag', HLXU: 'hapag', HLBU: 'hapag', HAMU: 'hapag',
  COSU: 'cosco',
  // ONE — MOAU dodane 2026-08-05 (BIC: "Ocean Network Express Pte. Ltd.");
  // KKFU dodane (BIC: "Kawasaki Kisen Kaisha Ltd - K Line", ta sama spółka co
  // już obecne KKLU — K-Line weszło w skład ONE dla operacji kontenerowych).
  ONEU: 'one', NYKU: 'one', MOLU: 'one', KKLU: 'one', MOAU: 'one', KKFU: 'one',
  // Evergreen — EMCU/EGSU dodane 2026-08-05 (BIC: "Evergreen Marine Corp
  // (Taiwan) Ltd" / "Evergreen Marine (Asia) Pte Ltd").
  EGHU: 'evergreen', EISU: 'evergreen', EMCU: 'evergreen', EGSU: 'evergreen',
  OOLU: 'oocl',
  YMLU: 'yangming',
  HMMU: 'hmm', HDMU: 'hmm',
  ZIMU: 'zim',
  // ── Leasingodawcy — dodane 2026-08-05, wszystkie potwierdzone w BIC ──
  TTNU: 'triton', TLLU: 'triton', TCLU: 'triton', TRIU: 'triton',
  SEKU: 'textainer', TEMU: 'textainer',
  CBHU: 'florens', FSCU: 'florens',
  CCLU: 'cosco_shipping_development',
}

// Agregatory — alternatywa niezależnie od tego, czy linię/leasingodawcę rozpoznaliśmy.
// Żaden nie ma potwierdzonego wzorca URL z numerem w adresie → strony główne narzędzi.
export const AGGREGATORS = [
  { id: 'shipsgo', name: 'ShipsGo', url: 'https://shipsgo.com/ocean' },
  { id: 'tracktrace', name: 'Track-Trace', url: 'https://www.track-trace.com/container' },
  { id: 'vesselfinder', name: 'VesselFinder', url: 'https://www.vesselfinder.com/container-tracking' },
]

// Zwraca { key, type, name, trackerUrl?, homeUrl? } albo null gdy prefiks nierozpoznany.
export function lookupCarrierByPrefix(prefix) {
  const key = CONTAINER_PREFIXES[prefix]
  if (!key) return null
  return { key, ...CARRIERS[key] }
}

// Rozwiązuje trackerUrl (funkcja albo string) do gotowego linku dla danego numeru.
// Tylko dla type:'carrier' — leasingodawcy nie mają własnego trackera.
export function resolveTrackerUrl(carrier, code) {
  return typeof carrier.trackerUrl === 'function' ? carrier.trackerUrl(code) : carrier.trackerUrl
}

// Strona główna trackera BEZ podstawionego numeru — używana przy wyszukiwaniu
// po nazwie przewoźnika, gdy nie mamy konkretnego numeru kontenera.
export function resolveHomeUrl(carrier) {
  if (carrier.homeUrl) return carrier.homeUrl
  return typeof carrier.trackerUrl === 'string' ? carrier.trackerUrl : null
}

function normalizeCarrierName(s) {
  return (s || '').toLowerCase().replace(/[\s-]/g, '')
}

// Wyszukiwanie po (fragmencie) nazwy przewoźnika — WYŁĄCZNIE wśród type:'carrier'
// (leasingodawców nie szukamy po nazwie, bo nie mają własnego trackera do pokazania).
// Dopasowanie odporne na wielkość liter, spacje i myślniki w obie strony
// ("cma" pasuje do "CMA CGM", "cma cgm"/"cma-cgm" też pasują).
// Zwraca { key, type, name, ... } dla pierwszego dopasowania albo null.
export function findCarrierByName(query) {
  const q = normalizeCarrierName(query)
  if (!q) return null
  for (const [key, carrier] of Object.entries(CARRIERS)) {
    if (carrier.type !== 'carrier') continue
    const name = normalizeCarrierName(carrier.name)
    if (name.includes(q) || q.includes(name)) return { key, ...carrier }
  }
  return null
}
