import { formatDocumentDate } from '../../../../utils/formatDate'

export function CitesPermitTemplate({ data }) {
  const today = formatDocumentDate(new Date())
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '6.5px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '20px' }}>
      {[55, 100, 90, 55, 40, 35, 65, 45, null].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>ZEZWOLENIE CITES</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>CITES Export / Import Permit · Konwencja Waszyngtońska 1973 · Rozporządzenie UE 338/97</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Towary chronione: skóry egzotyczne, drewno tropikalne, kość słoniowa, koralowce, orchidee — ponad 38 000 gatunków</div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          <strong>WAŻNE:</strong> Handel towarami CITES bez zezwolenia = przestępstwo w 183 krajach. Konfiskata
          towaru + kara finansowa + możliwość pozbawienia wolności. Weryfikuj każdy towar zawierający materiały
          naturalne.
        </span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Nr zezwolenia / Permit No.:</div>
          <div style={val}>{data.customs?.permitNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Typ / Type:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Data wydania / Issue date:</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Ważne do / Valid until:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Organ wystawiający / Management Authority:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Kraj / Country:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '5px 5px', borderRight: b, fontSize: '8px' }}>☐ Export Permit<br />Zezwolenie eksportowe</div>
        <div style={{ flex: 1, padding: '5px 5px', borderRight: b, fontSize: '8px' }}>☐ Import Permit<br />Zezwolenie importowe</div>
        <div style={{ flex: 1, padding: '5px 5px', borderRight: b, fontSize: '8px' }}>☐ Re-export Certificate<br />Świadectwo reeksportu</div>
        <div style={{ flex: 1, padding: '5px 5px', fontSize: '8px' }}>☐ Introduction from the Sea<br />Wprowadzenie z morza</div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Eksporter (nazwa, adres, kraj):</div>
          <div style={val}>{data.sender?.name}, {data.sender?.address}, {data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Nr rejestracji CITES eksportera:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Importer (nazwa, adres, kraj):</div>
          <div style={val}>{data.receiver?.name}, {data.receiver?.address}, {data.receiver?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Nr rejestracji CITES importera:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Country of export:</div>
          <div style={val}>{data.fromCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Kraj importu / Country of import:</div>
          <div style={val}>{data.toCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Kraj pochodzenia / Country of origin:</div>
          <div style={val}>{data.fromCountry || ''}</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>OPIS TOWARU / DESCRIPTION OF SPECIMENS</span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '55px' }}>Appendix<br />(I/II/III)</div>
        <div style={{ ...thStyle, width: '100px' }}>Nazwa naukowa gatunku<br />Scientific name</div>
        <div style={{ ...thStyle, width: '90px' }}>Nazwa zwyczajowa<br />Common name</div>
        <div style={{ ...thStyle, width: '55px' }}>Kod CITES<br />(opis)</div>
        <div style={{ ...thStyle, width: '40px' }}>Ilość<br />Quantity</div>
        <div style={{ ...thStyle, width: '35px' }}>Jedn.<br />Unit</div>
        <div style={{ ...thStyle, width: '65px' }}>Opis<br />(żywe/martwe/część)</div>
        <div style={{ ...thStyle, width: '45px' }}>Cel<br />Purpose</div>
        <div style={{ ...thStyle, flex: 1, borderRight: b }}>Źródło<br />Source</div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>☐I ☐II ☐III</div>
        <div style={{ width: '100px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.quantity || ''}</div>
        <div style={{ width: '35px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}
      {emptyRow}

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b }}>
          <div style={lbl}>KODY CELU / PURPOSE CODES:</div>
          <div style={{ fontSize: '6.5px', color: '#555', marginTop: '2px' }}>
            B=hodowla E=edukacja G=ogród bot./zoo H=trofeum myśliwskie L=prawo M=lek N=reintrodukcja
            P=osobisty Q=cyrk S=nauka T=handel Z=zoo
          </div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px' }}>
          <div style={lbl}>KODY ŹRÓDŁA / SOURCE CODES:</div>
          <div style={{ fontSize: '6.5px', color: '#555', marginTop: '2px' }}>
            A=hodowla C=hodowla D=Appendix I F=dziko złowione G=ogród bot. I=skonfiskowane O=morze R=ranczo
            U=nieznane W=dziko złowione
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Organ zarządzający CITES (Management Authority — Polska: GDOŚ)</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Signature &amp; stamp / Podpis i pieczęć</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Upoważniony pracownik / Authorized signatory</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Signature &amp; stamp / Podpis i pieczęć</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Data / Date</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Pieczęć urzędowa / Official stamp</div>
          <div style={{ flex: 1 }} />
        </div>
      </div>

    </div>
  )
}
