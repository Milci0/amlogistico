import { formatDocumentDate } from '../../../../utils/formatDate'

export function EadSadExportTemplate({ data }) {
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
    <div style={{ display: 'flex', minHeight: '20px' }}>
      {[25, null, 65, 55, 60, 60, 75, 60].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#1a3a6b', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>DEKLARACJA EKSPORTOWA UE</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>EU Export Declaration · EAD / SAD · Export · System AES</div>
        </div>
        <div style={{ width: '150px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>Nr dokumentu:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
        </div>
      </div>

      {/* NOTKA INSTRUKCYJNA */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#f7f7f7' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Dokument wypełniany i składany elektronicznie do systemu AES (Automated Export System) polskiego urzędu
          celnego (KAS). Poniższy formularz służy do przygotowania danych przed złożeniem zgłoszenia.
        </span>
      </div>

      {/* EKSPORTER | EORI | MRN */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '50px' }}>
          <div style={lbl}>Eksporter / Exporter (nazwa, adres):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
        </div>
        <div style={{ width: '160px', padding: '3px 5px', borderRight: b, minHeight: '50px' }}>
          <div style={lbl}>Nr EORI / EORI Number:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.customs?.eori || ''}</div>
        </div>
        <div style={{ width: '160px', padding: '3px 5px', minHeight: '50px' }}>
          <div style={lbl}>MRN (nadawany przez AES):</div>
          <div style={{ ...val, marginTop: '2px' }} />
        </div>
      </div>

      {/* KOD PROCEDURY | KRAJ PRZEZNACZENIA | ŚRODEK TRANSPORTU | URZĄD WYJŚCIA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '32px' }}>
          <div style={lbl}>Kod procedury celnej / Customs procedure code:</div>
          <div style={val}>{data.customs?.procedureCode || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '32px' }}>
          <div style={lbl}>Kraj przeznaczenia / Country of destination:</div>
          <div style={val}>{data.toCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '32px' }}>
          <div style={lbl}>Środek transportu / Mode of transport:</div>
          <div style={val}>{data.transportMeans || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '32px' }}>
          <div style={lbl}>Urząd wyjścia / Office of exit:</div>
          <div style={val}>{data.customs?.exitOffice || ''}</div>
        </div>
      </div>

      {/* SEKCJA: POZYCJE TOWAROWE */}
      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>POZYCJE TOWAROWE / GOODS ITEMS</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b }}>
        <div style={{ ...thStyle, width: '25px' }}>Lp.</div>
        <div style={{ ...thStyle, flex: 1 }}>Opis towaru<br />Description</div>
        <div style={{ ...thStyle, width: '65px' }}>Kod CN/HS<br />(8 cyfr)</div>
        <div style={{ ...thStyle, width: '55px' }}>Kraj poch.<br />Origin</div>
        <div style={{ ...thStyle, width: '60px' }}>Waga netto<br />Net wt (kg)</div>
        <div style={{ ...thStyle, width: '60px' }}>Waga brutto<br />Gross wt (kg)</div>
        <div style={{ ...thStyle, width: '75px' }}>Wartość celna<br />Customs value (EUR)</div>
        <div style={{ ...thStyle, width: '60px', borderRight: b }}>Procedura<br />Procedure</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '25px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
        <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode || ''}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.fromCountry || ''}</div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weightNet || ''}</div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight || ''}</div>
        <div style={{ width: '75px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'right' }}>{data.cargo?.value || ''}</div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.customs?.procedureCode || ''}</div>
      </div>

      {/* Puste wiersze */}
      {emptyRow}
      {emptyRow}
      {emptyRow}
      {emptyRow}
      {emptyRow}

      {/* DOŁĄCZONE DOKUMENTY */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <div style={{ ...lbl, fontWeight: 'bold' }}>Dołączone dokumenty / Supporting documents:</div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '32px' }}>
          <div style={lbl}>Nr faktury:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '32px' }}>
          <div style={lbl}>Nr pozwolenia:</div>
          <div style={val}>{data.customs?.permitNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '32px' }}>
          <div style={lbl}>Inne:</div>
          <div style={val} />
        </div>
      </div>

      {/* OŚWIADCZENIE */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, padding: '5px 7px', backgroundColor: '#f7f7f7' }}>
        <span style={{ fontSize: '6.5px', color: '#555' }}>
          <strong>OŚWIADCZENIE / DECLARATION:</strong> Oświadczam, że dane zawarte w niniejszym zgłoszeniu są
          prawdziwe i kompletne. I declare that the information in this declaration is true and complete.
        </span>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Eksporter / Exporter</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Data / Date</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Podpis / Signature</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
      </div>

    </div>
  )
}
