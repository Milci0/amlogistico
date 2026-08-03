import { formatDocumentDate } from '../../../../utils/formatDate'

export function NonGmoCertificateTemplate({ data }) {
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

  const tests = [
    [isEn ? 'GMO screening (general)' : 'GMO screening (ogólny) / GMO screening (general)', 'PCR ISO 21569', '0.1%'],
    ['Roundup Ready soya GTS40-3-2', 'Real-time PCR', '0.1%'],
    [isEn ? 'Bt maize MON810' : 'Bt kukurydza MON810 / Bt maize MON810', 'Real-time PCR', '0.1%'],
    [isEn ? 'MON88302 (rapeseed)' : 'MON88302 (rzepak) / MON88302 (rapeseed)', 'Real-time PCR', '0.1%'],
  ]

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>NON-GMO CERTIFICATE</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>
          {isEn
            ? 'Required for food and feed exported to the EU, Japan, Korea, Australia and other markets with GMO restrictions'
            : 'Wymagane dla żywności i pasz do UE, Japonii, Korei, Australii i innych rynków z restrykcjami GMO'}
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Cert. No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Date:' : 'Data / Date:'}</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Certifying body:' : 'Organ certyfikujący / Certifying body:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Producer:</div>
          <div style={val}>{data.sender?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Country:' : 'Kraj / Country:'}</div>
          <div style={val}>{data.sender?.country || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Product:</div>
          <div style={val}>{data.cargo?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Species:' : 'Gatunek / Species:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Lot No.:' : 'Nr partii / Lot No.:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Qty (kg):' : 'Ilość (kg) / Qty (kg):'}</div>
          <div style={val}>{data.cargo?.weight || ''}</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>{isEn ? 'TEST RESULTS' : 'WYNIKI TESTÓW / TEST RESULTS'}</span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, flex: 1 }}>{isEn ? 'Test / Parameter' : 'Test / Parametr / Parameter'}</div>
        <div style={{ ...thStyle, width: '100px' }}>{isEn ? 'Method' : 'Metoda / Method'}</div>
        <div style={{ ...thStyle, width: '90px' }}>{isEn ? 'Detection limit' : 'Próg wykrywalności / Detection limit'}</div>
        <div style={{ ...thStyle, width: '80px' }}>{isEn ? 'Result' : 'Wynik / Result'}</div>
        <div style={{ ...thStyle, width: '80px', borderRight: b }}>{isEn ? 'Compliance' : 'Zgodność / Compliance'}</div>
      </div>
      {tests.map(([name, method, limit], i) => (
        <div key={i} style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>{name}</div>
          <div style={{ width: '100px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px', textAlign: 'center' }}>{method}</div>
          <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px', textAlign: 'center' }}>{limit}</div>
          <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
          <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>☐ {isEn ? 'Negative' : 'Negatywny / Negative'}</div>
        </div>
      ))}

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Accredited laboratory' : 'Akredytowane laboratorium / Accredited laboratory'}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Signature &amp; stamp / Podpis i pieczęć'}</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Accreditation No.' : 'Nr akredytacji / Accreditation No.'}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Signature &amp; stamp / Podpis i pieczęć'}</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Date</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Signature &amp; stamp / Podpis i pieczęć'}</div>
        </div>
      </div>

    </div>
  )
}
