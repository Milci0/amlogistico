import { formatDocumentDate } from '../../../../utils/formatDate'

export function OrganicCertificateTemplate({ data }) {
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

  const rows = [data.cargo?.name || '', '', '', '', '']

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>ORGANIC CERTIFICATE</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>
          {isEn
            ? 'EU standard (Reg. 2018/848), USDA NOP (USA), JAS (Japan), Canada Organic'
            : 'Standard UE (Rozp. 2018/848), USDA NOP (USA), JAS (Japonia), Canada Organic'}
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Cert. No.:' : 'Nr certyfikatu / Cert. No.:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Standard:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Issue date:' : 'Data wydania / Issue date:'}</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Valid until:' : 'Ważny do / Valid until:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Certifying body:' : 'Jednostka certyfikująca / Certifying body:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Accreditation No.:' : 'Nr akredytacji / Accreditation No.:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Country:' : 'Kraj / Country:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Certified operator:' : 'Operator / Certified operator:'}</div>
          <div style={val}>{data.sender?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Tax ID:</div>
          <div style={val}>{data.customs?.eori || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Activity:' : 'Działalność / Activity:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>{isEn ? 'CERTIFIED PRODUCTS' : 'CERTYFIKOWANE PRODUKTY / CERTIFIED PRODUCTS'}</span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '130px' }}>{isEn ? 'Product name' : 'Nazwa produktu / Product name'}</div>
        <div style={{ ...thStyle, width: '80px' }}>{isEn ? 'Category' : 'Kategoria / Category'}</div>
        <div style={{ ...thStyle, width: '110px' }}>{isEn ? 'Certification status' : 'Status certyfikacji / Certification status'}</div>
        <div style={{ ...thStyle, width: '70px' }}>{isEn ? 'Product No.' : 'Nr produktu / Product No.'}</div>
        <div style={{ ...thStyle, width: '100px' }}>{isEn ? 'Production method' : 'Metoda produkcji / Production method'}</div>
        <div style={{ ...thStyle, flex: 1, borderRight: b }}>{isEn ? 'Certificate validity' : 'Ważność certyfikatu / Certificate validity'}</div>
      </div>
      {rows.map((name, i) => (
        <div key={i} style={{ display: 'flex', borderLeft: b, minHeight: '46px' }}>
          <div style={{ width: '130px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{name}</div>
          <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
          <div style={{ width: '110px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '7.5px', lineHeight: '1.5' }}>
            ☐ 100% Organic<br />☐ Organic (95%+)<br />☐ {isEn ? 'In conversion' : 'W konwersji / In conversion'}
          </div>
          <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
          <div style={{ width: '100px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '7.5px', lineHeight: '1.5' }}>
            ☐ {isEn ? 'Crops' : 'Uprawy / Crops'}<br />☐ {isEn ? 'Livestock' : 'Zwierzęta / Livestock'}<br />☐ {isEn ? 'Processing' : 'Przetwórstwo / Processing'}
          </div>
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        </div>
      ))}

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Certifying body' : 'Jednostka certyfikująca / Certifying body'}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Signature &amp; stamp / Podpis i pieczęć'}</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Inspector' : 'Inspektor / Inspector'}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Signature &amp; stamp / Podpis i pieczęć'}</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Date + Accreditation Stamp</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Signature &amp; stamp / Podpis i pieczęć'}</div>
        </div>
      </div>

    </div>
  )
}
