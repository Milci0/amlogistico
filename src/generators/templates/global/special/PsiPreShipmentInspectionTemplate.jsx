import { formatDocumentDate } from '../../../../utils/formatDate'

export function PsiPreShipmentInspectionTemplate({ data }) {
  const today = formatDocumentDate(new Date())
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }

  const points = [
    'Opis towaru zgodny z fakturą / Goods match invoice description',
    'Ilość zgodna z fakturą / Quantity matches invoice',
    'Jakość odpowiednia / Quality satisfactory',
    'Cena rynkowa prawidłowa / Price at fair market value',
    'Opakowanie właściwe / Packaging adequate',
    'Oznakowanie zgodne / Marking correct',
  ]

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>PRE-SHIPMENT INSPECTION CERTIFICATE (PSI)</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Świadectwo Inspekcji Przed Wysyłką · Clean Report of Findings (CRF)</div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          <strong>WAŻNE:</strong> Wymagane przez Nigerię, Kenię, Mozambik, Kamerun i inne kraje afrykańskie. Inspekcja
          MUSI odbyć się w kraju eksportu przed załadunkiem towaru na statek. CRF jest wymagany przez celników w kraju
          importu. Brak CRF = zakaz importu lub bardzo wysokie kary. Zaplanuj inspekcję min. 5 dni przed załadunkiem.
        </span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Nr CRF / Report No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Data inspekcji / Date:</div>
          <div style={val}>{today}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Firma inspekcyjna / Inspection Co.:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Eksporter / Shipper (kraj eksportu):</div>
          <div style={val}>{data.sender?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Importer (kraj docelowy):</div>
          <div style={val}>{data.receiver?.name || ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Kraj docelowy / Destination country:</div>
          <div style={val}>{data.toCountry || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Nr kontraktu / Contract No.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Nr L/C (jeśli):</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Opis towaru / Description of goods:</div>
          <div style={val}>{data.cargo?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Ilość / Qty:</div>
          <div style={val}>{data.cargo?.quantity || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Waga (kg):</div>
          <div style={val}>{data.cargo?.weight || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Wartość CIF (USD):</div>
          <div style={val}>{data.cargo?.value || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Waluta:</div>
          <div style={val}>{data.cargo?.currency || ''}</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>WERYFIKACJA / VERIFICATION</span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, flex: 1 }}>Punkt weryfikacji / Verification point</div>
        <div style={{ ...thStyle, width: '90px' }}>Status</div>
        <div style={{ ...thStyle, flex: 1, borderRight: b }}>Uwagi / Remarks</div>
      </div>
      {points.map((p, i) => (
        <div key={i} style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>{p}</div>
          <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>☐ OK ☐ NOK</div>
          <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        </div>
      ))}

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, padding: '3px 5px', minHeight: '20px' }}>
        <span style={{ fontSize: '7px' }}>
          WYNIK / RESULT: ☐ CLEAN — Towar zgodny ze specyfikacją. Eksport zalecany. / Goods conform to specification.
          Export approved. ☐ DISCREPANT — Niezgodności wykryte. / Discrepancies found.
        </span>
      </div>

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Inspektor / Inspector</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Kierownik biura / Office Manager</div>
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
