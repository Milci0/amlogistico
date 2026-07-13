import { formatDocumentDate } from '../../../../utils/formatDate'

export function Isf10Plus2Template({ data }) {
  const today = formatDocumentDate(new Date())
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#1a3a6b', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', letterSpacing: '2px' }}>ISF 10+2</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Importer Security Filing</div>
          <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>US Customs and Border Protection — CBP 19 CFR Part 149</div>
        </div>
      </div>

      {/* NOTKA OSTRZEGAWCZA */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          <strong>WAŻNE / IMPORTANT:</strong> Złożyć MINIMUM 24 GODZINY przed załadunkiem na statek w zagranicznym
          porcie. Kara za brak: do 5 000 USD. Must be filed MINIMUM 24 HOURS before vessel loading at foreign port.
          Penalty for non-compliance: up to USD 5,000 per shipment.
        </span>
      </div>

      {/* SEKCJA: 10 ELEMENTÓW IMPORTERA */}
      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>10 ELEMENTÓW IMPORTERA / 10 IMPORTER ELEMENTS</span>
      </div>

      {/* 1. SELLER | 2. BUYER */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>1. Seller / Sprzedający:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '40px' }}>
          <div style={lbl}>2. Buyer / Kupujący:</div>
          {/* Brak odpowiednika w słowniku — "Buyer" jest odrębną rolą od Consignee (poz. 4). Propozycja: data.customs.buyer (patrz manifest, poz. 08). */}
          <div style={val} />
        </div>
      </div>

      {/* 3. IMPORTER OF RECORD | 4. CONSIGNEE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>3. Importer of Record / Importer (EIN/IRS No.):</div>
          {/* Brak odpowiednika — propozycja: data.customs.importerOfRecord (patrz manifest, poz. 08). */}
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '40px' }}>
          <div style={lbl}>4. Consignee / Odbiorca:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
        </div>
      </div>

      {/* 5. MANUFACTURER | 6. SHIP TO PARTY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>5. Manufacturer / Producent (nazwa, adres, kraj):</div>
          {/* Brak odpowiednika — propozycja: data.customs.manufacturer (patrz manifest, poz. 08). */}
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '36px' }}>
          <div style={lbl}>6. Ship to Party / Miejsce dostawy w USA:</div>
          {/* Brak odpowiednika — propozycja: data.customs.shipToParty (patrz manifest, poz. 08). */}
          <div style={val} />
        </div>
      </div>

      {/* 7. COUNTRY OF ORIGIN | 8. HTS NUMBER */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>7. Country of Origin / Kraj pochodzenia:</div>
          <div style={val}>{data.fromCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>8. HTS Number / Kod celny USA (10 cyfr):</div>
          <div style={val}>{data.cargo?.hsCode || ''}</div>
        </div>
      </div>

      {/* SEKCJA: 2 ELEMENTY PRZEWOŹNIKA */}
      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>2 ELEMENTY PRZEWOŹNIKA / 2 CARRIER ELEMENTS</span>
      </div>

      {/* 9. CONTAINER STUFFING LOCATION | 10. CONSOLIDATOR */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>9. Container Stuffing Location / Miejsce załadunku kontenera:</div>
          {/* Brak odpowiednika — propozycja: data.customs.stuffingLocation (patrz manifest, poz. 08). */}
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '36px' }}>
          <div style={lbl}>10. Consolidator / Konsolidator ładunku:</div>
          {/* Brak odpowiednika — propozycja: data.customs.consolidator (patrz manifest, poz. 08). */}
          <div style={val} />
        </div>
      </div>

      {/* VESSEL | VOYAGE | POL | POD | ETD */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Vessel Name / Nazwa statku:</div>
          <div style={val}>{data.cargo?.vessel || ''}</div>
        </div>
        <div style={{ width: '80px', padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Voyage No.:</div>
          <div style={val}>{data.cargo?.voyageNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Port of Loading:</div>
          <div style={val}>{data.fromCity || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Port of Discharge:</div>
          <div style={val}>{data.toCity || ''}</div>
        </div>
        <div style={{ width: '80px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>ETD:</div>
          <div style={val}>{data.sea?.etd ? formatDocumentDate(data.sea.etd) : ''}</div>
        </div>
      </div>

      {/* B/L NO. | CONTAINER NO. | BOND NO. */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>B/L No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Container No.:</div>
          <div style={val}>{data.cargo?.containerNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Bond No. / Nr gwarancji celnej:</div>
          {/* Odpowiada wcześniej zgłoszonemu kandydatowi data.customs.guaranteeNo — nie dodane, patrz manifest poz. 08. */}
          <div style={val} />
        </div>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Filed by / Złożono przez</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Date / Data</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>CBP Confirmation No.</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
      </div>

    </div>
  )
}
