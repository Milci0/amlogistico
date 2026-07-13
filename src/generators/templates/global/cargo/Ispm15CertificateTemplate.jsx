export function Ispm15CertificateTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const thStyle = {
    padding: '3px 4px', borderRight: b, borderBottom: b,
    fontSize: '7px', fontWeight: 'bold', color: '#fff',
    backgroundColor: '#2c5fa8', verticalAlign: 'top',
  }

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      <div style={{ border: b, padding: '8px 12px', backgroundColor: '#1a3a6b' }}>
        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>ISPM 15 — CERTYFIKAT OPAKOWAŃ DREWNIANYCH</div>
        <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Wood Packaging Material Certificate · IPPC Standard ISPM 15</div>
        <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>
          Wymagany dla palet, skrzyń i opakowań drewnianych eksportowanych do USA, Australii, Chin, Kanady, Japonii i wielu innych krajów
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Australia i NZ: brak certyfikatu ISPM 15 = zniszczenie towaru na koszt importera bez możliwości odwołania.
          Oznaczenie IPPC musi być widoczne na każdej palecie.
        </span>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '24px' }}>
          <div style={lbl}>Producent opakowań / Wood packaging producer:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '24px' }}>
          <div style={lbl}>Nr rejestracji IPPC / IPPC Registration No.:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Adres / Address:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Kraj / Country:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '22px' }}>
          <div style={lbl}>Zleceniodawca / Client (eksporter):</div>
          <div style={val}>{data.sender?.name || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '22px' }}>
          <div style={lbl}>Data produkcji / Production date:</div>
          <div style={val} />
        </div>
      </div>

      <div style={{ backgroundColor: '#2c5fa8', border: b, padding: '4px 6px', marginTop: '8px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>METODA OBRÓBKI / TREATMENT METHOD</span>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        {[
          ['HT — Heat Treatment', '56°C przez min. 30 minut w całej masie drewna', 'Obróbka cieplna — najczęściej stosowana, akceptowana wszędzie'],
          ['MB — Methyl Bromide Fumigacja', 'Fumigacja bromkiem metylu — ZAKAZANA w UE od 2010r.', 'Stosowana w niektórych krajach poza UE'],
          ['DH — Dielectric Heating', 'Podgrzewanie dielektryczne (mikrofale)', 'Alternatywa dla HT, mniej popularna'],
          ['SF75 — Sulfuryl Fluoride', 'Fumigacja fluorkiem sulfonylowym', 'Alternatywa dla MB w krajach gdzie MB zakazane'],
        ].map(([title, desc, note], i, arr) => (
          <div key={title} style={{ flex: 1, padding: '4px 6px', borderRight: i < arr.length - 1 ? b : undefined }}>
            <div style={{ fontSize: '7px' }}>&#9634; {title}</div>
            <div style={{ fontSize: '6px', color: '#666', marginTop: '2px' }}>{desc}</div>
            <div style={{ fontSize: '6px', color: '#999', marginTop: '2px' }}>{note}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#2c5fa8', borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff' }}>SPECYFIKACJA OPAKOWAŃ / PACKAGING SPECIFICATION</span
        >
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderTop: b }}>
        <div style={{ ...thStyle, width: '85px' }}>Typ opakowania<br />Packaging type</div>
        <div style={{ ...thStyle, width: '55px' }}>Ilość sztuk<br />Quantity</div>
        <div style={{ ...thStyle, flex: 1 }}>Gatunek drewna<br />Wood species</div>
        <div style={{ ...thStyle, width: '55px' }}>Wymiary (cm)<br />Dimensions</div>
        <div style={{ ...thStyle, width: '55px' }}>Nr partii<br />Batch No.</div>
        <div style={{ ...thStyle, width: '55px' }}>Data obróbki<br />Treatment date</div>
        <div style={{ ...thStyle, width: '65px', borderRight: b }}>Certyfikat obróbki No.<br />Treatment cert. No.</div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, minHeight: '40px' }}>
        <div style={{ width: '85px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '7px' }}>
          &#9634; Paleta EUR<br />&#9634; Paleta przemysłowa<br />&#9634; Skrzynia<br />&#9634; Inne:
        </div>
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px', textAlign: 'center' }}>{data.cargo?.packages || ''}</div>
        <div style={{ flex: 1, padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '55px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
        <div style={{ width: '65px', padding: '2px 4px', borderRight: b, borderBottom: b, fontSize: '9px' }} />
      </div>

      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b }}>
          <div style={{ ...lbl, fontWeight: 'bold' }}>OZNACZENIE IPPC NA OPAKOWANIU / IPPC MARKING:</div>
          <div style={{ fontSize: '6.5px', color: '#555', marginTop: '2px' }}>Każde opakowanie drewniane musi być trwale oznakowane:</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a3a6b', marginTop: '4px' }}>PL — 1234 — HT</div>
          <div style={{ fontSize: '6px', color: '#999' }}>kraj | nr producenta | metoda &nbsp; country | producer No. | treatment method</div>
          <div style={{ fontSize: '6.5px', color: '#555', marginTop: '4px' }}>
            Logo IPPC musi być widoczne i czytelne z zewnątrz opakowania. Nie może być naklejką — musi być trwale
            naniesione (wypalenie, tłoczenie, farba niezmywalna).
          </div>
        </div>
        <div style={{ width: '220px', padding: '4px 6px' }}>
          <div style={lbl}>Próbka oznaczenia / Sample marking:</div>
          <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '9px', color: '#999' }}>[ IPPC LOGO ]</div>
          <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>PL-1234-HT</div>
          <div style={{ textAlign: 'center', fontSize: '7px', color: '#666' }}>Polska / Poland</div>
        </div>
      </div>

      <div style={{ display: 'flex', border: b, marginTop: '8px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Producent opakowań / Producer</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Kierownik zakładu / Manager</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', minHeight: '55px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Data / Date</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis i pieczęć / Signature &amp; stamp</div>
        </div>
      </div>

    </div>
  )
}
