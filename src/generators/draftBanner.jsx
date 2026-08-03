// Nagłówek dokumentu, którego platforma NIE wystawia.
//
// Treść jest funkcją PARY (outputMode, issuerType), nie samego outputMode —
// „wersja robocza do złożenia w urzędzie" i „projekt do zatwierdzenia przez
// przewoźnika" to dwie różne rzeczy, choć obie mają outputMode 'draft':
//
//   customs_authority / chamber_of_commerce / government_agency
//       → WERSJA ROBOCZA — do złożenia w: {authority}
//   carrier
//       → PROJEKT — do zatwierdzenia przez przewoźnika
//
// Dzięki temu Bill of Lading, Sea Waybill, AWB, CIM i MTD zostają uczciwie
// oznaczone jako projekt (draft B/L to realny artefakt w spedycji: spedytor
// przygotowuje projekt, armator wystawia oryginał), a nie jako niedokończony
// produkt platformy.

const AUTHORITY_ISSUERS = ['customs_authority', 'chamber_of_commerce', 'government_agency']

const TEXT = {
  authority: {
    PL: (authority) => `WERSJA ROBOCZA — do złożenia w: ${authority}`,
    EN: (authority) => `DRAFT — to be filed with: ${authority}`,
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
  if (AUTHORITY_ISSUERS.includes(issuerType)) {
    return TEXT.authority[lang](authority || (lang === 'EN' ? 'the competent authority' : 'właściwym organie'))
  }
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
