import { formatDocumentDate } from '../../../../utils/formatDate'

export function IataDgrAirDeclarationTemplate({ data }) {
  const today = formatDocumentDate(new Date())
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px',
    borderRight: b,
    borderBottom: b,
    fontSize: '6.5px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#2c5fa8',
    verticalAlign: 'top',
  }

  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '18px' }}>
      {[35, null, 40, 35, 40, 45, 40, 35, 35, 45, null].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>IATA DGR — DANGEROUS GOODS DECLARATION (AIR)</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Shipper's Declaration for Dangerous Goods · Air Transport · IATA DGR</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>IATA Dangerous Goods Regulations — bardziej restrykcyjny niż IMDG. Baterie litowe, substancje zapalne, toksyczne.</div>
      </div>

      {/* NOTKA OSTRZEGAWCZA */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          <strong>OSTRZEŻENIE KARNE:</strong> Fałszywe oświadczenie dotyczące towarów niebezpiecznych podlega karze
          pozbawienia wolności. Nadawca jest odpowiedzialny za poprawność deklaracji.
        </span>
      </div>

      {/* SHIPPER | CONSIGNEE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>Shipper / Nadawca (nazwa, adres, tel.):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.phone || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '36px' }}>
          <div style={lbl}>Consignee / Odbiorca (nazwa, adres):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
        </div>
      </div>

      {/* AIRPORT OF DEPARTURE | AIRPORT OF DESTINATION */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Airport of Departure / Port lotniczy nadania:</div>
          <div style={val}>{data.fromCity || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Airport of Destination / Port lotniczy docelowy:</div>
          <div style={val}>{data.toCity || ''}</div>
        </div>
      </div>

      {/* SEKCJA: DANGEROUS GOODS */}
      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>DANGEROUS GOODS</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '35px' }}>UN or<br />ID No.</div>
        <div style={{ ...thStyle, flex: 1 }}>Proper Shipping Name (PSN)<br />&amp; Technical Name</div>
        <div style={{ ...thStyle, width: '40px' }}>Class or<br />Division</div>
        <div style={{ ...thStyle, width: '35px' }}>Sub.<br />Risk</div>
        <div style={{ ...thStyle, width: '40px' }}>Packing<br />Group</div>
        <div style={{ ...thStyle, width: '45px' }}>Qty &amp; Type<br />of Packing</div>
        <div style={{ ...thStyle, width: '40px' }}>Packing<br />Instr.</div>
        <div style={{ ...thStyle, width: '35px' }}>Auth.</div>
        <div style={{ ...thStyle, width: '35px' }}>Index</div>
        <div style={{ ...thStyle, width: '45px' }}>Net Qty /<br />Package</div>
        <div style={{ ...thStyle, flex: 1, borderRight: b }}>Net Qty /<br />Consignment</div>
      </div>

      {/* Wiersz z danymi — UN No./Class/Packing Group bez odpowiednika (jak IMDG poz. 15, ADR poz. 14) */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '35px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '35px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages || ''}</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '35px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '35px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight || ''}</div>
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}

      {/* ADDITIONAL HANDLING INFORMATION */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, padding: '3px 5px', minHeight: '24px' }}>
        <div style={lbl}>Additional Handling Information / Dodatkowe instrukcje:</div>
        <div style={val}>{data.cargo?.notes || ''}</div>
      </div>

      {/* SHIPPER'S CERTIFICATION */}
      <div style={{ border: b, borderTop: 'none', padding: '5px 7px', backgroundColor: '#f7f7f7' }}>
        <span style={{ fontSize: '6.5px', color: '#555' }}>
          <strong>SHIPPER'S CERTIFICATION</strong> — I hereby declare that the contents of this consignment are fully
          and accurately described above by the Proper Shipping Name, and are classified, packed, marked and labeled
          and are in all respects in proper condition for transport according to applicable international and national
          governmental regulations. WARNING: Failure to comply in all respects with the applicable Dangerous Goods
          Regulations may be in breach of the applicable law, subject to legal penalties.
        </span>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Nadawca / Shipper</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Linia lotnicza / Airline</div>
          <div style={{ fontSize: '8px', marginTop: '2px' }}>{data.carrier?.name || ''}</div>
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
