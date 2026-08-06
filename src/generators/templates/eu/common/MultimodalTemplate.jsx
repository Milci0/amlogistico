import { formatDocumentDate } from '../../../../utils/formatDate'

// Mapowanie trybu etapu (wartości silnika: 'road'|'sea'|'rail'|'air') na
// etykiety checkboxów TRANSPORT ROUTE — ta sama kolejność na każdym wierszu,
// niezależnie od roli (Pre/Main/On), zaznaczony ten, który pasuje do leg.mode.
const MODE_CHECKBOXES = [
  ['road', 'Road'],
  ['rail', 'Rail'],
  ['sea', 'Sea'],
  ['air', 'Air'],
]

export function MultimodalTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '12px' }
  const PURPLE = '#6b30a8'
  const thBlue = {
    padding: '3px 5px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }
  const today = formatDocumentDate(new Date())
  const emptyCargoRow = (
    <div style={{ display: 'flex', minHeight: '20px' }}>
      {[30, null, 65, 50, 45, 70, 80].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, backgroundColor: PURPLE, padding: '8px 12px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>MULTIMODAL TRANSPORT DOCUMENT</div>
        <div style={{ fontSize: '8px', color: '#d0b8f0', marginTop: '2px' }}>Combined Transport B/L</div>
        <div style={{ fontSize: '7px', color: '#ffe080', marginTop: '2px' }}>
          Used when cargo moves by more than one mode of transport (e.g. truck + vessel + rail). One document covers the entire route.
        </div>
      </div>

      {/* SHIPPER | CONSIGNEE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '45px' }}>
          <div style={lbl}>Shipper:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '45px' }}>
          <div style={lbl}>Consignee:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
      </div>

      {/* NOTIFY PARTY | MTO */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Notify Party:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>MTO (Multimodal Transport Operator):</div>
          <div style={val}>{data.carrier?.name}</div>
        </div>
      </div>

      {/* SEKCJA: TRASA */}
      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>TRANSPORT ROUTE</span>
      </div>

      {/* TABELA TRASY - NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b }}>
        <div style={{ ...thBlue, width: '140px' }}>Leg</div>
        <div style={{ ...thBlue, flex: 1 }}>Mode</div>
        <div style={{ ...thBlue, flex: 1 }}>Place of Receipt</div>
        <div style={{ ...thBlue, flex: 1 }}>POL</div>
        <div style={{ ...thBlue, flex: 1 }}>POD</div>
        <div style={{ ...thBlue, flex: 1 }}>Place of Delivery</div>
        <div style={{ ...thBlue, flex: 1 }}>Carrier</div>
        <div style={{ ...thBlue, width: '80px', borderRight: b }}>Estimated Time</div>
      </div>

      {/* WIERSZE TRASY — dynamiczne, po jednym na etap z Kroku „Towar" (patrz
          buildTransportLegRows w documentGeneration.js). Checkbox trybu
          zaznaczony wg leg.mode; Place of Receipt/Delivery tylko na skrajnych
          wierszach, POL/POD tylko na Main-carriage. */}
      {(data.carrierLegs?.rows || []).map((row, i) => (
        <div key={i} style={{ display: 'flex', borderLeft: b, minHeight: '30px' }}>
          <div style={{ width: '140px', padding: '3px 5px', borderRight: b, borderBottom: b, fontSize: '8px', fontWeight: 'bold' }}>{i + 1} — {row.label}</div>
          <div style={{ flex: 1, padding: '3px 5px', borderRight: b, borderBottom: b, fontSize: '8px' }}>
            {MODE_CHECKBOXES.map(([mode, text], j) => (
              <span key={mode}>{j > 0 && '  '}{row.mode === mode ? '▣' : '▢'} {text}</span>
            ))}
          </div>
          <div style={{ flex: 1, padding: '3px 5px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{row.placeOfReceipt}</div>
          <div style={{ flex: 1, padding: '3px 5px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{row.pol}</div>
          <div style={{ flex: 1, padding: '3px 5px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{row.pod}</div>
          <div style={{ flex: 1, padding: '3px 5px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{row.placeOfDelivery}</div>
          <div style={{ flex: 1, padding: '3px 5px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{row.carrierName}</div>
          <div style={{ width: '80px', padding: '3px 5px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        </div>
      ))}

      {/* TABELA ŁADUNKU NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b, marginTop: '0' }}>
        <div style={{ ...thBlue, width: '30px' }}>No.</div>
        <div style={{ ...thBlue, flex: 1 }}>Description</div>
        <div style={{ ...thBlue, width: '65px' }}>HS Code</div>
        <div style={{ ...thBlue, width: '50px' }}>Qty</div>
        <div style={{ ...thBlue, width: '45px' }}>Unit</div>
        <div style={{ ...thBlue, width: '70px' }}>Weight (kg)</div>
        <div style={{ ...thBlue, width: '80px', borderRight: b }}>Value</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '30px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
        <div style={{ width: '50px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages}</div>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packageTypeUnCode || 'pcs'}</div>
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight}</div>
        <div style={{ width: '80px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'right' }}>{data.cargo?.value} {data.cargo?.currency}</div>
      </div>

      {/* 4 puste wiersze */}
      {emptyCargoRow}{emptyCargoRow}{emptyCargoRow}{emptyCargoRow}

      {/* B/L TYPE | DOCUMENT NO | DATE OF ISSUE | PLACE OF ISSUE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>B/L Type:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Document No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Date of Issue:</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Place of Issue:</div>
          <div style={val}>{data.fromCity}</div>
        </div>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>MTO / Operator</div>
          <div style={{ fontSize: '9px', marginTop: '2px' }}>{data.carrier?.name}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Shipper</div>
          <div style={{ fontSize: '9px', marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Date</div>
          <div style={{ fontSize: '9px', marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Signature &amp; stamp</div>
        </div>
      </div>

    </div>
  )
}
