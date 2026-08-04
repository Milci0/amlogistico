import { formatDocumentDate } from '../../../../utils/formatDate'

export function CargoManifestSeaTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }
  // Szerokosci kolumn tabeli manifestu - jedno zrodlo dla naglowka i wierszy.
  const cols = [30, 85, 85, 70, null, 70, 60, 60]

  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '18px' }}>
      {cols.map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#1a3a6b', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>MANIFEST ŁADUNKOWY / CARGO MANIFEST</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Deklaracja ładunkowa statku / Cargo Declaration</div>
          <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Konwencja FAL IMO (Londyn, 09.04.1965) &middot; formularz FAL nr 2</div>
        </div>
        <div style={{ width: '150px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>Nr manifestu / Manifest No.:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#a0b8d8', marginTop: '4px' }}>Strona / Page:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }}>1</div>
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#f5f7fa' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Manifest kompletuje armator lub agent statku i składa go władzom portowym oraz celnym w porcie przybycia i wyjścia. /
          Compiled by the carrier or the ship agent and submitted to port and customs authorities on arrival and departure.
        </span>
      </div>

      {/* STATEK */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nazwa statku / Name of ship:</div>
          <div style={val}>{data.cargo?.vessel || ''}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr IMO / IMO number:</div>
          <div style={val} />
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Bandera / Flag State:</div>
          <div style={val}>{data.sea?.flag || ''}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Nr rejsu / Voyage No.:</div>
          <div style={val}>{data.cargo?.voyageNo || ''}</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Port załadunku / Port of loading:</div>
          <div style={val}>{data.fromCity}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Port wyładunku / Port of discharge:</div>
          <div style={val}>{data.toCity}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Data wyjścia / Date of departure:</div>
          <div style={val}>{formatDocumentDate(data.loadDate)}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Data przybycia / Date of arrival:</div>
          <div style={val}>{formatDocumentDate(data.sea?.eta)}</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Armator lub agent statku / Carrier or ship agent:</div>
          <div style={val}>{data.carrier?.name || ''}</div>
        </div>
        <div style={{ width: '220px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Kapitan / Master:</div>
          <div style={val} />
        </div>
      </div>

      {/* TABELA POZYCJI */}
      <div style={{ display: 'flex', borderLeft: b, marginTop: '6px' }}>
        <div style={{ ...thStyle, width: '30px' }}>Lp.<br />No.</div>
        <div style={{ ...thStyle, width: '85px' }}>Nr konosamentu<br />B/L No.</div>
        <div style={{ ...thStyle, width: '85px' }}>Znaki i numery<br />Marks and Nos.</div>
        <div style={{ ...thStyle, width: '70px' }}>Nr kontenera<br />Container No.</div>
        <div style={{ ...thStyle, flex: 1 }}>Rodzaj opakowań i opis towaru<br />Kind of packages, description of goods</div>
        <div style={{ ...thStyle, width: '70px' }}>Liczba opakowań<br />No. of packages</div>
        <div style={{ ...thStyle, width: '60px' }}>Masa brutto (kg)<br />Gross weight</div>
        <div style={{ ...thStyle, width: '60px', borderRight: b }}>Wymiary<br />Measurement</div>
      </div>

      {/* Wiersz z danymi przesyłki */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '30px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ width: '85px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '85px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.marksNos || ''}</div>
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.containerNo || ''}</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>
          {data.cargo?.packages} {data.cargo?.packageTypeUnCode || ''}
        </div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight}</div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.volume}</div>
      </div>

      {emptyRow}{emptyRow}{emptyRow}{emptyRow}{emptyRow}
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* PODSUMOWANIE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Łączna liczba pozycji / Total number of entries:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Łączna liczba opakowań / Total packages:</div>
          <div style={val}>{data.cargo?.packages}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Łączna masa brutto (kg) / Total gross weight:</div>
          <div style={val}>{data.cargo?.weight}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Towary niebezpieczne na pokładzie / Dangerous goods on board:</div>
          <div style={{ fontSize: '7.5px' }}>&#9634; TAK / YES &nbsp;&nbsp; &#9634; NIE / NO</div>
        </div>
      </div>

      {/* PODPIS */}
      <div style={{ display: 'flex', border: b, borderTop: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '58px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Miejsce i data / Place and date</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>&nbsp;</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '58px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Kapitan, armator lub agent / Master, carrier or agent</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis / Signature</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '58px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Pieczęć / Stamp</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>&nbsp;</div>
        </div>
      </div>

    </div>
  )
}
