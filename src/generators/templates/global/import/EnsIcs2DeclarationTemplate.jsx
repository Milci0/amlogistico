import { formatDocumentDate } from '../../../../utils/formatDate'

export function EnsIcs2DeclarationTemplate({ data }) {
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
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>DEKLARACJA SKRÓCONA PRZYWOZOWA (ENS)</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Entry Summary Declaration &middot; system ICS2</div>
          <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Unijny Kodeks Celny, art. 127 &middot; ICS2 Release 3</div>
        </div>
        <div style={{ width: '160px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>MRN (nadaje system):</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#a0b8d8', marginTop: '4px' }}>Data złożenia / Date of lodgement:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Deklaracja dotyczy WPROWADZENIA towaru na obszar celny Unii (przywóz oraz tranzyt przez UE), nie wywozu z Unii.
          Składa ją przewoźnik przed przybyciem towaru, w terminie zależnym od gałęzi transportu.
          Obowiązek objął przewoźników drogowych i kolejowych od 01.04.2025, a od 01.09.2025 jest dla nich obowiązkowy.
        </span>
      </div>

      {/* STRONY */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>STRONY DEKLARACJI / DECLARATION PARTIES</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '50px' }}>
          <div style={lbl}>Nadawca / Consignor:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '50px' }}>
          <div style={lbl}>Odbiorca / Consignee:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '50px' }}>
          <div style={lbl}>Przewoźnik składający deklarację / Carrier lodging the ENS:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.carrier?.name || ''}</div>
          <div style={val}>{data.carrier?.address || ''}</div>
          <div style={{ ...lbl, marginTop: '2px' }}>Nr EORI / EORI No.:</div>
          <div style={val} />
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Zgłaszający / Declarant (jeżeli inny niż przewoźnik):</div>
          <div style={val} />
        </div>
        <div style={{ width: '160px', padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr EORI zgłaszającego / Declarant EORI:</div>
          <div style={val} />
        </div>
        <div style={{ width: '160px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Przedstawiciel / Representative:</div>
          <div style={val} />
        </div>
      </div>

      {/* TRASA I ŚRODEK TRANSPORTU */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>TRASA I ŚRODEK TRANSPORTU / ROUTING AND MEANS OF TRANSPORT</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Miejsce załadunku / Place of loading:</div>
          <div style={val}>{data.fromCity}, {data.fromCountry}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Miejsce wyładunku / Place of unloading:</div>
          <div style={val}>{data.toCity}, {data.toCountry}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Urząd celny pierwszego wprowadzenia / Office of first entry:</div>
          <div style={val} />
        </div>
        <div style={{ width: '110px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Data przybycia / Date of arrival:</div>
          <div style={val}>{formatDocumentDate(data.sea?.eta) || formatDocumentDate(data.loadDate)}</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Gałąź transportu na granicy / Mode of transport at the border:</div>
          <div style={val}>{data.transport}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Identyfikacja środka transportu / Identity of means of transport:</div>
          <div style={val}>{data.cargo?.vessel || data.vehicle?.reg || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr rejsu / przewozu / Voyage or journey No.:</div>
          <div style={val}>{data.cargo?.voyageNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Kraje trasy przewozu / Countries of routing:</div>
          <div style={val} />
        </div>
      </div>

      {/* DOKUMENTY PRZEWOZOWE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Główny dokument przewozowy / Master transport document:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Zbiorczy dokument przewozowy / House transport document:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Nr bookingu / Booking No.:</div>
          <div style={val}>{data.sea?.bookingNo || ''}</div>
        </div>
      </div>

      {/* POZYCJA TOWAROWA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>POZYCJA TOWAROWA / GOODS ITEM</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ width: '30px', padding: '3px 4px', borderRight: b, minHeight: '38px', fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '38px' }}>
          <div style={lbl}>Opis towaru / Description of goods:</div>
          <div style={val}>{data.cargo?.name}</div>
        </div>
        <div style={{ width: '90px', padding: '3px 5px', borderRight: b, minHeight: '38px' }}>
          <div style={lbl}>Kod HS (6 cyfr) / HS code:</div>
          <div style={val}>{data.cargo?.hsCode}</div>
        </div>
        <div style={{ width: '80px', padding: '3px 5px', borderRight: b, minHeight: '38px' }}>
          <div style={lbl}>Liczba opakowań / Packages:</div>
          <div style={val}>{data.cargo?.packages} {data.cargo?.packageTypeUnCode || ''}</div>
        </div>
        <div style={{ width: '80px', padding: '3px 5px', minHeight: '38px' }}>
          <div style={lbl}>Masa brutto (kg) / Gross mass:</div>
          <div style={val}>{data.cargo?.weight}</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Znaki i numery / Marks and numbers:</div>
          <div style={val}>{data.cargo?.marksNos || ''}</div>
        </div>
        <div style={{ width: '130px', padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr kontenera / Container No.:</div>
          <div style={val}>{data.cargo?.containerNo || ''}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr plomby / Seal No.:</div>
          <div style={val}>{data.cargo?.sealNo || ''}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Nr UN (towar niebezpieczny) / UN number:</div>
          <div style={val} />
        </div>
      </div>

      {/* PODPIS */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '54px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Miejsce i data / Place and date</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>&nbsp;</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '54px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Osoba składająca deklarację / Person lodging the declaration</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis / Signature</div>
        </div>
      </div>

    </div>
  )
}
