const s = {
  page: { width: '794px', minHeight: '1123px', padding: '30px 36px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '9px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box' },
  title: { fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' },
  subtitle: { fontSize: '10px', color: '#555', marginBottom: '20px' },
  section: { border: '1px solid #ccc', padding: '10px 12px', marginBottom: '0' },
  label: { fontSize: '7px', color: '#666', textTransform: 'uppercase', marginBottom: '2px' },
  val: { fontSize: '10px', fontWeight: 'bold' },
  val2: { fontSize: '9px' },
  th: { padding: '6px 8px', backgroundColor: '#222', color: '#fff', fontWeight: 'bold', fontSize: '8px', borderRight: '1px solid #444' },
  td: { padding: '6px 8px', borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc', fontSize: '9px' },
  divider: { borderTop: '1px solid #ddd', margin: '12px 0' },
}

export function FakturaHandlowaTemplate({ data }) {
  const today = new Date().toLocaleDateString('pl-PL')
  const invoiceNo = `FH/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`
  const incoterms = data.cargo?.incoterms || 'DAP'
  const currency = data.cargo?.currency || 'EUR'
  const value = data.cargo?.value || ''

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={s.title}>COMMERCIAL INVOICE</div>
          <div style={s.subtitle}>FAKTURA HANDLOWA</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={s.label}>Nr faktury / Invoice No.</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{invoiceNo}</div>
          <div style={{ marginTop: '6px', ...s.label }}>Data wystawienia / Issue date</div>
          <div style={{ fontWeight: 'bold' }}>{today}</div>
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
          {data.sender?.iban && <div style={s.val2}>IBAN: {data.sender.iban}</div>}
        </div>
        <div style={{ ...s.section, flex: 1, borderTop: '3px solid #000' }}>
          <div style={{ ...s.label, marginBottom: '6px', fontSize: '8px', fontWeight: 'bold', color: '#000' }}>NABYWCA / BUYER</div>
          <div style={s.val}>{data.receiver?.name}</div>
          <div style={s.val2}>{data.receiver?.address}</div>
          <div style={s.val2}>{data.receiver?.country}</div>
          <div style={{ marginTop: '4px', ...s.val2 }}>NIP: {data.receiver?.vat || '—'}</div>
        </div>
      </div>

      {/* Delivery terms */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ ...s.section, flex: 1 }}>
          <div style={s.label}>Warunki dostawy / Delivery terms</div>
          <div style={s.val}>{incoterms} {data.toCity}</div>
        </div>
        <div style={{ ...s.section, flex: 1 }}>
          <div style={s.label}>Waluta / Currency</div>
          <div style={s.val}>{currency}</div>
        </div>
        <div style={{ ...s.section, flex: 1 }}>
          <div style={s.label}>Kraj pochodzenia / Country of origin</div>
          <div style={s.val}>{data.fromCountry}</div>
        </div>
      </div>

      {/* Goods table */}
      <div style={{ border: '1px solid #ccc', marginBottom: '16px' }}>
        <div style={{ display: 'flex', backgroundColor: '#222' }}>
          <div style={{ ...s.th, width: '30px', textAlign: 'center' }}>Lp.</div>
          <div style={{ ...s.th, flex: 3 }}>Opis towaru / Description of goods</div>
          <div style={{ ...s.th, width: '80px', textAlign: 'center' }}>Kod HS</div>
          <div style={{ ...s.th, width: '60px', textAlign: 'center' }}>Ilość / Qty</div>
          <div style={{ ...s.th, width: '100px', textAlign: 'center' }}>Cena jedn.<br/>Unit price</div>
          <div style={{ ...s.th, width: '100px', textAlign: 'center', borderRight: 'none' }}>Wartość<br/>Amount ({currency})</div>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ ...s.td, width: '30px', textAlign: 'center' }}>1</div>
          <div style={{ ...s.td, flex: 3 }}>{data.cargo?.name}</div>
          <div style={{ ...s.td, width: '80px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
          <div style={{ ...s.td, width: '60px', textAlign: 'center' }}>{data.cargo?.packages} szt.</div>
          <div style={{ ...s.td, width: '100px', textAlign: 'right' }}>{value} {currency}</div>
          <div style={{ ...s.td, width: '100px', textAlign: 'right', borderRight: 'none' }}>{value} {currency}</div>
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
        {/* Total */}
        <div style={{ display: 'flex', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
          <div style={{ ...s.td, width: '30px' }}></div>
          <div style={{ ...s.td, flex: 3, fontSize: '8px', color: '#555' }}>ŁĄCZNIE / TOTAL</div>
          <div style={{ ...s.td, width: '80px' }}></div>
          <div style={{ ...s.td, width: '60px', textAlign: 'center' }}>{data.cargo?.packages}</div>
          <div style={{ ...s.td, width: '100px' }}></div>
          <div style={{ ...s.td, width: '100px', textAlign: 'right', borderRight: 'none', fontWeight: 'bold' }}>{value} {currency}</div>
        </div>
      </div>

      {/* Value in words */}
      <div style={{ ...s.section, marginBottom: '16px' }}>
        <div style={s.label}>Łączna wartość słownie / Total amount in words</div>
        <div style={s.val2}>{value ? `${value} ${currency}` : ''}</div>
      </div>

      {/* Declarations */}
      <div style={{ marginBottom: '30px', fontSize: '8px', color: '#444', lineHeight: '1.5' }}>
        Oświadczamy, że towary opisane powyżej są prawdziwe i poprawne pod każdym względem. /
        We declare that the goods described above are true and correct in every particular.
      </div>

      {/* Signature */}
      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ borderTop: '1px solid #000', paddingTop: '6px' }}>
            <div style={{ fontSize: '8px', color: '#555' }}>Podpis i pieczęć sprzedawcy / Seller's signature and stamp</div>
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
