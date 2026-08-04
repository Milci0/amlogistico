import { formatDocumentDate } from '../../../../utils/formatDate'

export function EuImportDeclarationTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const secHdr = {
    backgroundColor: '#2c5fa8', padding: '4px 6px',
    fontSize: '8px', fontWeight: 'bold', color: '#fff',
  }
  const box = (label, value, width) => (
    <div style={{ ...(width ? { width } : { flex: 1 }), padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
      <div style={lbl}>{label}</div>
      <div style={val}>{value}</div>
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#1a3a6b', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>ZGŁOSZENIE CELNE PRZYWOZOWE UE</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>EU Import Customs Declaration &middot; dopuszczenie do obrotu</div>
          <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Unijny Kodeks Celny, art. 158</div>
        </div>
        <div style={{ width: '170px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>MRN (nadaje urząd celny):</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#a0b8d8', marginTop: '4px' }}>Rodzaj zgłoszenia / Declaration type:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#f5f7fa' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Zgłoszenie składa importer lub jego przedstawiciel celny w urzędzie celnym państwa przywozu.
          Cło i VAT są naliczane przy odprawie.
        </span>
      </div>

      {/* STRONY */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>STRONY / PARTIES</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '54px' }}>
          <div style={lbl}>Nadawca / Exporter:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '54px' }}>
          <div style={lbl}>Importer / Importer:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '54px' }}>
          <div style={lbl}>Nr EORI importera / Importer EORI:</div>
          <div style={val}>{data.receiver?.vat || ''}</div>
          <div style={{ ...lbl, marginTop: '4px' }}>Przedstawiciel celny / Customs representative:</div>
          <div style={val} />
        </div>
      </div>

      {/* DANE ZGŁOSZENIA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>DANE ZGŁOSZENIA / DECLARATION DATA</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        {box('Urząd celny przywozu / Customs office of import:', '')}
        {box('Kod procedury / Procedure code:', '', '110px')}
        {box('Kraj wysyłki / Country of dispatch:', data.fromCountry, '110px')}
        <div style={{ width: '110px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Kraj pochodzenia / Country of origin:</div>
          <div style={val} />
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        {box('Warunki dostawy / Incoterms:', data.cargo?.incoterms || '', '110px')}
        {box('Waluta / Currency:', data.cargo?.currency || '', '90px')}
        {box('Wartość celna / Customs value:', data.cargo?.value || '')}
        {box('Wartość statystyczna / Statistical value:', '')}
        <div style={{ width: '120px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Data przybycia / Date of arrival:</div>
          <div style={val}>{formatDocumentDate(data.sea?.eta) || formatDocumentDate(data.loadDate)}</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        {box('Gałąź transportu / Mode of transport:', data.transport, '120px')}
        {box('Identyfikacja środka transportu / Identity of transport:', data.cargo?.vessel || data.vehicle?.reg || '')}
        {box('Nr kontenera / Container No.:', data.cargo?.containerNo || '', '130px')}
        <div style={{ width: '130px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Miejsce wyładunku / Place of unloading:</div>
          <div style={val}>{data.toCity}</div>
        </div>
      </div>

      {/* POZYCJA TOWAROWA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>POZYCJA TOWAROWA / GOODS ITEM</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ width: '30px', padding: '3px 4px', borderRight: b, minHeight: '40px', fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>Opis towaru / Description of goods:</div>
          <div style={val}>{data.cargo?.name}</div>
        </div>
        <div style={{ width: '100px', padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>Kod CN (8-10 cyfr) / CN code:</div>
          <div style={val}>{data.cargo?.hsCode}</div>
        </div>
        <div style={{ width: '80px', padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>Masa brutto (kg) / Gross mass:</div>
          <div style={val}>{data.cargo?.weight}</div>
        </div>
        <div style={{ width: '80px', padding: '3px 5px', minHeight: '40px' }}>
          <div style={lbl}>Masa netto (kg) / Net mass:</div>
          <div style={val}>{data.cargo?.weightNet || ''}</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        {box('Liczba i rodzaj opakowań / Packages:', `${data.cargo?.packages || ''} ${data.cargo?.packageTypeUnCode || ''}`)}
        {box('Preferencja taryfowa / Preference:', '', '110px')}
        {box('Kraj preferencyjnego pochodzenia / Preferential origin:', '', '150px')}
        <div style={{ width: '150px', padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Dokument potwierdzający pochodzenie / Proof of origin:</div>
          <div style={val} />
        </div>
      </div>

      {/* NALEŻNOŚCI */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>NALEŻNOŚCI / DUTIES AND TAXES</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        {box('Stawka cła / Duty rate:', '')}
        {box('Kwota cła / Duty amount:', '')}
        {box('Stawka VAT / VAT rate:', '')}
        {box('Kwota VAT / VAT amount:', '')}
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Razem do zapłaty / Total payable:</div>
          <div style={val} />
        </div>
      </div>

      {/* DOKUMENTY ZAŁĄCZONE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '46px' }}>
          <div style={lbl}>Dokumenty załączone / Supporting documents:</div>
          <div style={{ fontSize: '7px', color: '#666', marginTop: '2px' }}>
            faktura handlowa &middot; lista pakowania &middot; dokument przewozowy &middot; dowód pochodzenia &middot; pozwolenia i świadectwa
          </div>
        </div>
        <div style={{ width: '250px', padding: '4px 6px', minHeight: '46px' }}>
          <div style={lbl}>Uwagi / Remarks:</div>
          <div style={{ ...val, minHeight: '26px' }}>{data.cargo?.notes || ''}</div>
        </div>
      </div>

      {/* PODPIS */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '54px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Zgłaszający / Declarant</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature and stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '54px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Adnotacje urzędu celnego / Customs office endorsement</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Data, podpis, pieczęć / Date, signature, stamp</div>
        </div>
      </div>

    </div>
  )
}
