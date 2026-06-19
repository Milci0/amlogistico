const s = {
  page: { width: '794px', minHeight: '1123px', padding: '20px 24px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '9px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box' },
  title: { textAlign: 'center', fontSize: '15px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '2px' },
  subtitle: { textAlign: 'center', fontSize: '8px', color: '#555', marginBottom: '2px' },
  blNo: { textAlign: 'right', marginBottom: '10px' },
  row: { display: 'flex', borderLeft: '1px solid #000', borderTop: '1px solid #000' },
  cell: { borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '5px 7px' },
  label: { fontSize: '7px', color: '#666', textTransform: 'uppercase', marginBottom: '2px' },
  val: { fontSize: '10px', fontWeight: 'bold', minHeight: '13px' },
  val2: { fontSize: '9px', minHeight: '12px' },
  th: { padding: '5px 7px', backgroundColor: '#333', color: '#fff', fontWeight: 'bold', fontSize: '8px', borderRight: '1px solid #555', textAlign: 'center' },
  td: { padding: '5px 7px', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', fontSize: '9px' },
  sigBox: { borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '6px 7px', minHeight: '70px' },
}

export function BillOfLadingTemplate({ data }) {
  const today = new Date().toLocaleDateString('pl-PL')
  const blNo = `BL/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`

  return (
    <div style={s.page}>
      <div style={s.title}>BILL OF LADING</div>
      <div style={s.subtitle}>KONOSAMENT MORSKI — NEGOTIABLE</div>
      <div style={s.subtitle}>COMBINED TRANSPORT BILL OF LADING</div>
      <div style={{ textAlign: 'right', marginBottom: '8px' }}>
        <span style={s.label}>B/L No.: </span>
        <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{blNo}</span>
      </div>

      {/* Shipper | Consignee */}
      <div style={s.row}>
        <div style={{ ...s.cell, flex: 1, minHeight: '55px' }}>
          <div style={s.label}>Shipper / Nadawca (name, address, country)</div>
          <div style={s.val}>{data.sender?.name}</div>
          <div style={s.val2}>{data.sender?.address}</div>
          <div style={s.val2}>{data.sender?.country}</div>
        </div>
        <div style={{ ...s.cell, flex: 1, minHeight: '55px' }}>
          <div style={s.label}>Consignee / Odbiorca (name, address, country)</div>
          <div style={s.val}>{data.receiver?.name}</div>
          <div style={s.val2}>{data.receiver?.address}</div>
          <div style={s.val2}>{data.receiver?.country}</div>
        </div>
      </div>

      {/* Notify */}
      <div style={s.row}>
        <div style={{ ...s.cell, flex: 1, minHeight: '36px' }}>
          <div style={s.label}>Notify party / Strona do powiadomienia</div>
          <div style={s.val}>{data.receiver?.name}</div>
          <div style={s.val2}>{data.receiver?.address}</div>
        </div>
      </div>

      {/* Vessel / Voyage */}
      <div style={s.row}>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>Vessel / Statek</div>
          <div style={s.val}>{data.cargo?.vessel || '—'}</div>
        </div>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>Voyage No. / Nr rejsu</div>
          <div style={s.val}>{data.cargo?.voyageNo || '—'}</div>
        </div>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>Freight payment / Fracht</div>
          <div style={s.val}>{data.cargo?.incoterms || 'PREPAID'}</div>
        </div>
      </div>

      {/* Ports */}
      <div style={s.row}>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>Port of loading / Port załadunku</div>
          <div style={s.val}>{data.fromCity}, {data.fromCountry}</div>
        </div>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>Port of discharge / Port wyładunku</div>
          <div style={s.val}>{data.toCity}, {data.toCountry}</div>
        </div>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>Date of loading / Data załadunku</div>
          <div style={s.val}>{data.loadDate}</div>
        </div>
      </div>

      {/* Container table */}
      <div style={{ borderLeft: '1px solid #000', borderTop: '1px solid #000' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ ...s.th, width: '110px' }}>Container No.</div>
          <div style={{ ...s.th, width: '80px' }}>Seal No.</div>
          <div style={{ ...s.th, width: '70px' }}>Type</div>
          <div style={{ ...s.th, flex: 3 }}>Description of goods / Opis towaru</div>
          <div style={{ ...s.th, width: '60px' }}>Packages<br/>Szt.</div>
          <div style={{ ...s.th, width: '70px' }}>Weight<br/>kg</div>
          <div style={{ ...s.th, width: '65px', borderRight: 'none' }}>Volume<br/>m³</div>
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
        {/* Totals */}
        <div style={{ display: 'flex', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
          <div style={{ ...s.td, width: '110px', fontSize: '8px', color: '#555' }}>TOTAL</div>
          <div style={{ ...s.td, width: '80px' }}></div>
          <div style={{ ...s.td, width: '70px' }}></div>
          <div style={{ ...s.td, flex: 3 }}></div>
          <div style={{ ...s.td, width: '60px', textAlign: 'center' }}>{data.cargo?.packages}</div>
          <div style={{ ...s.td, width: '70px', textAlign: 'center' }}>{data.cargo?.weight} kg</div>
          <div style={{ ...s.td, width: '65px', textAlign: 'center', borderRight: 'none' }}>{data.cargo?.volume} m³</div>
        </div>
      </div>

      {/* Terms */}
      <div style={{ display: 'flex', borderLeft: '1px solid #000' }}>
        <div style={{ ...s.cell, flex: 1, minHeight: '40px' }}>
          <div style={s.label}>Freight terms / Warunki frachtu</div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px' }}><input type="checkbox" readOnly /> Prepaid</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px' }}><input type="checkbox" readOnly /> Collect</label>
          </div>
        </div>
        <div style={{ ...s.cell, flex: 2 }}>
          <div style={s.label}>Special notes / Uwagi szczególne</div>
          <div style={s.val2}>{data.cargo?.notes || ''}</div>
        </div>
      </div>

      {/* Signatures */}
      <div style={{ display: 'flex', borderLeft: '1px solid #000' }}>
        <div style={{ ...s.sigBox, flex: 1 }}>
          <div style={s.label}>Issued in / Wystawiono w</div>
          <div style={{ fontSize: '9px', fontWeight: 'bold' }}>{data.fromCity}</div>
          <div style={{ fontSize: '9px' }}>{today}</div>
          <div style={{ marginTop: '25px', borderTop: '1px solid #000', paddingTop: '4px', fontSize: '7px', color: '#666' }}>
            Carrier's signature / Podpis przewoźnika
          </div>
        </div>
        <div style={{ ...s.sigBox, flex: 1 }}>
          <div style={s.label}>On behalf of the Carrier</div>
          <div style={s.val2}></div>
          <div style={{ marginTop: '25px', borderTop: '1px solid #000', paddingTop: '4px', fontSize: '7px', color: '#666' }}>
            As agent for the Carrier
          </div>
        </div>
        <div style={{ ...s.sigBox, flex: 1 }}>
          <div style={s.label}>Shipper's signature / Podpis nadawcy</div>
          <div style={{ fontSize: '9px', fontWeight: 'bold' }}>{data.sender?.name}</div>
          <div style={{ marginTop: '25px', borderTop: '1px solid #000', paddingTop: '4px', fontSize: '7px', color: '#666' }}>
            Authorized signature
          </div>
        </div>
      </div>

      <div style={{ marginTop: '8px', fontSize: '7px', color: '#888', textAlign: 'center' }}>
        ONE ORIGINAL BILL OF LADING MUST BE SURRENDERED DULY ENDORSED IN EXCHANGE FOR THE GOODS OR DELIVERY ORDER
      </div>
    </div>
  )
}
