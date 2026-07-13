import { formatDocumentDate } from '../../../../utils/formatDate'

export function ImdgDeclarationTemplate({ data }) {
  const today = formatDocumentDate(new Date())
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px',
    borderRight: b,
    borderBottom: b,
    fontSize: '7px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#2c5fa8',
    verticalAlign: 'top',
  }

  const emptyRow = (
    <div style={{ display: 'flex', minHeight: '18px' }}>
      {[40, null, 45, 45, 45, 55, 40, 45, 45].map((w, i) => (
        <div key={i} style={{ width: w ? `${w}px` : undefined, flex: w ? undefined : 1, borderRight: b, borderBottom: b }} />
      ))}
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>IMDG — DANGEROUS GOODS DECLARATION</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Shipper's Declaration for Dangerous Goods (Sea) · IMO IMDG Code</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Obowiązkowa dla towarów niebezpiecznych transportem morskim — wymagana przez armatora przed załadunkiem kontenera</div>
      </div>

      {/* NOTKA OSTRZEGAWCZA */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Armator może odmówić załadunku kontenera bez prawidłowej deklaracji IMDG. Fałszywa deklaracja =
          odpowiedzialność karna.
        </span>
      </div>

      {/* NADAWCA | ODBIORCA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '36px' }}>
          <div style={lbl}>Shipper / Nadawca (nazwa, adres, kraj):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}, {data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '36px' }}>
          <div style={lbl}>Consignee / Odbiorca (nazwa, adres, kraj):</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}, {data.receiver?.country}</div>
        </div>
      </div>

      {/* VOYAGE | POL | POD */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Voyage No.:</div>
          <div style={val}>{data.cargo?.voyageNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Port of Loading:</div>
          <div style={val}>{data.fromCity || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Port of Discharge:</div>
          <div style={val}>{data.toCity || ''}</div>
        </div>
      </div>

      {/* SEAL | CONTAINER TYPE | TARE WEIGHT */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Seal No. / Nr plomby:</div>
          <div style={val}>{data.cargo?.sealNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Container Type / Typ:</div>
          <div style={val}>{data.cargo?.containerType || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Tare Weight:</div>
          <div style={val} />
        </div>
      </div>

      {/* SEKCJA: OPIS TOWARU NIEBEZPIECZNEGO */}
      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>OPIS TOWARU NIEBEZPIECZNEGO / DANGEROUS GOODS DESCRIPTION</span>
      </div>

      {/* TABELA NAGŁÓWEK */}
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '40px' }}>UN No.</div>
        <div style={{ ...thStyle, flex: 1 }}>Proper Shipping Name<br />(Oficjalna nazwa wg IMDG)</div>
        <div style={{ ...thStyle, width: '45px' }}>Class /<br />Division</div>
        <div style={{ ...thStyle, width: '45px' }}>Packing<br />Group</div>
        <div style={{ ...thStyle, width: '45px' }}>Flash Point<br />(°C)</div>
        <div style={{ ...thStyle, width: '55px' }}>Marine<br />Pollutant</div>
        <div style={{ ...thStyle, width: '40px' }}>EmS<br />No.</div>
        <div style={{ ...thStyle, width: '45px' }}>Qty (kg)<br />Ilość</div>
        <div style={{ ...thStyle, width: '45px', borderRight: b }}>No. of<br />Packages</div>
      </div>

      {/* Wiersz z danymi — brak w słowniku wspólnego (poza drogowym) miejsca na klasę/UN dla ładunku
          morskiego; UN No./Class zostawione puste, patrz manifest poz. 15 (propozycja: namespace data.dg.*). */}
      <div style={{ display: 'flex', borderLeft: b, minHeight: '20px' }}>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }}>{data.cargo?.name || ''}</div>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '8px' }}>&#9634; Tak &#9634; Nie</div>
        <div style={{ width: '40px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.weight || ''}</div>
        <div style={{ width: '45px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages || ''}</div>
      </div>
      {emptyRow}
      {emptyRow}
      {emptyRow}

      {/* TYP OPAKOWANIA | CERTYFIKAT | SEGREGACJA */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Typ opakowania / Package type:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Certyfikat opakowania / Package cert.:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Klasa segregacji / Segregation:</div>
          <div style={val} />
        </div>
      </div>

      {/* PACKING CERTIFICATE */}
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, padding: '3px 5px', minHeight: '20px' }}>
        <div style={lbl}>Container/Vehicle Packing Certificate — oświadczam że towar załadowano zgodnie z IMDG Code:</div>
      </div>

      {/* OŚWIADCZENIE */}
      <div style={{ border: b, borderTop: 'none', padding: '5px 7px', backgroundColor: '#f7f7f7' }}>
        <span style={{ fontSize: '6.5px', color: '#555' }}>
          <strong>SHIPPER'S DECLARATION / OŚWIADCZENIE NADAWCY:</strong> I hereby declare that the contents of this
          consignment are fully and accurately described above by the Proper Shipping Name, and are classified,
          packed, marked and labeled/placarded and are in all respects in proper condition for transport by sea
          according to applicable international and national governmental regulations. Oświadczam że zawartość
          przesyłki jest dokładnie opisana i spełnia wymagania IMDG Code.
        </span>
      </div>

      {/* PODPISY */}
      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Nadawca / Shipper</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Przewoźnik / Carrier / Agent</div>
          <div style={{ fontSize: '8px', marginTop: '2px' }}>{data.carrier?.name || ''}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Data / Date</div>
          <div style={{ ...val, marginTop: '2px' }}>{today}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
      </div>

    </div>
  )
}
