import { formatDocumentDate } from '../../../../utils/formatDate'

export function CeDeclarationOfConformityTemplate({ data }) {
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

  const directives = isEn
    ? [
        ['2014/35/EU', 'Low Voltage Directive (LVD)'],
        ['2014/30/EU', 'Electromagnetic Compatibility / EMC Directive'],
        ['2006/42/EC', 'Machinery Directive'],
        ['2017/745/EU', 'Medical Devices Regulation (MDR)'],
        ['2009/48/EC', 'Toy Safety Directive'],
        ['2014/53/EU', 'Radio Equipment Directive (RED)'],
        ['2016/425/EU', 'PPE Regulation'],
        ['2011/65/EU', 'RoHS Directive'],
        ['Other:', ''],
      ]
    : [
        ['2014/35/EU', 'Niskie napięcie / Low Voltage Directive (LVD)'],
        ['2014/30/EU', 'Kompatybilność elektromagnetyczna / EMC Directive'],
        ['2006/42/EC', 'Maszyny / Machinery Directive'],
        ['2017/745/EU', 'Wyroby medyczne / Medical Devices Regulation (MDR)'],
        ['2009/48/EC', 'Zabawki / Toy Safety Directive'],
        ['2014/53/EU', 'Urządzenia radiowe / Radio Equipment Directive (RED)'],
        ['2016/425/EU', 'Środki ochrony indywidualnej / PPE Regulation'],
        ['2011/65/EU', 'Ograniczenie substancji / RoHS Directive'],
        ['Inne / Other:', ''],
      ]

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>CE — DECLARATION OF CONFORMITY</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>{isEn ? 'EU DoC — required for products placed on the EU market' : 'Deklaracja Zgodności CE · EU DoC · wymagana dla produktów na rynek UE / EU DoC — required for products placed on the EU market'}</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>
          {isEn
            ? 'Applies to: electronics, machinery, medical devices, toys, PPE and others'
            : 'Dotyczy: elektroniki, maszyn, wyrobów medycznych, zabawek, PPE i innych'}
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Manufacturer:</div>
          <div style={val}>{data.sender?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Address:' : 'Adres / Address:'}</div>
          <div style={val}>{data.sender?.address || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>EORI / Tax No.:</div>
          <div style={val}>{data.customs?.eori || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'EU Authorised Representative:' : 'Przedstawiciel w UE / EU Authorised Rep. / EU Authorised Representative:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Address:' : 'Adres / Address:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Product name:</div>
          <div style={val}>{data.cargo?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Model / Type:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Serial No.:' : 'Nr seryjny / Serial No.:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Year of manufacture:' : 'Rok produkcji / Year of manufacture:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>{isEn ? 'APPLICABLE EU DIRECTIVES' : 'ZASTOSOWANE DYREKTYWY / APPLICABLE EU DIRECTIVES'}</span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '90px' }}>{isEn ? 'Regulation No.' : 'Dyrektywa / Regulation No.'}</div>
        <div style={{ ...thStyle, flex: 1 }}>{isEn ? 'Title' : 'Tytuł / Title'}</div>
        <div style={{ ...thStyle, width: '60px', borderRight: b }}>{isEn ? 'Applicable' : 'Zastosowana / Applicable'}</div>
      </div>
      {directives.map(([reg, title], i) => (
        <div key={i} style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
          <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{reg}</div>
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>{title}</div>
          <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>☐</div>
        </div>
      ))}

      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>{isEn ? 'HARMONISED STANDARDS' : 'ZASTOSOWANE NORMY ZHARMONIZOWANE / HARMONISED STANDARDS'}</span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Standard No.:' : 'Nr normy / Standard No.:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Title:' : 'Tytuł / Title:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Standard date:' : 'Data normy / Standard date:'}</div>
          <div style={val} />
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Standard No.:' : 'Nr normy / Standard No.:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Title:' : 'Tytuł / Title:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Standard date:' : 'Data normy / Standard date:'}</div>
          <div style={val} />
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Notified Body (if applicable):' : 'Jednostka notyfikowana / Notified Body (jeśli) / Notified Body (if applicable):'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>NB No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'NB Certificate No.:' : 'Nr certyfikatu NB / NB Certificate No.:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ border: b, padding: '5px 7px', marginTop: '8px', backgroundColor: '#f7f7f7' }}>
        <span style={{ fontSize: '6.5px', color: '#555' }}>
          {isEn
            ? "I hereby declare under my sole responsibility that the product described above is in conformity with the provisions of the directives and standards listed above."
            : "Niniejszym oświadczam na własną odpowiedzialność, że opisany wyżej produkt jest zgodny z postanowieniami wymienionych dyrektyw i norm. I hereby declare under my sole responsibility that the product described above is in conformity with the provisions of the directives and standards listed above."}
        </span>
      </div>

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Manufacturer</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Signature &amp; stamp / Podpis i pieczęć'}</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Title' : 'Funkcja / Title'}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Signature &amp; stamp / Podpis i pieczęć'}</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Place & date' : 'Miejsce i data / Place & date'}</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Signature &amp; stamp / Podpis i pieczęć'}</div>
        </div>
      </div>

    </div>
  )
}
