import { formatDocumentDate } from '../../../../utils/formatDate'

export function HalalCertificateTemplate({ data }) {
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
  // "Halal" — nazwa własna, bez tłumaczenia.
  const Checks = () => (
    <>&#9634; Halal &nbsp; &#9634; {isEn ? 'No pork' : 'Bez wieprzowiny'} &nbsp; &#9634; {isEn ? 'No alcohol' : 'Bez alkoholu'}</>
  )
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '26px' }}>
      {[65, 60, 55, 55, null, 55, 40].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b, fontSize: '7px', padding: '2px 3px' }}>
          {i === 4 ? <Checks /> : null}
        </div>
      ))}
    </div>
  )

  const declarations = isEn
    ? [
        'Product contains no pork or pork derivatives',
        'Product contains no alcohol',
        'No animal blood',
        'Animals slaughtered according to Sharia',
        'No haram contamination in production',
        'Production line separated from non-halal',
      ]
    : [
        'Produkt nie zawiera wieprzowiny ani jej pochodnych',
        'Produkt nie zawiera alkoholu',
        'Produkt nie zawiera krwi zwierzęcej',
        'Zwierzęta ubite zgodnie z zasadami Sharia',
        'Brak zanieczyszczeń haram w procesie produkcji',
        'Linia produkcyjna jest oddzielona od produktów nie-halal',
      ]

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>
          {isEn ? 'HALAL CERTIFICATE' : 'CERTYFIKAT HALAL'}
        </div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>
          {isEn
            ? 'Required for food, medicines and cosmetics exported to Muslim-majority countries (Saudi Arabia, UAE, Malaysia, Indonesia, Egypt and others)'
            : 'Wymagany dla żywności, leków i kosmetyków eksportowanych do krajów muzułmańskich (Arabia Saudyjska, ZEA, Malezja, Indonezja, Egipt i inne)'}
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          {isEn
            ? 'The certificate must be issued by an accredited certification body recognised by the country of import. Not every body is recognised in every country.'
            : 'Certyfikat musi być wystawiony przez akredytowaną jednostkę certyfikującą uznaną przez kraj importu. Nie każda jednostka jest uznawana w każdym kraju.'}
        </span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Certificate No.:' : 'Nr certyfikatu:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Issue date:' : 'Data wystawienia:'}</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Valid until:' : 'Ważny do:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'Certifying body (accredited):' : 'Jednostka certyfikująca (akredytowana):'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'Accreditation No.:' : 'Nr akredytacji:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>{isEn ? 'Manufacturer (name, address, country):' : 'Producent (nazwa, adres, kraj):'}</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}, {data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '36px' }}>
          <div style={lbl}>{isEn ? 'Establishment No.:' : 'Nr zakładu:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Country of destination:' : 'Kraj przeznaczenia:'}</div>
          <div style={val}>{data.toCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>{isEn ? 'Competent authority in country of import:' : 'Właściwy organ w kraju importu:'}</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>{isEn ? 'PRODUCT DESCRIPTION' : 'OPIS PRODUKTU'}</span>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '65px' }}>{isEn ? 'Product name' : 'Nazwa produktu'}</div>
        <div style={{ ...thStyle, width: '60px' }}>{isEn ? 'Arabic name' : 'Nazwa arabska'}</div>
        <div style={{ ...thStyle, width: '55px' }}>{isEn ? 'Product code' : 'Kod produktu'}</div>
        <div style={{ ...thStyle, width: '55px' }}>{isEn ? 'Category' : 'Kategoria'}</div>
        <div style={{ ...thStyle, flex: 1 }}>{isEn ? 'Ingredients verified' : 'Składniki (sprawdzone)'}</div>
        <div style={{ ...thStyle, width: '55px' }}>{isEn ? 'Batch No.' : 'Nr partii'}</div>
        <div style={{ ...thStyle, width: '40px', borderRight: b }}>{isEn ? 'Qty' : 'Ilość'}</div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, minHeight: '26px' }}>
        <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '7px' }}><Checks /></div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.quantity || ''}</div>
      </div>
      {emptyRow}
      {emptyRow}

      <div style={{ borderLeft: b, borderRight: b }}>
        {declarations.map((text, i) => (
          <div key={i} style={{ display: 'flex', padding: '3px 5px', borderBottom: b }}>
            <span style={{ marginRight: '5px' }}>&#9634;</span>
            <span style={{ fontSize: '7px' }}>{text}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>{isEn ? 'Inspector:' : 'Inspektor:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>{isEn ? 'Director:' : 'Dyrektor jednostki:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>{isEn ? 'Date:' : 'Data:'}</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '4px 6px', minHeight: '30px' }}>
          <div style={lbl}>{isEn ? 'Stamp & halal logo:' : 'Pieczęć i logo halal:'}</div>
          <div style={val} />
        </div>
      </div>

    </div>
  )
}
