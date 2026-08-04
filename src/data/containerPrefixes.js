// Prefiksy własnościowe kontenerów (BIC / ISO 6346) → rozpoznana linia żeglugowa
// + link do jej trackera. WYŁĄCZNIE podpowiedź linku — zero integracji/API,
// zero przechowywania wpisanych numerów.
//
// Kody własnościowe bywają przenoszone przy przejęciach linii — jeśli coś tu
// przestanie się zgadzać, zaktualizuj ten plik (świadomie trzymany osobno od
// komponentu, bo lista będzie żyła własnym życiem).
//
// Zweryfikowane 2026-08-04 (bic-code.org, shipping-container-info.com,
// cargoenter.com, traqocontainer.com — min. 2 niezależne źródła na prefiks).
//
// trackerUrl:
//   - funkcja (code) => url  → potwierdzony, zaobserwowany wzorzec URL danego
//     przewoźnika z numerem kontenera w adresie (link prowadzi od razu do wyniku)
//   - string                 → brak potwierdzonego wzorca URL z numerem w adresie,
//     link prowadzi do strony głównej trackera (użytkownik wkleja numer sam)
export const CARRIERS = {
  maersk: {
    name: 'Maersk',
    trackerUrl: 'https://www.maersk.com/tracking/',
  },
  msc: {
    name: 'MSC',
    trackerUrl: 'https://www.msc.com/en/track-a-shipment',
  },
  cma_cgm: {
    name: 'CMA CGM',
    trackerUrl: (code) => `https://www.cma-cgm.com/ebusiness/tracking/detail/${code}`,
  },
  hapag: {
    name: 'Hapag-Lloyd',
    trackerUrl: 'https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html',
  },
  cosco: {
    name: 'COSCO',
    trackerUrl: (code) => `https://elines.coscoshipping.com/ebusiness/cargoTracking?trackingType=CONTAINER&number=${code}`,
  },
  one: {
    name: 'ONE',
    trackerUrl: (code) => `https://ecomm.one-line.com/one-ecom/manage-shipment/cargo-tracking?trakNoParam=${code}`,
  },
  evergreen: {
    name: 'Evergreen',
    trackerUrl: 'https://ct.shipmentlink.com/servlet/TDB1_CargoTracking.do',
  },
  oocl: {
    name: 'OOCL',
    trackerUrl: 'https://www.oocl.com/eng/ourservices/eservices/cargotracking/pages/cargotracking.aspx',
  },
  yangming: {
    name: 'Yang Ming',
    trackerUrl: 'https://e-solution.yangming.com/e-service/track_trace/track_trace_cargo_tracking.aspx',
  },
  hmm: {
    name: 'HMM',
    trackerUrl: 'https://www.hmm21.com/e-service/general/trackNTrace/TrackNTrace.do',
  },
  zim: {
    name: 'ZIM',
    // Parametr obserwowany w realnym URL-u (zim.com/tools/track-a-shipment?blnumber1=...)
    // nazywa się "blnumber1" — nienazwany jednoznacznie pod kontenery, ale
    // przyjmuje numer w formacie kontenerowym w zaobserwowanym przykładzie.
    trackerUrl: (code) => `https://www.zim.com/tools/track-a-shipment?blnumber1=${code}`,
  },
}

// Prefiks (4 znaki: 3-literowy kod właściciela + litera kategorii U/J/Z) → klucz w CARRIERS.
export const CONTAINER_PREFIXES = {
  MSKU: 'maersk', MRKU: 'maersk', MAEU: 'maersk',
  MSCU: 'msc', MEDU: 'msc',
  CMAU: 'cma_cgm', CGMU: 'cma_cgm',
  HLCU: 'hapag', HLXU: 'hapag',
  COSU: 'cosco',
  ONEU: 'one', NYKU: 'one', MOLU: 'one', KKLU: 'one',
  EGHU: 'evergreen', EISU: 'evergreen',
  OOLU: 'oocl',
  YMLU: 'yangming',
  HMMU: 'hmm', HDMU: 'hmm',
  ZIMU: 'zim',
}

// Agregatory — alternatywa niezależnie od tego, czy linię rozpoznaliśmy.
// Żaden nie ma potwierdzonego wzorca URL z numerem w adresie → strony główne narzędzi.
export const AGGREGATORS = [
  { id: 'shipsgo', name: 'ShipsGo', url: 'https://shipsgo.com/ocean' },
  { id: 'tracktrace', name: 'Track-Trace', url: 'https://www.track-trace.com/container' },
  { id: 'vesselfinder', name: 'VesselFinder', url: 'https://www.vesselfinder.com/container-tracking' },
]

// Zwraca { carrierKey, name, trackerUrl } albo null gdy prefiks nierozpoznany.
export function lookupCarrierByPrefix(prefix) {
  const carrierKey = CONTAINER_PREFIXES[prefix]
  if (!carrierKey) return null
  return { carrierKey, ...CARRIERS[carrierKey] }
}

// Rozwiązuje trackerUrl (funkcja albo string) do gotowego linku dla danego numeru.
export function resolveTrackerUrl(carrier, code) {
  return typeof carrier.trackerUrl === 'function' ? carrier.trackerUrl(code) : carrier.trackerUrl
}
