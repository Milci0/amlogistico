const s = {
  page: { width: '794px', minHeight: '1123px', padding: '30px 36px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '9px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box' },
  title: { textAlign: 'center', fontSize: '16px', fontWeight: 'bold', letterSpacing: '3px', marginBottom: '20px', paddingBottom: '6px', borderBottom: '2px solid #000' },
  section: { border: '1px solid #ccc', padding: '10px 12px', marginBottom: '8px' },
  label: { fontSize: '7px', color: '#666', textTransform: 'uppercase', marginBottom: '2px' },
  val: { fontSize: '10px', fontWeight: 'bold' },
  val2: { fontSize: '9px' },
  th: { padding: '6px 8px', backgroundColor: '#222', color: '#fff', fontWeight: 'bold', fontSize: '8px', borderRight: '1px solid #444', textAlign: 'center' },
  td: { padding: '6px 8px', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', fontSize: '9px' },
}

export function PackingListTemplate({ data }) {
  const today = new Date().toLocaleDateString('pl-PL')

  return (
    <div style={s.page}>
      <div style={s.title}>PACKING LIST</div>

      {/* Date */}
      <div style={{ textAlign: 'right', marginBottom: '16px' }}>
        <span style={s.label}>Data / Date: </span>
        <span style={{ fontWeight: 'bold' }}>{today}</span>
      </div>

      {/* Sender / Receiver */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ ...s.section, flex: 1 }}>
          <div style={{ ...s.label, marginBottom: '6px', fontSize: '8px', fontWeight: 'bold', color: '#000' }}>NADAWCA / SHIPPER</div>
          <div style={s.val}>{data.sender?.name}</div>
          <div style={s.val2}>{data.sender?.address}</div>
          <div style={s.val2}>{data.sender?.country}</div>
          <div style={{ marginTop: '4px', ...s.val2 }}>VAT: {data.sender?.vat || '—'}</div>
        </div>
        <div style={{ ...s.section, flex: 1 }}>
          <div style={{ ...s.label, marginBottom: '6px', fontSize: '8px', fontWeight: 'bold', color: '#000' }}>ODBIORCA / CONSIGNEE</div>
          <div style={s.val}>{data.receiver?.name}</div>
          <div style={s.val2}>{data.receiver?.address}</div>
          <div style={s.val2}>{data.receiver?.country}</div>
          <div style={{ marginTop: '4px', ...s.val2 }}>VAT: {data.receiver?.vat || '—'}</div>
        </div>
      </div>

      {/* Route */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ ...s.section, flex: 1 }}>
          <div style={s.label}>Kraj wysyłki / Country of dispatch</div>
          <div style={s.val}>{data.fromCountry}</div>
        </div>
        <div style={{ ...s.section, flex: 1 }}>
          <div style={s.label}>Kraj przeznaczenia / Country of destination</div>
          <div style={s.val}>{data.toCountry}</div>
        </div>
      </div>

      {/* Goods table */}
      <div style={{ border: '1px solid #ccc', marginBottom: '16px' }}>
        <div style={{ display: 'flex', backgroundColor: '#222' }}>
          <div style={{ ...s.th, flex: 3, textAlign: 'left' }}>Opis towaru / Description of goods</div>
          <div style={{ ...s.th, width: '80px' }}>Kod HS<br/>HS Code</div>
          <div style={{ ...s.th, width: '60px' }}>Ilość<br/>Qty</div>
          <div style={{ ...s.th, width: '80px' }}>Waga brutto<br/>Gross weight</div>
          <div style={{ ...s.th, width: '70px', borderRight: 'none' }}>Objętość<br/>Volume (m³)</div>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ ...s.td, flex: 3 }}>{data.cargo?.name}</div>
          <div style={{ ...s.td, width: '80px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
          <div style={{ ...s.td, width: '60px', textAlign: 'center' }}>{data.cargo?.packages} szt.</div>
          <div style={{ ...s.td, width: '80px', textAlign: 'center' }}>{data.cargo?.weight} kg</div>
          <div style={{ ...s.td, width: '70px', textAlign: 'center', borderRight: 'none' }}>{data.cargo?.volume} m³</div>
        </div>
        {/* Empty rows */}
        {[1, 2].map(i => (
          <div key={i} style={{ display: 'flex', minHeight: '28px' }}>
            <div style={{ ...s.td, flex: 3 }}></div>
            <div style={{ ...s.td, width: '80px' }}></div>
            <div style={{ ...s.td, width: '60px' }}></div>
            <div style={{ ...s.td, width: '80px' }}></div>
            <div style={{ ...s.td, width: '70px', borderRight: 'none' }}></div>
          </div>
        ))}
        {/* Totals */}
        <div style={{ display: 'flex', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
          <div style={{ ...s.td, flex: 3, fontSize: '8px', color: '#555' }}>ŁĄCZNIE / TOTAL</div>
          <div style={{ ...s.td, width: '80px' }}></div>
          <div style={{ ...s.td, width: '60px', textAlign: 'center' }}>{data.cargo?.packages}</div>
          <div style={{ ...s.td, width: '80px', textAlign: 'center' }}>{data.cargo?.weight} kg</div>
          <div style={{ ...s.td, width: '70px', textAlign: 'center', borderRight: 'none' }}>{data.cargo?.volume} m³</div>
        </div>
      </div>

      {/* Incoterms */}
      <div style={{ ...s.section, marginBottom: '40px' }}>
        <div style={s.label}>Warunki dostawy / Delivery terms (Incoterms)</div>
        <div style={s.val}>{data.cargo?.incoterms || 'DAP'} {data.toCity}</div>
      </div>

      {/* Signature */}
      <div style={{ display: 'flex', gap: '40px', marginTop: 'auto' }}>
        <div style={{ flex: 1 }}>
          <div style={{ borderTop: '1px solid #000', paddingTop: '6px' }}>
            <div style={{ fontSize: '8px', color: '#555' }}>Podpis upoważnionego / Authorized signature</div>
            <div style={{ marginTop: '4px', fontSize: '9px', fontWeight: 'bold' }}>{data.sender?.name}</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ borderTop: '1px solid #000', paddingTop: '6px' }}>
            <div style={{ fontSize: '8px', color: '#555' }}>Miejscowość i data / Place and date</div>
            <div style={{ marginTop: '4px', fontSize: '9px' }}>{data.fromCity}, {today}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
