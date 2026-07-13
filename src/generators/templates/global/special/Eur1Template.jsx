export function Eur1Template({ data }) {
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
      {[50, null, 60, 70, 60].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>EUR.1 — ŚWIADECTWO PRZEWOZOWE</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Movement Certificate · Bescheinigung EUR.1 · Unilateral Preferential Origin</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Konwencja Paneurośródziemnomorska (PEM) / Umowy preferencyjne UE</div>
      </div>

      {/* 1. EKSPORTER | NR + 2. WYMIANA PREFERENCYJNA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '60px' }}>
          <div style={lbl}>1. Eksporter / Exporter (name, address, country):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ width: '220px', padding: '3px 5px', minHeight: '60px' }}>
          <div style={lbl}>Nr / No.: <span style={{ fontSize: '6.5px', color: '#999' }}>(wypełnia urząd celny)</span></div>
          <div style={{ ...val, borderBottom: b, paddingBottom: '2px', marginTop: '4px' }} />
          <div style={{ ...lbl, marginTop: '4px' }}>2. Świadectwo stosowane w ramach wymiany preferencyjnej między:</div>
          <div style={val}>UE ↔ {data.toCountry || ''}</div>
        </div>
      </div>

      {/* 3. ODBIORCA */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '3px 5px', minHeight: '45px' }}>
        <div style={lbl}>3. Odbiorca / Consignee (name, address, country):</div>
        <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
        <div style={val}>{data.receiver?.address}, {data.receiver?.country}</div>
      </div>

      {/* 4. KRAJ POCHODZENIA | 5. KRAJ PRZEZNACZENIA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>4. Kraj, grupa krajów lub terytorium, z którego produkty są uznawane za pochodzące / Country of origin:</div>
          <div style={val}>{data.fromCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>5. Kraj, grupa krajów lub terytorium przeznaczenia / Country of destination:</div>
          <div style={val}>{data.toCountry || ''}</div>
        </div>
      </div>

      {/* 6. ŚRODEK TRANSPORTU | 7. UWAGI */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>6. Środek transportu / Transport details (optional):</div>
          <div style={val}>{data.transportMeans || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>7. Uwagi / Remarks:</div>
          <div style={val}>{data.cargo?.notes || ''}</div>
        </div>
      </div>

      {/* SEKCJA: OPIS TOWARU */}
      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>OPIS TOWARU / DESCRIPTION OF GOODS</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b }}>
        <div style={{ ...thStyle, width: '50px' }}>8. Numery opakowań<br />Item No.</div>
        <div style={{ ...thStyle, flex: 1 }}>9. Znaki, numery, ilość i rodzaj opakowań<br />Marks, numbers, packages</div>
        <div style={{ ...thStyle, width: '60px' }}>10. Kod HS<br />HS Code</div>
        <div style={{ ...thStyle, width: '70px' }}>11. Waga brutto lub inna miara<br />Gross weight / Other measure</div>
        <div style={{ ...thStyle, width: '60px', borderRight: b }}>12. Faktura<br />Invoice (nr &amp; data)</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '22px' }}>
        <div style={{ width: '50px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>
          {data.cargo?.marksNos || ''} {data.cargo?.packages ? `— ${data.cargo.packages} opak.` : ''}
        </div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode || ''}</div>
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight || ''}</div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}

      {/* 13. OŚWIADCZENIE | 14. WNIOSEK O WIZĘ */}
      <div style={{ display: 'flex', border: b, borderTop: 'none' }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>13. Oświadczenie eksportera / Exporter's declaration:</div>
          <div style={{ fontSize: '6.5px', color: '#555', marginTop: '2px', lineHeight: '1.3' }}>
            Niżej podpisany eksporter towarów opisanych na odwrocie oświadcza, że towary te spełniają warunki
            wymagane do wydania niniejszego świadectwa. The undersigned exporter of the goods described overleaf
            declares that the goods meet the conditions required for the issue of this certificate.
          </div>
          <div style={{ display: 'flex', marginTop: '10px' }}>
            <div style={{ flex: 1, paddingRight: '6px' }}>
              <div style={{ ...lbl, marginBottom: '16px' }}>Miejsce i data / Place &amp; date</div>
              <div style={{ borderTop: b }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...lbl, marginBottom: '16px' }}>Podpis eksportera / Signature</div>
              <div style={{ borderTop: b }} />
            </div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '4px 6px' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>14. Wniosek o wizę / Request for visa:</div>
          <div style={{ fontSize: '6.5px', color: '#555', marginTop: '2px', lineHeight: '1.3' }}>
            Podpisany organ wnioskuje o opatrzenie niniejszego świadectwa wizą. The undersigned authority requests
            the visa of this certificate.
          </div>
          <div style={{ ...lbl, fontWeight: 'bold', marginTop: '8px' }}>Wiza urzędu celnego / Customs endorsement:</div>
          <div style={{ fontSize: '6.5px', color: '#555' }}>Świadectwo uznane za autentyczne / Certificate declared authentic</div>
          <div style={{ marginTop: '8px' }}>
            <div style={lbl}>Urząd celny / Customs office:</div>
            <div style={{ minHeight: '14px' }} />
          </div>
          <div style={{ marginTop: '6px' }}>
            <div style={lbl}>Pieczęć / Stamp + Data / Date:</div>
            <div style={{ minHeight: '14px' }} />
          </div>
        </div>
      </div>

    </div>
  )
}
