const s = {
  page: { width: '794px', minHeight: '1123px', padding: '28px 34px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '9px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box' },
  title: { fontSize: '16px', fontWeight: 'bold', marginBottom: '2px' },
  subtitle: { fontSize: '9px', color: '#666', marginBottom: '16px' },
  metaRow: { display: 'flex', gap: '20px', marginBottom: '16px' },
  metaBox: { border: '1px solid #ccc', padding: '6px 10px' },
  label: { fontSize: '7px', color: '#666', textTransform: 'uppercase', marginBottom: '2px' },
  val: { fontSize: '10px', fontWeight: 'bold' },
  val2: { fontSize: '9px' },
  section: { border: '1px solid #ccc', padding: '10px 12px', marginBottom: '12px' },
  sectionTitle: { fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '8px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '6px 8px', backgroundColor: '#333', color: '#fff', fontWeight: 'bold', fontSize: '8px', textAlign: 'center', border: '1px solid #333' },
  td: { padding: '6px 8px', border: '1px solid #ccc', fontSize: '9px' },
  sigBox: { flex: 1, border: '1px solid #ccc', padding: '8px 10px', minHeight: '70px' },
}

export function ZlecenieTemplate({ data }) {
  const today = new Date().toLocaleDateString('pl-PL')
  const docNo = `ZT/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={s.title}>ZLECENIE TRANSPORTOWE</div>
          <div style={s.subtitle}>TRANSPORT ORDER</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={s.label}>Nr zlecenia / Order No.</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{docNo}</div>
          <div style={{ marginTop: '4px', ...s.label }}>Data wystawienia / Date</div>
          <div style={{ fontWeight: 'bold' }}>{today}</div>
        </div>
      </div>

      {/* Parties */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
        <div style={{ ...s.section, flex: 1, marginBottom: '0', borderTop: '3px solid #000' }}>
          <div style={s.sectionTitle}>Zleceniodawca / Shipper</div>
          <div style={s.val}>{data.sender?.name}</div>
          <div style={s.val2}>{data.sender?.address}</div>
          <div style={{ marginTop: '4px', ...s.val2 }}>NIP: {data.sender?.vat || '—'}</div>
        </div>
        <div style={{ ...s.section, flex: 1, marginBottom: '0', borderTop: '3px solid #000' }}>
          <div style={s.sectionTitle}>Przewoźnik / Carrier</div>
          <div style={s.val}>{data.receiver?.name}</div>
          <div style={s.val2}>{data.receiver?.address}</div>
          <div style={{ marginTop: '4px', ...s.val2 }}>NIP: {data.receiver?.vat || '—'}</div>
        </div>
      </div>

      {/* Loading */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Miejsce i termin załadunku / Loading place and date</div>
        <div style={{ display: 'flex', gap: '30px' }}>
          <div>
            <div style={s.label}>Adres załadunku / Loading address</div>
            <div style={s.val}>{data.fromCity}, {data.fromCountry}</div>
          </div>
          <div>
            <div style={s.label}>Data załadunku / Loading date</div>
            <div style={s.val}>{data.loadDate}</div>
          </div>
        </div>
      </div>

      {/* Unloading */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Miejsce i termin rozładunku / Unloading place and date</div>
        <div>
          <div style={s.label}>Adres rozładunku / Unloading address</div>
          <div style={s.val}>{data.toCity}, {data.toCountry}</div>
        </div>
      </div>

      {/* Cargo table */}
      <div style={{ ...s.section }}>
        <div style={s.sectionTitle}>Opis ładunku / Cargo description</div>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={{ ...s.th, textAlign: 'left' }}>Opis towaru / Goods description</th>
              <th style={s.th}>Waga brutto / Gross weight</th>
              <th style={s.th}>Objętość / Volume</th>
              <th style={s.th}>Ilość / Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.td}>{data.cargo?.name}</td>
              <td style={{ ...s.td, textAlign: 'center' }}>{data.cargo?.weight ? `${data.cargo.weight} kg` : '—'}</td>
              <td style={{ ...s.td, textAlign: 'center' }}>{data.cargo?.volume ? `${data.cargo.volume} m³` : '—'}</td>
              <td style={{ ...s.td, textAlign: 'center' }}>{data.cargo?.packages ? `${data.cargo.packages} szt.` : '—'}</td>
            </tr>
            <tr style={{ minHeight: '24px' }}>
              <td style={s.td}>&nbsp;</td>
              <td style={s.td}></td>
              <td style={s.td}></td>
              <td style={s.td}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Special conditions */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Warunki szczególne / Special conditions</div>
        <div style={{ ...s.val2, minHeight: '40px' }}>{data.cargo?.notes || ''}</div>
      </div>

      {/* Signatures */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '8px', fontSize: '8px', color: '#555' }}>
          Zamawiający potwierdza zlecenie transportu na warunkach opisanych powyżej. /
          The ordering party confirms the transport order on the terms described above.
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={s.sigBox}>
            <div style={s.label}>Zleceniodawca / Shipper</div>
            <div style={{ marginTop: '8px', ...s.val2 }}>{data.sender?.name}</div>
            <div style={{ marginTop: '25px', borderTop: '1px solid #000', paddingTop: '4px', fontSize: '7px', color: '#666' }}>
              Podpis i pieczęć / Signature and stamp
            </div>
          </div>
          <div style={s.sigBox}>
            <div style={s.label}>Przewoźnik / Carrier</div>
            <div style={{ marginTop: '8px', ...s.val2 }}>{data.receiver?.name}</div>
            <div style={{ marginTop: '25px', borderTop: '1px solid #000', paddingTop: '4px', fontSize: '7px', color: '#666' }}>
              Podpis i pieczęć / Signature and stamp
            </div>
          </div>
          <div style={s.sigBox}>
            <div style={s.label}>Data i miejsce / Date and place</div>
            <div style={{ marginTop: '8px', ...s.val2 }}>{data.fromCity}, {today}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
