import { formatDocumentDate } from '../../../../utils/formatDate'

export function EmcsEadTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const secHdr = {
    backgroundColor: '#2c5fa8', padding: '4px 6px',
    fontSize: '8px', fontWeight: 'bold', color: '#fff',
  }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '18px' }}>
      {[30, null, 90, 70, 70, 70, 70].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#1a3a6b', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>e-AD / e-SAD — DOKUMENT ADMINISTRACYJNY</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Electronic Administrative Document &middot; system EMCS</div>
          <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Dyrektywa (UE) 2020/262 &middot; ustawa o podatku akcyzowym</div>
        </div>
        <div style={{ width: '175px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>ARC (nadaje system EMCS):</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#a0b8d8', marginTop: '4px' }}>Data i godzina wysyłki:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }}>{formatDocumentDate(data.loadDate)}</div>
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Numer ARC nadaje system EMCS po przyjęciu projektu dokumentu; nie da się go wpisać wcześniej.
          e-AD towarzyszy wyrobom akcyzowym w procedurze zawieszenia poboru akcyzy, e-SAD przemieszczeniom
          wyrobów z zapłaconą akcyzą między państwami członkowskimi.
        </span>
      </div>

      {/* RODZAJ PRZEMIESZCZENIA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '30px' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>Rodzaj dokumentu / Document type:</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>
            &#9634; e-AD (zawieszenie poboru akcyzy) &nbsp;&nbsp; &#9634; e-SAD (akcyza zapłacona)
          </div>
        </div>
        <div style={{ width: '260px', padding: '4px 6px', minHeight: '30px' }}>
          <div style={lbl}>Kod rodzaju przemieszczenia / Destination type code:</div>
          <div style={val} />
        </div>
      </div>

      {/* STRONY */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>PODMIOTY / OPERATORS</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '58px' }}>
          <div style={lbl}>Wysyłający / Consignor:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={{ ...lbl, marginTop: '2px' }}>Nr akcyzowy SEED / Excise number:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '58px' }}>
          <div style={lbl}>Odbiorca / Consignee:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={{ ...lbl, marginTop: '2px' }}>Nr akcyzowy SEED / Excise number:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '58px' }}>
          <div style={lbl}>Miejsce wysyłki / Place of dispatch:</div>
          <div style={val}>{data.fromCity}, {data.fromCountry}</div>
          <div style={{ ...lbl, marginTop: '4px' }}>Miejsce dostawy / Place of delivery:</div>
          <div style={val}>{data.toCity}, {data.toCountry}</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Urząd celno-skarbowy wysyłki / Office of dispatch:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Gwarant / Guarantor:</div>
          <div style={val} />
        </div>
        <div style={{ width: '170px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Rodzaj gwarancji / Guarantee type:</div>
          <div style={val} />
        </div>
      </div>

      {/* TRANSPORT */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>TRANSPORT / TRANSPORT DETAILS</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ width: '150px', padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Gałąź transportu / Mode:</div>
          <div style={val}>{data.transport}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Organizator transportu / Transport arranger:</div>
          <div style={val}>{data.carrier?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Identyfikacja środka transportu / Identity of transport:</div>
          <div style={val}>{data.vehicle?.reg || data.cargo?.vessel || ''}</div>
        </div>
        <div style={{ width: '120px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Czas przewozu / Journey time:</div>
          <div style={val} />
        </div>
      </div>

      {/* WYROBY AKCYZOWE */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>WYROBY AKCYZOWE / EXCISE PRODUCTS</div>
      <div style={{ display: 'flex', borderLeft: b }}>
        <div style={{ ...thStyle, width: '30px' }}>Lp.<br />No.</div>
        <div style={{ ...thStyle, flex: 1 }}>Opis wyrobu<br />Description</div>
        <div style={{ ...thStyle, width: '90px' }}>Kod wyrobu akcyz.<br />Excise product code</div>
        <div style={{ ...thStyle, width: '70px' }}>Kod CN<br />CN code</div>
        <div style={{ ...thStyle, width: '70px' }}>Ilość<br />Quantity</div>
        <div style={{ ...thStyle, width: '70px' }}>Masa brutto (kg)<br />Gross mass</div>
        <div style={{ ...thStyle, width: '70px', borderRight: b }}>Masa netto (kg)<br />Net mass</div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '30px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages}</div>
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight}</div>
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weightNet || ''}</div>
      </div>
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* ZNAKI AKCYZY I PODPIS */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Znaki akcyzy / Fiscal marks:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Nr opakowań i plomb / Packages and seals:</div>
          <div style={val}>{data.cargo?.sealNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Uwagi / Remarks:</div>
          <div style={val}>{data.cargo?.notes || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '54px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Osoba składająca projekt e-AD / Person submitting the draft</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Imię, nazwisko, podpis</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '54px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Adnotacje organu / Authority endorsement</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Data, podpis, pieczęć</div>
        </div>
      </div>

    </div>
  )
}
