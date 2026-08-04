import { formatDocumentDate } from '../../../../utils/formatDate'

export function DeliveryOrderTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const secHdr = {
    backgroundColor: '#2c5fa8', padding: '4px 6px',
    fontSize: '8px', fontWeight: 'bold', color: '#fff',
  }

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#1a3a6b', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>ZLECENIE WYDANIA TOWARU / DELIVERY ORDER</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Polecenie wydania ładunku z terminalu lub składu / Instruction to release the cargo</div>
        </div>
        <div style={{ width: '160px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>Nr zlecenia / D/O No.:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#a0b8d8', marginTop: '4px' }}>Data wystawienia / Date of issue:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }}>{formatDocumentDate(new Date())}</div>
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#f5f7fa' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Zlecenie wystawia armator, agent lub spedytor w porcie przeznaczenia po przedstawieniu oryginału konosamentu
          albo zwolnieniu przesyłki przez linię. / Issued by the carrier, agent or forwarder at destination against surrender of the
          original Bill of Lading or release by the line.
        </span>
      </div>

      {/* WYSTAWCA I ADRESAT */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '54px' }}>
          <div style={lbl}>Wystawca (armator, agent, spedytor) / Issued by:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.carrier?.name || ''}</div>
          <div style={val}>{data.carrier?.address || ''}</div>
          <div style={val}>{data.carrier?.contact || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '54px' }}>
          <div style={lbl}>Adresat &mdash; terminal, skład lub magazyn / Addressed to (terminal, depot, warehouse):</div>
          <div style={{ ...val, marginTop: '2px' }} />
          <div style={val} />
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '54px' }}>
          <div style={lbl}>Towar wydać na rzecz / Release the cargo to:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
      </div>

      {/* PODSTAWA WYDANIA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>PODSTAWA WYDANIA / BASIS OF RELEASE</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr konosamentu / Bill of Lading No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr bookingu / Booking No.:</div>
          <div style={val}>{data.sea?.bookingNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Statek / Vessel:</div>
          <div style={val}>{data.cargo?.vessel || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Nr rejsu / Voyage No.:</div>
          <div style={val}>{data.cargo?.voyageNo || ''}</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Port wyładunku / Port of discharge:</div>
          <div style={val}>{data.toCity}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Miejsce dostawy / Place of delivery:</div>
          <div style={val}>{data.toCity}, {data.toCountry}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Data przybycia / Date of arrival:</div>
          <div style={val}>{formatDocumentDate(data.sea?.eta)}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Zlecenie ważne do / Order valid until:</div>
          <div style={val} />
        </div>
      </div>

      {/* ŁADUNEK DO WYDANIA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>ŁADUNEK DO WYDANIA / CARGO TO BE RELEASED</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr kontenera / Container No.:</div>
          <div style={{ ...val, fontWeight: 'bold' }}>{data.cargo?.containerNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Typ kontenera / Container type:</div>
          <div style={val}>{data.cargo?.containerType || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr plomby / Seal No.:</div>
          <div style={val}>{data.cargo?.sealNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Znaki i numery / Marks and Nos.:</div>
          <div style={val}>{data.cargo?.marksNos || ''}</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>Opis towaru / Description of goods:</div>
          <div style={val}>{data.cargo?.name}</div>
        </div>
        <div style={{ width: '100px', padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>Liczba opakowań / Packages:</div>
          <div style={val}>{data.cargo?.packages} {data.cargo?.packageTypeUnCode || ''}</div>
        </div>
        <div style={{ width: '100px', padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>Masa brutto (kg) / Gross weight:</div>
          <div style={val}>{data.cargo?.weight}</div>
        </div>
        <div style={{ width: '100px', padding: '3px 5px', minHeight: '34px' }}>
          <div style={lbl}>Objętość (m&sup3;) / Volume:</div>
          <div style={val}>{data.cargo?.volume}</div>
        </div>
      </div>

      {/* WARUNKI WYDANIA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '46px' }}>
          <div style={lbl}>Warunki wydania / Release conditions:</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>&#9634; Oryginał konosamentu zwrócony / Original B/L surrendered</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>&#9634; Odprawa celna zakończona / Customs clearance completed</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>&#9634; Należności uregulowane / Charges settled</div>
        </div>
        <div style={{ flex: 1, padding: '4px 6px', minHeight: '46px' }}>
          <div style={lbl}>Uwagi / Remarks:</div>
          <div style={{ ...val, minHeight: '30px' }}>{data.cargo?.notes || ''}</div>
        </div>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '58px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Wystawił / Issued by</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature and stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '58px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Odbiór towaru potwierdza / Cargo received by</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis / Signature</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '58px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Data i miejsce wydania / Date and place of release</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>&nbsp;</div>
        </div>
      </div>

    </div>
  )
}
