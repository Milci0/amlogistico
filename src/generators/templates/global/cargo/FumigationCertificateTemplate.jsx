import { formatDocumentDate } from '../../../../utils/formatDate'

export function FumigationCertificateTemplate({ data }) {
  const today = formatDocumentDate(new Date())
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }

  const fumigants = ['Methyl Bromide (MB)', 'Phosphine (PH3)', 'Sulfuryl Fluoride']

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>FUMIGATION CERTIFICATE</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Świadectwo Fumigacji · Certificat de Fumigation</div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          <strong>WAŻNE:</strong> Wymagane dla towarów fumigowanych (odrobaczonych/odkażonych) — zboże, drewno,
          używane maszyny. Wystawiane przez akredytowanego fumiganta.
        </span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Nr świadectwa / Certificate No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Data fumigacji / Date of fumigation:</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Organ wystawiający / Issuing authority:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Eksporter / Shipper:</div>
          <div style={val}>{data.sender?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Kraj / Country:</div>
          <div style={val}>{data.sender?.country || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Odbiorca / Consignee:</div>
          <div style={val}>{data.receiver?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Kraj przeznaczenia / Country of destination:</div>
          <div style={val}>{data.toCountry || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Opis towaru / Description of goods:</div>
          <div style={val}>{data.cargo?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Ilość / Quantity (kg):</div>
          <div style={val}>{data.cargo?.weight || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Nr kontenera / Container No.:</div>
          <div style={val}>{data.cargo?.containerNo || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Port załadunku / Port of loading:</div>
          <div style={val}>{data.fromCity || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Środek transportu / Conveyance:</div>
          <div style={val}>{data.transportMeans || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Nr B/L / B/L No.:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>SZCZEGÓŁY FUMIGACJI / FUMIGATION DETAILS</span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '110px' }}>Środek fumigujący<br />Fumigant used</div>
        <div style={{ ...thStyle, flex: 1 }}>Stężenie<br />Concentration (g/m³)</div>
        <div style={{ ...thStyle, flex: 1 }}>Temperatura<br />Temperature (°C)</div>
        <div style={{ ...thStyle, flex: 1 }}>Czas ekspozycji<br />Exposure time (h)</div>
        <div style={{ ...thStyle, flex: 1 }}>Data rozpoczęcia<br />Start date/time</div>
        <div style={{ ...thStyle, flex: 1 }}>Data zakończenia<br />End date/time</div>
        <div style={{ ...thStyle, width: '70px', borderRight: b }}>Wynik<br />Result</div>
      </div>
      {fumigants.map((name, i) => (
        <div key={i} style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
          <div style={{ width: '110px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>☐ {name}</div>
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
          <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>☐ Satisfactory</div>
        </div>
      ))}

      <div style={{ border: b, borderTop: 'none', padding: '5px 7px', backgroundColor: '#f7f7f7' }}>
        <span style={{ fontSize: '6.5px', color: '#555' }}>
          <strong>OŚWIADCZENIE / DECLARATION:</strong> Niniejszym zaświadcza się, że wyżej opisany towar/pojemnik
          został poddany fumigacji zgodnie z obowiązującymi przepisami i jest wolny od żywych organizmów szkodliwych.
          This is to certify that the above described goods/container have been fumigated according to applicable
          regulations and are free from living harmful organisms.
        </span>
      </div>

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Fumigant / Akredytowany fumigant</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Licencja Nr / Licence No.:</div>
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
