import { formatDocumentDate } from '../../../../utils/formatDate'

export function ConsignorSecurityDeclarationTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const secHdr = {
    backgroundColor: '#5c4a1f', padding: '4px 6px',
    fontSize: '8px', fontWeight: 'bold', color: '#fff',
  }

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#403313', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>DEKLARACJA BEZPIECZEŃSTWA NADAWCY</div>
          <div style={{ fontSize: '8px', color: '#ddd0a8', marginTop: '2px' }}>Consignor Security Declaration &middot; ochrona lotnictwa cywilnego</div>
          <div style={{ fontSize: '6.5px', color: '#ddd0a8', marginTop: '1px' }}>Rozporządzenie wykonawcze (UE) 2015/1998</div>
        </div>
        <div style={{ width: '165px', padding: '6px 8px', backgroundColor: '#403313' }}>
          <div style={{ ...lbl, color: '#ddd0a8' }}>Nr AWB / HAWB:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#ddd0a8', marginTop: '4px' }}>Data i godzina wystawienia:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }}>{formatDocumentDate(data.loadDate)}</div>
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Deklarację wystawia znany nadawca (KC) lub zarejestrowany agent (RA) wpisany do unijnej bazy danych.
          Przesyłka bez potwierdzonego statusu bezpieczeństwa podlega kontroli bezpieczeństwa przed załadunkiem.
        </span>
      </div>

      {/* NADAWCA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>NADAWCA / CONSIGNOR</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '50px' }}>
          <div style={lbl}>Nazwa i adres / Name and address:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ width: '210px', padding: '3px 5px', borderRight: b, minHeight: '50px' }}>
          <div style={lbl}>Status w unijnej bazie danych / Status:</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>
            {data.air?.knownConsignor ? 'znany nadawca (KC)' : <>&#9634; znany nadawca (KC)</>}
          </div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>&#9634; zarejestrowany agent (RA)</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>&#9634; nadawca nieokreślony</div>
        </div>
        <div style={{ width: '190px', padding: '3px 5px', minHeight: '50px' }}>
          <div style={lbl}>Numer identyfikacyjny w bazie / Identifier:</div>
          <div style={val} />
          <div style={{ ...lbl, marginTop: '4px' }}>Ważność zatwierdzenia / Valid until:</div>
          <div style={val} />
        </div>
      </div>

      {/* PRZESYŁKA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>PRZESYŁKA / CONSIGNMENT</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>Opis towaru / Description of goods:</div>
          <div style={val}>{data.cargo?.name}</div>
        </div>
        <div style={{ width: '80px', padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>Liczba sztuk / Pieces:</div>
          <div style={val}>{data.cargo?.packages}</div>
        </div>
        <div style={{ width: '80px', padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>Masa brutto (kg):</div>
          <div style={val}>{data.cargo?.weight}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '34px' }}>
          <div style={lbl}>Lotnisko wylotu / Origin:</div>
          <div style={val}>{data.air?.airportFrom || data.fromCity}</div>
        </div>
        <div style={{ width: '110px', padding: '3px 5px', minHeight: '34px' }}>
          <div style={lbl}>Lotnisko przeznaczenia / Destination:</div>
          <div style={val}>{data.air?.airportTo || data.toCity}</div>
        </div>
      </div>

      {/* STATUS BEZPIECZEŃSTWA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>STATUS BEZPIECZEŃSTWA / SECURITY STATUS</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '52px' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>Nadany status / Status assigned:</div>
          <div style={{ fontSize: '7.5px', marginTop: '3px' }}>
            &#9634; <strong>SPX</strong> &mdash; bezpieczna dla statków pasażerskich, towarowych i pocztowych
          </div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>
            &#9634; <strong>SCO</strong> &mdash; bezpieczna wyłącznie dla statków towarowych i pocztowych
          </div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>
            &#9634; <strong>SHR</strong> &mdash; bezpieczna, ładunek wysokiego ryzyka
          </div>
        </div>
        <div style={{ width: '300px', padding: '4px 6px', minHeight: '52px' }}>
          <div style={lbl}>Podstawa nadania statusu / Grounds for issuing status:</div>
          <div style={{ fontSize: '7.5px', marginTop: '3px' }}>&#9634; przesyłka od znanego nadawcy</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>&#9634; przeprowadzona kontrola bezpieczeństwa</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>&#9634; zwolnienie z kontroli &mdash; podstawa:</div>
          <div style={{ ...val, borderBottom: b, marginTop: '2px' }} />
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Zastosowana metoda kontroli / Screening method applied:</div>
          <div style={val} />
        </div>
        <div style={{ width: '160px', padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Data i godzina kontroli:</div>
          <div style={val} />
        </div>
        <div style={{ width: '160px', padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Podmiot przeprowadzający kontrolę:</div>
          <div style={val} />
        </div>
      </div>

      {/* ŁAŃCUCH ODPOWIEDZIALNOŚCI */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>ŁAŃCUCH ODPOWIEDZIALNOŚCI / CHAIN OF CUSTODY</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Przesyłkę przyjął od / Received from:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Przekazano do / Handed over to:</div>
          <div style={val}>{data.carrier?.name || ''}</div>
        </div>
        <div style={{ width: '170px', padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Zabezpieczenie przesyłki / Tamper-evident protection:</div>
          <div style={{ fontSize: '7.5px' }}>&#9634; TAK / YES &nbsp; &#9634; NIE / NO</div>
        </div>
      </div>

      {/* OŚWIADCZENIE */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '5px 7px' }}>
        <div style={{ fontSize: '7.5px', lineHeight: '1.5' }}>
          Oświadczam, że przesyłka została przygotowana, zabezpieczona i przekazana zgodnie z wymogami ochrony
          lotnictwa cywilnego, a od chwili nadania statusu bezpieczeństwa pozostawała pod stałą ochroną przed
          nieuprawnioną ingerencją.
        </div>
        <div style={{ fontSize: '6.5px', color: '#777', marginTop: '3px' }}>
          I declare that the consignment has been prepared, protected and handed over in accordance with the applicable
          aviation security requirements and has been protected from unauthorised interference since the security status
          was issued.
        </div>
      </div>

      {/* PODPIS */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, minHeight: '56px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Osoba wystawiająca / Person issuing the declaration</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Imię, nazwisko, stanowisko</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Miejsce i data / Place and date</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>&nbsp;</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Podpis i pieczęć / Signature and stamp</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>&nbsp;</div>
        </div>
      </div>

    </div>
  )
}
