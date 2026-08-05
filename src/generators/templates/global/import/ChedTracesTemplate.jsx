// CHED to dokument urzedowy: powstaje w systemie TRACES NT, czesc I wypelnia
// podmiot odpowiedzialny za przesylke, a czesci II i III wylacznie wlasciwy
// organ na granicznym punkcie kontroli. Platforma go NIE wystawia
// (outputMode: 'blank_only'), wiec szablon CELOWO nie przyjmuje propsa `data`
// i nie ma w nim ANI JEDNEGO odwolania do danych uzytkownika - to jedyny
// sposob, zeby wydruk nie udawal wypelnionego dokumentu urzedowego.
// Sciezka generowania i tak podstawia tu pusty obiekt (generateOne ->
// downloadBlankDocument), ale sygnatura bez propsa czyni to niezaleznym
// od tamtej warstwy.

export function ChedTracesTemplate() {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '13px' }
  const secHdr = {
    backgroundColor: '#2c5fa8', padding: '4px 6px',
    fontSize: '8px', fontWeight: 'bold', color: '#fff',
  }
  const field = (label, width) => (
    <div style={{ ...(width ? { width } : { flex: 1 }), padding: '3px 5px', borderRight: b, minHeight: '28px' }}>
      <div style={lbl}>{label}</div>
      <div style={val} />
    </div>
  )

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#1a3a6b', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>CHED — WSPÓLNY ZDROWOTNY DOKUMENT WEJŚCIA</div>
          <div style={{ fontSize: '8px', color: '#a0b8d8', marginTop: '2px' }}>Common Health Entry Document &middot; system TRACES NT</div>
          <div style={{ fontSize: '6.5px', color: '#a0b8d8', marginTop: '1px' }}>Rozporządzenie (UE) 2017/625</div>
        </div>
        <div style={{ width: '170px', padding: '6px 8px', backgroundColor: '#1a3a6b' }}>
          <div style={{ ...lbl, color: '#a0b8d8' }}>Nr referencyjny CHED:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#a0b8d8', marginTop: '4px' }}>Rodzaj / Type:</div>
          <div style={{ color: '#fff', fontSize: '7.5px', minHeight: '14px' }}>&#9634; CHED-A &#9634; CHED-P &#9634; CHED-PP &#9634; CHED-D</div>
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fffbe6' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Dokument wystawia właściwy organ na granicznym punkcie kontroli (BCP) w systemie TRACES NT.
          Część I wypełnia podmiot odpowiedzialny za przesyłkę przed przybyciem, części II i III wypełnia wyłącznie organ.
          Wydruk poniżej jest pustym formularzem pomocniczym do przygotowania danych.
        </span>
      </div>

      {/* CZĘŚĆ I */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>
        CZĘŚĆ I — OPIS PRZESYŁKI (wypełnia podmiot odpowiedzialny) / PART I — DESCRIPTION OF CONSIGNMENT
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '54px' }}>
          <div style={lbl}>I.1 Nadawca / Consignor:</div>
          <div style={val} /><div style={val} /><div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '54px' }}>
          <div style={lbl}>I.2 Odbiorca / Consignee:</div>
          <div style={val} /><div style={val} /><div style={val} />
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '54px' }}>
          <div style={lbl}>I.3 Podmiot odpowiedzialny za przesyłkę / Operator responsible:</div>
          <div style={val} /><div style={val} /><div style={val} />
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        {field('I.4 Graniczny punkt kontroli (BCP) / Border Control Post:')}
        {field('I.5 Kraj pochodzenia / Country of origin:', '130px')}
        {field('I.6 Kraj wysyłki / Country of dispatch:', '130px')}
        <div style={{ width: '130px', padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>I.7 Miejsce przeznaczenia / Place of destination:</div>
          <div style={val} />
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        {field('I.8 Środek transportu / Means of transport:')}
        {field('I.9 Identyfikacja / Identification:', '150px')}
        {field('I.10 Nr kontenera / Container No.:', '130px')}
        <div style={{ width: '130px', padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>I.11 Nr plomby / Seal No.:</div>
          <div style={val} />
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        {field('I.12 Data i godzina przybycia / Date and time of arrival:')}
        {field('I.13 Temperatura przewozu / Transport temperature:', '150px')}
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '28px' }}>
          <div style={lbl}>I.14 Cel przywozu / Purpose:</div>
          <div style={{ fontSize: '7.5px' }}>&#9634; wprowadzenie na rynek &nbsp; &#9634; tranzyt &nbsp; &#9634; przeładunek &nbsp; &#9634; zwrot</div>
        </div>
      </div>

      {/* TOWAR */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '46px' }}>
          <div style={lbl}>I.15 Opis towaru / Description of goods:</div>
          <div style={val} /><div style={val} />
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '46px' }}>
          <div style={lbl}>I.16 Kod CN / CN code:</div>
          <div style={val} />
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '46px' }}>
          <div style={lbl}>I.17 Liczba opakowań / Packages:</div>
          <div style={val} />
        </div>
        <div style={{ width: '110px', padding: '3px 5px', borderRight: b, minHeight: '46px' }}>
          <div style={lbl}>I.18 Masa netto (kg) / Net weight:</div>
          <div style={val} />
        </div>
        <div style={{ width: '110px', padding: '3px 5px', minHeight: '46px' }}>
          <div style={lbl}>I.19 Świadectwa towarzyszące / Accompanying certificates:</div>
          <div style={val} />
        </div>
      </div>

      {/* CZĘŚĆ II */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b, backgroundColor: '#1a3a6b' }}>
        CZĘŚĆ II — DECYZJA (wypełnia wyłącznie właściwy organ) / PART II — DECISION (competent authority only)
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '52px' }}>
          <div style={lbl}>II.1 Przeprowadzone kontrole / Checks carried out:</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>&#9634; dokumentacyjna &nbsp; &#9634; identyfikacyjna &nbsp; &#9634; bezpośrednia</div>
          <div style={{ ...lbl, marginTop: '4px' }}>II.2 Wyniki badań laboratoryjnych / Laboratory tests:</div>
          <div style={val} />
        </div>
        <div style={{ flex: 1, padding: '4px 6px', minHeight: '52px' }}>
          <div style={lbl}>II.3 Decyzja / Decision:</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>&#9634; dopuszczone / acceptable</div>
          <div style={{ fontSize: '7.5px' }}>&#9634; niedopuszczone / not acceptable</div>
          <div style={{ ...lbl, marginTop: '4px' }}>Uzasadnienie / Reason:</div>
          <div style={val} />
        </div>
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '4px 6px', borderRight: b, minHeight: '46px' }}>
          <div style={lbl}>II.4 Działanie w razie odmowy / Action in case of refusal:</div>
          <div style={{ fontSize: '7.5px', marginTop: '2px' }}>&#9634; odesłanie &nbsp; &#9634; zniszczenie &nbsp; &#9634; przetworzenie &nbsp; &#9634; inne przeznaczenie</div>
        </div>
        <div style={{ width: '280px', padding: '5px 7px', minHeight: '46px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Urzędowy inspektor / Official inspector</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Data, podpis, pieczęć urzędowa</div>
        </div>
      </div>

      {/* CZĘŚĆ III */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b, backgroundColor: '#1a3a6b' }}>
        CZĘŚĆ III — DZIAŁANIA NASTĘPCZE (wypełnia wyłącznie właściwy organ) / PART III — FOLLOW-UP
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, minHeight: '44px' }}>
        {field('III.1 Podjęte środki / Measures taken:')}
        {field('III.2 Miejsce przeznaczenia przesyłki / Consignment destination:', '200px')}
        <div style={{ width: '200px', padding: '3px 5px', minHeight: '44px' }}>
          <div style={lbl}>III.3 Data i podpis / Date and signature:</div>
          <div style={val} />
        </div>
      </div>

    </div>
  )
}
