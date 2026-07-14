import { formatDocumentDate } from '../../../../utils/formatDate'

export function MsdsSafetyDataSheetTemplate({ data }) {
  const today = formatDocumentDate(new Date())
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }

  const sections = [
    'Identyfikacja substancji/mieszaniny i identyfikacja przedsiębiorstwa',
    'Identyfikacja zagrożeń — piktogramy GHS, hasła ostrzegawcze H/P',
    'Skład / informacja o składnikach — wzór chemiczny, stężenia',
    'Środki pierwszej pomocy — narażenie na skórę, oczy, drogi oddechowe',
    'Postępowanie w przypadku pożaru — środki gaśnicze, temperatury',
    'Postępowanie w przypadku niezamierzonego uwolnienia',
    'Postępowanie z substancją i jej przechowywanie',
    'Kontrola narażenia / środki ochrony indywidualnej — PPE',
    'Właściwości fizyczne i chemiczne — temp. zapłonu, gęstość, pH',
    'Stabilność i reaktywność — warunki, które należy unikać',
    'Informacje toksykologiczne — LD50, LC50, drogi narażenia',
    'Informacje ekologiczne — ekotoksyczność, biodegradacja',
    'Postępowanie z odpadami — metody usuwania',
    'Informacje dotyczące transportu — UN No., klasa, PG, EmS',
    'Informacje dotyczące przepisów prawnych — regulacje UE/lokalne',
    'Inne informacje — data ostatniej rewizji, źródła',
  ]

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>MSDS — MATERIAL SAFETY DATA SHEET</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Karta Charakterystyki Substancji Niebezpiecznej · GHS / SDS</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Wymagana przez armatora dla towarów niebezpiecznych, chemikaliów i baterii litowych. Format GHS. 16 sekcji obowiązkowych.</div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Nazwa substancji / Product name:</div>
          <div style={val}>{data.cargo?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Nr CAS:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Nr UN:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Data sporządzenia:</div>
          <div style={val}>{today}</div>
        </div>
      </div>

      {sections.map((desc, i) => (
        <div key={i} style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: i === 0 ? b : 'none', borderBottom: b, minHeight: '18px' }}>
          <div style={{ width: '65px', padding: '3px 4px', borderRight: b, fontSize: '7px', fontWeight: 'bold', color: '#fff', backgroundColor: '#2c5fa8', display: 'flex', alignItems: 'center' }}>SEKCJA {i + 1}</div>
          <div style={{ flex: 1, padding: '3px 5px', borderRight: b, fontSize: '8px', display: 'flex', alignItems: 'center' }}>{desc}</div>
          <div style={{ width: '90px', padding: '3px 5px' }} />
        </div>
      ))}

      <div style={{ borderLeft: b, borderRight: b, borderBottom: b, padding: '3px 5px', textAlign: 'center' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Sekcja 14 — najważniejsza dla przewoźników: UN No., Proper Shipping Name, Class, Packing Group, Marine Pollutant (Y/N)
        </span>
      </div>

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Autor / Author</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Zatwierdził / Approved by</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Data rewizji / Revision date</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
      </div>

    </div>
  )
}
