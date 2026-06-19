const s = {
  page: { width: '794px', minHeight: '1123px', padding: '30px 36px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '9px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box' },
  title: { fontSize: '18px', fontWeight: 'bold', marginBottom: '2px' },
  subtitle: { fontSize: '10px', color: '#555', marginBottom: '4px' },
  badge: { display: 'inline-block', backgroundColor: '#ffe066', color: '#000', fontWeight: 'bold', fontSize: '8px', padding: '2px 8px', border: '1px solid #cca000', marginBottom: '16px', letterSpacing: '1px' },
  section: { border: '1px solid #ccc', padding: '10px 12px', marginBottom: '0' },
  label: { fontSize: '7px', color: '#666', textTransform: 'uppercase', marginBottom: '2px' },
  val: { fontSize: '10px', fontWeight: 'bold' },
  val2: { fontSize: '9px' },
  th: { padding: '6px 8px', backgroundColor: '#222', color: '#fff', fontWeight: 'bold', fontSize: '8px', borderRight: '1px solid #444' },
  td: { padding: '6px 8px', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', fontSize: '9px' },
}

export function FakturaProformaTemplate({ data }) {
  const today = new Date().toLocaleDateString('pl-PL')
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL')
  const proformaNo = `PF/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`
  const incoterms = data.cargo?.incoterms || 'DAP'
  const currency = data.cargo?.currency || 'EUR'
  const value = data.cargo?.value || ''

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={s.title}>PROFORMA INVOICE</div>
          <div style={s.subtitle}>FAKTURA PROFORMA</div>
          <div style={s.badge}>PROFORMA — NIE JEST DOKUMENTEM CELNYM</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={s.label}>Nr / No.</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{proformaNo}</div>
          <div style={{ marginTop: '6px', ...s.label }}>Data wystawienia</div>
          <div style={{ fontWeight: 'bold' }}>{today}</div>
          <div style={{ marginTop: '6px', ...s.label }}>Ważna do / Valid until</div>
          <div style={{ fontWeight: 'bold' }}>{validUntil}</div>
        </div>
      </div>

      {/* Seller / Buyer */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ ...s.section, flex: 1, borderTop: '3px solid #000' }}>
          <div style={{ ...s.label, marginBottom: '6px', fontSize: '8px', fontWeight: 'bold', color: '#000' }}>SPRZEDAWCA / SELLER</div>
          <div style={s.val}>{data.sender?.name}</div>
          <div style={s.val2}>{data.sender?.address}</div>
          <div style={s.val2}>{data.sender?.country}</div>
          <div style={{ marginTop: '4px', ...s.val2 }}>NIP: {data.sender?.vat || '—'}</div>
        </div>
        <div style={{ ...s.section, flex: 1, borderTop: '3px solid #000' }}>
          <div style={{ ...s.label, marginBottom: '6px', fontSize: '8px', fontWeight: 'bold', color: '#000' }}>NABYWCA / BUYER</div>
          <div style={s.val}>{data.receiver?.name}</div>
          <div style={s.val2}>{data.receiver?.address}</div>
          <div style={s.val2}>{data.receiver?.country}</div>
          <div style={{ marginTop: '4px', ...s.val2 }}>NIP: {data.receiver?.vat || '—'}</div>
        </div>
      </div>

      {/* Route + Terms */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ ...s.section, flex: 1 }}>
          <div style={s.label}>Kraj wysyłki / Country of dispatch</div>
          <div style={s.val}>{data.fromCountry}</div>
        </div>
        <div style={{ ...s.section, flex: 1 }}>
          <div style={s.label}>Kraj przeznaczenia / Destination</div>
          <div style={s.val}>{data.toCountry}</div>
        </div>
        <div style={{ ...s.section, flex: 1 }}>
          <div style={s.label}>Warunki dostawy / Incoterms</div>
          <div style={s.val}>{incoterms} {data.toCity}</div>
        </div>
        <div style={{ ...s.section, flex: 1 }}>
          <div style={s.label}>Waluta / Currency</div>
          <div style={s.val}>{currency}</div>
        </div>
      </div>

      {/* Goods table */}
      <div style={{ border: '1px solid #ccc', marginBottom: '16px' }}>
        <div style={{ display: 'flex', backgroundColor: '#222' }}>
          <div style={{ ...s.th, width: '30px', textAlign: 'center' }}>Lp.</div>
          <div style={{ ...s.th, flex: 3 }}>Opis towaru / Description of goods</div>
          <div style={{ ...s.th, width: '80px', textAlign: 'center' }}>Kod HS</div>
          <div style={{ ...s.th, width: '60px', textAlign: 'center' }}>Ilość</div>
          <div style={{ ...s.th, width: '100px', textAlign: 'center' }}>Wartość ({currency})</div>
          <div style={{ ...s.th, width: '100px', textAlign: 'center', borderRight: 'none' }}>Łącznie ({currency})</div>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ ...s.td, width: '30px', textAlign: 'center' }}>1</div>
          <div style={{ ...s.td, flex: 3 }}>{data.cargo?.name}</div>
          <div style={{ ...s.td, width: '80px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
          <div style={{ ...s.td, width: '60px', textAlign: 'center' }}>{data.cargo?.packages} szt.</div>
          <div style={{ ...s.td, width: '100px', textAlign: 'right' }}>{value}</div>
          <div style={{ ...s.td, width: '100px', textAlign: 'right', borderRight: 'none' }}>{value}</div>
        </div>
        {[1, 2].map(i => (
          <div key={i} style={{ display: 'flex', minHeight: '24px' }}>
            <div style={{ ...s.td, width: '30px' }}></div>
            <div style={{ ...s.td, flex: 3 }}></div>
            <div style={{ ...s.td, width: '80px' }}></div>
            <div style={{ ...s.td, width: '60px' }}></div>
            <div style={{ ...s.td, width: '100px' }}></div>
            <div style={{ ...s.td, width: '100px', borderRight: 'none' }}></div>
          </div>
        ))}
        <div style={{ display: 'flex', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
          <div style={{ ...s.td, width: '30px' }}></div>
          <div style={{ ...s.td, flex: 3, fontSize: '8px', color: '#555' }}>ŁĄCZNIE / TOTAL</div>
          <div style={{ ...s.td, width: '80px' }}></div>
          <div style={{ ...s.td, width: '60px', textAlign: 'center' }}>{data.cargo?.packages}</div>
          <div style={{ ...s.td, width: '100px' }}></div>
          <div style={{ ...s.td, width: '100px', textAlign: 'right', borderRight: 'none' }}>{value} {currency}</div>
        </div>
      </div>

      {/* Note */}
      <div style={{ border: '1px solid #ffe066', backgroundColor: '#fffbe6', padding: '8px 12px', marginBottom: '30px', fontSize: '8px', color: '#555' }}>
        Niniejsza faktura proforma nie stanowi wezwania do zapłaty ani faktury podatkowej. Jest wystawiana wyłącznie do celów informacyjnych i celnych. /
        This proforma invoice is not a demand for payment or a tax invoice. It is issued for informational and customs purposes only.
      </div>

      {/* Signature */}
      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ borderTop: '1px solid #000', paddingTop: '6px' }}>
            <div style={{ fontSize: '8px', color: '#555' }}>Podpis wystawcy / Issuer's signature</div>
            <div style={{ marginTop: '8px', fontSize: '9px', fontWeight: 'bold' }}>{data.sender?.name}</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ borderTop: '1px solid #000', paddingTop: '6px' }}>
            <div style={{ fontSize: '8px', color: '#555' }}>Miejscowość i data / Place and date</div>
            <div style={{ marginTop: '8px', fontSize: '9px' }}>{data.fromCity}, {today}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
