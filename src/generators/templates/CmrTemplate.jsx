const s = {
  page: { width: '794px', minHeight: '1123px', padding: '20px 24px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '9px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box' },
  title: { textAlign: 'center', fontSize: '13px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '6px', letterSpacing: '1px' },
  subtitle: { textAlign: 'center', fontSize: '9px', marginBottom: '8px', color: '#444' },
  row: { display: 'flex', borderLeft: '1px solid #000', borderTop: '1px solid #000' },
  cell: { borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 6px', minHeight: '50px' },
  label: { fontSize: '7px', color: '#555', marginBottom: '3px', textTransform: 'uppercase' },
  val: { fontSize: '10px', fontWeight: 'bold', minHeight: '14px' },
  val2: { fontSize: '9px', minHeight: '12px' },
  tableHead: { backgroundColor: '#e8e8e8', fontWeight: 'bold', fontSize: '8px', padding: '4px 6px', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'center' },
  td: { padding: '5px 6px', borderRight: '1px solid #000', borderBottom: '1px solid #000', fontSize: '9px' },
  sigBox: { borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '6px', minHeight: '60px' },
}

export function CmrTemplate({ data }) {
  const today = new Date().toLocaleDateString('pl-PL')

  return (
    <div style={s.page}>
      <div style={s.title}>INTERNATIONAL CONSIGNMENT NOTE — LIST PRZEWOZOWY (CMR)</div>
      <div style={s.subtitle}>Convention on the Contract for the International Carriage of Goods by Road</div>

      {/* Row 1: Sender | Consignee | (blank customs col) */}
      <div style={s.row}>
        <div style={{ ...s.cell, flex: 2 }}>
          <div style={s.label}>1. Nadawca / Sender (name, address, country)</div>
          <div style={s.val}>{data.sender?.name}</div>
          <div style={s.val2}>{data.sender?.address}</div>
          <div style={s.val2}>{data.sender?.country}</div>
          <div style={{ marginTop: '4px', ...s.val2 }}>NIP: {data.sender?.vat || '—'}</div>
        </div>
        <div style={{ ...s.cell, flex: 2 }}>
          <div style={s.label}>2. Odbiorca / Consignee (name, address, country)</div>
          <div style={s.val}>{data.receiver?.name}</div>
          <div style={s.val2}>{data.receiver?.address}</div>
          <div style={s.val2}>{data.receiver?.country}</div>
          <div style={{ marginTop: '4px', ...s.val2 }}>NIP: {data.receiver?.vat || '—'}</div>
        </div>
        <div style={{ ...s.cell, flex: 1, minHeight: '80px' }}>
          <div style={s.label}>Nr / No.</div>
          <div style={{ marginTop: '20px', fontSize: '7px', color: '#888', textAlign: 'center' }}>Przeznaczony<br/>dla organów celnych</div>
        </div>
      </div>

      {/* Row 2: Place of delivery */}
      <div style={s.row}>
        <div style={{ ...s.cell, flex: 1, minHeight: '36px' }}>
          <div style={s.label}>3. Miejsce wyznaczone do dostawy towaru / Place designated for delivery of goods</div>
          <div style={s.val}>{data.toCity}, {data.toCountry}</div>
        </div>
      </div>

      {/* Row 3: Loading place + date | Delivery docs */}
      <div style={s.row}>
        <div style={{ ...s.cell, flex: 2, minHeight: '40px' }}>
          <div style={s.label}>4. Miejsce i data załadowania towaru / Place and date of loading</div>
          <div style={s.val}>{data.fromCity}, {data.fromCountry}</div>
          <div style={s.val2}>{data.loadDate}</div>
        </div>
        <div style={{ ...s.cell, flex: 3, minHeight: '40px' }}>
          <div style={s.label}>5. Dołączone dokumenty / Documents attached</div>
          <div style={s.val2}>{data.cargo?.notes ? 'Faktura, Packing List' : 'Faktura, Packing List'}</div>
        </div>
      </div>

      {/* Goods table */}
      <div style={{ borderLeft: '1px solid #000', borderTop: '1px solid #000', marginTop: '0' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ ...s.tableHead, width: '40px' }}>Lp.</div>
          <div style={{ ...s.tableHead, width: '60px' }}>8. Szt.<br/>Pcs</div>
          <div style={{ ...s.tableHead, flex: 3 }}>9–10. Opis towaru / Description of goods</div>
          <div style={{ ...s.tableHead, width: '70px' }}>11. Kod HS<br/>HS Code</div>
          <div style={{ ...s.tableHead, width: '70px' }}>12. Waga brutto<br/>Gross weight kg</div>
          <div style={{ ...s.tableHead, width: '60px' }}>13. Objętość<br/>Volume m³</div>
        </div>
        <div style={{ display: 'flex', minHeight: '40px' }}>
          <div style={{ ...s.td, width: '40px', textAlign: 'center' }}>1</div>
          <div style={{ ...s.td, width: '60px', textAlign: 'center' }}>{data.cargo?.packages}</div>
          <div style={{ ...s.td, flex: 3 }}>{data.cargo?.name}</div>
          <div style={{ ...s.td, width: '70px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
          <div style={{ ...s.td, width: '70px', textAlign: 'center' }}>{data.cargo?.weight}</div>
          <div style={{ ...s.td, width: '60px', textAlign: 'center' }}>{data.cargo?.volume}</div>
        </div>
        <div style={{ display: 'flex', minHeight: '20px' }}>
          <div style={{ ...s.td, width: '40px' }}></div>
          <div style={{ ...s.td, width: '60px' }}></div>
          <div style={{ ...s.td, flex: 3 }}></div>
          <div style={{ ...s.td, width: '70px' }}></div>
          <div style={{ ...s.td, width: '70px' }}></div>
          <div style={{ ...s.td, width: '60px' }}></div>
        </div>
      </div>

      {/* Instructions */}
      <div style={s.row}>
        <div style={{ ...s.cell, flex: 1, minHeight: '50px' }}>
          <div style={s.label}>13. Uwagi i instrukcje nadawcy / Sender's instructions</div>
          <div style={s.val2}>{data.cargo?.notes || ''}</div>
        </div>
      </div>

      {/* Freight terms */}
      <div style={s.row}>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>15. Frachtowe do zapłacenia przez / Freight charges to be paid by</div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="checkbox" readOnly /> Nadawcę / Sender</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="checkbox" readOnly /> Odbiorcę / Consignee</label>
          </div>
        </div>
        <div style={{ ...s.cell, flex: 1 }}>
          <div style={s.label}>16. Przewoźnik / Carrier (name, address, country)</div>
          <div style={s.val2}></div>
        </div>
      </div>

      {/* Reservations */}
      <div style={s.row}>
        <div style={{ ...s.cell, flex: 1, minHeight: '30px' }}>
          <div style={s.label}>17. Zastrzeżenia i uwagi przewoźnika przy odbiorze towaru / Carrier's reservations and observations</div>
        </div>
      </div>

      {/* Signatures */}
      <div style={s.row}>
        <div style={{ ...s.sigBox, flex: 1 }}>
          <div style={s.label}>21. Wystawiono w / Established in</div>
          <div style={s.val2}>{data.fromCity}, dnia {today}</div>
          <div style={{ marginTop: '30px', borderTop: '1px solid #000', paddingTop: '4px', fontSize: '7px', color: '#666' }}>
            22. Podpis i pieczęć nadawcy / Signature and stamp of sender
          </div>
        </div>
        <div style={{ ...s.sigBox, flex: 1 }}>
          <div style={s.label}>Przewoźnik / Carrier</div>
          <div style={s.val2}></div>
          <div style={{ marginTop: '30px', borderTop: '1px solid #000', paddingTop: '4px', fontSize: '7px', color: '#666' }}>
            23. Podpis i pieczęć przewoźnika / Signature and stamp of carrier
          </div>
        </div>
        <div style={{ ...s.sigBox, flex: 1 }}>
          <div style={s.label}>Towar i dokumenty przyjęto / Goods and documents received</div>
          <div style={s.val2}></div>
          <div style={{ marginTop: '30px', borderTop: '1px solid #000', paddingTop: '4px', fontSize: '7px', color: '#666' }}>
            24. Podpis i pieczęć odbiorcy / Signature and stamp of consignee
          </div>
        </div>
      </div>
    </div>
  )
}
