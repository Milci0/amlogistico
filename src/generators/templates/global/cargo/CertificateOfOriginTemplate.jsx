import { formatDocumentDate } from '../../../../utils/formatDate'

export function CertificateOfOriginTemplate({ data }) {
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
      {[60, 65, null, 60, 55, 75].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* ── NAGŁÓWEK ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', border: b, marginBottom: '0' }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '8px 10px', borderRight: b }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a3a6b', marginBottom: '3px' }}>
            ŚWIADECTWO POCHODZENIA
          </div>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#1a3a6b', marginBottom: '2px' }}>
            CERTIFICATE OF ORIGIN
          </div>
          <div style={{ fontSize: '7px', color: '#666' }}>Certificat d'Origine · Ursprungszeugnis</div>
        </div>
        <div style={{ width: '190px', padding: '6px 8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <div style={lbl}>Nr / No.:</div>
            <div style={{ ...val, borderBottom: b, paddingBottom: '2px' }} />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div style={lbl}>Data / Date:</div>
            <div style={{ ...val, borderBottom: b, paddingBottom: '2px' }}>{today}</div>
          </div>
          <div>
            <div style={lbl}>Wystawiła / Issued by:</div>
            <div style={{ fontSize: '8px' }}>Krajowa Izba Gospodarcza KIG — Warsaw, Poland</div>
          </div>
        </div>
      </div>

      {/* ── 1. EKSPORTER | 2. ODBIORCA ─────────────────────────── */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '75px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>1. Eksporter / Exporter</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', marginTop: '4px' }}>
            <span style={lbl}>Kraj / Country: </span>
            <span style={{ fontSize: '9px' }}>{data.sender?.country}</span>
          </div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '75px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>2. Odbiorca / Consignee</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', marginTop: '4px' }}>
            <span style={lbl}>Kraj / Country: </span>
            <span style={{ fontSize: '9px' }}>{data.receiver?.country}</span>
          </div>
        </div>
      </div>

      {/* ── 3. ŚRODEK TRANSPORTU | 4. KRAJ PRZEZNACZENIA | 5. KRAJ POCHODZENIA ── */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>3. Środek transportu / Means of transport</div>
          <div style={val}>{data.transportMeans || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>4. Kraj przeznaczenia / Country of destination</div>
          <div style={val}>{data.toCountry}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '34px' }}>
          <div style={lbl}>5. Kraj pochodzenia / Country of origin</div>
          <div style={val}>{data.fromCountry}</div>
        </div>
      </div>

      {/* ── SEKCJA: OPIS TOWARU ────────────────────────────────── */}
      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>OPIS TOWARU / DESCRIPTION OF GOODS</span>
      </div>

      {/* ── TABELA TOWARÓW ─────────────────────────────────────── */}
      <div style={{ borderLeft: b }}>
        {/* Nagłówek */}
        <div style={{ display: 'flex' }}>
          <div style={{ ...thStyle, width: '60px' }}>6. Znaki<br />Marks &amp; Nos</div>
          <div style={{ ...thStyle, width: '65px' }}>7. Liczba opakowań<br />No. of packages</div>
          <div style={{ ...thStyle, flex: 1 }}>8. Opis towaru<br />Description</div>
          <div style={{ ...thStyle, width: '60px' }}>9. Kod HS<br />HS Code</div>
          <div style={{ ...thStyle, width: '55px' }}>10. Ilość<br />Quantity</div>
          <div style={{ ...thStyle, width: '75px', borderRight: b }}>11. Waga brutto<br />Gross weight (kg)</div>
        </div>
        {/* Wiersz z danymi */}
        <div style={{ display: 'flex', minHeight: '22px' }}>
          <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.marksNos || ''}</div>
          <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages || ''}</div>
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
          <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode || ''}</div>
          <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.quantity || ''}</div>
          <div style={{ width: '75px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight || ''}</div>
        </div>
        {/* Puste wiersze */}
        {emptyRow}
        {emptyRow}
        {emptyRow}
        {emptyRow}
      </div>

      {/* ── 12. NR FAKTURY | 13. WARTOŚĆ | 14. WALUTA ─────────── */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>12. Nr faktury / Invoice No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>13. Wartość / Value:</div>
          <div style={val}>{data.cargo?.value || ''}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>14. Waluta / Currency:</div>
          <div style={val}>{data.cargo?.currency || ''}</div>
        </div>
      </div>

      {/* ── 15. OŚWIADCZENIE EKSPORTERA | 16. ZAŚWIADCZENIE ────── */}
      <div style={{ display: 'flex', border: b, borderTop: 'none' }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>15. Oświadczenie eksportera / Exporter's declaration:</div>
          <div style={{ fontSize: '6.5px', color: '#555', marginTop: '2px', lineHeight: '1.3' }}>
            Niżej podpisany oświadcza, że powyższe dane są prawdziwe i poprawne, a opisany towar pochodzi z kraju
            wskazanego jako kraj pochodzenia. The undersigned declares that the above details are correct and that the
            goods described originated in the country shown as the country of origin.
          </div>
          <div style={{ display: 'flex', marginTop: '10px' }}>
            <div style={{ flex: 1, paddingRight: '6px' }}>
              <div style={{ ...lbl, marginBottom: '18px' }}>Miejscowość i data / Place &amp; date</div>
              <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '6.5px', color: '#555' }}>Podpis i pieczęć</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...lbl, marginBottom: '18px' }}>Podpis eksportera / Exporter's signature</div>
              <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '6.5px', color: '#555' }}>Podpis i pieczęć</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '4px 6px' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>16. Zaświadczenie / Certificate:</div>
          <div style={{ fontSize: '6.5px', color: '#555', marginTop: '2px', lineHeight: '1.3' }}>
            Krajowa Izba Gospodarcza zaświadcza, że powyższe świadectwo jest autentyczne i zgodne z prawdą. The
            Chamber certifies that this certificate is authentic.
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={lbl}>Miejscowość i data / Place &amp; date:</div>
            <div style={{ minHeight: '16px' }} />
          </div>
          <div style={{ marginTop: '8px' }}>
            <div style={lbl}>Podpis i pieczęć KIG / Signature &amp; stamp of Chamber:</div>
            <div style={{ minHeight: '16px' }} />
          </div>
        </div>
      </div>

    </div>
  )
}
