const EU_CODES = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR',
  'HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK',
  'SI','ES','SE',
])

function isEU(countryCode) {
  return EU_CODES.has(countryCode)
}

function selectDocuments(transport, fromCountry, toCountry) {
  const outsideEU = !isEU(fromCountry) || !isEU(toCountry)

  if (transport === 'road') {
    const docs = [
      { code: 'cmr',           name: 'CMR — list przewozowy',          required: true },
      { code: 'packing_list',  name: 'Packing List',                   required: true },
      { code: 'invoice',       name: 'Faktura handlowa',               required: true },
      { code: 'transport_order', name: 'Zlecenie transportowe',        required: false },
    ]
    if (outsideEU) {
      docs.push(
        { code: 'proforma',    name: 'Faktura proforma',               required: true },
        { code: 'origin_cert', name: 'Świadectwo pochodzenia',         required: true },
        { code: 'sad',         name: 'SAD — Deklaracja celna',         required: true },
      )
    }
    return { docs, outsideEU }
  }

  if (transport === 'sea') {
    const docs = [
      { code: 'sea_waybill',   name: 'Sea Waybill',                    required: true },
      { code: 'booking_conf',  name: 'Booking Confirmation',           required: true },
      { code: 'packing_list',  name: 'Packing List morski',            required: true },
    ]
    if (outsideEU) {
      docs.push(
        { code: 'proforma',    name: 'Faktura proforma',               required: true },
        { code: 'origin_cert', name: 'Świadectwo pochodzenia',         required: true },
        { code: 'sad',         name: 'SAD — Deklaracja celna',         required: true },
      )
    }
    return { docs, outsideEU }
  }

  return { docs: [], outsideEU }
}

module.exports = { selectDocuments, isEU }
