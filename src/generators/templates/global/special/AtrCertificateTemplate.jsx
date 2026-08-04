import { formatDocumentDate } from '../../../../utils/formatDate'

export function AtrCertificateTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '20px' }}>
      {[50, null, 90, 90].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>A.TR — ŚWIADECTWO PRZEWOZOWE</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>A.TR Movement Certificate &middot; unia celna UE &ndash; Turcja</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Decyzja nr 1/95 Rady Stowarzyszenia UE-Turcja</div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          A.TR potwierdza SWOBODNY OBRÓT towaru w unii celnej UE-Turcja, a nie jego pochodzenie.
          Dla wyrobów przemysłowych właściwe jest to świadectwo, nie EUR.1. Towary rolne oraz wyroby węgla i stali
          pozostają przy świadectwie EUR.1.
        </span>
      </div>

      {/* 1. EKSPORTER | NR */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '58px' }}>
          <div style={lbl}>1. Eksporter / Exporter (nazwa, pełny adres, kraj):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ width: '230px', padding: '3px 5px', minHeight: '58px' }}>
          <div style={lbl}>Nr / No.: <span style={{ fontSize: '6.5px', color: '#999' }}>(wypełnia urząd celny)</span></div>
          <div style={{ ...val, borderBottom: b, paddingBottom: '2px', marginTop: '4px' }} />
          <div style={{ ...lbl, marginTop: '4px' }}>2. Świadectwo stosowane w wymianie preferencyjnej między:</div>
          <div style={val}>UE i Turcja</div>
        </div>
      </div>

      {/* 3. ODBIORCA */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '3px 5px', minHeight: '44px' }}>
        <div style={lbl}>3. Odbiorca / Consignee (nazwa, pełny adres, kraj):</div>
        <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
        <div style={val}>{data.receiver?.address}, {data.receiver?.country}</div>
      </div>

      {/* 4-5. KRAJE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>4. Kraj wywozu / Country of export:</div>
          <div style={val}>{data.fromCountry}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>5. Kraj przeznaczenia / Country of destination:</div>
          <div style={val}>{data.toCountry}</div>
        </div>
      </div>

      {/* 6-7. TRANSPORT | UWAGI */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '46px' }}>
          <div style={lbl}>6. Szczegóły transportu / Transport details:</div>
          <div style={val}>{data.transport}</div>
          <div style={val}>{data.cargo?.vessel || data.vehicle?.reg || ''}</div>
          <div style={val}>{data.fromCity} &ndash; {data.toCity}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '46px' }}>
          <div style={lbl}>7. Uwagi / Remarks:</div>
          <div style={val}>{data.cargo?.notes || ''}</div>
        </div>
      </div>

      {/* 8-9. TABELA TOWARÓW */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '50px' }}>8. Lp.<br />Item</div>
        <div style={{ ...thStyle, flex: 1 }}>Znaki i numery, liczba i rodzaj opakowań, opis towaru<br />Marks, numbers, packages and description of goods</div>
        <div style={{ ...thStyle, width: '90px' }}>9. Masa brutto (kg)<br />Gross mass</div>
        <div style={{ ...thStyle, width: '90px', borderRight: b }}>Nr faktury<br />Invoice No.</div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, minHeight: '22px' }}>
        <div style={{ width: '50px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>
          {data.cargo?.marksNos ? `${data.cargo.marksNos} - ` : ''}{data.cargo?.packages} {data.cargo?.packageTypeName || ''} - {data.cargo?.name}
        </div>
        <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight}</div>
        <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* 10. POŚWIADCZENIE ORGANU CELNEGO | 11. DEKLARACJA EKSPORTERA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '96px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>10. POŚWIADCZENIE ORGANU CELNEGO / CUSTOMS ENDORSEMENT</div>
          <div style={{ fontSize: '6.5px', color: '#666', marginTop: '2px' }}>
            Potwierdza się zgodność deklaracji.<br />Declaration certified.
          </div>
          <div style={{ ...lbl, marginTop: '4px' }}>Dokument wywozowy / Export document:</div>
          <div style={val} />
          <div style={{ ...lbl, marginTop: '2px' }}>Urząd celny / Customs office:</div>
          <div style={val} />
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Data, podpis, pieczęć / Date, signature, stamp</div>
        </div>
        <div style={{ flex: 1, padding: '4px 6px', minHeight: '96px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>11. DEKLARACJA EKSPORTERA / DECLARATION BY THE EXPORTER</div>
          <div style={{ fontSize: '6.5px', color: '#333', marginTop: '2px', lineHeight: '1.4' }}>
            Ja, niżej podpisany, oświadczam, że towary opisane powyżej spełniają warunki wymagane do wystawienia
            niniejszego świadectwa.
          </div>
          <div style={{ ...lbl, marginTop: '4px' }}>Miejsce i data / Place and date:</div>
          <div style={val}>{formatDocumentDate(data.loadDate)}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis / Signature</div>
        </div>
      </div>

      {/* 12-13. WERYFIKACJA */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '70px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>12. WNIOSEK O WERYFIKACJĘ / REQUEST FOR VERIFICATION</div>
          <div style={{ fontSize: '6.5px', color: '#666', marginTop: '2px' }}>Wnosi się o sprawdzenie autentyczności i prawidłowości niniejszego świadectwa.</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Data, podpis, pieczęć</div>
        </div>
        <div style={{ flex: 1, padding: '4px 6px', minHeight: '70px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>13. WYNIK WERYFIKACJI / RESULT OF VERIFICATION</div>
          <div style={{ fontSize: '7.5px', marginTop: '3px' }}>&#9634; świadectwo autentyczne i prawidłowe</div>
          <div style={{ fontSize: '7.5px' }}>&#9634; świadectwo nie spełnia wymogów co do autentyczności lub prawidłowości</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Data, podpis, pieczęć</div>
        </div>
      </div>

    </div>
  )
}
