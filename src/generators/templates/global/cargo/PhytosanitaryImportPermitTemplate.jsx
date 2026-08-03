import { formatDocumentDate } from '../../../../utils/formatDate'

export function PhytosanitaryImportPermitTemplate({ data }) {
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

  const requirements = isEn
    ? [
        ['Prohibited pests', 'The goods must be free from the following organisms:'],
        ['Treatment', '☐ Fumigation MB ☐ Heat treatment HT ☐ Other:'],
        ['Inspection', '☐ Pre-shipment ☐ Port of entry ☐ Both'],
        ['Phytosanitary cert.', 'Required, issued by:'],
        ['Other conditions', ''],
      ]
    : [
        ['Organizmy kwarantannowe', 'Towar musi być wolny od następujących organizmów:'],
        ['Traktowanie', '☐ Fumigacja MB ☐ Obróbka cieplna HT ☐ Inne:'],
        ['Inspekcja', '☐ Pre-shipment ☐ Port of entry ☐ Obydwie'],
        ['Świadectwo fitosanitarne', 'Wymagane wystawione przez:'],
        ['Inne warunki', ''],
      ]

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>PHYTOSANITARY IMPORT PERMIT</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>{isEn ? 'Import Permit for Plants' : 'Pozwolenie na Przywóz Fitosanitarne · Import Permit for Plants'}</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>
          {isEn
            ? 'Required by the country of import BEFORE the exporter ships the goods. Permit No. is entered on the phytosanitary certificate.'
            : 'Wymagane przez kraj importu ZANIM eksporter wyśle towar. Nr pozwolenia wpisywany na świadectwie fitosanitarnym.'}
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Permit No.:</div>
          <div style={val}>{data.customs?.permitNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Issue date:' : 'Data wydania / Issue date:'}</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Valid until:' : 'Ważne do / Valid until:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Issuing authority:' : 'Organ wystawiający / Issuing authority:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Country:' : 'Kraj / Country:'}</div>
          <div style={val}>{data.toCountry || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Importer / Applicant:</div>
          <div style={val}>{data.receiver?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Tax ID:</div>
          <div style={val}>{data.customs?.eori || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Exporter:</div>
          <div style={val}>{data.sender?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Country of export:' : 'Kraj eksportu / Country of export:'}</div>
          <div style={val}>{data.fromCountry || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Commodity:</div>
          <div style={val}>{data.cargo?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Botanical name:' : 'Botaniczna nazwa / Botanical name:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Qty:</div>
          <div style={val}>{data.cargo?.quantity || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Unit:' : 'Jednostka / Unit:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>{isEn ? 'PHYTOSANITARY REQUIREMENTS' : 'WYMAGANIA FITOSANITARNE / PHYTOSANITARY REQUIREMENTS'}</span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '190px' }}>{isEn ? 'Requirement' : 'Wymóg / Requirement'}</div>
        <div style={{ ...thStyle, flex: 1, borderRight: b }}>{isEn ? 'Details' : 'Szczegóły / Details'}</div>
      </div>
      {requirements.map(([req, det], i) => (
        <div key={i} style={{ display: 'flex', borderLeft: b, minHeight: '24px' }}>
          <div style={{ width: '190px', padding: '3px 5px', borderRight: b, borderBottom: b, fontSize: '8px' }}>{req}</div>
          <div style={{ flex: 1, padding: '3px 5px', borderRight: b, borderBottom: b, fontSize: '8px' }}>{det}</div>
        </div>
      ))}

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Plant Protection Authority</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Signature &amp; stamp / Podpis i pieczęć'}</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Importer</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Signature &amp; stamp / Podpis i pieczęć'}</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Date + Official Stamp</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Signature &amp; stamp / Podpis i pieczęć'}</div>
        </div>
      </div>

    </div>
  )
}
