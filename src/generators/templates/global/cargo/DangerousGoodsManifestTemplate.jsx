import { formatDocumentDate } from '../../../../utils/formatDate'

export function DangerousGoodsManifestTemplate({ data }) {
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
      {[45, 55, 40, null, 35, 30, 45, 50, 40, 55, 55].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>DANGEROUS GOODS MANIFEST</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Manifest Towarów Niebezpiecznych na Statku · IMDG Manifest</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Wymagany przez kapitana statku i władze portowe. Zawiera wszystkie towary niebezpieczne załadowane na statek w danym rejsie.</div>
      </div>

      {/* STATEK | REJS | BANDERA | DATA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nazwa statku / Vessel name:</div>
          <div style={val}>{data.cargo?.vessel || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr rejsu / Voyage No.:</div>
          <div style={val}>{data.cargo?.voyageNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Bandera / Flag:</div>
          <div style={val}>{data.sea?.flag || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Data / Date:</div>
          <div style={val}>{today}</div>
        </div>
      </div>

      {/* PORT ZAŁADUNKU | PORT ROZŁADUNKU | KAPITAN */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Port załadunku / Port of loading:</div>
          <div style={val}>{data.fromCity || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Port rozładunku / Port of discharge:</div>
          <div style={val}>{data.toCity || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Kapitan / Master:</div>
          {/* Brak odpowiednika w słowniku — dane kapitana statku nie są zbierane w wizardzie. */}
          <div style={val} />
        </div>
      </div>

      {/* SEKCJA: WYKAZ TOWARÓW NIEBEZPIECZNYCH */}
      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>WYKAZ TOWARÓW NIEBEZPIECZNYCH / DG CARGO LIST</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '45px' }}>B/L No.</div>
        <div style={{ ...thStyle, width: '55px' }}>Container No.</div>
        <div style={{ ...thStyle, width: '40px' }}>UN No.</div>
        <div style={{ ...thStyle, flex: 1 }}>Proper Shipping Name</div>
        <div style={{ ...thStyle, width: '35px' }}>Class</div>
        <div style={{ ...thStyle, width: '30px' }}>PG</div>
        <div style={{ ...thStyle, width: '45px' }}>Flash Pt °C</div>
        <div style={{ ...thStyle, width: '50px' }}>Marine Poll.</div>
        <div style={{ ...thStyle, width: '40px' }}>Qty kg</div>
        <div style={{ ...thStyle, width: '55px' }}>Location on vessel</div>
        <div style={{ ...thStyle, width: '55px', borderRight: b }}>Shipper</div>
      </div>

      {/* Wiersz z danymi — UN No./Class/PG/Flash Pt/Marine Poll./Location bez odpowiednika w słowniku
          (namespace DG niezależny od trybu transportu wciąż nie istnieje, patrz uwaga w IMDG poz. 15). */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.containerNo || ''}</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
        <div style={{ width: '35px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '30px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '50px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>&#9634; Tak &#9634; Nie</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight || ''}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.sender?.name || ''}</div>
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}
      {emptyRow}
      {emptyRow}
      {emptyRow}
      {emptyRow}

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Chief Officer / I oficer</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Port Authorities / Władze portu</div>
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
