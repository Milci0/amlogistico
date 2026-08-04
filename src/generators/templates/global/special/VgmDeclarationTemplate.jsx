import { formatDocumentDate } from '../../../../utils/formatDate'

export function VgmDeclarationTemplate({ data }) {
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
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>DEKLARACJA VGM / VGM DECLARATION</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Zweryfikowana masa brutto kontenera / Verified Gross Mass of a packed container</div>
          <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Konwencja SOLAS, rozdz. VI praw. 2 &middot; MSC.1/Circ.1475</div>
        </div>
        <div style={{ width: '150px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>Nr deklaracji / Declaration No.:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#a0b8d8', marginTop: '4px' }}>Data / Date:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }}>{formatDocumentDate(data.loadDate)}</div>
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Deklaracja dotyczy każdego zapakowanego kontenera i jest przekazywana przewoźnikowi oraz terminalowi przed załadunkiem na statek.
          Wystawia ją nadawca wskazany w konosamencie. / Required for every packed container, submitted to the carrier and the terminal before loading.
        </span>
      </div>

      {/* NADAWCA (SHIPPER) */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>NADAWCA WEDŁUG KONOSAMENTU / SHIPPER NAMED ON THE BILL OF LADING</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '46px' }}>
          <div style={lbl}>Nazwa i adres / Name and address:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ width: '250px', padding: '3px 5px', minHeight: '46px' }}>
          <div style={lbl}>Nr VAT / EORI / VAT / EORI No.:</div>
          <div style={val}>{data.sender?.vat || ''}</div>
          <div style={{ ...lbl, marginTop: '4px' }}>Nr bookingu / Booking No.:</div>
          <div style={val}>{data.sea?.bookingNo || ''}</div>
        </div>
      </div>

      {/* KONTENER */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>KONTENER / CONTAINER</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr kontenera / Container No.:</div>
          <div style={{ ...val, fontWeight: 'bold' }}>{data.cargo?.containerNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Typ i rozmiar / Type and size:</div>
          <div style={val}>{data.cargo?.containerType || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr plomby / Seal No.:</div>
          <div style={val}>{data.cargo?.sealNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Masa własna kontenera (kg) / Tare mass (kg):</div>
          <div style={val} />
        </div>
      </div>

      {/* MASA ZWERYFIKOWANA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>ZWERYFIKOWANA MASA BRUTTO / VERIFIED GROSS MASS</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ width: '230px', padding: '5px 6px', borderRight: b, minHeight: '46px' }}>
          <div style={lbl}>VGM &mdash; masa zweryfikowana (kg) / Verified gross mass (kg):</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', minHeight: '20px', marginTop: '2px' }}>{data.cargo?.weight || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '5px 6px', minHeight: '46px' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>Metoda ustalenia masy / Method used:</div>
          <div style={{ fontSize: '7.5px', marginTop: '3px' }}>
            &#9634; <strong>Metoda 1</strong> &mdash; ważenie zapakowanego kontenera w całości / weighing the packed container
          </div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>
            &#9634; <strong>Metoda 2</strong> &mdash; sumowanie mas ładunku, opakowań, mocowań i masy własnej kontenera / calculation
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Data i godzina ważenia / Date and time of weighing:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Miejsce ważenia / Place of weighing:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Nr świadectwa wagi / Weighing certificate No.:</div>
          <div style={val} />
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Podmiot ważący (nazwa i adres) / Weighing party (name and address):</div>
          <div style={val} />
        </div>
        <div style={{ width: '250px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Nr certyfikacji urządzenia / Equipment certification No.:</div>
          <div style={val} />
        </div>
      </div>

      {/* PRZESYŁKA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>PRZESYŁKA / SHIPMENT</div>
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
          <div style={lbl}>Port załadunku / Port of loading:</div>
          <div style={val}>{data.fromCity}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Port wyładunku / Port of discharge:</div>
          <div style={val}>{data.toCity}</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Przewoźnik / Carrier:</div>
          <div style={val}>{data.carrier?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Terminal / Terminal:</div>
          <div style={val} />
        </div>
      </div>

      {/* OSOBA UPOWAŻNIONA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b, backgroundColor: '#1a3a6b' }}>
        OSOBA UPOWAŻNIONA PRZEZ NADAWCĘ / PERSON AUTHORISED BY THE SHIPPER
      </div>
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '6.5px', color: '#555' }}>
          Deklarację podpisuje imiennie osoba upoważniona przez nadawcę. Podpis nieczytelny lub sama pieczęć firmowa nie spełniają wymogu MSC.1/Circ.1475. /
          The declaration is signed by a named person authorised by the shipper.
        </span>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, minHeight: '58px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Imię i nazwisko / Full name</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>drukowanymi / in block letters</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Stanowisko / Position</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>&nbsp;</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Miejsce, data i podpis / Place, date and signature</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis / Signature</div>
        </div>
      </div>

    </div>
  )
}
