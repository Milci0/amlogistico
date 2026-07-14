import { formatDocumentDate } from '../../../../utils/formatDate'

export function KosherCertificateTemplate({ data }) {
  const today = formatDocumentDate(new Date())
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }

  const kosherTypes = ['KOSHER', 'KOSHER PAREVE', 'KOSHER DAIRY', 'KOSHER MEAT', 'KOSHER PESACH', "KOSHER L'MEHADRIN"]
  const rows = [data.cargo?.name || '', '', '', '', '']

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>KOSHER CERTIFICATE</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Certyfikat Koszerności · Kosher Certificate</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Wymagany dla żywności eksportowanej do społeczności żydowskich. Wystawiany przez organy rabiniczne.</div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Nr certyfikatu / Cert. No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Data / Date:</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Ważny do / Valid until:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Organ certyfikujący / Rabbinical authority:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Kraj / Country:</div>
          <div style={val}>{data.sender?.country || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Producent / Manufacturer:</div>
          <div style={val}>{data.sender?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Adres / Address:</div>
          <div style={val}>{data.sender?.address || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Nr zakładu:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        {kosherTypes.map((t, i) => (
          <div key={i} style={{ flex: 1, padding: '5px 5px', borderRight: i < kosherTypes.length - 1 ? b : undefined, fontSize: '8px', fontWeight: 'bold' }}>☐ {t}</div>
        ))}
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>PRODUKTY / PRODUCTS</span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '150px' }}>Nazwa / Product name</div>
        <div style={{ ...thStyle, width: '80px' }}>Kod / Code</div>
        <div style={{ ...thStyle, width: '150px' }}>Składniki sprawdzone</div>
        <div style={{ ...thStyle, width: '130px' }}>Status / Scope</div>
        <div style={{ ...thStyle, flex: 1, borderRight: b }}>Ważność</div>
      </div>
      {rows.map((name, i) => (
        <div key={i} style={{ display: 'flex', borderLeft: b, minHeight: '26px' }}>
          <div style={{ width: '150px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{name}</div>
          <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
          <div style={{ width: '150px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>☐ Wszystkie składniki OK</div>
          <div style={{ width: '130px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>☐ Produkcja ☐ Import</div>
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        </div>
      ))}

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Rabin certyfikujący / Rabbi</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Signature &amp; stamp / Podpis i pieczęć</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Organ rabiniczny / Rabbinical body</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Signature &amp; stamp / Podpis i pieczęć</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Date + Seal</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Signature &amp; stamp / Podpis i pieczęć</div>
        </div>
      </div>

    </div>
  )
}
