import { formatDocumentDate } from '../../../../utils/formatDate'

export function BookingConfirmationTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const secHdr = {
    backgroundColor: '#2c5fa8', padding: '4px 6px',
    fontSize: '8px', fontWeight: 'bold', color: '#fff',
  }
  const cutOff = (label) => (
    <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
      <div style={lbl}>{label}</div>
      <div style={val} />
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#1a3a6b', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>POTWIERDZENIE BOOKINGU / BOOKING CONFIRMATION</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Potwierdzenie rezerwacji miejsca na statku / Confirmation of space reservation</div>
        </div>
        <div style={{ width: '160px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>Nr bookingu / Booking No.:</div>
          <div style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', minHeight: '14px' }}>{data.sea?.bookingNo || ''}</div>
          <div style={{ ...lbl, color: '#a0b8d8', marginTop: '4px' }}>Data / Date:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }}>{formatDocumentDate(new Date())}</div>
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#f5f7fa' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Dokument wystawia armator, linia żeglugowa lub NVOCC na podstawie przyjętej rezerwacji.
          Potwierdzenie nie zastępuje konosamentu ani morskiego listu przewozowego. /
          Issued by the carrier upon acceptance of the booking. It does not replace a Bill of Lading or Sea Waybill.
        </span>
      </div>

      {/* STRONY */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>STRONY / PARTIES</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '58px' }}>
          <div style={lbl}>Nadawca / Shipper:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '58px' }}>
          <div style={lbl}>Odbiorca / Consignee:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '58px' }}>
          <div style={lbl}>Przewoźnik / Carrier:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.carrier?.name || ''}</div>
          <div style={val}>{data.carrier?.address || ''}</div>
          <div style={val}>{data.carrier?.contact || ''}</div>
        </div>
      </div>

      {/* TRASA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>TRASA I STATEK / ROUTING AND VESSEL</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Miejsce przyjęcia / Place of receipt:</div>
          <div style={val}>{data.fromCity}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Port załadunku / Port of loading:</div>
          <div style={val}>{data.fromCity}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Port wyładunku / Port of discharge:</div>
          <div style={val}>{data.toCity}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Miejsce dostawy / Place of delivery:</div>
          <div style={val}>{data.toCity}</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Statek / Vessel:</div>
          <div style={val}>{data.cargo?.vessel || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr rejsu / Voyage No.:</div>
          <div style={val}>{data.cargo?.voyageNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Bandera / Flag:</div>
          <div style={val}>{data.sea?.flag || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Data załadunku / Loading date:</div>
          <div style={val}>{formatDocumentDate(data.loadDate)}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>ETA / ETA:</div>
          <div style={val}>{formatDocumentDate(data.sea?.eta)}</div>
        </div>
      </div>

      {/* ŁADUNEK */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>ŁADUNEK / CARGO</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>Opis towaru / Description of goods:</div>
          <div style={val}>{data.cargo?.name}</div>
          <div style={{ fontSize: '7px', color: '#666' }}>{data.cargo?.cargoType || ''}</div>
        </div>
        <div style={{ width: '80px', padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>Kod HS / HS Code:</div>
          <div style={val}>{data.cargo?.hsCode}</div>
        </div>
        <div style={{ width: '90px', padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>Liczba opakowań / Packages:</div>
          <div style={val}>{data.cargo?.packages} {data.cargo?.packageTypeUnCode || ''}</div>
        </div>
        <div style={{ width: '90px', padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>Masa brutto (kg) / Gross weight:</div>
          <div style={val}>{data.cargo?.weight}</div>
        </div>
        <div style={{ width: '80px', padding: '3px 5px', minHeight: '34px' }}>
          <div style={lbl}>Objętość (m&sup3;) / Volume:</div>
          <div style={val}>{data.cargo?.volume}</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Typ i liczba kontenerów / Container type and quantity:</div>
          <div style={val}>{data.cargo?.containerType || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr kontenera / Container No.:</div>
          <div style={val}>{data.cargo?.containerNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Warunki frachtu / Freight terms:</div>
          <div style={val}>{data.sea?.freightTerms || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Incoterms / Incoterms:</div>
          <div style={val}>{data.cargo?.incoterms || ''}</div>
        </div>
      </div>

      {/* TERMINY GRANICZNE */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>TERMINY GRANICZNE / CUT-OFF TIMES</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        {cutOff('Dokumentacja / Documentation cut-off:')}
        {cutOff('Deklaracja VGM / VGM cut-off:')}
        {cutOff('Dostarczenie ładunku / Cargo cut-off:')}
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Zgłoszenie celne / Customs cut-off:</div>
          <div style={val} />
        </div>
      </div>

      {/* UWAGI I PODPIS */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, minHeight: '62px' }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b }}>
          <div style={lbl}>Uwagi / Remarks:</div>
          <div style={{ ...val, minHeight: '40px' }}>{data.cargo?.notes || ''}</div>
        </div>
        <div style={{ width: '250px', padding: '5px 7px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Wystawił przewoźnik / Issued by carrier</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature and stamp</div>
        </div>
      </div>

    </div>
  )
}
