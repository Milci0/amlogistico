import { formatDocumentDate } from '../../../../utils/formatDate'

export function PackingListTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '12px' }
  const thStyle = {
    padding: '3px 5px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '20px' }}>
      {[35, null, 65, 50, 45, 75, 75, 95].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#2c5fa8', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', letterSpacing: '2px' }}>PACKING LIST</div>
          <div style={{ fontSize: '8px', color: '#d0dff0', marginTop: '2px' }}>Lista pakowania / Wykaz zawartości przesyłki</div>
        </div>
        <div style={{ width: '140px', padding: '6px 8px', backgroundColor: '#2c5fa8' }}>
          <div style={{ ...lbl, color: '#d0dff0' }}>Nr dokumentu:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
        </div>
      </div>

      {/* SPRZEDAJĄCY | KUPUJĄCY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '80px' }}>
          <div style={lbl}>Sprzedający / Seller:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '80px' }}>
          <div style={lbl}>Kupujący / Buyer:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
      </div>

      {/* KRAJ NADANIA | KRAJ DOCELOWY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Kraj nadania / Country of origin:</div>
          <div style={val}>{data.fromCountry}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Kraj docelowy / Destination country:</div>
          <div style={val}>{data.toCountry}</div>
        </div>
      </div>

      {/* NR FAKTURY | DATA WYSYŁKI | INCOTERMS | WALUTA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Nr faktury / Invoice No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Data wysyłki / Shipment date:</div>
          <div style={val}>{formatDocumentDate(data.loadDate)}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Incoterms:</div>
          <div style={val}>{data.cargo?.incoterms}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Waluta / Currency:</div>
          <div style={val}>{data.cargo?.currency}</div>
        </div>
      </div>

      {/* SEKCJA: ZAWARTOŚĆ */}
      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>ZAWARTOŚĆ PRZESYŁKI / CONTENTS</span>
      </div>

      {/* TABELA - NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b }}>
        <div style={{ ...thStyle, width: '35px' }}>Lp.<br />No.</div>
        <div style={{ ...thStyle, flex: 1 }}>Opis towaru<br />Description of goods</div>
        <div style={{ ...thStyle, width: '65px' }}>Kod HS<br />HS Code</div>
        <div style={{ ...thStyle, width: '50px' }}>Ilość<br />Qty</div>
        <div style={{ ...thStyle, width: '45px' }}>Jedn.<br />Unit</div>
        <div style={{ ...thStyle, width: '75px' }}>Waga netto<br />Net wt (kg)</div>
        <div style={{ ...thStyle, width: '75px' }}>Waga brutto<br />Gross wt (kg)</div>
        <div style={{ ...thStyle, width: '95px', borderRight: b }}>Wymiary (cm)<br />Dimensions</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '35px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
        <div style={{ width: '50px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages}</div>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>szt.</div>
        <div style={{ width: '75px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight}</div>
        <div style={{ width: '75px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight}</div>
        <div style={{ width: '95px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>

      {/* 9 pustych wierszy */}
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}{emptyRow}
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* PODSUMOWANIE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 2, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Łączna liczba opakowań Total packages:</div>
          <div style={val}>{data.cargo?.packages}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Łączna waga netto Total net weight (kg):</div>
          <div style={val}>{data.cargo?.weight}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Łączna waga brutto Total gross weight (kg):</div>
          <div style={val}>{data.cargo?.weight}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Łączna objętość Total volume (m³):</div>
          <div style={val}>{data.cargo?.volume}</div>
        </div>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Wystawił / Prepared by</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Data / Date</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Podpis i pieczęć / Signature &amp; stamp</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
      </div>

    </div>
  )
}
