import { formatDocumentDate } from '../../../../utils/formatDate'

export function SliAirTemplate({ data }) {
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
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>INSTRUKCJA NADAWCY (SLI)</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Shipper&apos;s Letter of Instruction &middot; fracht lotniczy</div>
          <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Formularz według standardu IATA</div>
        </div>
        <div style={{ width: '165px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>Nr referencyjny nadawcy:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#a0b8d8', marginTop: '4px' }}>Data / Date:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }}>{formatDocumentDate(data.loadDate)}</div>
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#f5f7fa' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Nadawca przekazuje tym dokumentem spedytorowi dane i dyspozycje potrzebne do wystawienia lotniczego listu
          przewozowego. SLI nie jest dokumentem przewozowym ani dowodem zawarcia umowy przewozu.
        </span>
      </div>

      {/* STRONY */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>STRONY / PARTIES</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '56px' }}>
          <div style={lbl}>Nadawca / Shipper:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
          <div style={val}>{data.sender?.phone || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '56px' }}>
          <div style={lbl}>Odbiorca / Consignee:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '56px' }}>
          <div style={lbl}>Spedytor / Forwarder:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.carrier?.name || ''}</div>
          <div style={val}>{data.carrier?.address || ''}</div>
          <div style={{ ...lbl, marginTop: '2px' }}>Strona do powiadomienia / Notify party:</div>
          <div style={val} />
        </div>
      </div>

      {/* DYSPOZYCJE PRZEWOZOWE */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>DYSPOZYCJE PRZEWOZOWE / SHIPPING INSTRUCTIONS</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Lotnisko wylotu / Airport of departure:</div>
          <div style={val}>{data.air?.airportFrom || data.fromCity}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Lotnisko przeznaczenia / Airport of destination:</div>
          <div style={val}>{data.air?.airportTo || data.toCity}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Preferowany przewoźnik / Requested carrier:</div>
          <div style={val} />
        </div>
        <div style={{ width: '120px', padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Data gotowości / Ready date:</div>
          <div style={val}>{formatDocumentDate(data.loadDate)}</div>
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Warunki dostawy / Incoterms:</div>
          <div style={val}>{data.cargo?.incoterms || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Opłaty / Charges:</div>
          <div style={{ fontSize: '7.5px' }}>&#9634; PREPAID &nbsp; &#9634; COLLECT</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Konsolidacja / Consolidation:</div>
          <div style={{ fontSize: '7.5px' }}>
            {data.air?.consolidated ? 'TAK / YES' : <>&#9634; TAK / YES &nbsp; &#9634; NIE / NO</>}
          </div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Ubezpieczenie zlecone / Insurance requested:</div>
          <div style={{ fontSize: '7.5px' }}>&#9634; TAK / YES &nbsp; &#9634; NIE / NO</div>
        </div>
      </div>

      {/* TOWAR */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>TOWAR / GOODS</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '38px' }}>
          <div style={lbl}>Opis towaru / Description of goods:</div>
          <div style={val}>{data.cargo?.name}</div>
        </div>
        <div style={{ width: '85px', padding: '3px 5px', borderRight: b, minHeight: '38px' }}>
          <div style={lbl}>Kod HS / HS code:</div>
          <div style={val}>{data.cargo?.hsCode}</div>
        </div>
        <div style={{ width: '75px', padding: '3px 5px', borderRight: b, minHeight: '38px' }}>
          <div style={lbl}>Liczba sztuk / Pieces:</div>
          <div style={val}>{data.cargo?.packages}</div>
        </div>
        <div style={{ width: '75px', padding: '3px 5px', borderRight: b, minHeight: '38px' }}>
          <div style={lbl}>Masa brutto (kg):</div>
          <div style={val}>{data.cargo?.weight}</div>
        </div>
        <div style={{ width: '75px', padding: '3px 5px', borderRight: b, minHeight: '38px' }}>
          <div style={lbl}>Masa taryfowa (kg):</div>
          <div style={val}>{data.air?.chargeableWeightKg || ''}</div>
        </div>
        <div style={{ width: '85px', padding: '3px 5px', minHeight: '38px' }}>
          <div style={lbl}>Wymiary / Dimensions:</div>
          <div style={val} />
        </div>
      </div>

      {/* WYMAGANIA SZCZEGÓLNE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '46px' }}>
          <div style={lbl}>Wymagania szczególne / Special handling:</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>
            &#9634; łatwo psujące się &nbsp; &#9634; kontrola temperatury &nbsp; &#9634; żywe zwierzęta
          </div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>
            &#9634; towary niebezpieczne (wymagana deklaracja IATA DGR) &nbsp; &#9634; ładunek wartościowy
          </div>
        </div>
        <div style={{ width: '250px', padding: '4px 6px', minHeight: '46px' }}>
          <div style={lbl}>Zakres temperatury / Temperature range:</div>
          <div style={val}>
            {data.vehicle?.tempFrom || data.vehicle?.tempTo
              ? `${data.vehicle?.tempFrom || ''} - ${data.vehicle?.tempTo || ''}`
              : ''}
          </div>
        </div>
      </div>

      {/* DOKUMENTY I CŁO */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '44px' }}>
          <div style={lbl}>Dokumenty załączone / Documents attached:</div>
          <div style={{ fontSize: '7px', color: '#666', marginTop: '2px' }}>
            faktura handlowa &middot; lista pakowania &middot; dowód pochodzenia &middot; pozwolenia i świadectwa
          </div>
        </div>
        <div style={{ flex: 1, padding: '4px 6px', minHeight: '44px' }}>
          <div style={lbl}>Dyspozycje celne / Customs instructions:</div>
          <div style={{ ...val, minHeight: '24px' }}>{data.cargo?.notes || ''}</div>
        </div>
      </div>

      {/* UPOWAŻNIENIE */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '5px 7px', backgroundColor: '#f9fafb' }}>
        <div style={{ ...lbl, fontWeight: 'bold' }}>UPOWAŻNIENIE / AUTHORISATION</div>
        <div style={{ fontSize: '7.5px', marginTop: '2px', lineHeight: '1.5' }}>
          Upoważniam spedytora do wystawienia i podpisania lotniczego listu przewozowego w moim imieniu, zgodnie
          z powyższymi dyspozycjami. Potwierdzam, że podane dane są prawdziwe i kompletne.
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, minHeight: '56px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Imię, nazwisko i stanowisko / Name and position</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>drukowanymi / in block letters</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Miejsce, data i podpis / Place, date and signature</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć</div>
        </div>
      </div>

    </div>
  )
}
