import { formatDocumentDate } from '../../../../utils/formatDate'

export function RexStatementOfOriginTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '20px' }}>
      {[40, null, 100, 100, 90].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>OŚWIADCZENIE O POCHODZENIU (REX)</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Statement on Origin &middot; system zarejestrowanych eksporterów</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Umowy o wolnym handlu UE &middot; system REX</div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Oświadczenie umieszcza się na fakturze lub innym dokumencie handlowym opisującym towar w sposób umożliwiający
          jego identyfikację. Zastępuje ono świadectwo EUR.1 w umowach opartych o system REX.
          Niniejszy wydruk służy do przygotowania treści oświadczenia przed przeniesieniem jej na dokument handlowy.
        </span>
      </div>

      {/* EKSPORTER */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '56px' }}>
          <div style={lbl}>Eksporter / Exporter (nazwa, pełny adres, kraj):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ width: '240px', padding: '3px 5px', minHeight: '56px' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>Numer REX / REX number:</div>
          <div style={{ ...val, borderBottom: b, paddingBottom: '2px', marginTop: '2px', fontWeight: 'bold' }} />
          <div style={{ fontSize: '6px', color: '#777', marginTop: '3px', lineHeight: '1.4' }}>
            Rejestracja w systemie REX jest wymagana dla przesyłek o wartości powyżej 6 000 EUR.
            Poniżej tego progu oświadczenie może wystawić każdy eksporter, bez numeru REX.
          </div>
        </div>
      </div>

      {/* ODBIORCA I TRASA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '44px' }}>
          <div style={lbl}>Odbiorca / Consignee:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}, {data.receiver?.country}</div>
        </div>
        <div style={{ width: '150px', padding: '3px 5px', borderRight: b, minHeight: '44px' }}>
          <div style={lbl}>Kraj przeznaczenia / Country of destination:</div>
          <div style={val}>{data.toCountry}</div>
        </div>
        <div style={{ width: '150px', padding: '3px 5px', minHeight: '44px' }}>
          <div style={lbl}>Nr faktury i data / Invoice No. and date:</div>
          <div style={val}>{formatDocumentDate(data.loadDate)}</div>
        </div>
      </div>

      {/* TOWARY */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '40px' }}>Lp.<br />No.</div>
        <div style={{ ...thStyle, flex: 1 }}>Opis towaru<br />Description of goods</div>
        <div style={{ ...thStyle, width: '100px' }}>Kod HS<br />HS code</div>
        <div style={{ ...thStyle, width: '100px' }}>Kraj pochodzenia<br />Country of origin</div>
        <div style={{ ...thStyle, width: '90px', borderRight: b }}>Masa brutto (kg)<br />Gross mass</div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, minHeight: '22px' }}>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '100px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
        <div style={{ width: '100px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight}</div>
      </div>
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* TREŚĆ OŚWIADCZENIA */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '5px 7px', backgroundColor: '#f9fafb' }}>
        <div style={{ fontSize: '7.5px', fontWeight: 'bold', marginBottom: '4px' }}>TREŚĆ OŚWIADCZENIA DO UMIESZCZENIA NA DOKUMENCIE HANDLOWYM</div>
        <div style={{ border: b, backgroundColor: '#fff', padding: '6px 8px', fontSize: '8px', lineHeight: '1.6' }}>
          Eksporter produktów objętych tym dokumentem (nr upoważnienia lub rejestracji REX ...............................)
          deklaruje, że z wyjątkiem gdzie jest to wyraźnie określone, produkty te mają
          ............................... preferencyjne pochodzenie.
        </div>
        <div style={{ border: b, backgroundColor: '#fff', padding: '6px 8px', fontSize: '7.5px', lineHeight: '1.6', marginTop: '4px', color: '#444' }}>
          The exporter of the products covered by this document (customs authorisation or REX registration No. ...............................)
          declares that, except where otherwise clearly indicated, these products are of ............................... preferential origin.
        </div>
        <div style={{ fontSize: '6.5px', color: '#777', marginTop: '4px' }}>
          Dokładne brzmienie oraz język oświadczenia określa umowa o wolnym handlu mająca zastosowanie do danego kraju.
        </div>
      </div>

      {/* PODPIS */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, minHeight: '58px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Miejsce i data / Place and date</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>&nbsp;</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Imię i nazwisko eksportera / Name of the exporter</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>drukowanymi / in block letters</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Podpis / Signature</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>&nbsp;</div>
        </div>
      </div>

    </div>
  )
}
