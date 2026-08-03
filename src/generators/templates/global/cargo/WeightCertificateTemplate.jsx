import { formatDocumentDate } from '../../../../utils/formatDate'

export function WeightCertificateTemplate({ data }) {
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

  const methodCheckbox = isEn ? '☐ Static ☐ Dynamic ☐ Draft Survey' : '☐ Statyczna ☐ Dynamiczna ☐ Draft Survey'
  const rows = [
    { gross: data.cargo?.weight || '', net: data.cargo?.weightNet || '' },
    {}, {}, {}, {}, {},
  ]

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>WEIGHT CERTIFICATE</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Certificat de Poids · Gewichtszertifikat</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>
          {isEn
            ? 'Required for goods settled by weight: grain, ore, metals, coal, sugar. Issued by an independent inspector (SGS, Bureau Veritas, Intertek).'
            : 'Wymagane dla towarów rozliczanych wagowo: zboże, ruda, metale, węgiel, cukier. Wystawiane przez niezależnego inspektora (SGS, Bureau Veritas, Intertek).'}
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Certificate No.:' : 'Nr świadectwa:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Weighing date:' : 'Data ważenia:'}</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Place:' : 'Miejsce:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Principal:' : 'Zleceniodawca:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Inspector (SGS/BV/Intertek):' : 'Inspektor (SGS/BV/Intertek):'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Shipper:' : 'Eksporter:'}</div>
          <div style={val}>{data.sender?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Consignee:' : 'Odbiorca:'}</div>
          <div style={val}>{data.receiver?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Contract No.:' : 'Nr kontraktu:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Description of goods:' : 'Opis towaru:'}</div>
          <div style={val}>{data.cargo?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Packaging:' : 'Opakowanie:'}</div>
          <div style={val}>
            {data.cargo?.packageTypeName && data.cargo?.packages
              ? `${data.cargo.packages} × ${isEn ? (data.cargo.packageTypeNameEn || data.cargo.packageTypeName) : data.cargo.packageTypeName}`
              : ''}
          </div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Container or wagon No.:' : 'Nr kontenera lub wagonu:'}</div>
          <div style={val}>{data.cargo?.containerNo || ''}</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>{isEn ? 'WEIGHING RESULTS' : 'WYNIKI WAŻENIA'}</span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '45px' }}>{isEn ? 'Item' : 'Pozycja'}</div>
        <div style={{ ...thStyle, width: '80px' }}>{isEn ? 'Package No.' : 'Nr opakowania'}</div>
        <div style={{ ...thStyle, width: '70px' }}>{isEn ? 'Tare (kg)' : 'Waga tary (kg)'}</div>
        <div style={{ ...thStyle, width: '75px' }}>{isEn ? 'Gross (kg)' : 'Waga brutto (kg)'}</div>
        <div style={{ ...thStyle, width: '75px' }}>{isEn ? 'Net (kg)' : 'Waga netto (kg)'}</div>
        <div style={{ ...thStyle, flex: 1, borderRight: b }}>{isEn ? 'Weighing method' : 'Metoda ważenia'}</div>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
          <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{i + 1}</div>
          <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
          <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
          <div style={{ width: '75px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{r.gross || ''}</div>
          <div style={{ width: '75px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{r.net || ''}</div>
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '7.5px' }}>{methodCheckbox}</div>
        </div>
      ))}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px', fontWeight: 'bold' }} />
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px', fontWeight: 'bold' }}>{isEn ? 'TOTAL' : 'SUMA'}</div>
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '75px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '75px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Invoice weight (kg):' : 'Waga fakturowa (kg):'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Difference ± (kg):' : 'Różnica ± (kg):'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Tolerance (%):' : 'Tolerancja (%):'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Result:' : 'Wynik:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Inspector' : 'Inspektor'}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Licence No.:' : 'Nr licencji:'}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Date</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
      </div>

    </div>
  )
}
