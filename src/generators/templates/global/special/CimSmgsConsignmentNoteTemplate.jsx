import { formatDocumentDate } from '../../../../utils/formatDate'

// Wspolny list przewozowy CIM/SMGS - jeden dokument na cala trase, bez
// przepisywania na granicy miedzy strefa COTIF a strefa SMGS.
//
// JEZYKI: przewodnik GLV-CIM/SMGS stawia wymog PER POLE, nie dla calego
// dokumentu (pola wspolne: rosyjski + jeden z EN/FR/DE; pola tylko CIM:
// EN/FR/DE; pola tylko SMGS: rosyjski; do Chin dodatkowo chinski). Szablon
// ma na razie etykiety PL/EN jak reszta repo - warstwa jezykowa i props
// `boxScope` to osobny zakres. Przypisanie pol do stref, zeby nie trzeba
// bylo ustalac go od nowa:
//   wspolne: nadawca, odbiorca, opis towaru, masa, opakowania, stacje
//   tylko CIM: oswiadczenia nadawcy, przewoznik umowny, koszty
//   tylko SMGS: adnotacje kolei, przeladunek na innej szerokosci toru
export function CimSmgsConsignmentNoteTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }
  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '18px' }}>
      {[30, 90, null, 70, 70, 70].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#1a3a6b', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>WSPÓLNY LIST PRZEWOZOWY CIM/SMGS</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>CIM/SMGS Common Consignment Note</div>
          <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>CIM art. 6 &sect; 8 (załącznik B do COTIF) &middot; SMGS art. 13 &middot; GLV-CIM/SMGS</div>
        </div>
        <div style={{ width: '160px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>Nr przesyłki / Consignment No.:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#a0b8d8', marginTop: '4px' }}>Data nadania / Date of acceptance:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }}>{formatDocumentDate(data.loadDate)}</div>
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#f5f7fa' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Jeden list przewozowy dla odcinka objętego przepisami CIM i odcinka objętego SMGS, bez przepisywania dokumentu
          na styku obu reżimów. Na relacjach kończących się w strefie SMGS zastępuje odrębny list CIM.
        </span>
      </div>

      {/* 1-4. STRONY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '58px' }}>
          <div style={lbl}>1. Nadawca / Consignor (nazwa, adres, kraj):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '58px' }}>
          <div style={lbl}>4. Odbiorca / Consignee (nazwa, adres, kraj):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
        <div style={{ width: '200px', padding: '3px 5px', minHeight: '58px' }}>
          <div style={lbl}>Przewoźnik umowny / Contractual carrier:</div>
          <div style={val}>{data.carrier?.name || ''}</div>
          <div style={{ ...lbl, marginTop: '4px' }}>Przewoźnicy kolejni / Successive carriers:</div>
          <div style={val} />
        </div>
      </div>

      {/* STACJE */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Stacja nadania / Station of departure:</div>
          <div style={val}>{data.rail?.stationFrom || data.fromCity}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Stacja przeznaczenia / Station of destination:</div>
          <div style={val}>{data.rail?.stationTo || data.toCity}</div>
        </div>
        <div style={{ width: '150px', padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Stacja przejścia CIM/SMGS / Interchange station:</div>
          <div style={val} />
        </div>
        <div style={{ width: '150px', padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Droga przewozu / Route:</div>
          <div style={val} />
        </div>
      </div>

      {/* WAGONY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Nr wagonu lub wagonów / Wagon number(s):</div>
          <div style={val}>{data.rail?.wagonNumbers || ''}</div>
        </div>
        <div style={{ width: '150px', padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Przesyłka grupowa / Group consignment:</div>
          <div style={{ fontSize: '7.5px' }}>
            {data.rail?.groupConsignment
              ? <>TAK / YES</>
              : <>&#9634; TAK / YES &nbsp; &#9634; NIE / NO</>}
          </div>
        </div>
        <div style={{ width: '150px', padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Nr kontenera / Container No.:</div>
          <div style={val}>{data.cargo?.containerNo || ''}</div>
        </div>
        <div style={{ width: '150px', padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Przeładunek na inną szerokość toru / Transhipment to other gauge:</div>
          <div style={{ fontSize: '7.5px' }}>&#9634; TAK / YES &nbsp; &#9634; NIE / NO</div>
        </div>
      </div>

      {/* TABELA TOWARÓW */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '30px' }}>Lp.<br />No.</div>
        <div style={{ ...thStyle, width: '90px' }}>Znaki i numery<br />Marks and Nos.</div>
        <div style={{ ...thStyle, flex: 1 }}>Opis towaru<br />Description of goods</div>
        <div style={{ ...thStyle, width: '70px' }}>Kod HS<br />HS code</div>
        <div style={{ ...thStyle, width: '70px' }}>Opakowania<br />Packages</div>
        <div style={{ ...thStyle, width: '70px', borderRight: b }}>Masa brutto (kg)<br />Gross mass</div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, minHeight: '22px' }}>
        <div style={{ width: '30px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>1</div>
        <div style={{ width: '90px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.marksNos || ''}</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name}</div>
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.hsCode}</div>
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages} {data.cargo?.packageTypeUnCode || ''}</div>
        <div style={{ width: '70px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight}</div>
      </div>
      {emptyRow}{emptyRow}{emptyRow}{emptyRow}{emptyRow}

      {/* OŚWIADCZENIA I DOKUMENTY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>Oświadczenia nadawcy / Consignor&apos;s declarations:</div>
          <div style={val}>{data.cargo?.notes || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '40px' }}>
          <div style={lbl}>Dokumenty załączone przez nadawcę / Documents attached:</div>
          <div style={val} />
        </div>
        <div style={{ width: '170px', padding: '3px 5px', minHeight: '40px' }}>
          <div style={lbl}>Towar niebezpieczny RID / RID dangerous goods:</div>
          <div style={{ fontSize: '7.5px' }}>&#9634; TAK / YES &nbsp; &#9634; NIE / NO</div>
        </div>
      </div>

      {/* KOSZTY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Warunki opłaty przewoźnego / Payment of charges:</div>
          <div style={val}>{data.cargo?.incoterms || ''}</div>
        </div>
        <div style={{ width: '150px', padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Przewoźne / Freight charges:</div>
          <div style={val}>{data.terms?.freightPrice} {data.terms?.freightCurrency}</div>
        </div>
        <div style={{ width: '150px', padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Zaliczka / Advance:</div>
          <div style={val} />
        </div>
        <div style={{ width: '150px', padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Deklaracja wartości / Declared value:</div>
          <div style={val}>{data.cargo?.value} {data.cargo?.currency}</div>
        </div>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Nadawca / Consignor</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Miejsce, data, podpis</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Przewoźnik przyjmujący / Accepting carrier</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Stempel stacji nadania, data</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Odbiorca / Consignee</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Data odbioru, podpis</div>
        </div>
      </div>

    </div>
  )
}
