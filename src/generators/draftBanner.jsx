// Nagłówek dokumentu, którego platforma NIE wystawia.
//
// Treść jest funkcją PARY (outputMode, issuerType), nie samego outputMode —
// „wersja robocza do złożenia w urzędzie" i „projekt do zatwierdzenia przez
// przewoźnika" to dwie różne rzeczy, choć obie mają outputMode 'draft':
//
//   customs_authority / chamber_of_commerce / government_agency
//       → WERSJA ROBOCZA — do złożenia w: {authority}
//   shipper
//       → WERSJA ROBOCZA — dane do złożenia w: {authority}
//   carrier
//       → PROJEKT — do zatwierdzenia przez przewoźnika
//
// Dzięki temu Bill of Lading, Sea Waybill, AWB, CIM i MTD zostają uczciwie
// oznaczone jako projekt (draft B/L to realny artefakt w spedycji: spedytor
// przygotowuje projekt, armator wystawia oryginał), a nie jako niedokończony
// produkt platformy.
//
// Galaz `shipper` istnieje dla formularzy, ktore zobowiazany sklada SAM
// w systemie urzedowym (CBAM, EUDR, SENT): dokument nie wchodzi do obrotu
// handlowego, wiec "projekt do zatwierdzenia przez przewoznika" bylby falszem,
// a bez naglowka user mialby wrazenie gotowego dokumentu.
//
// authority puste => sam "WERSJA ROBOCZA", bez dopowiedzenia. Wczesniej
// podstawialo sie "wlasciwym organie", czyli puste odeslanie, ktore wyglada
// na wypelnione pole i nie niesie zadnej informacji.

const AUTHORITY_ISSUERS = ['customs_authority', 'chamber_of_commerce', 'government_agency']

const TEXT = {
  authority: {
    PL: (authority) => (authority ? `WERSJA ROBOCZA — do złożenia w: ${authority}` : 'WERSJA ROBOCZA'),
    EN: (authority) => (authority ? `DRAFT — to be filed with: ${authority}` : 'DRAFT'),
  },
  shipper: {
    PL: (authority) => (authority ? `WERSJA ROBOCZA — dane do złożenia w: ${authority}` : 'WERSJA ROBOCZA'),
    EN: (authority) => (authority ? `DRAFT — data to be filed with: ${authority}` : 'DRAFT'),
  },
  carrier: {
    PL: () => 'PROJEKT — do zatwierdzenia przez przewoźnika',
    EN: () => 'DRAFT — to be approved by the carrier',
  },
}

// Zwraca tekst nagłówka albo null, gdy dokument go nie potrzebuje.
export function draftBannerText({ outputMode, issuerType, authority }, language = 'PL') {
  if (outputMode !== 'draft') return null
  const lang = language === 'EN' ? 'EN' : 'PL'
  if (issuerType === 'carrier') return TEXT.carrier[lang]()
  if (issuerType === 'shipper') return TEXT.shipper[lang](authority)
  if (AUTHORITY_ISSUERS.includes(issuerType)) return TEXT.authority[lang](authority)
  return null
}

// Opakowuje szablon paskiem u góry strony. Style inline i szerokość 794 px —
// ta sama konwencja co wszystkie szablony (patrz docs/slownik_zmiennych.md).
export function withDraftBanner(Template, bannerText) {
  function DraftBannerWrapper({ data }) {
    return (
      <div style={{ width: '794px', backgroundColor: '#fff' }}>
        <div
          style={{
            width: '794px',
            boxSizing: 'border-box',
            padding: '7px 10px',
            marginBottom: '4px',
            border: '2px solid #b45309',
            backgroundColor: '#fffbeb',
            color: '#7c2d12',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '10px',
            fontWeight: 'bold',
            letterSpacing: '0.4px',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          {bannerText}
        </div>
        <Template data={data} />
      </div>
    )
  }
  return DraftBannerWrapper
}
