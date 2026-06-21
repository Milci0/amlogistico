import { formatDocumentDate } from '../../../../utils/formatDate'

export function CmrTemplate({ data }) {
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
      {[55, 55, 65, null, 50, 75, 70].map((w, i) => (
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
            MIĘDZYNARODOWY LIST PRZEWOZOWY
          </div>
          <div style={{ fontSize: '8px', color: '#666', marginBottom: '2px' }}>
            CONSIGNMENT NOTE · FRACHTBRIEF · LETTRE DE VOITURE
          </div>
          <div style={{ fontSize: '7px', color: '#666' }}>Konwencja CMR — Genewa 1956</div>
        </div>
        <div style={{ width: '148px', padding: '6px 8px' }}>
          <div style={{ marginBottom: '10px' }}>
            <div style={lbl}>Nr / No.</div>
            <div style={{ ...val, borderBottom: b, paddingBottom: '2px' }} />
          </div>
          <div>
            <div style={lbl}>Data / Date:</div>
            <div style={{ ...val, borderBottom: b, paddingBottom: '2px' }}>{today}</div>
          </div>
        </div>
      </div>

      {/* ── 1. NADAWCA | 2. ODBIORCA ──────────────────────────── */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '90px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>1. Nadawca (Sender / Absender / Expéditeur)</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', marginTop: '4px' }}>
            <span style={lbl}>Kraj / Country: </span>
            <span style={{ fontSize: '9px' }}>{data.sender?.country}</span>
          </div>
          <div style={{ borderTop: b, marginTop: '3px', minHeight: '10px' }} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '90px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>2. Odbiorca (Consignee / Empfänger / Destinataire)</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', marginTop: '4px' }}>
            <span style={lbl}>Kraj / Country: </span>
            <span style={{ fontSize: '9px' }}>{data.receiver?.country}</span>
          </div>
          <div style={{ borderTop: b, marginTop: '3px', minHeight: '10px' }} />
        </div>
      </div>

      {/* ── 3. PRZEWOŹNIK | 16. PRZEWOŹNIK NASTĘPNY ────────────── */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '58px' }}>
          <div style={lbl}>3. Przewoźnik (Carrier / Frachtführer / Transporteur)</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.carrier?.name}</div>
          <div style={val}>{data.carrier?.address}</div>
          {data.carrier?.vatNumber && <div style={val}>VAT: {data.carrier.vatNumber}</div>}
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '58px' }}>
          <div style={lbl}>16. Przewoźnik następny (Successive carrier)</div>
        </div>
      </div>

      {/* ── 4. ZAŁADUNEK | 5. DOSTAWA | 6. DATA DOSTAWY ───────── */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 2, padding: '3px 5px', borderRight: b, minHeight: '48px' }}>
          <div style={lbl}>4. Miejsce i data załadunku (Place &amp; date of loading)</div>
          <div style={val}>{data.fromCity}, {data.fromCountry}</div>
          <div style={val}>{formatDocumentDate(data.loadDate)}</div>
        </div>
        <div style={{ flex: 2, padding: '3px 5px', borderRight: b, minHeight: '48px' }}>
          <div style={lbl}>5. Miejsce dostawy (Place of delivery)</div>
          <div style={val}>{data.toCity}, {data.toCountry}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '48px' }}>
          <div style={lbl}>6. Data dostawy (Delivery date)</div>
        </div>
      </div>

      {/* ── DOKUMENTY ─────────────────────────────────────────── */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '3px 5px', minHeight: '20px' }}>
        <span style={lbl}>Dokumenty załączone / Documents attached:</span>
      </div>

      {/* ── TABELA TOWARÓW ─────────────────────────────────────── */}
      <div style={{ borderLeft: b, borderTop: b }}>
        {/* Nagłówek */}
        <div style={{ display: 'flex' }}>
          <div style={{ ...thStyle, width: '55px' }}>7. Znaki i numery<br />(Marks &amp; Nos)</div>
          <div style={{ ...thStyle, width: '55px' }}>8. Liczba opakowań<br />(Number of packages)</div>
          <div style={{ ...thStyle, width: '65px' }}>9. Rodzaj opakowania<br />(Method of packing)</div>
          <div style={{ ...thStyle, flex: 1 }}>10. Opis towaru<br />(Nature of goods)</div>
          <div style={{ ...thStyle, width: '50px' }}>11. Stat./Code</div>
          <div style={{ ...thStyle, width: '75px' }}>12. Waga brutto kg<br />(Gross weight)</div>
          <div style={{ ...thStyle, width: '70px', borderRight: b }}>13. Objętość m³<br />(Volume)</div>
        </div>
        {/* Wiersz z danymi */}
        <div style={{ display: 'flex', minHeight: '22px' }}>
          <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
          <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages || ''}</div>
          <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
          <div style={{ width: '50px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode || ''}</div>
          <div style={{ width: '75px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight || ''}</div>
          <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.volume || ''}</div>
        </div>
        {/* Puste wiersze */}
        {emptyRow}
        {emptyRow}
        {emptyRow}
        {emptyRow}
      </div>

      {/* ── 14. INSTRUKCJE | 15. FRACHT | 15a. WALUTA ─────────── */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 3, padding: '3px 5px', borderRight: b, minHeight: '80px' }}>
          <div style={lbl}>14. Instrukcje nadawcy (Sender's instructions)</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.cargo?.notes || ''}</div>
        </div>
        <div style={{ flex: 2, padding: '3px 5px', borderRight: b, minHeight: '80px' }}>
          <div style={lbl}>15. Fracht (Freight)</div>
        </div>
        <div style={{ width: '90px', padding: '3px 5px', minHeight: '80px' }}>
          <div style={lbl}>15a. Waluta (Currency)</div>
        </div>
      </div>

      {/* ── INCOTERMS / REJESTRACJA ───────────────────────────── */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ width: '120px', padding: '3px 5px', borderRight: b, minHeight: '32px' }}>
          <div style={lbl}>Incoterms:</div>
          <div style={{ ...val, fontWeight: 'bold' }}>{data.cargo?.incoterms || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '32px' }}>
          <div style={lbl}>Nr rejestracyjny pojazdu (Vehicle registration):</div>
          <div style={val}>{data.vehicle?.reg || ''}</div>
        </div>
        <div style={{ width: '130px', padding: '3px 5px', minHeight: '32px' }}>
          <div style={lbl}>Kraj pojazdu:</div>
          <div style={val}>{data.vehicle?.reg ? data.fromCountry : ''}</div>
        </div>
      </div>

      {/* ── 17. UWAGI SPECJALNE ───────────────────────────────── */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '3px 5px', minHeight: '55px' }}>
        <div style={lbl}>17. Uwagi specjalne (Special agreements / Besondere Vereinbarungen)</div>
      </div>

      {/* ── PODPISY 22 | 23 | 24 ──────────────────────────────── */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '100px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>22. Nadawca (Sender / Absender / Expéditeur)</div>
          <div style={{ ...lbl, marginTop: '2px' }}>Podpis i pieczęć / Signature &amp; stamp</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, marginTop: '4px', minHeight: '12px' }} />
          <div style={{ borderTop: b, marginTop: '8px', minHeight: '12px' }} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '100px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>23. Przewoźnik (Carrier / Frachtführer / Transporteur)</div>
          <div style={{ ...lbl, marginTop: '2px' }}>Podpis i pieczęć / Signature &amp; stamp</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, marginTop: '4px', minHeight: '12px' }} />
          <div style={{ borderTop: b, marginTop: '8px', minHeight: '12px' }} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '100px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>24. Odbiorca (Consignee / Destinataire / Empfänger)</div>
          <div style={{ ...lbl, marginTop: '2px' }}>Podpis i pieczęć / Signature &amp; stamp</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, marginTop: '4px', minHeight: '12px' }} />
          <div style={{ borderTop: b, marginTop: '8px', minHeight: '12px' }} />
        </div>
      </div>
      <div style={{ borderLeft: b, borderRight: b, borderBottom: b, height: '2px' }} />

      {/* ── STOPKA ────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', fontSize: '6.5px', color: '#666', marginTop: '5px' }}>
        Oryginał dla odbiorcy (1) · Kopia dla nadawcy (2) · Kopia dla przewoźnika (3) · Dokument wystawiany w 3 egzemplarzach
      </div>

    </div>
  )
}
