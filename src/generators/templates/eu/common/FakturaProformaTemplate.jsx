import { formatDocumentDate } from '../../../../utils/formatDate'

export function FakturaProformaTemplate({ data }) {
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
  const today = formatDocumentDate(new Date())
  const etd = data.loadDate ? new Date(data.loadDate) : new Date()
  const validUntil = formatDocumentDate(new Date(etd.getTime() + 30 * 24 * 60 * 60 * 1000))
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '20px' }}>
      {[30, null, 65, 50, 45, 80, 80].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a3a6b' }}>{isEn ? 'PROFORMA INVOICE' : 'FAKTURA PROFORMA'}</div>
          <div style={{ fontSize: '8px', color: '#555', marginTop: '2px' }}>Proforma Invoice · NOT A TAX DOCUMENT</div>
          <div style={{ fontSize: '7px', color: '#888', marginTop: '2px' }}>{isEn ? 'Commercial document — does not give rise to a tax liability.' : 'Dokument handlowy — nie rodzi obowiązku podatkowego'}</div>
        </div>
        <div style={{ width: '190px', padding: '6px 8px' }}>
          <div style={lbl}>{isEn ? 'Proforma No.:' : 'Nr proformy / Proforma No.:'}</div>
          <div style={{ ...val, marginBottom: '4px' }} />
          <div style={lbl}>{isEn ? 'Issue Date:' : 'Data wystawienia / Issue date:'}</div>
          <div style={{ ...val, marginBottom: '4px' }}>{today}</div>
          <div style={lbl}>{isEn ? 'Valid Until:' : 'Ważna do / Valid until:'}</div>
          <div style={val}>{validUntil}</div>
        </div>
      </div>

      {/* SPRZEDAJĄCY | KUPUJĄCY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '60px' }}>
          <div style={lbl}>{isEn ? 'Seller:' : 'Sprzedający / Seller:'}</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '60px' }}>
          <div style={lbl}>{isEn ? 'Buyer:' : 'Kupujący / Buyer:'}</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
      </div>

      {/* NIP/VAT */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'VAT No.:' : 'NIP/VAT:'}</div>
          <div style={val}>{data.sender?.vat}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'VAT No.:' : 'NIP/VAT:'}</div>
          <div style={val}>{data.receiver?.vat}</div>
        </div>
      </div>

      {/* KRAJ */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'Country:' : 'Kraj / Country:'}</div>
          <div style={val}>{data.fromCountry}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'Country:' : 'Kraj / Country:'}</div>
          <div style={val}>{data.toCountry}</div>
        </div>
      </div>

      {/* INCOTERMS | MIEJSCE | WALUTA | KRAJ POCHODZENIA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ width: '80px', padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Incoterms:</div>
          <div style={val}>{data.cargo?.incoterms}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>{isEn ? 'Place:' : 'Miejsce:'}</div>
          <div style={val}>{data.toCity}</div>
        </div>
        <div style={{ width: '100px', padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>{isEn ? 'Currency:' : 'Waluta / Currency:'}</div>
          <div style={val}>{data.cargo?.currency}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>{isEn ? 'Country of Origin:' : 'Kraj pochodzenia:'}</div>
          <div style={val}>{data.fromCountry}</div>
        </div>
      </div>

      {/* SEKCJA: POZYCJE */}
      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>{isEn ? 'ITEMS' : 'POZYCJE / ITEMS'}</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b }}>
        <div style={{ ...thStyle, width: '30px' }}>{isEn ? 'No.' : 'Lp.'}</div>
        <div style={{ ...thStyle, flex: 1 }}>{isEn ? 'Description of Goods' : 'Opis towaru / Description of goods'}</div>
        <div style={{ ...thStyle, width: '65px' }}>{isEn ? 'HS Code' : <>Kod HS<br />HS Code</>}</div>
        <div style={{ ...thStyle, width: '50px' }}>{isEn ? 'Qty' : <>Ilość<br />Qty</>}</div>
        <div style={{ ...thStyle, width: '45px' }}>{isEn ? 'Unit' : <>Jedn.<br />Unit</>}</div>
        <div style={{ ...thStyle, width: '80px' }}>{isEn ? 'Unit price' : <>Cena jedn.<br />Unit price</>}</div>
        <div style={{ ...thStyle, width: '80px', borderRight: b }}>{isEn ? 'Total value' : <>Wartość<br />Total value</>}</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '30px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
        <div style={{ width: '50px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages}</div>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packageTypeUnCode || (isEn ? 'pcs' : 'szt.')}</div>
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'right' }}>{unitPrice}</div>
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'right' }}>{data.cargo?.value}</div>
      </div>

      {/* 9 pustych wierszy */}
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}{emptyRow}
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* PODSUMOWANIE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>{isEn ? 'Goods Value:' : 'Wartość towaru / Goods value:'}</div>
          <div style={val}>{data.cargo?.value} {data.cargo?.currency}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>{isEn ? 'Est. Freight:' : 'Szac. koszt transportu / Est. freight:'}</div>
          <div style={val}>{data.terms?.freightPrice ? `${data.terms.freightPrice} ${data.terms.freightCurrency || data.cargo?.currency}` : ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '30px', backgroundColor: '#fffbe6' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>{isEn ? 'CUSTOMS VALUE:' : 'WARTOŚĆ CELNA / CUSTOMS VALUE:'}</div>
          <div style={{ ...val, fontWeight: 'bold' }}>{data.cargo?.value} {data.cargo?.currency}</div>
        </div>
      </div>

      {/* NOTA PRAWNA */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', fontSize: '7px', color: '#555', lineHeight: '1.4' }}>
        {isEn
          ? 'This document is not a VAT invoice and cannot be used for tax deduction purposes. For customs and quotation purposes only.'
          : <>Niniejszy dokument nie jest fakturą VAT i nie stanowi podstawy do odliczenia podatku. Służy wyłącznie do celów celnych i ofertowych.
        This document is not a VAT invoice and cannot be used for tax deduction purposes. For customs and quotation purposes only.</>}
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
          <div style={lbl}>{isEn ? 'Signature &amp; stamp' : 'Podpis i pieczęć'}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Podpis i pieczęć'}</div>
        </div>
      </div>

    </div>
  )
}
