export function EudrDdsTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const secHdr = {
    backgroundColor: '#1f6f4a', padding: '4px 6px',
    fontSize: '8px', fontWeight: 'bold', color: '#fff',
  }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#1f6f4a', verticalAlign: 'top',
  }
  const plotRow = (
    <div style={{ display: 'flex', minHeight: '20px' }}>
      {[30, null, 110, 110, 90, 90].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#145136', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>EUDR — OŚWIADCZENIE DUE DILIGENCE</div>
          <div style={{ fontSize: '8px', color: '#a8d5c0', marginTop: '2px' }}>Due Diligence Statement &middot; produkty niezwiązane z wylesianiem</div>
          <div style={{ fontSize: '6.5px', color: '#a8d5c0', marginTop: '1px' }}>Rozporządzenie (UE) 2023/1115</div>
        </div>
        <div style={{ width: '175px', padding: '6px 8px', backgroundColor: '#145136' }}>
          <div style={{ ...lbl, color: '#a8d5c0' }}>Nr referencyjny DDS (nadaje TRACES):</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#a8d5c0', marginTop: '4px' }}>Data złożenia / Date of submission:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '5px 7px', backgroundColor: '#fffbe6' }}>
        <div style={{ fontSize: '7.5px', fontWeight: 'bold', color: '#7c2d12', marginBottom: '2px' }}>
          Formularz zbiera dane PRZED złożeniem oświadczenia w systemie TRACES.
        </div>
        <div style={{ fontSize: '6.5px', color: '#555', lineHeight: '1.5' }}>
          Numer referencyjny DDS nadaje system TRACES po złożeniu oświadczenia; nie da się go wpisać wcześniej.<br />
          Obowiązek dotyczy dużych i średnich operatorów od 30.12.2026, a mikro i małych od 30.06.2027.<br />
          Zakres towarowy: bydło, kakao, kawa, olej palmowy, kauczuk, soja i drewno oraz produkty pochodne.
        </div>
      </div>

      {/* OPERATOR */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>OPERATOR LUB PODMIOT HANDLOWY / OPERATOR OR TRADER</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '52px' }}>
          <div style={lbl}>Nazwa i adres / Name and address:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ width: '170px', padding: '3px 5px', borderRight: b, minHeight: '52px' }}>
          <div style={lbl}>Nr EORI / EORI No.:</div>
          <div style={val}>{data.sender?.vat || ''}</div>
          <div style={{ ...lbl, marginTop: '4px' }}>Rola / Role:</div>
          <div style={{ fontSize: '7.5px' }}>&#9634; operator &nbsp; &#9634; podmiot handlowy</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '52px' }}>
          <div style={lbl}>Odbiorca w UE / EU recipient:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
        </div>
      </div>

      {/* TOWAR */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>TOWAR OBJĘTY OŚWIADCZENIEM / COMMODITY COVERED</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>Opis towaru / Description of goods:</div>
          <div style={val}>{data.cargo?.name}</div>
        </div>
        <div style={{ width: '100px', padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>Kod HS / HS code:</div>
          <div style={val}>{data.cargo?.hsCode}</div>
        </div>
        <div style={{ width: '100px', padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>Ilość / Quantity:</div>
          <div style={val}>{data.cargo?.weight} kg</div>
        </div>
        <div style={{ width: '120px', padding: '3px 5px', minHeight: '34px' }}>
          <div style={lbl}>Kraj produkcji / Country of production:</div>
          <div style={val}>{data.fromCountry}</div>
        </div>
      </div>

      {/* GEOLOKALIZACJA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>GEOLOKALIZACJA DZIAŁEK / GEOLOCATION OF PLOTS OF LAND</div>
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Dla działek powyżej 4 ha podaje się poligon, a nie punkt. Współrzędne w układzie WGS 84, z dokładnością do sześciu miejsc po przecinku.
        </span>
      </div>
      <div style={{ display: 'flex', borderLeft: b }}>
        <div style={{ ...thStyle, width: '30px' }}>Lp.<br />No.</div>
        <div style={{ ...thStyle, flex: 1 }}>Nazwa lub identyfikator działki<br />Plot name or identifier</div>
        <div style={{ ...thStyle, width: '110px' }}>Szerokość geogr.<br />Latitude</div>
        <div style={{ ...thStyle, width: '110px' }}>Długość geogr.<br />Longitude</div>
        <div style={{ ...thStyle, width: '90px' }}>Powierzchnia (ha)<br />Area</div>
        <div style={{ ...thStyle, width: '90px', borderRight: b }}>Data produkcji<br />Production date</div>
      </div>
      {plotRow}{plotRow}{plotRow}{plotRow}{plotRow}{plotRow}

      {/* DOSTAWCA I OCENA RYZYKA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>DOSTAWCA I OCENA RYZYKA / SUPPLIER AND RISK ASSESSMENT</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>Dostawca lub plantacja / Supplier or plantation:</div>
          <div style={val} />
          <div style={{ ...lbl, marginTop: '3px' }}>Dane kontaktowe / Contact details:</div>
          <div style={val} />
        </div>
        <div style={{ width: '170px', padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>Poziom ryzyka kraju / Country risk level:</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>&#9634; niskie &nbsp; &#9634; standardowe &nbsp; &#9634; wysokie</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '40px' }}>
          <div style={lbl}>Wynik oceny ryzyka / Risk assessment conclusion:</div>
          <div style={val} />
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '46px' }}>
          <div style={lbl}>Środki ograniczające ryzyko / Risk mitigation measures:</div>
          <div style={{ ...val, minHeight: '30px' }} />
        </div>
        <div style={{ flex: 1, padding: '4px 6px', minHeight: '46px' }}>
          <div style={lbl}>Dokumenty potwierdzające legalność produkcji / Evidence of legal production:</div>
          <div style={{ ...val, minHeight: '30px' }} />
        </div>
      </div>

      {/* OŚWIADCZENIE */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b, backgroundColor: '#145136' }}>OŚWIADCZENIE / STATEMENT</div>
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '5px 7px' }}>
        <div style={{ fontSize: '7.5px', lineHeight: '1.5' }}>
          Oświadczam, że przeprowadzono należytą staranność zgodnie z rozporządzeniem (UE) 2023/1115 oraz że stwierdzono
          brak ryzyka lub jedynie znikome ryzyko, iż towary objęte niniejszym oświadczeniem są niezgodne z tym rozporządzeniem.
        </div>
        <div style={{ fontSize: '6.5px', color: '#777', marginTop: '3px' }}>
          I declare that due diligence was carried out in accordance with Regulation (EU) 2023/1115 and that no or only
          a negligible risk was found that the products covered by this statement are non-compliant.
        </div>
      </div>

      {/* PODPIS */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, minHeight: '54px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Osoba upoważniona / Authorised person</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Imię, nazwisko, stanowisko / Name and position</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Miejsce, data i podpis / Place, date and signature</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis / Signature</div>
        </div>
      </div>

    </div>
  )
}
