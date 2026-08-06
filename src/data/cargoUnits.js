// Typy jednostek ładunku (opakowań) dla pola „Typ i liczba jednostek ładunku"
// w kroku „Towar" kreatora. Osobny plik danych — ten sam wzorzec co
// src/data/cargoCategories.js (dane oddzielone od komponentu widgetu).
//
// `unCode` = oficjalny kod UN/ECE Recommendation 21 „Codes for types of cargo,
// packages and packaging materials" (te same 2-literowe kody co w EDIFACT 7065
// i w unijnych deklaracjach celnych „Kind of packages"). Zweryfikowane przez
// dwa niezależne źródła (peppol.eu codelist + datasets/unece-package-codes),
// NIE z pamięci — patrz `unNote` przy trzech typach bez jednoznacznego
// odpowiednika w Rec 21 (ULD, BLK, ROR), gdzie kod jest świadomym przybliżeniem
// (potwierdzonym z użytkownikiem), a nie oficjalnym 1:1 dopasowaniem.

export const CARGO_UNIT_GROUPS = [
  {
    id: 'standard',
    label: 'Standardowe',
    units: [
      { code: 'PLT', name: 'Paleta', nameEn: 'Pallet', unCode: 'PX', hint: 'Paleta EUR: 120×80 cm, nośność do ok. 1000 kg (paleta przemysłowa 120×100 cm, do ok. 1500 kg).' },
      { code: 'CTN', name: 'Karton', nameEn: 'Carton', unCode: 'CT', hint: 'Opakowanie kartonowe, zwykle do ok. 30 kg.' },
      { code: 'CRT', name: 'Skrzynia', nameEn: 'Crate', unCode: 'CR', hint: 'Skrzynia drewniana lub plastikowa, towary nieregularne lub cięższe.' },
      { code: 'BAG', name: 'Worek', nameEn: 'Bag', unCode: 'BG', hint: 'Worek luzem, big-bag do ok. 1000 kg lub worek foliowy/papierowy.' },
      { code: 'DRM', name: 'Beczka', nameEn: 'Drum', unCode: 'DR', hint: 'Beczka metalowa lub plastikowa, zwykle 200 l, najczęściej ciecze i chemikalia.' },
      { code: 'ROL', name: 'Rolka', nameEn: 'Roll', unCode: 'RO', hint: 'Towar zwinięty w rolkę, folia, tkanina, papier, blacha w kręgach.' },
      { code: 'PCS', name: 'Sztuka', nameEn: 'Piece', unCode: 'PP', hint: 'Pojedyncza, niepakowana jednostka towaru.' },
      { code: 'SET', name: 'Zestaw', nameEn: 'Set', unCode: 'SX', hint: 'Komplet kilku elementów pakowanych i liczonych razem.' },
    ],
  },
  {
    id: 'air',
    label: 'Lotnicze',
    units: [
      {
        code: 'ULD',
        name: 'ULD (kontener lotniczy)',
        nameEn: 'Unit Load Device',
        unCode: 'CN',
        unNote: 'Rec 21 nie ma kodu dla ULD (system lotniczy standaryzowany przez IATA, poza Rec 21, własne 3-literowe kody typu AKE/PMC). CN „Container, not otherwise specified" przyjęty jako najbliższe przybliżenie.',
        hint: 'Unit Load Device, znormalizowany kontener lub paleta lotnicza (np. AKE, AKH).',
      },
      { code: 'LOOSE', name: 'Luzem (lotnicze)', nameEn: 'Unpacked / loose', unCode: 'NE', hint: 'Ładunek bez jednostkowego opakowania, przewożony luzem w ładowni.' },
    ],
  },
  {
    id: 'bulk',
    label: 'Masowe i specjalne',
    units: [
      { code: 'TNK', name: 'Cysterna', nameEn: 'Tank container', unCode: 'TG', hint: 'Ciecze lub gazy luzem, cysterna drogowa/kolejowa lub kontener-cysterna (ISO tank).' },
      {
        code: 'BLK',
        name: 'Luzem masowy',
        nameEn: 'Bulk, solid (granular)',
        unCode: 'VR',
        unNote: 'Rec 21 dzieli bulk wg stanu fizycznego (VG gaz / VL ciecz / VO grudki / VR ziarna / VY proszek / VS złom złomu metali), brak jednego uniwersalnego kodu. VR przyjęty jako domyślny (najczęstszy przypadek: zboże, kruszywo).',
        hint: 'Towar sypki bez opakowań jednostkowych, np. zboże, kruszywo, węgiel.',
      },
      {
        code: 'ROR',
        name: 'Ro-Ro',
        nameEn: 'Vehicle (Ro-Ro)',
        unCode: 'VN',
        unNote: 'Ro-Ro to sposób załadunku (samojezdna jednostka), nie typ opakowania, Rec 21 nie ma dedykowanego kodu. VN „Vehicle" przyjęty jako przybliżenie, trafne gdy sam ładunek to pojazd/naczepa.',
        hint: 'Samojezdna jednostka ładunkowa (pojazd, naczepa) wjeżdżająca na prom lub statek własnymi kołami.',
      },
    ],
  },
]

export function getUnitType(code) {
  for (const group of CARGO_UNIT_GROUPS) {
    const unit = group.units.find((u) => u.code === code)
    if (unit) return unit
  }
  return null
}
