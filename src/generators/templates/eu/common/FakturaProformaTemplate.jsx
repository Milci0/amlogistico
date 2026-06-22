import { formatDocumentDate } from '../../../../utils/formatDate'

export function FakturaProformaTemplate({ data }) {
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
  const validUntil = formatDocumentDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
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
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a3a6b' }}>FAKTURA PROFORMA</div>
          <div style={{ fontSize: '8px', color: '#555', marginTop: '2px' }}>Proforma Invoice · NOT A TAX DOCUMENT</div>
          <div style={{ fontSize: '7px', color: '#888', marginTop: '2px' }}>Dokument handlowy — nie rodzi obowiązku podatkowego</div>
        </div>
        <div style={{ width: '190px', padding: '6px 8px' }}>
          <div style={lbl}>Nr proformy / Proforma No.:</div>
          <div style={{ ...val, marginBottom: '4px' }} />
          <div style={lbl}>Data wystawienia / Issue date:</div>
          <div style={{ ...val, marginBottom: '4px' }}>{today}</div>
          <div style={lbl}>Ważna do / Valid until:</div>
          <div style={val}>{validUntil}</div>
        </div>
      </div>

      {/* SPRZEDAJĄCY | KUPUJĄCY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '60px' }}>
          <div style={lbl}>Sprzedający / Seller:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '60px' }}>
          <div style={lbl}>Kupujący / Buyer:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
      </div>

      {/* NIP/VAT */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>NIP/VAT:</div>
          <div style={val}>{data.sender?.vat}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>NIP/VAT:</div>
          <div style={val}>{data.receiver?.vat}</div>
        </div>
      </div>

      {/* KRAJ */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Kraj / Country:</div>
          <div style={val}>{data.fromCountry}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Kraj / Country:</div>
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
          <div style={lbl}>Miejsce:</div>
          <div style={val}>{data.toCity}</div>
        </div>
        <div style={{ width: '100px', padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Waluta / Currency:</div>
          <div style={val}>{data.cargo?.currency}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Kraj pochodzenia:</div>
          <div style={val}>{data.fromCountry}</div>
        </div>
      </div>

      {/* SEKCJA: POZYCJE */}
      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>POZYCJE / ITEMS</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b }}>
        <div style={{ ...thStyle, width: '30px' }}>Lp.</div>
        <div style={{ ...thStyle, flex: 1 }}>Opis towaru / Description of goods</div>
        <div style={{ ...thStyle, width: '65px' }}>Kod HS<br />HS Code</div>
        <div style={{ ...thStyle, width: '50px' }}>Ilość<br />Qty</div>
        <div style={{ ...thStyle, width: '45px' }}>Jedn.<br />Unit</div>
        <div style={{ ...thStyle, width: '80px' }}>Cena jedn.<br />Unit price</div>
        <div style={{ ...thStyle, width: '80px', borderRight: b }}>Wartość<br />Total value</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '30px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
        <div style={{ width: '50px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages}</div>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>szt.</div>
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'right' }}>{unitPrice}</div>
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'right' }}>{data.cargo?.value}</div>
      </div>

      {/* 9 pustych wierszy */}
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}{emptyRow}
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* PODSUMOWANIE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Wartość towaru / Goods value:</div>
          <div style={val}>{data.cargo?.value} {data.cargo?.currency}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Szac. koszt transportu / Est. freight:</div>
          <div style={val}>{data.terms?.freightPrice ? `${data.terms.freightPrice} ${data.terms.freightCurrency || data.cargo?.currency}` : ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '30px', backgroundColor: '#fffbe6' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>WARTOŚĆ CELNA / CUSTOMS VALUE:</div>
          <div style={{ ...val, fontWeight: 'bold' }}>{data.cargo?.value} {data.cargo?.currency}</div>
        </div>
      </div>

      {/* NOTA PRAWNA */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', fontSize: '7px', color: '#555', lineHeight: '1.4' }}>
        Niniejszy dokument nie jest fakturą VAT i nie stanowi podstawy do odliczenia podatku. Służy wyłącznie do celów celnych i ofertowych.
        This document is not a VAT invoice and cannot be used for tax deduction purposes. For customs and quotation purposes only.
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Wystawił / Prepared by</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Data / Date</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Podpis i pieczęć</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
      </div>

    </div>
  )
}
