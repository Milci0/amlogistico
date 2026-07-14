import { formatDocumentDate } from '../../../../utils/formatDate'

export function SaudiArabiaExportTemplate({ data }) {
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
      {[25, null, 55, 40, 40, 55, 55, 65, 55, 65].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>SAUDI ARABIA — EXPORT DECLARATION (بيان التصدير)</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Saudi Customs — الجمارك السعودية</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>System: FASAH Single Window Platform</div>
      </div>

      {/* CR NO. | DATA | CUSTOMS PORT */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>CR No. (Commercial Registration) eksportera:</div>
          <div style={val}>{data.customs?.eori || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Date:</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Customs Port:</div>
          <div style={val}>{data.fromCity || ''}</div>
        </div>
      </div>

      {/* EKSPORTER | CONSIGNEE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>Eksporter (nazwa, adres, CR No.):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '36px' }}>
          <div style={lbl}>Consignee (country):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
      </div>

      {/* COUNTRY OF EXPORT | COUNTRY OF DESTINATION | MODE OF TRANSPORT | FOB VALUE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Country of Export:</div>
          <div style={val}>{data.fromCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Country of Destination:</div>
          <div style={val}>{data.toCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Mode of Transport:</div>
          <div style={val}>{data.transportMeans || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>FOB Value (SAR/USD):</div>
          <div style={val}>{data.cargo?.value || ''}</div>
        </div>
      </div>

      {/* SEKCJA: GOODS */}
      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>GOODS / البضائع</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '25px' }}>Lp.</div>
        <div style={{ ...thStyle, flex: 1 }}>Opis towaru<br />Description</div>
        <div style={{ ...thStyle, width: '55px' }}>Kod HS<br />HS Code</div>
        <div style={{ ...thStyle, width: '40px' }}>Ilość<br />Qty</div>
        <div style={{ ...thStyle, width: '40px' }}>Jedn.<br />Unit</div>
        <div style={{ ...thStyle, width: '55px' }}>Waga (kg)<br />Weight</div>
        <div style={{ ...thStyle, width: '55px' }}>Wartość<br />Value</div>
        <div style={{ ...thStyle, width: '65px' }}>HS Code<br />KSA (8)</div>
        <div style={{ ...thStyle, width: '55px' }}>Net Wt<br />(kg)</div>
        <div style={{ ...thStyle, width: '65px', borderRight: b }}>Statistical<br />Value SAR</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '25px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode || ''}</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.quantity || ''}</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight || ''}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'right' }}>{data.cargo?.value || ''}</div>
        <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weightNet || ''}</div>
        <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}
      {emptyRow}
      {emptyRow}

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Exporter</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Customs Broker</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Date</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
      </div>

    </div>
  )
}
