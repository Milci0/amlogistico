import { formatDocumentDate } from '../../../../utils/formatDate'

export function FakturaHandlowaTemplate({ data }) {
  const isEn = data.language === 'EN'
  const unitPrice = (data.cargo?.value && data.cargo?.packages)
    ? (parseFloat(data.cargo.value) / parseFloat(data.cargo.packages)).toFixed(2)
    : data.cargo?.value
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '12px' }
  const thStyle = {
    padding: '3px 5px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '20px' }}>
      {[30, null, 65, 55, 50, 40, 80, 80].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#1a3a6b', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', letterSpacing: '2px' }}>{isEn ? 'COMMERCIAL INVOICE' : 'FAKTURA HANDLOWA'}</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Commercial Invoice · Factura Comercial</div>
        </div>
        <div style={{ width: '150px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>{isEn ? 'Document No.:' : 'Nr dokumentu:'}</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
        </div>
      </div>

      {/* SPRZEDAJĄCY | KUPUJĄCY | NR FAKTURY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '65px' }}>
          <div style={lbl}>{isEn ? 'Seller:' : 'Sprzedający / Seller:'}</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '65px' }}>
          <div style={lbl}>{isEn ? 'Buyer:' : 'Kupujący / Buyer:'}</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
        <div style={{ width: '160px', padding: '3px 5px', minHeight: '65px' }}>
          <div style={lbl}>{isEn ? 'Invoice No.:' : 'Nr faktury / Invoice No.:'}</div>
          <div style={val} />
        </div>
      </div>

      {/* NIP/VAT | NIP/VAT | DATA WYSTAWIENIA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'VAT No.:' : 'NIP/VAT:'}</div>
          <div style={val}>{data.sender?.vat}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'VAT No.:' : 'NIP/VAT:'}</div>
          <div style={val}>{data.receiver?.vat}</div>
        </div>
        <div style={{ width: '160px', padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'Issue Date:' : 'Data wystawienia / Issue date:'}</div>
          <div style={val}>{formatDocumentDate(new Date())}</div>
        </div>
      </div>

      {/* INCOTERMS | MIEJSCE | WALUTA | WARUNKI PŁATNOŚCI | KRAJ POCHODZENIA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ width: '80px', padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Incoterms:</div>
          <div style={val}>{data.cargo?.incoterms}</div>
        </div>
        <div style={{ width: '100px', padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>{isEn ? 'Incoterms Place:' : 'Miejsce Incoterms:'}</div>
          <div style={val}>{data.toCity}</div>
        </div>
        <div style={{ width: '80px', padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>{isEn ? 'Currency:' : 'Waluta / Currency:'}</div>
          <div style={val}>{data.cargo?.currency}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>{isEn ? 'Payment Terms:' : 'Warunki płatności / Payment terms:'}</div>
          <div style={val}>{data.terms?.paymentDays ? `${data.terms.paymentDays} ${isEn ? 'days' : 'dni'}` : ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>{isEn ? 'Country of Origin:' : 'Kraj pochodzenia / Country of origin:'}</div>
          <div style={val}>{data.fromCountry}</div>
        </div>
      </div>

      {/* SEKCJA: POZYCJE */}
      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>{isEn ? 'LINE ITEMS' : 'POZYCJE FAKTURY / LINE ITEMS'}</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b }}>
        <div style={{ ...thStyle, width: '30px' }}>{isEn ? 'No.' : 'Lp.'}</div>
        <div style={{ ...thStyle, flex: 1 }}>{isEn ? 'Description' : 'Opis towaru / Description'}</div>
        <div style={{ ...thStyle, width: '65px' }}>{isEn ? 'HS Code' : 'Kod HS'}</div>
        <div style={{ ...thStyle, width: '55px' }}>{isEn ? 'Origin' : <>Kraj poch.<br />Origin</>}</div>
        <div style={{ ...thStyle, width: '50px' }}>{isEn ? 'Qty' : <>Ilość<br />Qty</>}</div>
        <div style={{ ...thStyle, width: '40px' }}>{isEn ? 'Unit' : 'Jedn.'}</div>
        <div style={{ ...thStyle, width: '80px' }}>{isEn ? 'Unit price' : <>Cena jedn.<br />Unit price</>}</div>
        <div style={{ ...thStyle, width: '80px', borderRight: b }}>{isEn ? 'Amount' : <>Wartość<br />Amount</>}</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '30px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.fromCountry}</div>
        <div style={{ width: '50px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages}</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packageTypeUnCode || (isEn ? 'pcs' : 'szt.')}</div>
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'right' }}>{unitPrice}</div>
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'right' }}>{data.cargo?.value}</div>
      </div>

      {/* 8 pustych wierszy */}
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* PODSUMOWANIE WARTOŚCI */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>{isEn ? 'Net Value:' : 'Wartość netto / Net value:'}</div>
          <div style={val}>{data.cargo?.value} {data.cargo?.currency}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>{isEn ? 'Freight:' : 'Koszt transportu / Freight:'}</div>
          <div style={val}>{data.terms?.freightPrice ? `${data.terms.freightPrice} ${data.terms.freightCurrency || data.cargo?.currency}` : ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>{isEn ? 'Insurance:' : 'Ubezpieczenie / Insurance:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '30px', backgroundColor: '#fffbe6' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>{isEn ? 'CUSTOMS VALUE:' : 'WARTOŚĆ CELNA / CUSTOMS VALUE:'}</div>
          <div style={{ ...val, fontWeight: 'bold' }}>{data.cargo?.value} {data.cargo?.currency}</div>
        </div>
      </div>

      {/* DANE BANKOWE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '45px' }}>
          <div style={lbl}>{isEn ? 'Bank Details:' : 'Dane bankowe / Bank details:'}</div>
          <div style={{ ...val, marginTop: '2px' }}>IBAN: {data.sender?.iban}</div>
          <div style={val}>BIC/SWIFT: {data.sender?.swift}</div>
          <div style={val}>Bank: {data.sender?.bank}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '45px' }}>
          <div style={lbl}>{isEn ? 'Exporter Declaration (REX):' : 'Deklaracja eksportera / Exporter declaration (REX):'}</div>
          <div style={{ minHeight: '30px' }} />
        </div>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Prepared by' : 'Wystawił / Prepared by'}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Podpis i pieczęć'}</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Date' : 'Data / Date'}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Podpis i pieczęć'}</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Signature &amp; stamp' : 'Podpis i pieczęć / Signature &amp; stamp'}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Podpis i pieczęć'}</div>
        </div>
      </div>

    </div>
  )
}
