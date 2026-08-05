import { formatDocumentDate } from '../../../../utils/formatDate'

export function SentNotificationTemplate({ data }) {
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
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>ZGŁOSZENIE SENT</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>System monitorowania drogowego i kolejowego przewozu towarów</div>
          <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Ustawa z 09.03.2017 &middot; rejestr SENT na platformie PUESC</div>
        </div>
        <div style={{ width: '175px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>Nr referencyjny SENT (nadaje rejestr):</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#a0b8d8', marginTop: '4px' }}>Data zgłoszenia:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, padding: '5px 7px', backgroundColor: '#fffbe6', borderTop: b }}>
        <div style={{ fontSize: '7.5px', fontWeight: 'bold', color: '#7c2d12', marginBottom: '2px' }}>
          Obowiązek wynika z RODZAJU TOWARU, nie z trasy.
        </div>
        <div style={{ fontSize: '6.5px', color: '#555', lineHeight: '1.5' }}>
          Zgłoszenie jest wymagane także przy przewozie wyłącznie krajowym, bez przekraczania granicy.
          Numer referencyjny nadaje rejestr SENT po przyjęciu zgłoszenia; przewóz nie może się rozpocząć przed jego uzyskaniem.
        </div>
      </div>

      {/* RODZAJ ZGŁOSZENIA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '32px' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>Rodzaj przewozu / Type of carriage:</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>
            &#9634; krajowy &nbsp;&nbsp; &#9634; wewnątrzunijny &nbsp;&nbsp; &#9634; wywóz &nbsp;&nbsp; &#9634; przywóz &nbsp;&nbsp; &#9634; tranzyt
          </div>
        </div>
        <div style={{ width: '250px', padding: '4px 6px', minHeight: '32px' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>Gałąź transportu / Mode:</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>&#9634; drogowy &nbsp;&nbsp; &#9634; kolejowy</div>
        </div>
      </div>

      {/* PODMIOTY */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>PODMIOTY / PARTIES</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '56px' }}>
          <div style={lbl}>Podmiot wysyłający / Consignor:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={{ ...lbl, marginTop: '2px' }}>NIP / numer identyfikacyjny:</div>
          <div style={val}>{data.sender?.vat || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '56px' }}>
          <div style={lbl}>Podmiot odbierający / Consignee:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={{ ...lbl, marginTop: '2px' }}>NIP / numer identyfikacyjny:</div>
          <div style={val}>{data.receiver?.vat || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '56px' }}>
          <div style={lbl}>Przewoźnik / Carrier:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.carrier?.name || ''}</div>
          <div style={val}>{data.carrier?.address || ''}</div>
          <div style={{ ...lbl, marginTop: '2px' }}>NIP przewoźnika:</div>
          <div style={val}>{data.carrier?.vatNumber || ''}</div>
        </div>
      </div>

      {/* TOWAR */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>TOWAR OBJĘTY MONITOROWANIEM / MONITORED GOODS</div>
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <div style={{ fontSize: '7px', color: '#555' }}>
          Kategorie objęte systemem: paliwa i oleje opałowe &middot; alkohol etylowy skażony &middot; susz tytoniowy &middot;
          oleje roślinne &middot; produkty lecznicze, środki spożywcze specjalnego przeznaczenia i wyroby medyczne zagrożone brakiem dostępności.
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>Rodzaj towaru / Description of goods:</div>
          <div style={val}>{data.cargo?.name}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>Pozycja CN / CN heading:</div>
          <div style={val}>{data.cargo?.hsCode}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>Masa brutto (kg):</div>
          <div style={val}>{data.cargo?.weight}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>Objętość (l) / Volume:</div>
          <div style={val}>{data.cargo?.volume}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', minHeight: '36px' }}>
          <div style={lbl}>Wartość brutto / Gross value:</div>
          <div style={val}>{data.cargo?.value} {data.cargo?.currency}</div>
        </div>
      </div>

      {/* PRZEWÓZ */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>DANE PRZEWOZU / CARRIAGE DATA</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Miejsce załadunku / Place of loading:</div>
          <div style={val}>{data.fromCity}, {data.fromCountry}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Miejsce dostarczenia / Place of delivery:</div>
          <div style={val}>{data.toCity}, {data.toCountry}</div>
        </div>
        <div style={{ width: '130px', padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Data rozpoczęcia przewozu:</div>
          <div style={val}>{formatDocumentDate(data.loadDate)}</div>
        </div>
        <div style={{ width: '130px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Planowana data zakończenia:</div>
          <div style={val} />
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Nr rejestracyjny pojazdu lub nr wagonu / Vehicle or wagon No.:</div>
          <div style={val}>{data.vehicle?.reg || data.rail?.wagonNumbers || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Nr lokalizatora GPS / Geolocator No.:</div>
          <div style={val} />
        </div>
        <div style={{ width: '160px', padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Nr dokumentu przewozowego:</div>
          <div style={val} />
        </div>
      </div>

      {/* PODPIS */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '54px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Zgłaszający / Person making the notification</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Imię, nazwisko, stanowisko</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '54px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Miejsce, data i podpis / Place, date and signature</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis</div>
        </div>
      </div>

    </div>
  )
}
