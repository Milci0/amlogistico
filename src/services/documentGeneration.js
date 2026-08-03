// ── Współdzielona warstwa doboru + generowania dokumentów ──────────────────────
//
// JEDNO miejsce, które: liczy listę dokumentów (getDocsList), buduje ładunek dla
// szablonów (buildGeneratorData) i generuje PDF-y (generateDocuments). Używa tego
// zarówno krok 4 kreatora, jak i „Pobierz" w historii — dzięki czemu regeneracja
// z zapisanego formData daje DOKŁADNIE ten sam komplet co pierwotny.
//
// UWAGA: nie duplikować logiki generowania PDF nigdzie indziej — wołać stąd.

import { getDocsList, generateDocument } from '../generators/documents'
import { COUNTRIES } from '../data/mockData'
import { cargoLabel } from '../data/cargoCategories'
import { getUnitType } from '../data/cargoUnits'

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

// Lista dokumentów dla danej migawki (identyczna z tym, co pokazuje krok 4).
export function getDocsForSnapshot(snapshot) {
  return getDocsList(snapshot.route.transport, computeBothEU(snapshot.route), snapshot.route.multimodal)
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
export function buildGeneratorData(snapshot, language) {
  const { route, cargo, parties, road, sea, terms } = snapshot
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
    carrierLegs: {
      preCarriage: { name: '', address: '', vatNumber: '' },
      mainCarriage: {
        name: parties.carrier.name,
        address: parties.carrier.address,
        vatNumber: parties.carrier.vat,
      },
      onCarriage: { name: '', address: '', vatNumber: '' },
    },
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
    terms: {
      freightPrice: terms.freightPrice,
      freightCurrency: terms.freightCurrency,
      paymentDays: terms.paymentDays,
    },
  }
}

// Serializowalny obraz doboru dokumentów zapisywany w DocumentSet.engineResult.
// (getDocsList zwraca też komponenty szablonów — te odrzucamy, zostają metadane.)
export function buildEngineResult(snapshot) {
  return {
    docs: getDocsForSnapshot(snapshot).map((d) => ({
      key: d.key,
      name: d.name,
      desc: d.desc,
      icon: d.icon,
      filename: d.filename,
      required: d.required,
    })),
    warnings: [],
  }
}

// Metadane karty/wyszukiwarki. `documentLanguage` zapisywany tu (nie tylko użyty
// przy generowaniu), żeby regeneracja/pobranie STAREGO zestawu z historii
// odtwarzała dokument w JĘZYKU, w którym powstał — a nie w aktualnej preferencji
// profilu, która mogła się od tamtej pory zmienić (ten sam powód co templateVersion).
export function buildMeta(snapshot, language) {
  return {
    routeFrom: snapshot.route.fromCountry,
    routeTo: snapshot.route.toCountry,
    transportMode: snapshot.route.transport,
    cargoDescription: snapshot.cargo.cargoName,
    transportDate: snapshot.route.loadDate,
    documentLanguage: normalizeLanguage(language),
  }
}

// Generuje wybrane dokumenty z migawki. onStatus(key, 'loading'|'done'|'error')
// pozwala kreatorowi pokazywać status na żywo. Zwraca { failed: [key...] } —
// nie rzuca, aby jeden błędny szablon nie wywalił reszty.
export async function generateDocuments(snapshot, keys, onStatus, language) {
  const data = buildGeneratorData(snapshot, language)
  const docs = getDocsForSnapshot(snapshot).filter((d) => keys.includes(d.key))
  const failed = []
  for (const doc of docs) {
    onStatus?.(doc.key, 'loading')
    try {
      await generateDocument(doc, data)
      onStatus?.(doc.key, 'done')
    } catch (err) {
      console.error('Błąd generowania PDF:', doc.key, err)
      onStatus?.(doc.key, 'error')
      failed.push(doc.key)
    }
  }
  return { failed }
}
