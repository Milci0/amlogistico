import { formatDocumentDate } from '../../../../utils/formatDate'

export function PhytosanitaryCertificateTemplate({ data }) {
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
      {[null, 90, 55, 90, 70].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>ŚWIADECTWO FITOSANITARNE</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Phytosanitary Certificate · Certificat Phytosanitaire · Pflanzenschutzzeugnis</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Konwencja IPPC (International Plant Protection Convention) — FAO Rome 1951/2009</div>
      </div>

      {/* NOTKA */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Wystawiany wyłącznie przez PIORiN (Polska Inspekcja Ochrony Roślin i Nasiennictwa). Czas oczekiwania:
          3-10 dni roboczych. Ważny zazwyczaj 14 dni.
        </span>
      </div>

      {/* NR ŚWIADECTWA | DATA WYSTAWIENIA | ORGAN WYSTAWIAJĄCY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Nr świadectwa / Certificate No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Data wystawienia / Date of issue:</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Organ wystawiający / Issuing authority:</div>
          <div style={val} />
        </div>
      </div>

      {/* EKSPORTER | ODBIORCA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>Nazwa i adres eksportera / Name and address of exporter:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '36px' }}>
          <div style={lbl}>Nazwa i adres odbiorcy / Name and address of consignee:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
        </div>
      </div>

      {/* KRAJ POCHODZENIA | KRAJ PRZEZNACZENIA | PUNKT WEJŚCIA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Kraj pochodzenia / Country of origin:</div>
          <div style={val}>{data.fromCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Kraj przeznaczenia / Country of destination:</div>
          <div style={val}>{data.toCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Punkt wejścia / Declared point of entry:</div>
          <div style={val} />
        </div>
      </div>

      {/* ŚRODEK TRANSPORTU | NR B/L LUB AWB | DATA WYSYŁKI */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Środek transportu / Means of conveyance:</div>
          <div style={val}>{data.transportMeans || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Nr B/L lub AWB / B/L or AWB No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Data wysyłki / Date of dispatch:</div>
          <div style={val}>{data.loadDate ? formatDocumentDate(data.loadDate) : ''}</div>
        </div>
      </div>

      {/* SEKCJA: OPIS PRZESYŁKI */}
      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>OPIS PRZESYŁKI / DESCRIPTION OF CONSIGNMENT</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, flex: 1 }}>Nazwa botaniczna rośliny<br />Botanical name of plant</div>
        <div style={{ ...thStyle, width: '90px' }}>Ilość i rodzaj opakowań<br />No. &amp; description of packages</div>
        <div style={{ ...thStyle, width: '55px' }}>Masa netto (kg)<br />Net weight</div>
        <div style={{ ...thStyle, width: '90px' }}>Nazwa handlowa produktu<br />Trade name</div>
        <div style={{ ...thStyle, width: '70px', borderRight: b }}>Kraj produkcji<br />Country of production</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
        <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages || ''}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weightNet || ''}</div>
        <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.fromCountry || ''}</div>
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}

      {/* ZASTOSOWANE TRAKTOWANIE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Zastosowane traktowanie / Treatment applied (if any):</div>
          <div style={val} />
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Środek chemiczny / Chemical:</div>
          <div style={val} />
        </div>
        <div style={{ width: '90px', padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Stężenie / Concentration:</div>
          <div style={val} />
        </div>
        <div style={{ width: '90px', padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Czas trwania / Duration:</div>
          <div style={val} />
        </div>
        <div style={{ width: '90px', padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Temperatura / Temperature:</div>
          <div style={val} />
        </div>
      </div>

      {/* OŚWIADCZENIE */}
      <div style={{ border: b, borderTop: 'none', padding: '5px 7px', backgroundColor: '#f0f9f0' }}>
        <span style={{ fontSize: '6.5px', color: '#555' }}>
          <strong>OŚWIADCZENIE FITOSANITARNE / PHYTOSANITARY DECLARATION:</strong> Niniejszym zaświadcza się, że
          rośliny, produkty roślinne lub inne artykuły opisane powyżej zostały zbadane zgodnie z odpowiednimi
          procedurami i są uważane za wolne od organizmów kwarantannowych określonych przez umawiającą się stronę
          importującą, oraz że są zgodne z wymogami fitosanitarnymi strony importującej. This is to certify that the
          plants, plant products or other regulated articles described above have been inspected according to
          appropriate procedures and are considered to be free from quarantine pests specified by the importing
          contracting party and to conform with the current phytosanitary requirements of the importing contracting
          party.
        </span>
      </div>

      {/* STOPKA — WYPEŁNIA URZĄD */}
      <div style={{ display: 'flex', border: b, borderTop: 'none' }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Upoważniony funkcjonariusz / Authorized officer:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Stanowisko / Title:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Data / Date:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '4px 6px', minHeight: '30px' }}>
          <div style={lbl}>Pieczęć urzędowa / Official stamp:</div>
          <div style={val} />
        </div>
      </div>

    </div>
  )
}
