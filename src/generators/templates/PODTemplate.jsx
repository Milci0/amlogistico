const s = {
  page: { width: '794px', minHeight: '1123px', padding: '28px 34px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '9px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box' },
  title: { fontSize: '16px', fontWeight: 'bold', marginBottom: '2px' },
  subtitle: { fontSize: '9px', color: '#666', marginBottom: '16px' },
  section: { border: '1px solid #ccc', padding: '10px 12px', marginBottom: '12px' },
  sectionTitle: { fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '8px' },
  label: { fontSize: '7px', color: '#666', textTransform: 'uppercase', marginBottom: '2px' },
  val: { fontSize: '10px', fontWeight: 'bold' },
  val2: { fontSize: '9px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '6px 8px', backgroundColor: '#333', color: '#fff', fontWeight: 'bold', fontSize: '8px', textAlign: 'center', border: '1px solid #333' },
  td: { padding: '6px 8px', border: '1px solid #ccc', fontSize: '9px' },
  sigBox: { flex: 1, border: '1px solid #ccc', padding: '8px 10px', minHeight: '80px' },
  ok: { display: 'inline-block', width: '14px', height: '14px', border: '1px solid #000', textAlign: 'center', lineHeight: '14px', marginRight: '6px', fontSize: '10px', fontWeight: 'bold' },
}

export function PODTemplate({ data }) {
  const today = new Date().toLocaleDateString('pl-PL')
  const docNo = `POD/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={s.title}>PROTOKÓŁ ODBIORU TOWARU</div>
          <div style={s.subtitle}>PROOF OF DELIVERY (POD)</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={s.label}>Nr dokumentu / Doc No.</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{docNo}</div>
          <div style={{ marginTop: '4px', ...s.label }}>Data i godzina dostawy / Delivery date & time</div>
          <div style={{ fontWeight: 'bold' }}>{today}</div>
        </div>
      </div>

      {/* Delivery address | Carrier */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
        <div style={{ ...s.section, flex: 1, marginBottom: '0', borderTop: '3px solid #000' }}>
          <div style={s.sectionTitle}>Adres dostawy / Delivery address</div>
          <div style={s.val}>{data.toCity}, {data.toCountry}</div>
          <div style={s.val2}>{data.receiver?.address}</div>
          <div style={{ marginTop: '6px', ...s.label }}>Odbiorca / Consignee</div>
          <div style={s.val}>{data.receiver?.name}</div>
        </div>
        <div style={{ ...s.section, flex: 1, marginBottom: '0', borderTop: '3px solid #000' }}>
          <div style={s.sectionTitle}>Przewoźnik / Carrier</div>
          <div style={s.val}>{data.sender?.name}</div>
          <div style={s.val2}>{data.sender?.address}</div>
          <div style={{ marginTop: '6px', ...s.label }}>Trasa / Route</div>
          <div style={s.val2}>{data.fromCity} → {data.toCity}</div>
        </div>
      </div>

      {/* Goods received table */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Towary przyjęte / Goods received</div>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={{ ...s.th, width: '35px' }}>Lp.</th>
              <th style={{ ...s.th, textAlign: 'left' }}>Opis towaru / Description</th>
              <th style={{ ...s.th, width: '80px' }}>Ilość zam.<br/>Ordered qty</th>
              <th style={{ ...s.th, width: '80px' }}>Ilość otrz.<br/>Received qty</th>
              <th style={{ ...s.th, width: '80px' }}>Jedn.<br/>Unit</th>
              <th style={{ ...s.th, width: '70px' }}>Uwagi<br/>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...s.td, textAlign: 'center' }}>1</td>
              <td style={s.td}>{data.cargo?.name}</td>
              <td style={{ ...s.td, textAlign: 'center' }}>{data.cargo?.packages}</td>
              <td style={{ ...s.td, textAlign: 'center' }}>{data.cargo?.packages}</td>
              <td style={{ ...s.td, textAlign: 'center' }}>szt.</td>
              <td style={{ ...s.td, textAlign: 'center' }}>—</td>
            </tr>
            {[1, 2].map(i => (
              <tr key={i} style={{ minHeight: '26px' }}>
                <td style={s.td}>&nbsp;</td>
                <td style={s.td}></td>
                <td style={s.td}></td>
                <td style={s.td}></td>
                <td style={s.td}></td>
                <td style={s.td}></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Condition check */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Stan towaru / Condition of goods</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}>
            <span style={s.ok}>✓</span>
            <span style={{ fontSize: '9px', fontWeight: 'bold' }}>Towar przyjęto bez zastrzeżeń / Goods received in good condition</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}>
            <span style={s.ok}>&nbsp;</span>
            <span style={{ fontSize: '9px' }}>Towar przyjęto z zastrzeżeniami / Goods received with reservations</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}>
            <span style={s.ok}>&nbsp;</span>
            <span style={{ fontSize: '9px' }}>Odmowa przyjęcia / Refusal to accept</span>
          </label>
        </div>
      </div>

      {/* Remarks */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Uwagi / Remarks</div>
        <div style={{ minHeight: '40px', ...s.val2 }}>{data.cargo?.notes || ''}</div>
      </div>

      {/* Signatures */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={s.sigBox}>
            <div style={s.label}>Kierowca / Driver</div>
            <div style={{ marginTop: '4px', ...s.val2 }}></div>
            <div style={{ marginTop: '30px', borderTop: '1px solid #000', paddingTop: '4px', fontSize: '7px', color: '#666' }}>
              Imię, nazwisko i podpis / Name and signature
            </div>
          </div>
          <div style={s.sigBox}>
            <div style={s.label}>Odbiorca / Consignee</div>
            <div style={{ marginTop: '4px', ...s.val2 }}>{data.receiver?.name}</div>
            <div style={{ marginTop: '30px', borderTop: '1px solid #000', paddingTop: '4px', fontSize: '7px', color: '#666' }}>
              Imię, nazwisko, pieczęć i podpis / Name, stamp and signature
            </div>
          </div>
          <div style={s.sigBox}>
            <div style={s.label}>Data i godzina / Date and time</div>
            <div style={{ marginTop: '4px', fontSize: '10px', fontWeight: 'bold' }}>{today}</div>
            <div style={{ marginTop: '4px', ...s.val2 }}>godz.: ___________</div>
          </div>
        </div>
      </div>
    </div>
  )
}
