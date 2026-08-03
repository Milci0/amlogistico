import { formatDocumentDate } from '../../../../utils/formatDate'

export function ZlecenieTemplate({ data }) {
  const isEn = data.language === 'EN'
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '12px' }
  const secHdr = { backgroundColor: '#2c5fa8', color: '#fff', fontWeight: 'bold', fontSize: '8px', padding: '4px 6px' }
  const today = formatDocumentDate(new Date())

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#1a3a6b', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '2px' }}>{isEn ? 'TRANSPORT ORDER' : 'ZLECENIE TRANSPORTOWE'}</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Transport Order · Frachtauftrag</div>
        </div>
        <div style={{ width: '150px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>{isEn ? 'Document No.:' : 'Nr dokumentu:'}</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
        </div>
      </div>

      {/* NR ZLECENIA | DATA | PRIORYTET */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '32px' }}>
          <div style={lbl}>{isEn ? 'Order No.:' : 'Nr zlecenia / Order No.:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '32px' }}>
          <div style={lbl}>{isEn ? 'Date:' : 'Data zlecenia / Date:'}</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '32px' }}>
          <div style={lbl}>{isEn ? 'Priority:' : 'Priorytet / Priority:'}</div>
          <div style={{ fontSize: '8px', marginTop: '2px' }}>{isEn ? <>&#9634; Standard &nbsp;&nbsp; &#9634; Express &nbsp;&nbsp; &#9634; Dedicated</> : <>&#9634; Standard &nbsp;&nbsp; &#9634; Ekspres &nbsp;&nbsp; &#9634; Dedykowany</>}</div>
        </div>
      </div>

      {/* ZLECENIODAWCA | PRZEWOŹNIK */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '55px' }}>
          <div style={lbl}>{isEn ? 'Shipper:' : 'Zleceniodawca / Shipper:'}</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '55px' }}>
          <div style={lbl}>{isEn ? 'Carrier:' : 'Przewoźnik / Carrier:'}</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.carrier?.name}</div>
          <div style={val}>{data.carrier?.address}</div>
        </div>
      </div>

      {/* NIP/VAT */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'VAT No.:' : 'NIP / VAT:'}</div>
          <div style={val}>{data.sender?.vat}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'VAT No.:' : 'NIP / VAT:'}</div>
          <div style={val}>{data.carrier?.vatNumber}</div>
        </div>
      </div>

      {/* OSOBA KONTAKTOWA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'Contact Person:' : 'Osoba kontaktowa:'}</div>
          <div style={val}>{data.sender?.contact}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'Contact Person / Driver:' : 'Osoba kontaktowa / kierowca:'}</div>
          <div style={val}>{data.carrier?.contact}</div>
        </div>
      </div>

      {/* TEL */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'Tel.:' : 'Tel.:'}</div>
          <div style={val}>{data.sender?.phone}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'Driver Phone:' : 'Tel. kierowcy / Driver phone:'}</div>
          <div style={val}>{data.carrier?.phone}</div>
        </div>
      </div>

      {/* SEKCJA: ZAŁADUNEK */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>{isEn ? 'LOADING DETAILS' : 'SZCZEGÓŁY ZAŁADUNKU / LOADING DETAILS'}</div>

      {/* ADRES ZAŁADUNKU | DATA I GODZINA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>{isEn ? 'Loading Address:' : 'Adres załadunku / Loading address:'}</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.fromCity}, {data.fromCountry}</div>
          <div style={val}>{data.sender?.address}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '40px' }}>
          <div style={lbl}>{isEn ? 'Loading Date & Time:' : 'Data i godzina załadunku / Loading date &amp; time:'}</div>
          <div style={{ ...val, marginTop: '2px' }}>{formatDocumentDate(data.loadDate)}</div>
        </div>
      </div>

      {/* OSOBA ZAŁADUNEK | REFERENCJA ZAŁADUNKOWA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>{isEn ? 'Contact Person at Loading Site:' : 'Osoba do kontaktu w miejscu załadunku:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>{isEn ? 'Loading Reference:' : 'Referencja załadunkowa / Reference:'}</div>
          <div style={val} />
        </div>
      </div>

      {/* ADRES ROZŁADUNKU | DATA DOSTAWY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>{isEn ? 'Delivery Address:' : 'Adres rozładunku / Delivery address:'}</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.toCity}, {data.toCountry}</div>
          <div style={val}>{data.receiver?.address}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '40px' }}>
          <div style={lbl}>{isEn ? 'Planned Delivery Date:' : 'Planowana data dostawy / Delivery date:'}</div>
          <div style={val} />
        </div>
      </div>

      {/* OSOBA DOSTAWY | REFERENCJA DOSTAWY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'Contact Person at Delivery Site:' : 'Osoba do kontaktu w miejscu dostawy:'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>{isEn ? 'Delivery Reference:' : 'Referencja dostawy / Reference:'}</div>
          <div style={val} />
        </div>
      </div>

      {/* SEKCJA: TOWAR */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>{isEn ? 'CARGO DESCRIPTION' : 'OPIS TOWARU / CARGO DESCRIPTION'}</div>

      {/* OPIS | WAGA | LDM | ILOŚĆ */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 2, padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>{isEn ? 'Cargo Description:' : 'Opis towaru / Cargo description:'}</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.cargo?.name}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>{isEn ? 'Gross Weight (kg):' : 'Waga brutto (kg):'}</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.cargo?.weight}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>{isEn ? 'Loading Metres (LDM):' : 'Metry ładunkowe (LDM):'}</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '40px' }}>
          <div style={lbl}>{isEn ? 'No. of Packages:' : 'Ilość opakowań:'}</div>
          <div style={{ ...val, marginTop: '2px' }}>
            {data.cargo?.packages}
            {data.cargo?.packageTypeName ? ` × ${isEn ? (data.cargo.packageTypeNameEn || data.cargo.packageTypeName) : data.cargo.packageTypeName}` : ''}
          </div>
        </div>
      </div>

      {/* TYP POJAZDU | TEMPERATURA | ADR | KLASA ADR */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>{isEn ? 'Vehicle Type:' : 'Typ pojazdu / Vehicle type:'}</div>
          {data.vehicle?.type
            ? <div style={{ ...val, fontWeight: 'bold', marginTop: '2px' }}>{isEn ? (data.vehicle.typeEn || data.vehicle.type) : `${data.vehicle.type}${data.vehicle?.typeEn ? ` / ${data.vehicle.typeEn}` : ''}`}</div>
            : <div style={{ fontSize: '8px', marginTop: '2px' }}>{isEn ? <>&#9634; Tarpaulin &nbsp; &#9634; Reefer &nbsp; &#9634; Freezer</> : <>&#9634; Plandeka/Tarpaulin &nbsp; &#9634; Chłodnia/Reefer &nbsp; &#9634; Mroźnia/Freezer</>}</div>}
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>{isEn ? 'Temp. (°C):' : 'Temperatura / Temp. (°C):'}</div>
          {(data.vehicle?.tempFrom || data.vehicle?.tempTo)
            ? <div style={{ fontSize: '8px', marginTop: '2px' }}>{isEn ? 'From' : 'Od'}: {data.vehicle.tempFrom}°C &nbsp; {isEn ? 'To' : 'Do'}: {data.vehicle.tempTo}°C</div>
            : <div style={{ fontSize: '8px', marginTop: '2px' }}>{isEn ? 'From' : 'Od'}: &nbsp;&nbsp;&nbsp; {isEn ? 'To' : 'Do'}:</div>}
        </div>
        <div style={{ width: '90px', padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>ADR:</div>
          {data.vehicle?.adr !== undefined
            ? <div style={{ fontSize: '8px', marginTop: '2px', fontWeight: 'bold' }}>{data.vehicle.adr ? (isEn ? '✓ Yes' : '✓ Tak') : (isEn ? '✗ No' : '✗ Nie')}</div>
            : <div style={{ fontSize: '8px', marginTop: '2px' }}>{isEn ? <>&#9634; Yes &nbsp; &#9634; No</> : <>&#9634; Tak &nbsp; &#9634; Nie</>}</div>}
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '36px' }}>
          <div style={lbl}>{isEn ? 'ADR Class / UN No.:' : 'Klasa ADR / UN Nr:'}</div>
          <div style={val}>{data.vehicle?.adrClass || ''}</div>
        </div>
      </div>

      {/* CENA FRACHTU | WALUTA | TERMIN PŁATNOŚCI | PODSTAWA FAKTURY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '32px' }}>
          <div style={lbl}>{isEn ? 'Freight Price:' : 'Cena frachtu / Freight price:'}</div>
          <div style={val}>{data.terms?.freightPrice || ''}</div>
        </div>
        <div style={{ width: '80px', padding: '3px 5px', borderRight: b, minHeight: '32px' }}>
          <div style={lbl}>{isEn ? 'Currency:' : 'Waluta / Currency:'}</div>
          <div style={val}>{data.terms?.freightCurrency || data.cargo?.currency}</div>
        </div>
        <div style={{ width: '130px', padding: '3px 5px', borderRight: b, minHeight: '32px' }}>
          <div style={lbl}>{isEn ? 'Payment Terms (days):' : 'Termin płatności / Payment terms (dni):'}</div>
          <div style={val}>{data.terms?.paymentDays || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '32px' }}>
          <div style={lbl}>{isEn ? 'Invoice Basis:' : 'Podstawa faktury / Invoice basis:'}</div>
          <div style={{ fontSize: '8px', marginTop: '2px' }}>{isEn ? <>&#9634; Net invoice &nbsp; &#9634; Invoice+VAT 23% &nbsp; &#9634; Other:</> : <>&#9634; FV netto &nbsp; &#9634; FV+VAT 23% &nbsp; &#9634; Inny:</>}</div>
        </div>
      </div>

      {/* UWAGI */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '3px 5px', minHeight: '40px' }}>
        <div style={lbl}>{isEn ? 'Special Requirements:' : 'Uwagi i wymagania specjalne / Special requirements:'}</div>
        <div style={{ ...val, marginTop: '2px' }}>{data.cargo?.notes}</div>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Shipper' : 'Zleceniodawca / Shipper'}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Podpis i pieczęć'}</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Carrier' : 'Przewoźnik / Carrier'}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Podpis i pieczęć'}</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>{isEn ? 'Accepted' : 'Data przyjęcia / Accepted'}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>{isEn ? 'Signature &amp; stamp' : 'Podpis i pieczęć'}</div>
        </div>
      </div>

    </div>
  )
}
