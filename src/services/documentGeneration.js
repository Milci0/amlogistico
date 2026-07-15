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

// Migawka kreatora → płaski ładunek konsumowany przez szablony JSX.
// (Mapowanie przeniesione 1:1 z dawnego Step4 — nie zmieniać kształtu bez zmiany szablonów.)
export function buildGeneratorData(snapshot) {
  const { route, cargo, parties, road, sea, terms } = snapshot
  return {
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
      cargoType: cargo.cargoType,
      weight: cargo.weight,
      weightNet: cargo.weightNet,
      volume: cargo.volume,
      packages: cargo.packages,
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

// Metadane karty/wyszukiwarki.
export function buildMeta(snapshot) {
  return {
    routeFrom: snapshot.route.fromCountry,
    routeTo: snapshot.route.toCountry,
    transportMode: snapshot.route.transport,
    cargoDescription: snapshot.cargo.cargoName,
    transportDate: snapshot.route.loadDate,
  }
}

// Generuje wybrane dokumenty z migawki. onStatus(key, 'loading'|'done'|'error')
// pozwala kreatorowi pokazywać status na żywo. Zwraca { failed: [key...] } —
// nie rzuca, aby jeden błędny szablon nie wywalił reszty.
export async function generateDocuments(snapshot, keys, onStatus) {
  const data = buildGeneratorData(snapshot)
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
