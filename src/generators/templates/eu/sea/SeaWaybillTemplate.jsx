import { formatDocumentDate } from '../../../../utils/formatDate'

export function SeaWaybillTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '12px' }
  const TEAL = '#1a7070'
  const thStyle = {
    padding: '3px 5px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: TEAL, verticalAlign: 'top',
  }

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, backgroundColor: TEAL, padding: '8px 12px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', letterSpacing: '2px' }}>SEA WAYBILL</div>
        <div style={{ fontSize: '8px', color: '#a0d8d8', marginTop: '2px' }}>Morski List Przewozowy (bez oryginału) · Non-Negotiable</div>
        <div style={{ fontSize: '7px', color: '#ffe080', marginTop: '2px' }}>
          Odbiorca NIE potrzebuje oryginału — towar odbiera wskazana firma. Szybszy odbiór niż przy B/L.
        </div>
      </div>

      {/* SHIPPER | CONSIGNEE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '55px' }}>
          <div style={lbl}>Shipper / Załadowca:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '55px' }}>
          <div style={lbl}>Consignee (named) / Odbiorca (wskazany z nazwy):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
      </div>

      {/* NOTIFY PARTY | ISSUING CARRIER */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Notify Party:</div>
          <div style={val}>{data.receiver?.name}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Issuing Carrier / Armator:</div>
          <div style={val} />
        </div>
      </div>

      {/* VESSEL | VOYAGE | PORT OF LOADING | PORT OF DISCHARGE | ETD | ETA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Vessel / Statek:</div>
          <div style={val}>{data.cargo?.vessel}</div>
        </div>
        <div style={{ width: '80px', padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Voyage No.:</div>
          <div style={val}>{data.cargo?.voyageNo}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Port of Loading:</div>
          <div style={val}>{data.fromCity}, {data.fromCountry}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Port of Discharge:</div>
          <div style={val}>{data.toCity}, {data.toCountry}</div>
        </div>
        <div style={{ width: '70px', padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>ETD:</div>
          <div style={val}>{formatDocumentDate(data.loadDate)}</div>
        </div>
        <div style={{ width: '70px', padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>ETA:</div>
          <div style={val} />
        </div>
      </div>

      {/* SEKCJA: CARGO */}
      <div style={{ backgroundColor: TEAL, borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>CARGO</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b }}>
        <div style={{ ...thStyle, width: '110px' }}>Container No.</div>
        <div style={{ ...thStyle, width: '75px' }}>Seal No.</div>
        <div style={{ ...thStyle, width: '60px' }}>Type</div>
        <div style={{ ...thStyle, flex: 1 }}>Description of Goods</div>
        <div style={{ ...thStyle, width: '70px' }}>Gross Wt (kg)</div>
        <div style={{ ...thStyle, width: '55px' }}>CBM</div>
        <div style={{ ...thStyle, width: '110px', borderRight: b }}>Freight Terms</div>
      </div>

      {/* 4 wiersze z danymi + checkboxami */}
      {[
        { containerNo: data.cargo?.containerNo, sealNo: data.cargo?.sealNo, type: data.cargo?.containerType, desc: data.cargo?.name, wt: data.cargo?.weight, cbm: data.cargo?.volume },
        {}, {}, {},
      ].map((row, i) => (
        <div key={i} style={{ display: 'flex', borderLeft: b, minHeight: '28px' }}>
          <div style={{ width: '110px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{row.containerNo}</div>
          <div style={{ width: '75px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{row.sealNo}</div>
          <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{row.type}</div>
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{row.desc}</div>
          <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{row.wt}</div>
          <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{row.cbm}</div>
          <div style={{ width: '110px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: i === 0 && data.sea?.freightTerms ? '8px' : '7px', fontWeight: i === 0 && data.sea?.freightTerms ? 'bold' : 'normal' }}>
            {i === 0 && data.sea?.freightTerms ? data.sea.freightTerms : <span>&#9634; Prepaid &nbsp; &#9634; Collect</span>}
          </div>
        </div>
      ))}

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Carrier / Armator</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Date of Issue</div>
          <div style={{ fontSize: '9px', marginTop: '2px' }}>{formatDocumentDate(new Date())}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Consignee acknowledgment</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
      </div>

    </div>
  )
}
