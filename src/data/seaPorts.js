// ── Porty morskie — dopasowanie miasta z kreatora do kodu UN/LOCODE ────────────
//
// Krok 1 kreatora zbiera kraj + miasto jako wolny tekst (CitySelect, podpowiedzi
// z data/cities/*.json, ale user może wpisać cokolwiek). Freightos (api/_lib/
// freightos.js, PORT_CODES) potrzebuje kodu UN/LOCODE. api/ nie jest budowane do
// bundla frontendu, więc to osobna, mniejsza lista po stronie klienta — tylko
// porty morskie (bez lotnisk, kreator nie ma trybu "air") z tych samych PORT_CODES.
// Precedens dla takiej duplikacji: EU_CODES istnieje osobno w
// src/services/documentGeneration.js i api/_config/tariffSources.js.

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

const SEA_PORTS = [
  { country: 'PL', aliases: ['gdansk'], code: 'PLGDN' },
  { country: 'PL', aliases: ['gdynia'], code: 'PLGDY' },
  { country: 'DE', aliases: ['hamburg'], code: 'DEHAM' },
  { country: 'DE', aliases: ['bremerhaven', 'bremen'], code: 'DEBRE' },
  { country: 'NL', aliases: ['rotterdam'], code: 'NLRTM' },
  { country: 'US', aliases: ['newark', 'new york', 'nowy jork'], code: 'USNWK' },
  { country: 'US', aliases: ['savannah'], code: 'USSAV' },
  { country: 'US', aliases: ['los angeles', 'long beach'], code: 'USLGB' },
  { country: 'US', aliases: ['houston'], code: 'USHOU' },
  { country: 'CN', aliases: ['shanghai'], code: 'CNSHA' },
  { country: 'CN', aliases: ['shenzhen', 'yantian'], code: 'CNYTN' },
  { country: 'CN', aliases: ['ningbo'], code: 'CNNGB' },
  { country: 'CN', aliases: ['tianjin'], code: 'CNTXG' },
  { country: 'GB', aliases: ['felixstowe'], code: 'GBFXT' },
  { country: 'GB', aliases: ['southampton'], code: 'GBSOU' },
  { country: 'SG', aliases: ['singapore', 'singapur'], code: 'SGSIN' },
  { country: 'MY', aliases: ['port klang', 'klang'], code: 'MYPKG' },
  { country: 'KR', aliases: ['busan'], code: 'KRBPU' },
  { country: 'JP', aliases: ['yokohama', 'tokyo', 'tokio'], code: 'JPYOK' },
  { country: 'AE', aliases: ['jebel ali', 'dubai', 'dubaj'], code: 'AEJEA' },
  { country: 'MA', aliases: ['casablanca'], code: 'MACAS' },
  { country: 'BR', aliases: ['santos'], code: 'BRSSZ' },
  { country: 'AR', aliases: ['buenos aires'], code: 'ARBUE' },
]

// Zwraca kod UN/LOCODE dla pary (miasto, kraj) albo null, gdy nie rozpoznano.
// Dopasowanie: kraj musi się zgadzać, miasto — dowolny alias jako podciąg
// znormalizowanego tekstu (bez wielkości liter i polskich znaków diakrytycznych).
export function findSeaPortCode(city, countryCode) {
  const c = normalize((city || '').trim())
  if (!c || !countryCode) return null
  const hit = SEA_PORTS.find(
    p => p.country === countryCode && p.aliases.some(a => c.includes(a) || a.includes(c))
  )
  return hit?.code ?? null
}
