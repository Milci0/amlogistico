const s = {
  page: { width: '794px', minHeight: '1123px', padding: '20px 24px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '9px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box' },
  title: { textAlign: 'center', fontSize: '15px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '2px' },
  subtitle: { textAlign: 'center', fontSize: '8px', color: '#555', marginBottom: '2px' },
  badge: { textAlign: 'center', fontSize: '9px', fontWeight: 'bold', backgroundColor: '#f0f0f0', border: '1px solid #999', padding: '3px 0', marginBottom: '10px', letterSpacing: '1px' },
  row: { display: 'flex', borderLeft: '1px solid #000', borderTop: '1px solid #000' },
  cell: { borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '5px 7px' },
  label: { fontSize: '7px', color: '#666', textTransform: 'uppercase', marginBottom: '2px' },
  val: { fontSize: '10px', fontWeight: 'bold', minHeight: '13px' },
  val2: { fontSize: '9px', minHeight: '12px' },
  th: { padding: '5px 7px', backgroundColor: '#333', color: '#fff', fontWeight: 'bold', fontSize: '8px', borderRight: '1px solid #555', textAlign: 'center' },
  td: { padding: '5px 7px', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', fontSize: '9px' },
  sigBox: { borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '6px 7px', minHeight: '70px' },
}

export function SeaWaybillTemplate({ data }) {
  const today = new Date().toLocaleDateString('pl-PL')
  const swbNo = `SWB/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`

  return (
    <div style={s.page}>
      <div style={s.title}>SEA WAYBILL</div>
      <div style={s.subtitle}>MORSKI LIST PRZEWOZOWY</div>
      <div style={s.badge}>NON-NEGOTIABLE — NIEZBYWALNE</div>
      <div style={{ textAlign: 'right', marginBottom: '8px' }}>
        <span style={s.label}>SWB No.: </span>
        <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{swbNo}</span>
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
        <div style={{ ...s.cell, flex: 1, minHeight: '32px' }}>
          <div style={s.label}>Notify party</div>
          <div style={s.val}>{data.receiver?.name}</div>
        </div>
      </div>

      {/* Vessel + route + date in one row */}
      <div style={s.row}>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>Vessel / Statek</div>
          <div style={s.val}>{data.cargo?.vessel || '—'}</div>
        </div>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>Voyage No.</div>
          <div style={s.val}>{data.cargo?.voyageNo || '—'}</div>
        </div>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>Port of loading</div>
          <div style={s.val}>{data.fromCity}, {data.fromCountry}</div>
        </div>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>Port of discharge</div>
          <div style={s.val}>{data.toCity}, {data.toCountry}</div>
        </div>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>Date of loading</div>
          <div style={s.val}>{data.loadDate}</div>
        </div>
      </div>

      {/* Container / Cargo table */}
      <div style={{ borderLeft: '1px solid #000', borderTop: '1px solid #000' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ ...s.th, width: '110px' }}>Container No.</div>
          <div style={{ ...s.th, width: '80px' }}>Seal No.</div>
          <div style={{ ...s.th, width: '70px' }}>Type</div>
          <div style={{ ...s.th, flex: 3 }}>Description of goods</div>
          <div style={{ ...s.th, width: '60px' }}>Pkgs</div>
          <div style={{ ...s.th, width: '70px' }}>Weight kg</div>
          <div style={{ ...s.th, width: '65px', borderRight: 'none' }}>Volume m³</div>
        </div>
        <div style={{ display: 'flex', minHeight: '40px' }}>
          <div style={{ ...s.td, width: '110px' }}>{data.cargo?.containerNo || ''}</div>
          <div style={{ ...s.td, width: '80px' }}>{data.cargo?.sealNo || ''}</div>
          <div style={{ ...s.td, width: '70px', textAlign: 'center' }}>{data.cargo?.containerType || '20GP'}</div>
          <div style={{ ...s.td, flex: 3 }}>{data.cargo?.name}</div>
          <div style={{ ...s.td, width: '60px', textAlign: 'center' }}>{data.cargo?.packages}</div>
          <div style={{ ...s.td, width: '70px', textAlign: 'center' }}>{data.cargo?.weight}</div>
          <div style={{ ...s.td, width: '65px', textAlign: 'center', borderRight: 'none' }}>{data.cargo?.volume}</div>
        </div>
        <div style={{ display: 'flex', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
          <div style={{ ...s.td, width: '110px', fontSize: '8px', color: '#555' }}>TOTAL</div>
          <div style={{ ...s.td, width: '80px' }}></div>
          <div style={{ ...s.td, width: '70px' }}></div>
          <div style={{ ...s.td, flex: 3 }}></div>
          <div style={{ ...s.td, width: '60px', textAlign: 'center' }}>{data.cargo?.packages}</div>
          <div style={{ ...s.td, width: '70px', textAlign: 'center' }}>{data.cargo?.weight}</div>
          <div style={{ ...s.td, width: '65px', textAlign: 'center', borderRight: 'none' }}>{data.cargo?.volume}</div>
        </div>
      </div>

      {/* Notes */}
      <div style={s.row}>
        <div style={{ ...s.cell, flex: 1, minHeight: '36px' }}>
          <div style={s.label}>Special notes / Uwagi</div>
          <div style={s.val2}>{data.cargo?.notes || ''}</div>
        </div>
      </div>

      {/* Non-negotiable clause */}
      <div style={{ borderLeft: '1px solid #000' }}>
        <div style={{ ...s.cell, fontSize: '8px', color: '#555', lineHeight: '1.5' }}>
          This Sea Waybill is NON-NEGOTIABLE. The goods will be delivered to the named consignee without production of this document.
          Niniejszy morski list przewozowy jest NIEZBYWANY. Towar zostanie wydany wskazanemu odbiorcy bez konieczności przedstawienia tego dokumentu.
        </div>
      </div>

      {/* Signatures */}
      <div style={{ display: 'flex', borderLeft: '1px solid #000' }}>
        <div style={{ ...s.sigBox, flex: 1 }}>
          <div style={s.label}>Issued in / Wystawiono w</div>
          <div style={{ fontWeight: 'bold' }}>{data.fromCity}</div>
          <div>{today}</div>
          <div style={{ marginTop: '25px', borderTop: '1px solid #000', paddingTop: '4px', fontSize: '7px', color: '#666' }}>
            Carrier's signature / Podpis przewoźnika
          </div>
        </div>
        <div style={{ ...s.sigBox, flex: 1 }}>
          <div style={s.label}>Shipper's declaration / Deklaracja nadawcy</div>
          <div style={{ marginTop: '25px', borderTop: '1px solid #000', paddingTop: '4px', fontSize: '7px', color: '#666' }}>
            Shipper's signature / {data.sender?.name}
          </div>
        </div>
      </div>
    </div>
  )
}
