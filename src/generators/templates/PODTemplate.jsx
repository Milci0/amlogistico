export function PODTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '12px' }
  const TEAL = '#1a5e4a'
  const thStyle = {
    padding: '3px 5px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: TEAL, verticalAlign: 'top',
  }
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '20px' }}>
      {[30, null, 90, 90, 50, 90].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: TEAL, padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>PROTOKÓŁ ODBIORU TOWARU</div>
          <div style={{ fontSize: '8px', color: '#a0d0c0', marginTop: '2px' }}>Proof of Delivery (POD) · Lieferschein</div>
        </div>
        <div style={{ width: '150px', padding: '6px 8px', backgroundColor: TEAL }}>
          <div style={{ ...lbl, color: '#a0d0c0' }}>Nr dokumentu:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
        </div>
      </div>

      {/* NR PROTOKOŁU | DATA I GODZINA | NR CMR */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Nr protokołu / POD No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Data i godzina dostawy / Delivery date &amp; time:</div>
          <div style={val}>{new Date().toLocaleDateString('pl-PL')}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Nr CMR / Transport order No.:</div>
          <div style={val} />
        </div>
      </div>

      {/* ADRES DOSTAWY | PRZEWOŹNIK */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '45px' }}>
          <div style={lbl}>Adres dostawy / Delivery address:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.toCity}, {data.toCountry}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '45px' }}>
          <div style={lbl}>Przewoźnik / Carrier:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
        </div>
      </div>

      {/* KIEROWCA | NR REJESTRACYJNY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Kierowca / Driver:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Nr rejestracyjny / Vehicle plate:</div>
          <div style={val} />
        </div>
      </div>

      {/* SEKCJA: OPIS TOWARU */}
      <div style={{ backgroundColor: TEAL, borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>OPIS DOSTARCZONEGO TOWARU / DELIVERED GOODS</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b }}>
        <div style={{ ...thStyle, width: '30px' }}>Lp.</div>
        <div style={{ ...thStyle, flex: 1 }}>Opis towaru / Description</div>
        <div style={{ ...thStyle, width: '90px' }}>Ilość zamówiona<br />Ordered qty</div>
        <div style={{ ...thStyle, width: '90px' }}>Ilość dostarczona<br />Delivered qty</div>
        <div style={{ ...thStyle, width: '50px' }}>Jedn.</div>
        <div style={{ ...thStyle, width: '90px', borderRight: b }}>Uwagi / Remarks</div>
      </div>

      {/* Wiersz z danymi */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '30px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages}</div>
        <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages}</div>
        <div style={{ width: '50px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>szt.</div>
        <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>

      {/* 6 pustych wierszy */}
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* STAN TOWARU */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '3px 5px' }}>
        <div style={lbl}>Stan towaru przy odbiorze / Condition of goods upon receipt:</div>
      </div>
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', fontSize: '8px' }}>
        &#9634; Bez zastrzeżeń / No exceptions &nbsp;&nbsp;&nbsp;&nbsp;
        &#9634; Z zastrzeżeniami / With exceptions (opis poniżej) &nbsp;&nbsp;&nbsp;&nbsp;
        &#9634; Odmowa odbioru / Refused (powód poniżej)
      </div>
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '3px 5px', minHeight: '32px' }}>
        <div style={lbl}>Opis zastrzeżeń / Exceptions description:</div>
        <div style={val} />
      </div>

      {/* PODPIS ODBIORCY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '50px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Odbiorca / Recipient:</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć odbiorcy / Recipient's signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '50px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Data / Date:</div>
          <div style={{ flex: 1 }} />
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '50px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }} />
        </div>
      </div>

      {/* PODPIS KIEROWCY */}
      <div style={{ display: 'flex', border: b, marginTop: '4px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '45px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Kierowca potwierdzający dostawę / Driver confirming delivery:</div>
          <div style={{ flex: 1 }} />
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '45px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Data / Date:</div>
          <div style={{ flex: 1 }} />
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '45px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Podpis kierowcy / Driver's signature:</div>
          <div style={{ flex: 1 }} />
        </div>
      </div>

    </div>
  )
}
