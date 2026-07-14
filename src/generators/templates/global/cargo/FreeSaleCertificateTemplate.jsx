import { formatDocumentDate } from '../../../../utils/formatDate'

export function FreeSaleCertificateTemplate({ data }) {
  const today = formatDocumentDate(new Date())
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '18px' }}>
      {[25, null, null, 70, 80, 80, 90].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>FREE SALE CERTIFICATE</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Zaświadczenie o Wolnej Sprzedaży · Certificate of Free Sale (CFS)</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Wymagane przy eksporcie leków, suplementów, żywności, kosmetyków i wyrobów medycznych — potwierdza legalną sprzedaż w kraju eksportu.</div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Nr zaświadczenia / Certificate No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Data / Date:</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Organ wystawiający / Issuing authority:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Producent / Manufacturer (nazwa, adres):</div>
          <div style={val}>{data.sender?.name}, {data.sender?.address}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Nr zakładu / Establishment No.:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Kraj eksportu / Country of export:</div>
          <div style={val}>{data.fromCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Kraj przeznaczenia / Country of destination:</div>
          <div style={val}>{data.toCountry || ''}</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>OPIS PRODUKTU / PRODUCT DESCRIPTION</span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '25px' }}>Lp.</div>
        <div style={{ ...thStyle, flex: 1 }}>Nazwa produktu<br />Product name</div>
        <div style={{ ...thStyle, flex: 1 }}>Nazwa handlowa<br />Brand name</div>
        <div style={{ ...thStyle, width: '70px' }}>Forma<br />Form</div>
        <div style={{ ...thStyle, width: '80px' }}>Nr rejestracji<br />Registration No.</div>
        <div style={{ ...thStyle, width: '80px' }}>Nr pozwolenia<br />Marketing Auth. No.</div>
        <div style={{ ...thStyle, width: '90px', borderRight: b }}>Data ważności pozw.<br />MA expiry date</div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '25px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}
      {emptyRow}
      {emptyRow}

      <div style={{ border: b, padding: '5px 7px', marginTop: '8px', backgroundColor: '#f7f7f7' }}>
        <span style={{ fontSize: '6.5px', color: '#555' }}>
          <strong>OŚWIADCZENIE ORGANU WYSTAWIAJĄCEGO / ISSUING AUTHORITY DECLARATION:</strong> Niniejszym zaświadcza
          się, że wyżej wymienione produkty są legalnie wytwarzane i wprowadzane do obrotu w kraju eksportu zgodnie
          z obowiązującymi przepisami prawa, nie są objęte żadnymi ograniczeniami sprzedaży, i mogą być eksportowane
          do innych krajów. This is to certify that the above products are legally manufactured and marketed in the
          country of export in accordance with applicable laws and regulations, are not subject to any sales
          restrictions, and may be exported to other countries.
        </span>
      </div>

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Organ wystawiający (GIF/URPL/MZ — Polska)</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Upoważniony pracownik / Authorized officer</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Date + Official Stamp</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
      </div>

    </div>
  )
}
