import { formatDocumentDate } from '../../../../utils/formatDate'

export function AdrDeclarationTemplate({ data }) {
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
      {[45, null, 35, 45, 45, 45, 40, 45, 55].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  const adrClassInfo = [
    ['Klasa 1', 'Materiały wybuchowe'], ['Klasa 2', 'Gazy'], ['Klasa 3', 'Ciecze łatwopalne'],
    ['Klasa 4.1', 'Ciała stałe łatwopalne'], ['Klasa 4.2', 'Samozapalne'], ['Klasa 4.3', 'Wydzielające gazy palne'],
    ['Klasa 5.1', 'Utleniające'], ['Klasa 5.2', 'Nadtlenki organiczne'], ['Klasa 6.1', 'Toksyczne'],
    ['Klasa 6.2', 'Zakaźne'], ['Klasa 7', 'Radioaktywne'], ['Klasa 8', 'Żrące'], ['Klasa 9', 'Różne (np. baterie lit.)'],
  ]

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>DEKLARACJA ADR</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Dangerous Goods Declaration — Road Transport · Umowa ADR 1957</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Towary niebezpieczne transportem drogowym — 9 klas zagrożenia</div>
      </div>

      {/* NOTKA OSTRZEGAWCZA */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Przewóz towarów niebezpiecznych bez właściwej dokumentacji ADR jest przestępstwem. Kierowca musi posiadać
          ważny certyfikat ADR.
        </span>
      </div>

      {/* NADAWCA | ODBIORCA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>Nadawca / Sender (nazwa, adres):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '36px' }}>
          <div style={lbl}>Odbiorca / Recipient (nazwa, adres):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
        </div>
      </div>

      {/* PRZEWOŹNIK | NR REJESTRACYJNY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Przewoźnik / Carrier:</div>
          <div style={val}>{data.carrier?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Nr rejestracyjny pojazdu / Vehicle plate:</div>
          <div style={val}>{data.vehicle?.reg || ''}</div>
        </div>
      </div>

      {/* CERTYFIKAT ADR KIEROWCY | WAŻNOŚĆ */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Certyfikat ADR kierowcy / Driver ADR cert. No.:</div>
          <div style={val}>{data.vehicle?.driverCertNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Data ważności cert. / Valid until:</div>
          <div style={val} />
        </div>
      </div>

      {/* SEKCJA: DANE TOWARU NIEBEZPIECZNEGO */}
      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>DANE TOWARU NIEBEZPIECZNEGO / DANGEROUS GOODS DETAILS</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '45px' }}>Nr UN<br />UN No.</div>
        <div style={{ ...thStyle, flex: 1 }}>Oficjalna nazwa przewozowa<br />Proper Shipping Name (wg ADR)</div>
        <div style={{ ...thStyle, width: '35px' }}>Klasa<br />Class</div>
        <div style={{ ...thStyle, width: '45px' }}>Kod klas.<br />Class. Code</div>
        <div style={{ ...thStyle, width: '45px' }}>Grupa pak.<br />Packing Group</div>
        <div style={{ ...thStyle, width: '45px' }}>Etykiety<br />Labels</div>
        <div style={{ ...thStyle, width: '40px' }}>Kod tun.<br />Tunnel</div>
        <div style={{ ...thStyle, width: '45px' }}>Ilość<br />Qty (kg/L)</div>
        <div style={{ ...thStyle, width: '55px', borderRight: b }}>Opakowanie<br />Packaging type</div>
      </div>

      {/* Wiersz z danymi — data.vehicle.adrClass to jedno pole tekstowe "klasa / nr UN" z wizarda (Krok 2),
          pokazywane w kolumnie Nr UN; brak osobnego rozbicia klasa/UN w danych wejściowych. */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.vehicle?.adrClass || ''}</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
        <div style={{ width: '35px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.quantity || ''}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}

      {/* SEKCJA: KLASY ADR — REFERENCE */}
      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>KLASY ADR / ADR CLASSES — REFERENCE</span>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        {adrClassInfo.map(([k, name], i) => (
          <div key={k} style={{ flex: 1, padding: '2px 3px', borderRight: i < adrClassInfo.length - 1 ? b : undefined, fontSize: '6px', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold' }}>{k}</div>
            <div style={{ color: '#666' }}>{name}</div>
          </div>
        ))}
      </div>

      {/* WYPOSAŻENIE | INSTRUKCJE */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '3px 5px', minHeight: '20px' }}>
        <div style={lbl}>Wyposażenie awaryjne w pojeździe / Emergency equipment:</div>
      </div>
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, padding: '3px 5px', minHeight: '20px' }}>
        <div style={lbl}>Instrukcje pisemne / Written instructions (działanie w razie wypadku):</div>
      </div>

      {/* OŚWIADCZENIE */}
      <div style={{ border: b, borderTop: 'none', padding: '5px 7px', backgroundColor: '#f7f7f7' }}>
        <span style={{ fontSize: '6.5px', color: '#555' }}>
          <strong>OŚWIADCZENIE NADAWCY / SHIPPER'S DECLARATION:</strong> Oświadczam, że zawartość tej przesyłki jest w
          pełni i dokładnie opisana powyżej według właściwej nazwy przewozowej i jest sklasyfikowana, zapakowana,
          oznakowana/etykietowana i w każdym względzie odpowiednio przygotowana do przewozu zgodnie z obowiązującymi
          przepisami prawa. I declare that the contents of this consignment are fully and accurately described above
          by the proper shipping name and are classified, packaged, marked and labelled/placarded and are in all
          respects in proper condition for transport according to applicable international and national governmental
          regulations.
        </span>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Nadawca / Sender</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Przewoźnik / Carrier</div>
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
