import { formatDocumentDate } from '../../../../utils/formatDate'

export function AtaCarnetTemplate({ data }) {
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
      {[null, 40, 35, 50, 55, 50, 55, 60].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>KARNET ATA</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>ATA Carnet · Temporary Admission · Admission Temporaire</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Konwencja ATA 1961 / Konwencja Stambulska 1990 — akceptowany w ponad 80 krajach</div>
      </div>

      {/* NOTKA OSTRZEGAWCZA */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Towar MUSI wrócić do kraju wywozu przed datą ważności karnetu. Niezwrócony towar = obowiązek zapłaty cła i
          VAT w kraju tymczasowego wwozu.
        </span>
      </div>

      {/* NR KARNETU | DATA WYDANIA | WAŻNY DO */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Nr karnetu / Carnet No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Data wydania / Issue date:</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Ważny do / Valid until:</div>
          <div style={val} />
        </div>
      </div>

      {/* POSIADACZ */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '3px 5px', minHeight: '40px' }}>
        <div style={lbl}>Posiadacz / Holder (nazwa firmy lub osoba, adres, kraj):</div>
        <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
        <div style={val}>{data.sender?.address}, {data.sender?.country}</div>
      </div>

      {/* WYSTAWIŁA | KRAJ WYWOZU */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Wystawiła / Issued by (izba handlowa / Chamber):</div>
          <div style={{ fontSize: '8px', marginTop: '2px' }}>Krajowa Izba Gospodarcza KIG — Warsaw, Poland</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Kraj wywozu / Country of exportation:</div>
          <div style={val}>{data.fromCountry || ''}</div>
        </div>
      </div>

      {/* CEL WYWOZU */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '3px 5px', minHeight: '20px' }}>
        <div style={lbl}>Cel wywozu / Purpose of exportation:</div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 5px' }}>
        <div style={{ flex: 1, fontSize: '7.5px' }}>&#9634; Targi i wystawy<br /><span style={{ color: '#666' }}>Fairs &amp; exhibitions</span></div>
        <div style={{ flex: 1, fontSize: '7.5px' }}>&#9634; Sprzęt zawodowy<br /><span style={{ color: '#666' }}>Professional equipment</span></div>
        <div style={{ flex: 1, fontSize: '7.5px' }}>&#9634; Próbki handlowe<br /><span style={{ color: '#666' }}>Commercial samples</span></div>
        <div style={{ flex: 1, fontSize: '7.5px' }}>&#9634; Materiały dydaktyczne<br /><span style={{ color: '#666' }}>Educational material</span></div>
        <div style={{ flex: 1, fontSize: '7.5px' }}>&#9634; Inne / Other:</div>
      </div>

      {/* KRAJE TYMCZASOWEGO WWOZU */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, padding: '3px 5px', minHeight: '20px' }}>
        <div style={lbl}>Kraje tymczasowego wwozu / Countries of temporary admission:</div>
        <div style={val}>{data.toCountry || ''}</div>
      </div>

      {/* SEKCJA: WYKAZ TOWARÓW */}
      <div style={{ backgroundColor: '#2c5fa8', border: b, borderBottom: 'none', padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>WYKAZ TOWARÓW / LIST OF GOODS</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, flex: 1 }}>Lp. / Opis towaru<br />Description of goods</div>
        <div style={{ ...thStyle, width: '40px' }}>Ilość<br />Qty</div>
        <div style={{ ...thStyle, width: '35px' }}>Jedn.<br />Unit</div>
        <div style={{ ...thStyle, width: '50px' }}>Waga (kg)<br />Weight</div>
        <div style={{ ...thStyle, width: '55px' }}>Wartość<br />Value</div>
        <div style={{ ...thStyle, width: '50px' }}>Waluta<br />Currency</div>
        <div style={{ ...thStyle, width: '55px' }}>Kraj poch.<br />Origin</div>
        <div style={{ ...thStyle, width: '60px', borderRight: b }}>Nr ser. / fab.<br />Serial No.</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>1. {data.cargo?.name || ''}</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.quantity || ''}</div>
        <div style={{ width: '35px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>szt.</div>
        <div style={{ width: '50px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight || ''}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'right' }}>{data.cargo?.value || ''}</div>
        <div style={{ width: '50px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.currency || ''}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.fromCountry || ''}</div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}

      {/* PODSUMOWANIE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Łączna liczba pozycji / Total items:</div>
          <div style={val}>1</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Łączna wartość / Total value:</div>
          <div style={val}>{data.cargo?.value || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Waluta / Currency:</div>
          <div style={val}>{data.cargo?.currency || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Łączna waga / Total weight (kg):</div>
          <div style={val}>{data.cargo?.weight || ''}</div>
        </div>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Posiadacz / Holder</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>KIG — Gwarancja / Guarantee</div>
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
