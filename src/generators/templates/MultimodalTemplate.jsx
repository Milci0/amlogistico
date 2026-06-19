const s = {
  page: { width: '794px', minHeight: '1123px', padding: '20px 24px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '9px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box' },
  title: { textAlign: 'center', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '2px' },
  subtitle: { textAlign: 'center', fontSize: '8px', color: '#555', marginBottom: '10px' },
  row: { display: 'flex', borderLeft: '1px solid #000', borderTop: '1px solid #000' },
  cell: { borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '5px 7px' },
  label: { fontSize: '7px', color: '#666', textTransform: 'uppercase', marginBottom: '2px' },
  val: { fontSize: '10px', fontWeight: 'bold', minHeight: '13px' },
  val2: { fontSize: '9px', minHeight: '12px' },
  th: { padding: '5px 7px', backgroundColor: '#333', color: '#fff', fontWeight: 'bold', fontSize: '8px', borderRight: '1px solid #555', textAlign: 'center' },
  td: { padding: '5px 7px', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', fontSize: '9px' },
  sigBox: { borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '6px 7px', minHeight: '70px' },
}

export function MultimodalTemplate({ data }) {
  const today = new Date().toLocaleDateString('pl-PL')
  const docNo = `MTD/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`
  const currency = data.cargo?.currency || 'EUR'

  return (
    <div style={s.page}>
      <div style={s.title}>MULTIMODAL TRANSPORT DOCUMENT</div>
      <div style={s.subtitle}>DOKUMENT TRANSPORTU KOMBINOWANEGO — NON-NEGOTIABLE</div>
      <div style={{ textAlign: 'right', marginBottom: '8px' }}>
        <span style={s.label}>MTD No.: </span>
        <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{docNo}</span>
      </div>

      {/* Shipper | Consignee */}
      <div style={s.row}>
        <div style={{ ...s.cell, flex: 1, minHeight: '55px' }}>
          <div style={s.label}>Shipper / Nadawca</div>
          <div style={s.val}>{data.sender?.name}</div>
          <div style={s.val2}>{data.sender?.address}</div>
          <div style={s.val2}>{data.sender?.country}</div>
        </div>
        <div style={{ ...s.cell, flex: 1, minHeight: '55px' }}>
          <div style={s.label}>Consignee / Odbiorca</div>
          <div style={s.val}>{data.receiver?.name}</div>
          <div style={s.val2}>{data.receiver?.address}</div>
          <div style={s.val2}>{data.receiver?.country}</div>
        </div>
      </div>

      {/* Notify */}
      <div style={s.row}>
        <div style={{ ...s.cell, flex: 1, minHeight: '30px' }}>
          <div style={s.label}>Notify party / Do powiadomienia</div>
          <div style={s.val}>{data.receiver?.name}</div>
        </div>
      </div>

      {/* Transport legs table */}
      <div style={{ borderLeft: '1px solid #000', borderTop: '1px solid #000' }}>
        <div style={{ padding: '5px 7px', backgroundColor: '#e8e8e8', borderRight: '1px solid #000', borderBottom: '1px solid #000', fontWeight: 'bold', fontSize: '8px', textTransform: 'uppercase' }}>
          Etapy transportu / Transport legs
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ ...s.th, width: '50px' }}>Leg</div>
          <div style={{ ...s.th, width: '70px' }}>Mode</div>
          <div style={{ ...s.th, flex: 1 }}>Place of receipt</div>
          <div style={{ ...s.th, flex: 1 }}>Place of loading</div>
          <div style={{ ...s.th, flex: 1 }}>Port of discharge</div>
          <div style={{ ...s.th, flex: 1 }}>Place of delivery</div>
          <div style={{ ...s.th, flex: 1 }}>Carrier</div>
          <div style={{ ...s.th, width: '80px', borderRight: 'none' }}>Date</div>
        </div>
        <div style={{ display: 'flex', minHeight: '30px' }}>
          <div style={{ ...s.td, width: '50px', textAlign: 'center', fontWeight: 'bold' }}>1</div>
          <div style={{ ...s.td, width: '70px', textAlign: 'center' }}>Road</div>
          <div style={{ ...s.td, flex: 1 }}>{data.fromCity}</div>
          <div style={{ ...s.td, flex: 1 }}>{data.fromCity}</div>
          <div style={{ ...s.td, flex: 1 }}>—</div>
          <div style={{ ...s.td, flex: 1 }}>{data.fromCity}</div>
          <div style={{ ...s.td, flex: 1 }}>{data.sender?.name}</div>
          <div style={{ ...s.td, width: '80px', borderRight: 'none' }}>{data.loadDate}</div>
        </div>
        <div style={{ display: 'flex', minHeight: '30px' }}>
          <div style={{ ...s.td, width: '50px', textAlign: 'center', fontWeight: 'bold' }}>2</div>
          <div style={{ ...s.td, width: '70px', textAlign: 'center' }}>Sea</div>
          <div style={{ ...s.td, flex: 1 }}>{data.fromCity}, {data.fromCountry}</div>
          <div style={{ ...s.td, flex: 1 }}>{data.fromCity}, {data.fromCountry}</div>
          <div style={{ ...s.td, flex: 1 }}>{data.toCity}, {data.toCountry}</div>
          <div style={{ ...s.td, flex: 1 }}>{data.toCity}, {data.toCountry}</div>
          <div style={{ ...s.td, flex: 1 }}>{data.cargo?.carrier || '—'}</div>
          <div style={{ ...s.td, width: '80px', borderRight: 'none' }}>{data.loadDate}</div>
        </div>
      </div>

      {/* Cargo table */}
      <div style={{ borderLeft: '1px solid #000', borderTop: '1px solid #000' }}>
        <div style={{ padding: '5px 7px', backgroundColor: '#e8e8e8', borderRight: '1px solid #000', borderBottom: '1px solid #000', fontWeight: 'bold', fontSize: '8px', textTransform: 'uppercase' }}>
          Opis ładunku / Cargo description
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ ...s.th, width: '30px' }}>Lp.</div>
          <div style={{ ...s.th, flex: 3 }}>Description of goods</div>
          <div style={{ ...s.th, width: '80px' }}>HS Code</div>
          <div style={{ ...s.th, width: '60px' }}>Pkgs</div>
          <div style={{ ...s.th, width: '70px' }}>Weight kg</div>
          <div style={{ ...s.th, width: '100px', borderRight: 'none' }}>Value ({currency})</div>
        </div>
        <div style={{ display: 'flex', minHeight: '36px' }}>
          <div style={{ ...s.td, width: '30px', textAlign: 'center' }}>1</div>
          <div style={{ ...s.td, flex: 3 }}>{data.cargo?.name}</div>
          <div style={{ ...s.td, width: '80px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
          <div style={{ ...s.td, width: '60px', textAlign: 'center' }}>{data.cargo?.packages}</div>
          <div style={{ ...s.td, width: '70px', textAlign: 'center' }}>{data.cargo?.weight}</div>
          <div style={{ ...s.td, width: '100px', textAlign: 'right', borderRight: 'none' }}>
            {data.cargo?.value ? `${data.cargo.value} ${currency}` : '—'}
          </div>
        </div>
        <div style={{ display: 'flex', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
          <div style={{ ...s.td, width: '30px' }}></div>
          <div style={{ ...s.td, flex: 3, fontSize: '8px', color: '#555' }}>TOTAL</div>
          <div style={{ ...s.td, width: '80px' }}></div>
          <div style={{ ...s.td, width: '60px', textAlign: 'center' }}>{data.cargo?.packages}</div>
          <div style={{ ...s.td, width: '70px', textAlign: 'center' }}>{data.cargo?.weight} kg</div>
          <div style={{ ...s.td, width: '100px', textAlign: 'right', borderRight: 'none' }}>
            {data.cargo?.value ? `${data.cargo.value} ${currency}` : ''}
          </div>
        </div>
      </div>

      {/* MTO details */}
      <div style={{ display: 'flex', borderLeft: '1px solid #000' }}>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>Mode of transport / Rodzaj transportu</div>
          <div style={s.val2}>Combined — Road + Sea</div>
        </div>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>MTO Reference / Odniesienie MTO</div>
          <div style={s.val2}>{docNo}</div>
        </div>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>Issued in / Wystawiono</div>
          <div style={s.val2}>{data.fromCity}, {today}</div>
        </div>
      </div>

      {/* Notes */}
      <div style={{ borderLeft: '1px solid #000' }}>
        <div style={{ ...s.cell, minHeight: '32px' }}>
          <div style={s.label}>Special notes / Uwagi szczególne</div>
          <div style={s.val2}>{data.cargo?.notes || ''}</div>
        </div>
      </div>

      {/* Signatures */}
      <div style={{ display: 'flex', borderLeft: '1px solid #000' }}>
        <div style={{ ...s.sigBox, flex: 1 }}>
          <div style={s.label}>MTO / Operator transportu multimodalnego</div>
          <div style={{ marginTop: '25px', borderTop: '1px solid #000', paddingTop: '4px', fontSize: '7px', color: '#666' }}>
            Signature / Podpis MTO
          </div>
        </div>
        <div style={{ ...s.sigBox, flex: 1 }}>
          <div style={s.label}>Shipper / Nadawca</div>
          <div style={{ ...s.val2 }}>{data.sender?.name}</div>
          <div style={{ marginTop: '25px', borderTop: '1px solid #000', paddingTop: '4px', fontSize: '7px', color: '#666' }}>
            Signature / Podpis nadawcy
          </div>
        </div>
      </div>

      <div style={{ marginTop: '6px', fontSize: '7px', color: '#888', textAlign: 'center' }}>
        THIS MULTIMODAL TRANSPORT DOCUMENT IS ISSUED SUBJECT TO ICC UNIFORM RULES FOR A COMBINED TRANSPORT DOCUMENT (BROCHURE 298)
      </div>
    </div>
  )
}
