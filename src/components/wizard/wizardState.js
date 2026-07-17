// Kształt migawki (snapshot) stanu kreatora = formData zapisywane w DocumentSet.
// W pełni serializowalny: bez File, bez funkcji, daty jako string z <input type=date>.
// 1:1 z tym, co konsumuje documentGeneration.buildGeneratorData.

function emptyParty() {
  return { name: '', vat: '', address: '', contact: '', phone: '', iban: '', swift: '', bank: '' }
}

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
      cargoType: '',
      weight: '',
      weightNet: '',
      volume: '',
      packages: '',
      value: '',
      currency: '',
      notes: '',
    },
    parties: { sender: emptyParty(), receiver: emptyParty(), carrier: emptyParty() },
    road: { vehicleType: '', tempFrom: '', tempTo: '', adr: false, adrClass: '', vehicleReg: '' },
    sea: {
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
    },
    terms: { incoterms: '', freightPrice: '', freightCurrency: '', paymentDays: '' },
  }
}

export function cloneSnapshot(snapshot) {
  return JSON.parse(JSON.stringify(snapshot))
}
