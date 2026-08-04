import { formatDocumentDate } from '../../../../utils/formatDate'

export function SupplierDeclarationTemplate({ data }) {
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
      {[40, null, 110, 110].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>DEKLARACJA DOSTAWCY</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Supplier&apos;s Declaration &middot; status pochodzenia towaru w obrocie wewnątrzunijnym</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Rozporządzenie wykonawcze (UE) 2015/2447, art. 61-66</div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#f5f7fa' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Deklarację wystawia dostawca swojemu odbiorcy. Służy ona odbiorcy do wykazania statusu pochodzenia towaru
          przy późniejszym wystawianiu dowodów pochodzenia. Nie jest dokumentem przedstawianym organom celnym przy odprawie.
        </span>
      </div>

      {/* RODZAJ DEKLARACJI */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '34px' }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>Rodzaj deklaracji / Type of declaration:</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>
            &#9634; jednorazowa (dla jednej dostawy) &nbsp;&nbsp; &#9634; długoterminowa (dla wielu dostaw)
          </div>
        </div>
        <div style={{ width: '250px', padding: '3px 5px', minHeight: '34px' }}>
          <div style={lbl}>Okres ważności deklaracji długoterminowej / Validity period:</div>
          <div style={val}>od / from ................. do / to .................</div>
        </div>
      </div>

      {/* STRONY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '58px' }}>
          <div style={lbl}>Dostawca / Supplier (nazwa, adres, kraj):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
          <div style={{ ...lbl, marginTop: '2px' }}>Nr VAT / EORI:</div>
          <div style={val}>{data.sender?.vat || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '58px' }}>
          <div style={lbl}>Odbiorca / Recipient (nazwa, adres, kraj):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
          <div style={{ ...lbl, marginTop: '2px' }}>Nr faktury i data / Invoice No. and date:</div>
          <div style={val}>{formatDocumentDate(data.loadDate)}</div>
        </div>
      </div>

      {/* TOWARY */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '40px' }}>Lp.<br />No.</div>
        <div style={{ ...thStyle, flex: 1 }}>Opis towaru<br />Description of goods</div>
        <div style={{ ...thStyle, width: '110px' }}>Kod HS / CN<br />HS / CN code</div>
        <div style={{ ...thStyle, width: '110px', borderRight: b }}>Kraj pochodzenia<br />Country of origin</div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, minHeight: '22px' }}>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '110px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
        <div style={{ width: '110px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* TREŚĆ DEKLARACJI */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '5px 7px', backgroundColor: '#f9fafb' }}>
        <div style={{ fontSize: '7.5px', fontWeight: 'bold', marginBottom: '3px' }}>TREŚĆ DEKLARACJI / TEXT OF THE DECLARATION</div>
        <div style={{ fontSize: '7.5px', lineHeight: '1.5' }}>
          Ja, niżej podpisany, oświadczam, że towary wymienione powyżej i objęte niniejszym dokumentem:
        </div>
        <div style={{ fontSize: '7.5px', marginTop: '4px', paddingLeft: '10px' }}>
          &#9634; posiadają preferencyjne pochodzenie w rozumieniu umowy z: ...........................................................
        </div>
        <div style={{ fontSize: '7.5px', marginTop: '2px', paddingLeft: '10px' }}>
          &#9634; nie posiadają preferencyjnego pochodzenia; zastosowane materiały niepochodzące i przeprowadzona obróbka
          są opisane w załączniku
        </div>
        <div style={{ fontSize: '7.5px', marginTop: '2px', paddingLeft: '10px' }}>
          &#9634; posiadają status towaru unijnego
        </div>
        <div style={{ fontSize: '7px', marginTop: '5px', lineHeight: '1.5' }}>
          Zobowiązuję się udostępnić organom celnym wszelkie dokumenty potwierdzające niniejszą deklarację oraz
          powiadomić odbiorcę niezwłocznie, gdyby przestała ona odpowiadać stanowi faktycznemu.
        </div>
        <div style={{ fontSize: '6.5px', color: '#777', marginTop: '3px' }}>
          I undertake to make available to the customs authorities any supporting documents and to inform the recipient
          immediately should this declaration no longer be valid.
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
          <div style={lbl}>Imię i nazwisko / Name</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>drukowanymi / in block letters</div>
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
