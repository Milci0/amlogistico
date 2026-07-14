import { formatDocumentDate } from '../../../../utils/formatDate'

export function LetterOfCreditTemplate({ data }) {
  const today = formatDocumentDate(new Date())
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }

  const requiredDocs = [
    ['1', 'Faktura handlowa / Commercial Invoice', '3', 'Beneficjent', 'Na papierze firmowym, podpisana'],
    ['2', 'Konosament / Bill of Lading (Full set 3/3)', '3 oryg.', 'Armator', 'On Board, Notify Applicant, Freight Prepaid'],
    ['3', 'Packing List', '2', 'Beneficjent', 'Szczegółowy, zgodny z fakturą'],
    ['4', 'Świadectwo pochodzenia / Certificate of Origin', '1', 'Izba handlowa', 'Legalizowane (jeśli wymagane)'],
    ['5', 'Polisa ubezpieczeniowa / Insurance Policy', '1', 'Ubezpieczyciel', 'Min. 110% wartości CIF'],
    ['6', '', '', '', ''],
    ['7', '', '', '', ''],
  ]

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>LETTER OF CREDIT (L/C)</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Akredytywa Dokumentowa · Documentary Letter of Credit</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Regulowane przez UCP 600 (ICC — International Chamber of Commerce). Najpewniejsza forma płatności w handlu zagranicznym.</div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          <strong>WAŻNE:</strong> L/C to zobowiązanie banku do zapłaty — nie dokumentem transportowym. Eksporter
          musi przedstawić WSZYSTKIE dokumenty zgodnie z L/C w terminie, inaczej bank może odmówić zapłaty.
        </span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Nr L/C / Credit No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Data wydania / Issue date:</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Data ważności / Expiry date:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Miejsce wygaśnięcia / Place of expiry:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Bank otwierający / Issuing Bank:</div>
          <div style={val}>{data.sender?.bank || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Kraj / Country:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Swift Code:</div>
          <div style={val}>{data.sender?.swift || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Bank potwierdzający / Confirming Bank (jeśli):</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Swift Code:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Beneficjent / Beneficiary (eksporter):</div>
          <div style={val}>{data.sender?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>NIP/VAT / Tax No.:</div>
          <div style={val}>{data.sender?.vat || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Wnioskodawca / Applicant (importer):</div>
          <div style={val}>{data.receiver?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>NIP/VAT / Tax No.:</div>
          <div style={val}>{data.receiver?.vat || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Kwota L/C / Credit Amount:</div>
          <div style={val}>{data.cargo?.value || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Waluta / Currency:</div>
          <div style={val}>{data.cargo?.currency || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Tolerancja / Tolerance (±%):</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Częściowe wysyłki / Partial shipments:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Przeładunek / Transhipment:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Incoterms:</div>
          <div style={val}>{data.cargo?.incoterms || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Port załadunku / Port of loading:</div>
          <div style={val}>{data.fromCity || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Port przeznaczenia / Port of destination:</div>
          <div style={val}>{data.toCity || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Ostateczna data wysyłki / Latest shipment date:</div>
          <div style={val}>{data.loadDate ? formatDocumentDate(data.loadDate) : ''}</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>WYMAGANE DOKUMENTY / REQUIRED DOCUMENTS</span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '30px' }}>Nr</div>
        <div style={{ ...thStyle, flex: 1 }}>Dokument / Document</div>
        <div style={{ ...thStyle, width: '70px' }}>Ilość kopii<br />No. of copies</div>
        <div style={{ ...thStyle, width: '90px' }}>Wystawiony przez<br />Issued by</div>
        <div style={{ ...thStyle, flex: 1, borderRight: b }}>Wymagania<br />Requirements</div>
      </div>
      {requiredDocs.map(([nr, doc, copies, issuer, req], i) => (
        <div key={i} style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
          <div style={{ width: '30px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{nr}</div>
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>{doc}</div>
          <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px', textAlign: 'center' }}>{copies}</div>
          <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>{issuer}</div>
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>{req}</div>
        </div>
      ))}

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Issuing Bank / Bank otwierający</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Date</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Reference No.</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
      </div>

    </div>
  )
}
