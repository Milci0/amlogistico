import { formatDocumentDate } from '../../../../utils/formatDate'

export function HawbTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '18px' }}>
      {[45, 60, 55, 60, null, 70].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#1a3a6b', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>HOUSE AIR WAYBILL (HAWB)</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Lotniczy list przewozowy spedytora &middot; przesyłka w konsolidacji</div>
          <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Konwencja montrealska (1999), art. 4-11</div>
        </div>
        <div style={{ width: '175px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>Nr HAWB / HAWB No.:</div>
          <div style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#a0b8d8', marginTop: '4px' }}>Nr MAWB / MAWB No.:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#f5f7fa' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          HAWB wystawia spedytor dla pojedynczego nadawcy w przesyłce konsolidowanej. Przewoźnik lotniczy wystawia
          osobno MAWB na całą konsolidację. Dokument nie jest papierem wartościowym &mdash; wskazany odbiorca może
          odebrać towar bez okazywania oryginału.
        </span>
      </div>

      {/* NADAWCA | ODBIORCA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '54px' }}>
          <div style={lbl}>Nadawca / Shipper (nazwa, adres, kraj, tel.):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}, {data.sender?.country}</div>
          <div style={val}>{data.sender?.phone || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '54px' }}>
          <div style={lbl}>Odbiorca / Consignee (nazwa, adres, kraj, tel.):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}, {data.receiver?.country}</div>
          <div style={val} />
        </div>
      </div>

      {/* SPEDYTOR */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>Spedytor wystawiający / Issuing forwarder:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.carrier?.name || ''}</div>
          <div style={val}>{data.carrier?.address || ''}</div>
        </div>
        <div style={{ width: '160px', padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>Nr agenta IATA / IATA agent No.:</div>
          <div style={val} />
        </div>
        <div style={{ width: '160px', padding: '3px 5px', minHeight: '40px' }}>
          <div style={lbl}>Nr konsolidacji / Consolidation ref.:</div>
          <div style={val}>{data.air?.consolidated ? 'przesyłka konsolidowana' : ''}</div>
        </div>
      </div>

      {/* TRASA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Lotnisko wylotu / Airport of departure:</div>
          <div style={val}>{data.air?.airportFrom || data.fromCity}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Lotnisko przeznaczenia / Airport of destination:</div>
          <div style={val}>{data.air?.airportTo || data.toCity}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Nr lotu / Flight No.:</div>
          <div style={val} />
        </div>
        <div style={{ width: '110px', padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Data / Date:</div>
          <div style={val}>{formatDocumentDate(data.loadDate)}</div>
        </div>
      </div>

      {/* TABELA POZYCJI */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '45px' }}>Liczba sztuk<br />Pieces</div>
        <div style={{ ...thStyle, width: '60px' }}>Masa brutto<br />Gross weight</div>
        <div style={{ ...thStyle, width: '55px' }}>Jedn.<br />kg / lb</div>
        <div style={{ ...thStyle, width: '60px' }}>Masa taryfowa<br />Chargeable wt.</div>
        <div style={{ ...thStyle, flex: 1 }}>Rodzaj i ilość towaru (wymiary, objętość)<br />Nature and quantity of goods</div>
        <div style={{ ...thStyle, width: '70px', borderRight: b }}>Kod HS<br />HS code</div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, minHeight: '22px' }}>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages}</div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>kg</div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.air?.chargeableWeightKg || ''}</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
      </div>
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* WARTOŚCI I OPŁATY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Wartość zadeklarowana dla przewozu / Declared value for carriage:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Wartość zadeklarowana dla cła / Declared value for customs:</div>
          <div style={val}>{data.cargo?.value} {data.cargo?.currency}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Kwota ubezpieczenia / Amount of insurance:</div>
          <div style={val} />
        </div>
        <div style={{ width: '140px', padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Opłaty / Charges:</div>
          <div style={{ fontSize: '7.5px' }}>&#9634; PREPAID &nbsp; &#9634; COLLECT</div>
        </div>
      </div>

      {/* INFORMACJE OBSŁUGOWE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '38px' }}>
          <div style={lbl}>Informacje obsługowe / Handling information:</div>
          <div style={val}>{data.cargo?.notes || ''}</div>
        </div>
        <div style={{ width: '200px', padding: '3px 5px', minHeight: '38px' }}>
          <div style={lbl}>Towary niebezpieczne / Dangerous goods:</div>
          <div style={{ fontSize: '7.5px' }}>&#9634; TAK / YES &nbsp; &#9634; NIE / NO</div>
          <div style={{ fontSize: '6px', color: '#777', marginTop: '2px' }}>przy TAK wymagana deklaracja IATA DGR</div>
        </div>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '58px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Podpis nadawcy lub jego agenta / Signature of shipper or agent</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis / Signature</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '58px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Miejsce, data i podpis spedytora / Place, date, signature of forwarder</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
      </div>

    </div>
  )
}
