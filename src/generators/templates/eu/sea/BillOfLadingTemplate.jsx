import { formatDocumentDate } from '../../../../utils/formatDate'

export function BillOfLadingTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '12px' }
  const thStyle = {
    padding: '3px 5px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '22px' }}>
      {[110, 75, 60, 70, null, 55, 75, 75].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )
  const today = formatDocumentDate(new Date())

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#1a3a6b', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', letterSpacing: '2px' }}>BILL OF LADING</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>ORIGINAL</div>
        </div>
        <div style={{ width: '220px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>B/L No.:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '12px', marginBottom: '4px' }} />
          <div style={{ ...lbl, color: '#a0b8d8' }}>B/L Type:</div>
          <div style={{ fontSize: '8px', color: '#d0e4f8', marginTop: '2px' }}>&#9634; Original (3 oryg.) &nbsp; &#9634; Sea Waybill &nbsp; &#9634; Telex Release</div>
        </div>
      </div>

      {/* SHIPPER | CONSIGNEE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '60px' }}>
          <div style={lbl}>Shipper:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '60px' }}>
          <div style={lbl}>Consignee:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
      </div>

      {/* NOTIFY PARTY | ALSO NOTIFY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '32px' }}>
          <div style={lbl}>Notify Party:</div>
          <div style={val}>{data.receiver?.name}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '32px' }}>
          <div style={lbl}>Also Notify:</div>
          <div style={val} />
        </div>
      </div>

      {/* VESSEL | VOYAGE | FLAG | FREIGHT TERMS */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 2, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Vessel:</div>
          <div style={val}>{data.cargo?.vessel}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Voyage No.:</div>
          <div style={val}>{data.cargo?.voyageNo}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Flag:</div>
          <div style={val}>{data.sea?.flag}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Freight Terms:</div>
          {data.sea?.freightTerms
            ? <div style={{ fontSize: '8px', marginTop: '2px', fontWeight: 'bold' }}>{data.sea.freightTerms}</div>
            : <div style={{ fontSize: '8px', marginTop: '2px' }}>&#9634; Prepaid &nbsp; &#9634; Collect</div>}
        </div>
      </div>

      {/* PORT OF LOADING | PORT OF DISCHARGE | PLACE OF DELIVERY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Port of Loading:</div>
          <div style={val}>{data.fromCity}, {data.fromCountry}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Port of Discharge:</div>
          <div style={val}>{data.toCity}, {data.toCountry}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Place of Delivery:</div>
          <div style={val}>{data.toCity}</div>
        </div>
      </div>

      {/* ETD | ETA | BOOKING NO */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>ETD:</div>
          <div style={val}>{formatDocumentDate(data.loadDate)}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>ETA:</div>
          <div style={val}>{data.sea?.eta ? formatDocumentDate(data.sea.eta) : ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Booking No.:</div>
          <div style={val}>{data.sea?.bookingNo || ''}</div>
        </div>
      </div>

      {/* SEKCJA: CARGO */}
      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>CARGO DETAILS</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b }}>
        <div style={{ ...thStyle, width: '110px' }}>Container No.</div>
        <div style={{ ...thStyle, width: '75px' }}>Seal No.</div>
        <div style={{ ...thStyle, width: '60px' }}>Type</div>
        <div style={{ ...thStyle, width: '70px' }}>Marks &amp; Nos</div>
        <div style={{ ...thStyle, flex: 1 }}>Description of Goods</div>
        <div style={{ ...thStyle, width: '55px' }}>Packages</div>
        <div style={{ ...thStyle, width: '75px' }}>Gross Weight (kg)</div>
        <div style={{ ...thStyle, width: '75px', borderRight: b }}>Measurement (m³)</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '22px' }}>
        <div style={{ width: '110px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.containerNo}</div>
        <div style={{ width: '75px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.sealNo}</div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.containerType}</div>
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.marksNos || ''}</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>
          {data.cargo?.packages} {data.cargo?.packageTypeUnCode}
        </div>
        <div style={{ width: '75px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight}</div>
        <div style={{ width: '75px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.volume}</div>
      </div>

      {/* 4 puste wiersze */}
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* FREIGHT & CHARGES */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b }}>
          <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#555' }}>Freight &amp; Charges:</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b }}>
          <div style={lbl}>Prepaid (USD):</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b }}>
          <div style={lbl}>Collect (USD):</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px' }}>
          <div style={lbl}>Place of Issue:</div>
          <div style={val}>{data.fromCity}</div>
        </div>
      </div>
      {(() => {
        const fv = data.terms?.freightPrice
          ? `${data.terms.freightPrice} ${data.terms.freightCurrency || data.cargo?.currency || ''}`
          : ''
        const isPrepaid = !data.sea?.freightTerms || data.sea.freightTerms === 'Prepaid'
        return [['Freight'], ['B/L Fee'], ['TOTAL']].map(([label], i) => (
          <div key={i} style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
            <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px', fontSize: '8px', fontWeight: i === 2 ? 'bold' : 'normal' }}>{label}</div>
            <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '22px', fontSize: '9px' }}>
              {i === 0 && isPrepaid && fv}
              {i === 1 && <div style={lbl}>Date of Issue:</div>}
              {i === 1 && <div style={val}>{today}</div>}
            </div>
            <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '22px', fontSize: '9px' }}>
              {i === 0 && !isPrepaid && fv}
            </div>
            <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }} />
          </div>
        ))
      })()}

      {/* PODPIS */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '3px 5px', minHeight: '50px' }}>
        <div style={lbl}>Signed for and on behalf of the Carrier / Master:</div>
        <div style={{ flex: 1, minHeight: '30px' }} />
      </div>
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '3px 5px', textAlign: 'center', fontSize: '7px', color: '#555' }}>
        As agent(s) for the Carrier
      </div>
      <div style={{ marginTop: '6px', fontSize: '7px', color: '#777', textAlign: 'center' }}>
        ONE of the Bills of Lading being accomplished, the others to stand void.
      </div>

    </div>
  )
}
