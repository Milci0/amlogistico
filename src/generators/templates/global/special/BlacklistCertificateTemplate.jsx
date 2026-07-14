import { formatDocumentDate } from '../../../../utils/formatDate'

export function BlacklistCertificateTemplate({ data }) {
  const today = formatDocumentDate(new Date())
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>BLACKLIST CERTIFICATE</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Zaświadczenie o braku powiązań z Izraelem</div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          <strong>WAŻNE:</strong> Wymagane przy eksporcie do Arabii Saudyjskiej, Kuwejtu, Kataru, Bahrajnu, ZEA i innych
          krajów arabskich, które stosują bojkot Izraela. Wystawiany przez eksportera i legalizowany przez Izbę
          Handlową. Nie dotyczy towarów wysyłanych przez Izrael ani podmiotów z siedzibą w Izraelu lub mających
          udziałowców izraelskich. Wymóg ten może być niezgodny z prawem UE — skonsultuj z prawnikiem.
        </span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Nr / Reference No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Data / Date:</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Wystawił / Issued by:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Eksporter / Company (nazwa, adres, kraj):</div>
          <div style={val}>{data.sender?.name}, {data.sender?.address}, {data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>NIP/VAT / Tax No.:</div>
          <div style={val}>{data.sender?.vat || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Kraj docelowy / Destination country:</div>
          <div style={val}>{data.toCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Nr faktury / Invoice No.:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ border: b, padding: '5px 7px', marginTop: '8px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#555' }}>
          <strong>OŚWIADCZENIE / DECLARATION:</strong> Niniejszym oświadczamy, że nasza firma nie jest wpisana na Czarną
          Listę Biura Bojkotu Izraela Ligi Arabskiej, nie posiadamy filii ani zakładów w Izraelu, żaden z naszych
          udziałowców nie jest podmiotem izraelskim, opisane towary nie zawierają komponentów izraelskiego pochodzenia,
          i towary nie są transportowane przez terytorium Izraela. We hereby declare that our company is not
          blacklisted by the Arab League Boycott of Israel Office, we have no subsidiaries or plants in Israel, none
          of our shareholders are Israeli entities, the described goods contain no Israeli components, and the goods
          are not transshipped via Israel.
        </span>
      </div>

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Eksporter / Company representative</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Pieczęć Izby Handlowej / Chamber stamp</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Date</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
      </div>

    </div>
  )
}
