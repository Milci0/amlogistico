export function CbamDataSheetTemplate({ data }) {
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
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '18px' }}>
      {[null, 80, 70, 80, 80, 80, 80].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#145136', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>CBAM — KARTA DANYCH EMISYJNYCH</div>
          <div style={{ fontSize: '8px', color: '#a8d5c0', marginTop: '2px' }}>Embedded emissions data sheet &middot; dane od dostawcy dla importera UE</div>
          <div style={{ fontSize: '6.5px', color: '#a8d5c0', marginTop: '1px' }}>Rozporządzenie (UE) 2023/956</div>
        </div>
        <div style={{ width: '170px', padding: '6px 8px', backgroundColor: '#145136' }}>
          <div style={{ ...lbl, color: '#a8d5c0' }}>Okres sprawozdawczy / Reporting period:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#a8d5c0', marginTop: '4px' }}>Nr karty / Data sheet No.:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
        </div>
      </div>

      {/* CZYM TEN DOKUMENT NIE JEST */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '5px 7px', backgroundColor: '#fffbe6' }}>
        <div style={{ fontSize: '7.5px', fontWeight: 'bold', color: '#7c2d12', marginBottom: '2px' }}>
          To NIE jest zgłoszenie składane przy każdej przesyłce.
        </div>
        <div style={{ fontSize: '6.5px', color: '#555', lineHeight: '1.5' }}>
          Importer UE składa deklarację CBAM <strong>raz w roku</strong>: deklaracja za rok 2026 ma termin 30.09.2027,
          a sprzedaż certyfikatów CBAM rusza 01.02.2027. Niniejsza karta służy do przekazania importerowi danych
          o emisjach wbudowanych, których potrzebuje do tej deklaracji.<br />
          Faza definitywna CBAM obowiązuje od 01.01.2026. Próg zwolnienia wynosi 50 ton towarów rocznie na importera.<br />
          Zakres towarowy: cement, żelazo i stal, aluminium, nawozy, energia elektryczna, wodór.
        </div>
      </div>

      {/* STRONY */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>STRONY / PARTIES</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '52px' }}>
          <div style={lbl}>Dostawca wypełniający kartę / Supplier completing this sheet:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '52px' }}>
          <div style={lbl}>Importer w UE / EU importer:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={{ ...lbl, marginTop: '2px' }}>Nr EORI / EORI No.:</div>
          <div style={val}>{data.receiver?.vat || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '52px' }}>
          <div style={lbl}>Upoważniony zgłaszający CBAM / Authorised CBAM declarant:</div>
          <div style={val} />
          <div style={{ ...lbl, marginTop: '4px' }}>Nr w rejestrze CBAM / CBAM registry No.:</div>
          <div style={val} />
        </div>
      </div>

      {/* INSTALACJA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>INSTALACJA PRODUKCYJNA / PRODUCTION INSTALLATION</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Nazwa instalacji / Installation name:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Operator instalacji / Operator:</div>
          <div style={val} />
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Kraj / Country:</div>
          <div style={val}>{data.fromCountry}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>UN/LOCODE:</div>
          <div style={val} />
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Adres instalacji / Installation address:</div>
          <div style={val} />
        </div>
        <div style={{ width: '160px', padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Współrzędne geograficzne / Coordinates:</div>
          <div style={val} />
        </div>
        <div style={{ width: '160px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Ścieżka produkcji / Production route:</div>
          <div style={val} />
        </div>
      </div>

      {/* EMISJE */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>EMISJE WBUDOWANE / EMBEDDED EMISSIONS</div>
      <div style={{ display: 'flex', borderLeft: b }}>
        <div style={{ ...thStyle, flex: 1 }}>Towar<br />Goods description</div>
        <div style={{ ...thStyle, width: '80px' }}>Kod CN<br />CN code</div>
        <div style={{ ...thStyle, width: '70px' }}>Ilość (t)<br />Quantity</div>
        <div style={{ ...thStyle, width: '80px' }}>Emisje bezpośrednie<br />Direct (tCO2e/t)</div>
        <div style={{ ...thStyle, width: '80px' }}>Emisje pośrednie<br />Indirect (tCO2e/t)</div>
        <div style={{ ...thStyle, width: '80px' }}>Energia elektryczna<br />Electricity (MWh/t)</div>
        <div style={{ ...thStyle, width: '80px', borderRight: b }}>Emisje łącznie<br />Total (tCO2e)</div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }} />
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* CENA WEGLA I WERYFIKACJA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '32px' }}>
          <div style={lbl}>Opłata za emisje zapłacona w kraju pochodzenia / Carbon price paid in country of origin:</div>
          <div style={val} />
        </div>
        <div style={{ width: '130px', padding: '3px 5px', borderRight: b, minHeight: '32px' }}>
          <div style={lbl}>Waluta i kwota / Currency and amount:</div>
          <div style={val} />
        </div>
        <div style={{ width: '160px', padding: '3px 5px', minHeight: '32px' }}>
          <div style={lbl}>Podstawa prawna opłaty / Legal basis of the charge:</div>
          <div style={val} />
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Metoda ustalenia emisji / Method of determination:</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>&#9634; dane rzeczywiste / actual data &nbsp;&nbsp; &#9634; wartości domyślne / default values</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Weryfikator / Verifier:</div>
          <div style={val} />
        </div>
        <div style={{ width: '150px', padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Nr akredytacji / Accreditation No.:</div>
          <div style={val} />
        </div>
      </div>

      {/* PODPIS */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '54px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Osoba odpowiedzialna u dostawcy / Responsible person at supplier</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Imię, nazwisko, stanowisko / Name and position</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '54px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Miejsce, data i podpis / Place, date and signature</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis / Signature</div>
        </div>
      </div>

    </div>
  )
}
