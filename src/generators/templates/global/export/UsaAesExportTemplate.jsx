import { formatDocumentDate } from '../../../../utils/formatDate'

export function UsaAesExportTemplate({ data }) {
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
      {[65, null, 40, 45, 60, 80, 55, 55].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>USA — AES FILING / ELECTRONIC EXPORT INFORMATION (EEI)</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>US Census Bureau / BIS — Bureau of Industry and Security</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>System: AES — Automated Export System (online)</div>
      </div>

      {/* NOTKA OSTRZEGAWCZA */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          <strong>WAŻNE:</strong> Wymagane gdy wartość pozycji &gt; 2 500 USD lub towar podlega kontroli eksportowej. ITN musi
          być uzyskany PRZED załadunkiem.
        </span>
      </div>

      {/* ITN | FILING DATE | PORT OF EXPORT */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>ITN — Internal Transaction No. (nadawany przez AES):</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Filing date:</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Port of Export (kod CBP):</div>
          <div style={val}>{data.fromCity || ''}</div>
        </div>
      </div>

      {/* USPPI | ULTIMATE CONSIGNEE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>USPPI — eksporter USA (nazwa, adres, EIN/SSN):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.customs?.eori || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '40px' }}>
          <div style={lbl}>Ultimate Consignee — finalny odbiorca za granicą:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
        </div>
      </div>

      {/* INTERMEDIATE CONSIGNEE | COUNTRY OF DESTINATION | RELATED PARTIES */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Intermediate Consignee (jeśli dotyczy):</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Country of Ultimate Destination:</div>
          <div style={val}>{data.toCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Related Parties:</div>
          <div style={{ fontSize: '8px' }}>&#9634; Yes &#9634; No</div>
        </div>
      </div>

      {/* SEKCJA: POZYCJE / LINE ITEMS */}
      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>POZYCJE / LINE ITEMS</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '65px' }}>Schedule B No.<br />(10 cyfr)</div>
        <div style={{ ...thStyle, flex: 1 }}>Description</div>
        <div style={{ ...thStyle, width: '40px' }}>Qty</div>
        <div style={{ ...thStyle, width: '45px' }}>Unit</div>
        <div style={{ ...thStyle, width: '60px' }}>Value (USD)</div>
        <div style={{ ...thStyle, width: '80px' }}>Export Licence No.<br />(lub NLR)</div>
        <div style={{ ...thStyle, width: '55px' }}>ECCN<br />(jeśli dotyczy)</div>
        <div style={{ ...thStyle, width: '55px', borderRight: b }}>Country of<br />Origin</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode || ''}</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.quantity || ''}</div>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'right' }}>{data.cargo?.value || ''}</div>
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>NLR</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.fromCountry || ''}</div>
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}
      {emptyRow}

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>USPPI / Eksporter</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Agent (jeśli dotyczy)</div>
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
