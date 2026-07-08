// Jednorazowy generator: src/data/cities/{KOD}.json (top N miast per kraj wg populacji)
// Źródło: pakiet `all-the-cities` (GeoNames, populacja >=1000). Uruchom: node scripts/generate-cities.mjs
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync, writeFileSync, readFileSync } from 'fs'

const require = createRequire(import.meta.url)
const cities = require('all-the-cities')

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../src/data/cities')
const TOP_N = 30

// GeoNames liczy niektóre duże dzielnice stolic jako osobne "miasta" (własna ludność/kod).
// Wykluczamy te znane przypadki, żeby nie wypychały prawdziwych miast z top N.
const DISTRICT_BLOCKLIST = {
  PL: new Set([
    'Mokotów', 'Praga Południe', 'Praga Północ', 'Ursynów', 'Wola', 'Bielany',
    'Bemowo', 'Białołęka', 'Ochota', 'Rembertów', 'Śródmieście', 'Targówek',
    'Ursus', 'Wawer', 'Wesoła', 'Wilanów', 'Włochy', 'Żoliborz',
  ]),
}

// Polskie egzonimy dla najbardziej rozpoznawalnych miast świata.
// Klucz: "KOD_KRAJU:Nazwa z datasetu". Mniejsze miasta zostają z lokalną pisownią.
const EXONYMS = {
  'PL:Warsaw': 'Warszawa',
  'IT:Rome': 'Rzym',
  'IT:Milan': 'Mediolan',
  'IT:Turin': 'Turyn',
  'IT:Naples': 'Neapol',
  'IT:Florence': 'Florencja',
  'IT:Venice': 'Wenecja',
  'IT:Genoa': 'Genua',
  'AT:Vienna': 'Wiedeń',
  'DE:Munich': 'Monachium',
  'DE:Cologne': 'Kolonia',
  'DE:Nuremberg': 'Norymberga',
  'CZ:Prague': 'Praga',
  'HU:Budapest': 'Budapeszt',
  'RO:Bucharest': 'Bukareszt',
  'RS:Belgrade': 'Belgrad',
  'HR:Zagreb': 'Zagrzeb',
  'SI:Ljubljana': 'Lublana',
  'SK:Bratislava': 'Bratysława',
  'UA:Kyiv': 'Kijów',
  'UA:Kiev': 'Kijów',
  'UA:Lviv': 'Lwów',
  'BY:Minsk': 'Mińsk',
  'RU:Moscow': 'Moskwa',
  'RU:Saint Petersburg': 'Petersburg',
  'GR:Athens': 'Ateny',
  'GR:Thessaloniki': 'Saloniki',
  'PT:Lisbon': 'Lizbona',
  'ES:Seville': 'Sewilla',
  'DK:Copenhagen': 'Kopenhaga',
  'NL:The Hague': 'Haga',
  'BE:Antwerp': 'Antwerpia',
  'BE:Brussels': 'Bruksela',
  'CH:Geneva': 'Genewa',
  'GB:London': 'Londyn',
  'GB:Edinburgh': 'Edynburg',
  'FR:Paris': 'Paryż',
  'FR:Marseille': 'Marsylia',
  'MD:Chisinau': 'Kiszyniów',
  'XK:Pristina': 'Prisztina',
  'CY:Nicosia': 'Nikozja',
  'CN:Beijing': 'Pekin',
  'CN:Shanghai': 'Szanghaj',
  'CN:Guangzhou': 'Kanton',
  'CN:Nanjing': 'Nankin',
  'JP:Tokyo': 'Tokio',
  'KR:Seoul': 'Seul',
  'IN:New Delhi': 'Nowe Delhi',
  'SG:Singapore': 'Singapur',
  'IL:Jerusalem': 'Jerozolima',
  'SA:Mecca': 'Mekka',
  'SA:Medina': 'Medyna',
  'IQ:Baghdad': 'Bagdad',
  'IR:Tehran': 'Teheran',
  'LB:Beirut': 'Bejrut',
  'SY:Damascus': 'Damaszek',
  'AM:Yerevan': 'Erewan',
  'US:New York': 'Nowy Jork',
  'CU:Havana': 'Hawana',
  'EG:Cairo': 'Kair',
  'EG:Alexandria': 'Aleksandria',
  'LY:Tripoli': 'Trypolis',
  'ZA:Cape Town': 'Kapsztad',
  'DZ:Algiers': 'Algier',
}

const mockData = readFileSync(join(__dirname, '../src/data/mockData.js'), 'utf8')
const countryCodes = new Set(
  [...mockData.matchAll(/code: '([A-Z]{2})'/g)].map(m => m[1])
)

const byCountry = new Map()
for (const c of cities) {
  if (!countryCodes.has(c.country)) continue
  if (!byCountry.has(c.country)) byCountry.set(c.country, [])
  byCountry.get(c.country).push(c)
}

mkdirSync(OUT_DIR, { recursive: true })

let written = 0
for (const [code, list] of byCountry) {
  const blocked = DISTRICT_BLOCKLIST[code]
  const top = list
    .filter(c => !blocked?.has(c.name))
    .sort((a, b) => b.population - a.population)
    .slice(0, TOP_N)
    .map(c => EXONYMS[`${code}:${c.name}`] ?? c.name)

  // usuń duplikaty (mogą powstać po podmianie na egzonim), zachowaj kolejność (populacja malejąco)
  const names = [...new Set(top)]

  writeFileSync(join(OUT_DIR, `${code}.json`), JSON.stringify(names))
  written++
}

console.log(`Zapisano ${written} plików do ${OUT_DIR}`)
