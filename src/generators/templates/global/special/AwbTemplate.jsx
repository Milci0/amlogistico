import { formatDocumentDate } from '../../../../utils/formatDate'

export function AwbTemplate({ data }) {
  const today = formatDocumentDate(new Date())
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px',
    borderRight: b,
    borderBottom: b,
    fontSize: '7px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#2c5fa8',
    verticalAlign: 'top',
  }

  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '18px' }}>
      {[45, 55, 30, 40, 60, 55, 50, null].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#1a3a6b', padding: '8px 12px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>AIR WAYBILL (AWB)</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Lotniczy List Przewozowy · Konwencja Montrealska 1999</div>
        </div>
      </div>
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '3px 6px' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>Nie jest dokumentem własności towaru — odbiorca wskazany jako Consignee odbiera bez oryginału.</span>
      </div>

      {/* SHIPPER | CONSIGNEE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '55px' }}>
          <div style={lbl}>Shipper / Nadawca (nazwa, adres, kraj, tel.):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}, {data.sender?.country}</div>
          <div style={val}>{data.sender?.phone || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '55px' }}>
          <div style={lbl}>Consignee / Odbiorca (nazwa, adres, kraj, tel.):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}, {data.receiver?.country}</div>
          {/* Brak data.receiver.phone w słowniku (asymetria względem data.sender.phone) — propozycja, patrz manifest poz. 11. */}
          <div style={val} />
        </div>
      </div>

      {/* ISSUING CARRIER | AGENT IATA NO. */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Issuing Carrier / Linia lotnicza wystawiająca:</div>
          <div style={val}>{data.carrier?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Agent IATA No.:</div>
          {/* Brak odpowiednika — propozycja: data.carrier.iataAgentNo (patrz manifest poz. 11). */}
          <div style={val} />
        </div>
      </div>

      {/* PORT NADANIA | PORT DOCELOWY | ROUTING */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Port lotniczy nadania (kod IATA):</div>
          <div style={val}>{data.fromCity || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Airport of Destination / Port lotniczy docelowy (kod IATA):</div>
          <div style={val}>{data.toCity || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Routing / Trasa (via):</div>
          {/* Brak odpowiednika w słowniku — pole opcjonalne/rzadkie, zostawione puste bez propozycji nowej zmiennej. */}
          <div style={val} />
        </div>
      </div>

      {/* DATE | FLIGHT NO. 2 | DATE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Date:</div>
          <div style={val}>{data.loadDate ? formatDocumentDate(data.loadDate) : ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Flight No. 2:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Date:</div>
          <div style={val} />
        </div>
      </div>

      {/* SEKCJA: SZCZEGÓŁY ŁADUNKU */}
      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>SZCZEGÓŁY ŁADUNKU / CARGO DETAILS</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b }}>
        <div style={{ ...thStyle, width: '45px' }}>No. of Pieces</div>
        <div style={{ ...thStyle, width: '55px' }}>Gross Weight (kg)</div>
        <div style={{ ...thStyle, width: '30px' }}>kg/lb</div>
        <div style={{ ...thStyle, width: '40px' }}>Rate Class</div>
        <div style={{ ...thStyle, width: '60px' }}>Commodity Item No.</div>
        <div style={{ ...thStyle, width: '55px' }}>Chargeable Weight</div>
        <div style={{ ...thStyle, width: '50px' }}>Rate/Charge</div>
        <div style={{ ...thStyle, flex: 1, borderRight: b }}>Total / Nature of Goods &amp; Description</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages || ''}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight || ''}</div>
        <div style={{ width: '30px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>kg</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '50px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}

      {/* WARTOŚCI DEKLAROWANE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Declared Value for Carriage / Wartość do ubezpieczenia:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Declared Value for Customs / Wartość celna:</div>
          <div style={val}>{data.cargo?.value || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Amount of Insurance / Ubezpieczenie:</div>
          <div style={val} />
        </div>
      </div>

      {/* WEIGHT CHARGE | OTHER CHARGES | TOTAL */}
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, backgroundColor: '#2c5fa8', borderLeft: b, borderTop: b, padding: '3px 5px' }}>
          <span style={{ fontSize: '7px', fontWeight: 'bold', color: '#fff' }}>Weight Charge</span>
        </div>
        <div style={{ flex: 1, backgroundColor: '#2c5fa8', borderTop: b, padding: '3px 5px' }}>
          <span style={{ fontSize: '7px', fontWeight: 'bold', color: '#fff' }}>Other Charges</span>
        </div>
        <div style={{ flex: 1, backgroundColor: '#2c5fa8', borderRight: b, borderTop: b, padding: '3px 5px' }}>
          <span style={{ fontSize: '7px', fontWeight: 'bold', color: '#fff' }}>Total</span>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '2px 5px', borderRight: b, fontSize: '8px' }}>Prepaid:</div>
        <div style={{ flex: 1, padding: '2px 5px', borderRight: b, fontSize: '8px' }}>Prepaid:</div>
        <div style={{ flex: 1, padding: '2px 5px', fontSize: '8px' }}>Prepaid: {data.terms?.freightPrice || ''}</div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '2px 5px', borderRight: b, fontSize: '8px' }}>Collect:</div>
        <div style={{ flex: 1, padding: '2px 5px', borderRight: b, fontSize: '8px' }}>Collect:</div>
        <div style={{ flex: 1, padding: '2px 5px', fontSize: '8px' }}>Collect:</div>
      </div>

      {/* SPECIAL HANDLING */}
      <div style={{ borderLeft: b, borderRight: b, padding: '3px 5px', minHeight: '24px' }}>
        <div style={lbl}>Special Handling / Specjalne instrukcje (np. DGR, AVI, PER):</div>
        <div style={val}>{data.cargo?.notes || ''}</div>
      </div>

      {/* SHIPPER'S CERTIFICATION */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, padding: '4px 6px', backgroundColor: '#f7f7f7' }}>
        <span style={{ fontSize: '6.5px', color: '#555' }}>Shipper's Certification / Oświadczenie nadawcy.</span>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Nadawca / Shipper</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Linia lotnicza / Issuing Carrier</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Data / Date</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
      </div>

    </div>
  )
}
