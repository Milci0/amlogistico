import { formatDocumentDate } from '../../../../utils/formatDate'

export function ContainerPackingCertificateTemplate({ data }) {
  const b = '1px solid #c0c0c0'
  const lbl = { fontSize: '7px', color: '#555', marginBottom: '1px' }
  const val = { fontSize: '9px', minHeight: '11px' }
  const secHdr = {
    backgroundColor: '#8a1f1f', padding: '4px 6px',
    fontSize: '8px', fontWeight: 'bold', color: '#fff',
  }

  // Oswiadczenia z Kodeksu IMDG 5.4.2 - kolejnosc jak w kodeksie, tresc skrocona
  // do jednego zdania na pozycje (pelne brzmienie jest w samym kodeksie).
  const statements = [
    ['Kontener był czysty, suchy i przydatny do przewozu towaru',
     'the container was clean, dry and fit to receive the goods'],
    ['Przesyłki, których nie wolno przewozić razem, nie zostały zapakowane do tego samego kontenera',
     'goods which must be segregated have not been packed together in the container'],
    ['Wszystkie sztuki przesyłki zostały sprawdzone pod kątem uszkodzeń, wycieków i wysypywania się zawartości',
     'all packages have been externally inspected for damage, leakage or sifting'],
    ['Wszystkie sztuki przesyłki zostały prawidłowo załadowane i zamocowane, a w razie potrzeby zabezpieczone materiałem sztauerskim',
     'all packages have been properly loaded and secured, with adequate dunnage where required'],
    ['Bębny i beczki zostały ustawione w pozycji stojącej, o ile właściwy organ nie zezwolił inaczej',
     'drums have been stowed in an upright position unless otherwise authorised'],
    ['Ładunek jest równomiernie rozłożony, a masa nie przekracza dopuszczalnej ładowności kontenera',
     'the load is evenly distributed and does not exceed the maximum payload of the container'],
    ['Kontener i sztuki przesyłki są prawidłowo oznakowane, opatrzone nalepkami ostrzegawczymi i nalepkami dużych rozmiarów',
     'the container and the packages are properly marked, labelled and placarded'],
    ['Jeżeli jako środek chłodzący użyto suchego lodu, kontener został oznakowany z zewnątrz',
     'when dry ice is used for cooling purposes, the container is externally marked'],
    ['Dla każdej przesyłki towarów niebezpiecznych otrzymano deklarację nadawcy',
     'a dangerous goods declaration has been received for each consignment loaded in the container'],
  ]

  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '8px', color: '#000', backgroundColor: '#fff', boxSizing: 'border-box', padding: '8px 10px' }}>

      {/* NAGŁÓWEK */}
      <div style={{ display: 'flex', border: b }}>
        <div style={{ flex: 1, backgroundColor: '#8a1f1f', padding: '8px 12px', borderRight: b }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px' }}>ŚWIADECTWO PAKOWANIA KONTENERA</div>
          <div style={{ fontSize: '9px', color: '#f0c8c8', marginTop: '2px' }}>Container/Vehicle Packing Certificate</div>
          <div style={{ fontSize: '6.5px', color: '#f0c8c8', marginTop: '1px' }}>Kodeks IMDG 5.4.2 &middot; Kodeks CTU (IMO/ILO/EKG ONZ, 2014)</div>
        </div>
        <div style={{ width: '150px', padding: '6px 8px', backgroundColor: '#8a1f1f' }}>
          <div style={{ ...lbl, color: '#f0c8c8' }}>Nr świadectwa / Certificate No.:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }} />
          <div style={{ ...lbl, color: '#f0c8c8', marginTop: '4px' }}>Data / Date:</div>
          <div style={{ color: '#fff', fontSize: '9px', minHeight: '14px' }}>{formatDocumentDate(data.loadDate)}</div>
        </div>
      </div>

      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px', backgroundColor: '#fff5f5' }}>
        <span style={{ fontSize: '6.5px', color: '#666' }}>
          Świadectwo wystawia osoba odpowiedzialna za zapakowanie kontenera. Może ono stanowić odrębny dokument albo część
          łączonego formularza deklaracji towarów niebezpiecznych i świadectwa pakowania. /
          Completed by the person responsible for packing the container. It may be a separate document or form part of a combined
          dangerous goods declaration and packing certificate.
        </span>
      </div>

      {/* STRONY */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '48px' }}>
          <div style={lbl}>Nadawca / Shipper:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={val}>{data.sender?.address}</div>
          <div style={val}>{data.sender?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '48px' }}>
          <div style={lbl}>Odbiorca / Consignee:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.receiver?.name}</div>
          <div style={val}>{data.receiver?.address}</div>
          <div style={val}>{data.receiver?.country}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '48px' }}>
          <div style={lbl}>Przewoźnik / Carrier:</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.carrier?.name || ''}</div>
          <div style={{ ...lbl, marginTop: '4px' }}>Statek i rejs / Vessel and voyage:</div>
          <div style={val}>{data.cargo?.vessel || ''} {data.cargo?.voyageNo || ''}</div>
        </div>
      </div>

      {/* KONTENER */}
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr kontenera lub pojazdu / Container or vehicle No.:</div>
          <div style={{ ...val, fontWeight: 'bold' }}>{data.cargo?.containerNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Typ kontenera / Container type:</div>
          <div style={val}>{data.cargo?.containerType || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '26px' }}>
          <div style={lbl}>Nr plomby / Seal No.:</div>
          <div style={val}>{data.cargo?.sealNo || ''}</div>
        </div>
        <div style={{ flex: 1, padding: '3px 5px', minHeight: '26px' }}>
          <div style={lbl}>Port załadunku / Port of loading:</div>
          <div style={val}>{data.fromCity}</div>
        </div>
      </div>

      {/* TOWAR NIEBEZPIECZNY */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>TOWAR NIEBEZPIECZNY W KONTENERZE / DANGEROUS GOODS IN THE CONTAINER</div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
        <div style={{ flex: 1, padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Prawidłowa nazwa przewozowa / Proper shipping name:</div>
          <div style={val}>{data.cargo?.name}</div>
        </div>
        {/* Nr UN i klasa nie maja odpowiednika w migawce dla galezi morskiej
            (pole adrClass zbierane jest wylacznie w galezi drogowej) - zostaja
            puste do recznego wypelnienia. */}
        <div style={{ width: '70px', padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Nr UN / UN No.:</div>
          <div style={val} />
        </div>
        <div style={{ width: '70px', padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Klasa / Class:</div>
          <div style={val} />
        </div>
        <div style={{ width: '70px', padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Grupa pakowania / Packing group:</div>
          <div style={val} />
        </div>
        <div style={{ width: '90px', padding: '3px 5px', borderRight: b, minHeight: '30px' }}>
          <div style={lbl}>Liczba i rodzaj sztuk / No. and kind of packages:</div>
          <div style={val}>{data.cargo?.packages} {data.cargo?.packageTypeUnCode || ''}</div>
        </div>
        <div style={{ width: '80px', padding: '3px 5px', minHeight: '30px' }}>
          <div style={lbl}>Masa brutto (kg) / Gross mass:</div>
          <div style={val}>{data.cargo?.weight}</div>
        </div>
      </div>

      {/* OŚWIADCZENIA */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b }}>OŚWIADCZENIA / DECLARATIONS</div>
      <div style={{ borderLeft: b, borderRight: b, borderTop: b, padding: '4px 6px' }}>
        <span style={{ fontSize: '7px', color: '#333' }}>
          Oświadczam, że kontener został zapakowany zgodnie z Kodeksem IMDG oraz że: /
          I declare that the container has been packed in accordance with the IMDG Code and that:
        </span>
      </div>
      {statements.map(([pl, en], i) => (
        <div key={pl} style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b }}>
          <div style={{ width: '22px', padding: '3px 4px', borderRight: b, fontSize: '7px', color: '#666', textAlign: 'center' }}>{i + 1}</div>
          <div style={{ flex: 1, padding: '3px 6px' }}>
            <div style={{ fontSize: '7.5px' }}>{pl}</div>
            <div style={{ fontSize: '6.5px', color: '#777' }}>{en}</div>
          </div>
          <div style={{ width: '80px', padding: '3px 5px', borderLeft: b, fontSize: '7.5px', textAlign: 'center' }}>
            &#9634; TAK / YES
          </div>
        </div>
      ))}

      {/* PODPIS */}
      <div style={{ ...secHdr, borderLeft: b, borderRight: b, borderTop: b, backgroundColor: '#5c1414' }}>
        OSOBA ODPOWIEDZIALNA ZA ZAPAKOWANIE / PERSON RESPONSIBLE FOR PACKING
      </div>
      <div style={{ display: 'flex', borderLeft: b, borderRight: b, borderTop: b, borderBottom: b, minHeight: '58px' }}>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Nazwa firmy / Company name</div>
          <div style={{ ...val, marginTop: '2px' }}>{data.sender?.name}</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>&nbsp;</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', borderRight: b, display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Imię, nazwisko i stanowisko / Name and position</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>drukowanymi / in block letters</div>
        </div>
        <div style={{ flex: 1, padding: '5px 7px', display: 'flex', flexDirection: 'column' }}>
          <div style={lbl}>Miejsce, data i podpis / Place, date and signature</div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: b, paddingTop: '2px', textAlign: 'center', fontSize: '7px', color: '#555' }}>Podpis / Signature</div>
        </div>
      </div>

    </div>
  )
}
