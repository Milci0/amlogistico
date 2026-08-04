import { formatDocumentDate } from '../../../../utils/formatDate'

export function RidRailDgTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#8a1f1f', verticalAlign: 'top',
  }
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '18px' }}>
      {[45, null, 40, 45, 45, 55, 55, 60].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  const ridClasses = [
    ['Klasa 1', 'Materiały wybuchowe'], ['Klasa 2', 'Gazy'], ['Klasa 3', 'Ciecze łatwopalne'],
    ['Klasa 4.1', 'Ciała stałe łatwopalne'], ['Klasa 4.2', 'Samozapalne'], ['Klasa 4.3', 'Wydzielające gazy palne'],
    ['Klasa 5.1', 'Utleniające'], ['Klasa 5.2', 'Nadtlenki organiczne'], ['Klasa 6.1', 'Toksyczne'],
    ['Klasa 6.2', 'Zakaźne'], ['Klasa 7', 'Radioaktywne'], ['Klasa 8', 'Żrące'], ['Klasa 9', 'Różne'],
  ]

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#8a1f1f' }}>
        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>RID — DOKUMENT PRZEWOZOWY TOWARÓW NIEBEZPIECZNYCH</div>
        <div style={{ fontSize: '8px', color: '#f0c8c8', marginTop: '2px' }}>Dangerous Goods Transport Document &middot; transport kolejowy</div>
        <div style={{ fontSize: '6.5px', color: '#f0c8c8', marginTop: '1px' }}>Regulamin RID (załącznik C do COTIF 1999)</div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fff5f5' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Dane o towarze niebezpiecznym podaje się w jednym lub kilku językach, przy czym jednym z nich musi być
          francuski, niemiecki lub angielski. Instrukcje pisemne dla drużyny pociągowej są odrębnym dokumentem.
        </span>
      </div>

      {/* NADAWCA | ODBIORCA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '44px' }}>
          <div style={lbl}>Nadawca / Consignor (nazwa, adres):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}, {data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '44px' }}>
          <div style={lbl}>Odbiorca / Consignee (nazwa, adres):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}, {data.receiver?.country}</div>
        </div>
        <div style={{ width: '190px', padding: '3px 5px', minHeight: '44px' }}>
          <div style={lbl}>Przewoźnik kolejowy / Rail carrier:</div>
          <div style={val}>{data.carrier?.name || ''}</div>
          <div style={{ ...lbl, marginTop: '2px' }}>Data nadania / Date:</div>
          <div style={val}>{formatDocumentDate(data.loadDate)}</div>
        </div>
      </div>

      {/* TRASA I WAGON */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Stacja nadania / Station of departure:</div>
          <div style={val}>{data.rail?.stationFrom || data.fromCity}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Stacja przeznaczenia / Station of destination:</div>
          <div style={val}>{data.rail?.stationTo || data.toCity}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
          <div style={lbl}>Nr wagonu / Wagon No.:</div>
          <div style={val}>{data.rail?.wagonNumbers || ''}</div>
        </div>
        <div style={{ width: '130px', padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>Nr listu przewozowego / Consignment note No.:</div>
          <div style={val} />
        </div>
      </div>

      {/* TABELA POZYCJI */}
      <div style={{ backgroundColor: '#8a1f1f', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>OPIS TOWARU NIEBEZPIECZNEGO / DESCRIPTION OF DANGEROUS GOODS</span>
      </div>
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '3px 6px' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Kolejność zapisu według RID 5.4.1.1.1: numer UN, prawidłowa nazwa przewozowa, numer wzoru nalepki,
          grupa pakowania, liczba i opis sztuk przesyłki, ilość całkowita.
        </span>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '45px' }}>Nr UN<br />UN No.</div>
        <div style={{ ...thStyle, flex: 1 }}>Prawidłowa nazwa przewozowa<br />Proper shipping name</div>
        <div style={{ ...thStyle, width: '40px' }}>Klasa<br />Class</div>
        <div style={{ ...thStyle, width: '45px' }}>Nalepka<br />Label</div>
        <div style={{ ...thStyle, width: '45px' }}>Gr. pak.<br />PG</div>
        <div style={{ ...thStyle, width: '55px' }}>Kod ogr. tunel.<br />Tunnel code</div>
        <div style={{ ...thStyle, width: '55px' }}>Liczba sztuk<br />Packages</div>
        <div style={{ ...thStyle, width: '60px', borderRight: b }}>Ilość (kg/l)<br />Quantity</div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages}</div>
        <div style={{ width: '60px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight}</div>
      </div>
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* KLASY RID */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fafafa' }}>
        <div style={{ ...lbl, fontWeight: 'bold', marginBottom: '3px' }}>KLASY ZAGROŻENIA RID / RID HAZARD CLASSES</div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {ridClasses.map(([cls, desc]) => (
            <div key={cls} style={{ width: '25%', fontSize: '6.5px', color: '#555', marginBottom: '2px' }}>
              <strong>{cls}</strong> &mdash; {desc}
            </div>
          ))}
        </div>
      </div>

      {/* OŚWIADCZENIE NADAWCY */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '5px 7px' }}>
        <div style={{ ...lbl, fontWeight: 'bold' }}>OŚWIADCZENIE NADAWCY / CONSIGNOR&apos;S DECLARATION</div>
        <div style={{ fontSize: '7.5px', marginTop: '3px', lineHeight: '1.5' }}>
          Oświadczam, że zawartość przesyłki jest w pełni i dokładnie opisana powyżej prawidłową nazwą przewozową
          oraz że jest sklasyfikowana, zapakowana, oznakowana, zaopatrzona w nalepki i pod każdym względem przygotowana
          do przewozu zgodnie z obowiązującymi przepisami RID.
        </div>
        <div style={{ fontSize: '6.5px', color: '#777', marginTop: '3px' }}>
          I hereby declare that the contents of this consignment are fully and accurately described above by the proper
          shipping name, and are classified, packaged, marked and labelled, and are in all respects in proper condition
          for carriage according to the applicable RID regulations.
        </div>
      </div>

      {/* DODATKOWE DANE I PODPIS */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Doradca do spraw bezpieczeństwa (DGSA) / Safety adviser:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Instrukcje pisemne wydane / Written instructions provided:</div>
          <div style={{ fontSize: '7.5px' }}>&#9634; TAK / YES &nbsp; &#9634; NIE / NO</div>
        </div>
        <div style={{ width: '180px', padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Przewóz w cysternie / Tank carriage:</div>
          <div style={{ fontSize: '7.5px' }}>&#9634; TAK / YES &nbsp; &#9634; NIE / NO</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, minHeight: '56px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Nadawca &mdash; imię, nazwisko, stanowisko / Consignor</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>drukowanymi / in block letters</div>
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
