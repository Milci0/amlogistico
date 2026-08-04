import { formatDocumentDate } from '../../../../utils/formatDate'

export function WagonListTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }
  const cols = [30, 130, 70, null, 70, 70, 70, 70]

  const emptyRow = (key) => (
    <div key={key} style={{ display: 'flex', minHeight: '18px' }}>
      {cols.map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  // Numery wagonow przychodza z kroku "Towar" jako tekst rozdzielony przecinkami
  // (rail.wagonNumbers sklejane w buildGeneratorData) - rozbijamy z powrotem na
  // wiersze, zeby kazdy wagon mial wlasna linie wykazu.
  const wagons = (data.rail?.wagonNumbers || '')
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean)

  const filledRows = wagons.map((wagon, i) => (
    <div key={wagon + i} style={{ display: 'flex', minHeight: '18px' }}>
      <div style={{ width: '30px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{i + 1}</div>
      <div style={{ width: '130px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{wagon}</div>
      <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{i === 0 ? data.cargo?.name : ''}</div>
      <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
    </div>
  ))

  // Wykaz zawsze ma 15 wierszy - reszte dopelniamy pustymi do recznego wpisania.
  const blanks = []
  for (let i = filledRows.length; i < 15; i += 1) blanks.push(emptyRow(`blank-${i}`))

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#1a3a6b', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>WYKAZ WAGONÓW</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Wagon List &middot; załącznik do listu przewozowego przy przesyłce grupowej</div>
        </div>
        <div style={{ width: '160px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>Nr listu przewozowego:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#a0b8d8', marginTop: '4px' }}>Data / Date:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }}>{formatDocumentDate(data.loadDate)}</div>
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#f5f7fa' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Wykaz towarzyszy listowi przewozowemu, gdy jedna przesyłka jest przewożona więcej niż jednym wagonem.
          Nie zastępuje listu przewozowego.
        </span>
      </div>

      {/* NAGŁÓWEK PRZESYŁKI */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>Nadawca / Consignor:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>Odbiorca / Consignee:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
        </div>
        <div style={{ width: '180px', padding: '3px 5px', minHeight: '40px' }}>
          <div style={lbl}>Przewoźnik / Carrier:</div>
          <div style={val}>{data.carrier?.name || ''}</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Stacja nadania / Station of departure:</div>
          <div style={val}>{data.rail?.stationFrom || data.fromCity}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Stacja przeznaczenia / Station of destination:</div>
          <div style={val}>{data.rail?.stationTo || data.toCity}</div>
        </div>
        <div style={{ width: '180px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Liczba wagonów w przesyłce / Number of wagons:</div>
          <div style={val}>{wagons.length || ''}</div>
        </div>
      </div>

      {/* TABELA WAGONÓW */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '30px' }}>Lp.<br />No.</div>
        <div style={{ ...thStyle, width: '130px' }}>Nr wagonu<br />Wagon number</div>
        <div style={{ ...thStyle, width: '70px' }}>Typ wagonu<br />Wagon type</div>
        <div style={{ ...thStyle, flex: 1 }}>Opis towaru<br />Description of goods</div>
        <div style={{ ...thStyle, width: '70px' }}>Liczba sztuk<br />Packages</div>
        <div style={{ ...thStyle, width: '70px' }}>Masa brutto (kg)<br />Gross mass</div>
        <div style={{ ...thStyle, width: '70px' }}>Masa tary (kg)<br />Tare mass</div>
        <div style={{ ...thStyle, width: '70px', borderRight: b }}>Nr plomby<br />Seal No.</div>
      </div>
      {filledRows}
      {blanks}

      {/* PODSUMOWANIE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Łączna liczba wagonów / Total wagons:</div>
          <div style={val}>{wagons.length || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Łączna liczba sztuk / Total packages:</div>
          <div style={val}>{data.cargo?.packages}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Łączna masa brutto (kg) / Total gross mass:</div>
          <div style={val}>{data.cargo?.weight}</div>
        </div>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '54px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Sporządził / Prepared by</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis / Signature</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '54px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Stacja nadania / Station of departure</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Stempel i data / Stamp and date</div>
        </div>
      </div>

    </div>
  )
}
