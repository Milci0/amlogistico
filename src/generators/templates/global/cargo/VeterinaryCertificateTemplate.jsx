import { formatDocumentDate } from '../../../../utils/formatDate'

export function VeterinaryCertificateTemplate({ data }) {
  const today = formatDocumentDate(new Date())
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px',
    borderRight: b,
    borderBottom: b,
    fontSize: '7px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#2c5fa8',
    verticalAlign: 'top',
  }

  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '18px' }}>
      {[null, 55, 55, 55, 55, 55, 45, 55].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  const attestations = [
    'Produkty spełniają wymagania Rozporządzenia (WE) 853/2004 / Products meet requirements of Regulation (EC) 853/2004',
    'Zakład posiada zatwierdzenie weterynaryjne i jest ujęty w wykazie zakładów / Establishment is approved and listed',
    'Produkty są zdatne do spożycia przez ludzi / Products are fit for human consumption',
    'Produkty pochodzą od zwierząt, które przeszły ante-mortem i post-mortem badanie / Animals passed ante- and post-mortem inspection',
    'Produkty są wolne od chorób zakaźnych / Products are free from infectious diseases',
    'Temperatura transportu jest odpowiednia / Transport temperature is appropriate',
  ]

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>ŚWIADECTWO ZDROWOTNE / WETERYNARYJNE</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Health / Veterinary Certificate · Certificat Sanitaire Vétérinaire</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Rozporządzenie UE 2017/625 — wymagane dla żywności pochodzenia zwierzęcego eksportowanej poza UE</div>
      </div>

      {/* NOTKA */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Format świadectwa zależy od kraju docelowego. Każdy kraj ma własny wzór uzgodniony z UE. Niniejszy
          formularz jest wzorem ogólnym.
        </span>
      </div>

      {/* NR ŚWIADECTWA | KRAJ WYWOZU | WŁAŚCIWY ORGAN */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Nr świadectwa / Certificate No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Kraj wywozu / Exporting country:</div>
          <div style={val}>{data.fromCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Właściwy organ / Competent authority:</div>
          <div style={val} />
        </div>
      </div>

      {/* PRODUCENT | ADRES ZAKŁADU | KOD TRACES */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Producent / Establishment (nazwa, nr zakładu wet.):</div>
          <div style={val}>{data.sender?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Adres zakładu / Address:</div>
          <div style={val}>{data.sender?.address || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Kod produktu wg TRACES:</div>
          <div style={val} />
        </div>
      </div>

      {/* KRAJ PRZEZNACZENIA | ODBIORCA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Kraj przeznaczenia / Country of destination:</div>
          <div style={val}>{data.toCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Odbiorca / Consignee (nazwa, adres):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
        </div>
      </div>

      {/* ŚRODEK TRANSPORTU | TEMPERATURA TRANSPORTU */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Środek transportu:</div>
          <div style={val}>{data.transportMeans || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Temperatura transportu / Transport temperature:</div>
          {(data.vehicle?.tempFrom || data.vehicle?.tempTo)
            ? <div style={{ fontSize: '8px', marginTop: '2px' }}>Od: {data.vehicle.tempFrom}°C &nbsp; Do: {data.vehicle.tempTo}°C</div>
            : <div style={val} />}
        </div>
      </div>

      {/* SEKCJA: OPIS PRODUKTU */}
      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>OPIS PRODUKTU / PRODUCT DESCRIPTION</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, flex: 1 }}>Nazwa produktu<br />Product name</div>
        <div style={{ ...thStyle, width: '55px' }}>Gatunek<br />Species</div>
        <div style={{ ...thStyle, width: '55px' }}>Część / postać<br />Part / Form</div>
        <div style={{ ...thStyle, width: '55px' }}>Nr partii<br />Batch/Lot No.</div>
        <div style={{ ...thStyle, width: '55px' }}>Data prod.<br />Production date</div>
        <div style={{ ...thStyle, width: '55px' }}>Data ważności<br />Expiry date</div>
        <div style={{ ...thStyle, width: '45px' }}>Ilość (kg)<br />Quantity</div>
        <div style={{ ...thStyle, width: '55px', borderRight: b }}>Nr świad. wet.<br />Vet. cert. No.</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight || ''}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}

      {/* SEKCJA: DEKLARACJE ZDROWOTNE */}
      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>DEKLARACJE ZDROWOTNE / HEALTH ATTESTATIONS</span>
      </div>
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        {attestations.map((text, i) => (
          <div key={i} style={{ display: 'flex', padding: '3px 5px', borderBottom: i < attestations.length - 1 ? b : undefined }}>
            <span style={{ marginRight: '5px' }}>&#9634;</span>
            <span style={{ fontSize: '7px' }}>{text}</span>
          </div>
        ))}
      </div>

      {/* STOPKA — WYPEŁNIA URZĄD */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Urzędowy lekarz weterynarii / Official Veterinarian:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Nr upoważnienia / Licence No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Data / Date:</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '4px 6px', minHeight: '30px' }}>
          <div style={lbl}>Pieczęć urzędowa / Official stamp:</div>
          <div style={val} />
        </div>
      </div>

    </div>
  )
}
