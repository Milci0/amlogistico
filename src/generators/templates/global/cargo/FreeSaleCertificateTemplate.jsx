import { formatDocumentDate } from '../../../../utils/formatDate'

export function FreeSaleCertificateTemplate({ data }) {
  const today = formatDocumentDate(new Date())
  const isEn = data.language === 'EN'
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
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>{isEn ? 'Certificate of Free Sale (CFS)' : 'Zaświadczenie o Wolnej Sprzedaży · Certificate of Free Sale (CFS)'}</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>
          {isEn
            ? 'Required for exports of medicines, supplements, food, cosmetics and medical devices — confirms lawful sale in the country of export.'
            : 'Wymagane przy eksporcie leków, suplementów, żywności, kosmetyków i wyrobów medycznych — potwierdza legalną sprzedaż w kraju eksportu.'}
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Certificate No.:' : 'Nr zaświadczenia:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Date:' : 'Data:'}</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Issuing authority:' : 'Organ wystawiający:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Manufacturer (name, address):' : 'Producent (nazwa, adres):'}</div>
          <div style={val}>{data.sender?.name}, {data.sender?.address}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Establishment No.:' : 'Nr zakładu:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Country of export:' : 'Kraj eksportu:'}</div>
          <div style={val}>{data.fromCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Country of destination:' : 'Kraj przeznaczenia:'}</div>
          <div style={val}>{data.toCountry || ''}</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>{isEn ? 'PRODUCT DESCRIPTION' : 'OPIS PRODUKTU'}</span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '25px' }}>{isEn ? 'No.' : 'Lp.'}</div>
        <div style={{ ...thStyle, flex: 1 }}>{isEn ? 'Product name' : 'Nazwa produktu'}</div>
        <div style={{ ...thStyle, flex: 1 }}>{isEn ? 'Brand name' : 'Nazwa handlowa'}</div>
        <div style={{ ...thStyle, width: '70px' }}>{isEn ? 'Form' : 'Forma'}</div>
        <div style={{ ...thStyle, width: '80px' }}>{isEn ? 'Registration No.' : 'Nr rejestracji'}</div>
        <div style={{ ...thStyle, width: '80px' }}>{isEn ? 'Marketing Auth. No.' : 'Nr pozwolenia'}</div>
        <div style={{ ...thStyle, width: '90px', borderRight: b }}>{isEn ? 'MA expiry date' : 'Data ważności pozw.'}</div>
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
          {isEn ? (
            <><strong>ISSUING AUTHORITY DECLARATION:</strong> This is to certify that the above products are legally manufactured and marketed in the country of export in accordance with applicable laws and regulations, are not subject to any sales restrictions, and may be exported to other countries.</>
          ) : (
            <><strong>OŚWIADCZENIE ORGANU WYSTAWIAJĄCEGO:</strong> Niniejszym zaświadcza się, że wyżej wymienione produkty są legalnie wytwarzane i wprowadzane do obrotu w kraju eksportu zgodnie z obowiązującymi przepisami prawa, nie są objęte żadnymi ograniczeniami sprzedaży, i mogą być eksportowane do innych krajów.</>
          )}
        </span>
      </div>

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Issuing authority (GIF/URPL/MZ — Poland)' : 'Organ wystawiający (GIF/URPL/MZ — Polska)'}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Authorized officer' : 'Upoważniony pracownik'}</div>
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
