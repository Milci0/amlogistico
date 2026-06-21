import { formatDocumentDate } from '../../../../utils/formatDate'

export function FakturaHandlowaTemplate({ data }) {
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
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', letterSpacing: '2px' }}>FAKTURA HANDLOWA</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Commercial Invoice · Factura Comercial</div>
        </div>
        <div style={{ width: '150px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>Nr dokumentu:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
        </div>
      </div>

      {/* SPRZEDAJĄCY | KUPUJĄCY | NR FAKTURY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '65px' }}>
          <div style={lbl}>Sprzedający / Seller:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '65px' }}>
          <div style={lbl}>Kupujący / Buyer:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
        <div style={{ width: '160px', padding: '3px 5px', minHeight: '65px' }}>
          <div style={lbl}>Nr faktury / Invoice No.:</div>
          <div style={val} />
        </div>
      </div>

      {/* NIP/VAT | NIP/VAT | DATA WYSTAWIENIA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>NIP/VAT:</div>
          <div style={val}>{data.sender?.vat}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>NIP/VAT:</div>
          <div style={val}>{data.receiver?.vat}</div>
        </div>
        <div style={{ width: '160px', padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Data wystawienia / Issue date:</div>
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
          <div style={lbl}>Miejsce Incoterms:</div>
          <div style={val}>{data.toCity}</div>
        </div>
        <div style={{ width: '80px', padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Waluta / Currency:</div>
          <div style={val}>{data.cargo?.currency}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Warunki płatności / Payment terms:</div>
          <div style={val}>{data.terms?.paymentDays ? `${data.terms.paymentDays} dni` : ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Kraj pochodzenia / Country of origin:</div>
          <div style={val}>{data.fromCountry}</div>
        </div>
      </div>

      {/* SEKCJA: POZYCJE */}
      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>POZYCJE FAKTURY / LINE ITEMS</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b }}>
        <div style={{ ...thStyle, width: '30px' }}>Lp.</div>
        <div style={{ ...thStyle, flex: 1 }}>Opis towaru / Description</div>
        <div style={{ ...thStyle, width: '65px' }}>Kod HS</div>
        <div style={{ ...thStyle, width: '55px' }}>Kraj poch.<br />Origin</div>
        <div style={{ ...thStyle, width: '50px' }}>Ilość<br />Qty</div>
        <div style={{ ...thStyle, width: '40px' }}>Jedn.</div>
        <div style={{ ...thStyle, width: '80px' }}>Cena jedn.<br />Unit price</div>
        <div style={{ ...thStyle, width: '80px', borderRight: b }}>Wartość<br />Amount</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '30px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.fromCountry}</div>
        <div style={{ width: '50px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages}</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>szt.</div>
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'right' }}>{data.cargo?.value}</div>
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'right' }}>{data.cargo?.value}</div>
      </div>

      {/* 8 pustych wierszy */}
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* PODSUMOWANIE WARTOŚCI */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Wartość netto / Net value:</div>
          <div style={val}>{data.cargo?.value} {data.cargo?.currency}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Koszt transportu / Freight:</div>
          <div style={val}>{data.terms?.freightPrice ? `${data.terms.freightPrice} ${data.terms.freightCurrency || data.cargo?.currency}` : ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Ubezpieczenie / Insurance:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '30px', backgroundColor: '#fffbe6' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>WARTOŚĆ CELNA / CUSTOMS VALUE:</div>
          <div style={{ ...val, fontWeight: 'bold' }}>{data.cargo?.value} {data.cargo?.currency}</div>
        </div>
      </div>

      {/* DANE BANKOWE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '45px' }}>
          <div style={lbl}>Dane bankowe / Bank details:</div>
          <div style={{ ...val, marginTop: '2px' }}>IBAN: {data.sender?.iban}</div>
          <div style={val}>BIC/SWIFT: {data.sender?.swift}</div>
          <div style={val}>Bank: {data.sender?.bank}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '45px' }}>
          <div style={lbl}>Deklaracja eksportera / Exporter declaration (REX):</div>
          <div style={{ minHeight: '30px' }} />
        </div>
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
          <div style={lbl}>Podpis i pieczęć / Signature &amp; stamp</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
      </div>

    </div>
  )
}
