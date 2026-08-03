import { formatDocumentDate } from '../../../../utils/formatDate'

export function CimRailWaybillTemplate({ data }) {
  const today = formatDocumentDate(new Date())
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '20px' }}>
      {[35, null, 55, 40, 40, 55, 60].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>CIM — RAIL WAYBILL</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Rail Waybill · Lettre de Voiture Ferroviaire CIM</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>COTIF/CIM Convention — rail transport between OTIF member states (Europe, Middle East, Central Asia, North Africa).</div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Date:</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Railway of Departure:</div>
          <div style={val}>{data.carrier?.name || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Sender (name, address):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Consignee (name, address):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Station of departure:</div>
          <div style={val}>{data.fromCity || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Country:</div>
          <div style={val}>{data.fromCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Destination Station:</div>
          <div style={val}>{data.toCity || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Country:</div>
          <div style={val}>{data.toCountry || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Wagon No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Wagon Type:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Load Capacity (t):</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Container No.:</div>
          <div style={val}>{data.cargo?.containerNo || ''}</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>CARGO DESCRIPTION</span>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '35px' }}>No.</div>
        <div style={{ ...thStyle, flex: 1 }}>Description</div>
        <div style={{ ...thStyle, width: '55px' }}>HS Code</div>
        <div style={{ ...thStyle, width: '40px' }}>Qty</div>
        <div style={{ ...thStyle, width: '40px' }}>Unit</div>
        <div style={{ ...thStyle, width: '55px' }}>Weight (kg)</div>
        <div style={{ ...thStyle, width: '60px', borderRight: b }}>Value</div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '35px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode || ''}</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.quantity || ''}</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>pcs</div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight || ''}</div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'right' }}>{data.cargo?.value || ''}</div>
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Net Weight (kg):</div>
          <div style={val}>{data.cargo?.weightNet || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Gross Weight (kg):</div>
          <div style={val}>{data.cargo?.weight || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Packages:</div>
          <div style={val}>
            {data.cargo?.packages || ''}
            {data.cargo?.packageTypeName ? ` × ${data.cargo.packageTypeNameEn}` : ''}
          </div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Attached Documents:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Sender</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Railway</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Consignee</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Signature &amp; stamp</div>
        </div>
      </div>

    </div>
  )
}
