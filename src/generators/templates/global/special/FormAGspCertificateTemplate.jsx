export function FormAGspCertificateTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px',
    borderRight: b,
    borderBottom: b,
    fontSize: '7px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#2c5fa8',
    verticalAlign: 'top',
  }

  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '20px' }}>
      {[45, 65, null, 65, 60, 75].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>FORM A — GSP CERTIFICATE OF ORIGIN</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Świadectwo Pochodzenia Form A · Generalised System of Preferences</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Stosowane przez kraje rozwijające się do korzystania z preferencji GSP w UE, USA, Japonii, Kanadzie i innych krajach donatorach</div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          <strong>WAŻNE:</strong> Form A jest zastępowany przez REX (Registered Exporter System) w UE od 2017. Jednak
          wiele krajów nadal wymaga Form A lub akceptuje obie formy. Sprawdź wymagania konkretnego kraju donatora.
        </span>
      </div>

      {/* 1. EKSPORTER | TYTUŁ FORMULARZA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '55px' }}>
          <div style={lbl}>1. Goods consigned from (Exporter's name, address, country):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ width: '260px', padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#1a3a6b' }}>CERTIFICATE OF ORIGIN</div>
          <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#1a3a6b' }}>(Combined declaration and certificate) FORM A</div>
          <div style={{ fontSize: '7px', color: '#666', marginTop: '4px' }}>Issued in {data.fromCountry || '____________'} (country)</div>
          <div style={{ fontSize: '6.5px', color: '#999', marginTop: '2px' }}>See notes overleaf</div>
        </div>
      </div>

      {/* 2. GOODS CONSIGNED TO | 3. MEANS OF TRANSPORT */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '45px' }}>
          <div style={lbl}>2. Goods consigned to (Consignee's name, address, country):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '45px' }}>
          <div style={lbl}>3. Means of transport and route (as far as known):</div>
          <div style={val}>{data.transportMeans || ''}</div>
        </div>
      </div>

      {/* 4. FOR OFFICIAL USE */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, padding: '3px 5px', minHeight: '20px' }}>
        <div style={lbl}>4. For official use:</div>
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>GOODS DETAILS</span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '45px' }}>5. Item<br />number</div>
        <div style={{ ...thStyle, width: '65px' }}>6. Marks and<br />numbers</div>
        <div style={{ ...thStyle, flex: 1 }}>7. Number and kind of packages; description of goods</div>
        <div style={{ ...thStyle, width: '65px' }}>8. Origin<br />criterion</div>
        <div style={{ ...thStyle, width: '60px' }}>9. Gross<br />weight (kg)</div>
        <div style={{ ...thStyle, width: '75px', borderRight: b }}>10. Invoice<br />No. &amp; date</div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, minHeight: '22px' }}>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.marksNos || ''}</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>
          {data.cargo?.packages ? `${data.cargo.packages} pkg — ` : ''}{data.cargo?.name || ''}
        </div>
        <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight || ''}</div>
        <div style={{ width: '75px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}
      {emptyRow}

      {/* 11. CERTIFICATION | 12. DECLARATION */}
      <div style={{ display: 'flex', border: b, borderTop: 'none' }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>11. Certification:</div>
          <div style={{ fontSize: '6.5px', color: '#555', marginTop: '2px', lineHeight: '1.3' }}>
            It is hereby certified, on the basis of control carried out, that the declaration by the exporter is
            correct.
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '6.5px', color: '#555' }}>Place and date / Stamp</div>
        </div>
        <div style={{ flex: 1, padding: '4px 6px' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>12. Declaration by the exporter:</div>
          <div style={{ fontSize: '6.5px', color: '#555', marginTop: '2px', lineHeight: '1.3' }}>
            The undersigned hereby declares that the above details and statements are correct; that all the goods
            were produced in {data.fromCountry || '____________'} and that they comply with the origin requirements
            specified for those goods in the Generalised System of Preferences for goods exported
            to {data.toCountry || '____________'}.
          </div>
        </div>
      </div>

    </div>
  )
}
