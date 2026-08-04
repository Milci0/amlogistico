import { formatDocumentDate } from '../../../../utils/formatDate'

export function AirCargoManifestTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }
  const cols = [28, 85, 85, 45, 60, null, 90, 60]

  const emptyRow = (key) => (
    <div key={key} style={{ display: 'flex', minHeight: '18px' }}>
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
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>MANIFEST LOTNICZY</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Air Cargo Manifest &middot; wykaz ładunku na pokładzie</div>
          <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Załącznik 9 do Konwencji chicagowskiej (1944)</div>
        </div>
        <div style={{ width: '160px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>Nr manifestu / Manifest No.:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#a0b8d8', marginTop: '4px' }}>Strona / Page:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }}>1</div>
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#f5f7fa' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Manifest kompletuje przewoźnik lotniczy lub agent obsługi naziemnej i przedstawia go organom celnym
          oraz lotniskowym w porcie odlotu i przylotu.
        </span>
      </div>

      {/* LOT */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Przewoźnik / Operator:</div>
          <div style={val}>{data.carrier?.name || ''}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Nr lotu / Flight No.:</div>
          <div style={val} />
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Znaki statku / Aircraft registration:</div>
          <div style={val} />
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Data lotu / Flight date:</div>
          <div style={val}>{formatDocumentDate(data.loadDate)}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Typ statku / Aircraft type:</div>
          <div style={val} />
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Lotnisko załadunku / Airport of loading:</div>
          <div style={val}>{data.air?.airportFrom || data.fromCity}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Lotnisko wyładunku / Airport of unloading:</div>
          <div style={val}>{data.air?.airportTo || data.toCity}</div>
        </div>
        <div style={{ width: '150px', padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Agent obsługi naziemnej / Handling agent:</div>
          <div style={val} />
        </div>
        <div style={{ width: '150px', padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Miejsce sporządzenia / Place of issue:</div>
          <div style={val} />
        </div>
      </div>

      {/* TABELA */}
      <div style={{ display: 'flex', borderLeft: b, marginTop: '6px' }}>
        <div style={{ ...thStyle, width: '28px' }}>Lp.<br />No.</div>
        <div style={{ ...thStyle, width: '85px' }}>Nr MAWB<br />MAWB No.</div>
        <div style={{ ...thStyle, width: '85px' }}>Nr HAWB<br />HAWB No.</div>
        <div style={{ ...thStyle, width: '45px' }}>Sztuk<br />Pieces</div>
        <div style={{ ...thStyle, width: '60px' }}>Masa (kg)<br />Weight</div>
        <div style={{ ...thStyle, flex: 1 }}>Rodzaj towaru<br />Nature of goods</div>
        <div style={{ ...thStyle, width: '90px' }}>Nadawca / odbiorca<br />Shipper / consignee</div>
        <div style={{ ...thStyle, width: '60px', borderRight: b }}>Kody obsługi<br />Handling codes</div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, minHeight: '22px' }}>
        <div style={{ width: '28px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ width: '85px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '85px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages}</div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight}</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '7.5px' }}>
          {data.sender?.name}<br />{data.receiver?.name}
        </div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => emptyRow(`row-${i}`))}

      {/* PODSUMOWANIE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Łączna liczba listów przewozowych / Total waybills:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Łączna liczba sztuk / Total pieces:</div>
          <div style={val}>{data.cargo?.packages}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Łączna masa (kg) / Total weight:</div>
          <div style={val}>{data.cargo?.weight}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Towary niebezpieczne na pokładzie / Dangerous goods on board:</div>
          <div style={{ fontSize: '7.5px' }}>&#9634; TAK / YES &nbsp; &#9634; NIE / NO</div>
        </div>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '54px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Sporządził / Prepared by</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Imię, nazwisko, podpis</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '54px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Przewoźnik lub agent / Carrier or agent</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '54px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Adnotacje urzędu celnego / Customs endorsement</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Data, podpis, pieczęć</div>
        </div>
      </div>

    </div>
  )
}
