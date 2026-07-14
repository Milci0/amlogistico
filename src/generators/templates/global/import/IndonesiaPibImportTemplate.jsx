import { formatDocumentDate } from '../../../../utils/formatDate'

export function IndonesiaPibImportTemplate({ data }) {
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
      {[25, null, 45, 35, 35, 40, 45, 40, 45, 40, null].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>INDONESIA — PIB — PEMBERITAHUAN IMPOR BARANG</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Direktorat Jenderal Bea dan Cukai — DJBC</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>System: CEISA 4.0 — Customs-Excise Information System</div>
      </div>

      {/* NOTKA OSTRZEGAWCZA */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          <strong>WAŻNE:</strong> Indonezja wymaga Angka Pengenal Importir (API) — licencji importowej. Wiele towarów
          wymaga SNI (Standar Nasional Indonesia) lub Lartas — ograniczenia importowe.
        </span>
      </div>

      {/* DATA | KPPBC */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Date:</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>KPPBC (Kantor Pabean):</div>
          <div style={val}>{data.customs?.exitOffice || ''}</div>
        </div>
      </div>

      {/* IMPORTIR | SUPPLIER LUAR NEGERI */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>Importir (alamat, NPWP, API):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.customs?.eori || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '36px' }}>
          <div style={lbl}>Supplier luar negeri:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
        </div>
      </div>

      {/* COUNTRY OF ORIGIN | PELABUHAN BONGKAR | NILAI PABEAN | HS CODE INDONESIA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Country of Origin:</div>
          <div style={val}>{data.fromCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Pelabuhan Bongkar / Port of Entry:</div>
          <div style={val}>{data.toCity || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nilai Pabean (USD):</div>
          <div style={val}>{data.cargo?.value || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>HS Code Indonesia (8):</div>
          <div style={val}>{data.cargo?.hsCode || ''}</div>
        </div>
      </div>

      {/* SEKCJA: RINCIAN BARANG / GOODS ITEMS */}
      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>RINCIAN BARANG / GOODS ITEMS</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '25px' }}>Lp.</div>
        <div style={{ ...thStyle, flex: 1 }}>Opis towaru<br />Description</div>
        <div style={{ ...thStyle, width: '45px' }}>Kod HS<br />HS Code</div>
        <div style={{ ...thStyle, width: '35px' }}>Ilość<br />Qty</div>
        <div style={{ ...thStyle, width: '35px' }}>Jedn.<br />Unit</div>
        <div style={{ ...thStyle, width: '40px' }}>Waga (kg)<br />Weight</div>
        <div style={{ ...thStyle, width: '45px' }}>Wartość<br />Value</div>
        <div style={{ ...thStyle, width: '40px' }}>HS Code<br />ID (8)</div>
        <div style={{ ...thStyle, width: '45px' }}>SNI<br />Cert. No.</div>
        <div style={{ ...thStyle, width: '40px' }}>BM<br />Tarif %</div>
        <div style={{ ...thStyle, flex: 1, borderRight: b }}>PPN % / PPh Pasal 22 %</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '25px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode || ''}</div>
        <div style={{ width: '35px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.quantity || ''}</div>
        <div style={{ width: '35px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight || ''}</div>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'right' }}>{data.cargo?.value || ''}</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}
      {emptyRow}
      {emptyRow}

      {/* API / LARTAS / BPOM */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>API No. (Licencja importowa):</div>
          <div style={val}>{data.customs?.permitNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Lartas Permit (jeśli):</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>BPOM No. (żywność/leki):</div>
          <div style={val} />
        </div>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>PPJK (Customs Agent)</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Importir</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Tanggal / Date</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
      </div>

    </div>
  )
}
