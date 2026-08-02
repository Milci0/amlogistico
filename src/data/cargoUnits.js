// Typy jednostek ładunku (opakowań) dla pola „Typ i liczba jednostek ładunku"
// w kroku „Towar" kreatora. Osobny plik danych — ten sam wzorzec co
// src/data/cargoCategories.js (dane oddzielone od komponentu widgetu).

export const CARGO_UNIT_GROUPS = [
  {
    id: 'standard',
    label: 'Standardowe',
    units: [
      { code: 'PLT', name: 'Paleta', hint: 'Paleta EUR: 120×80 cm, nośność do ok. 1000 kg (paleta przemysłowa 120×100 cm, do ok. 1500 kg).' },
      { code: 'CTN', name: 'Karton', hint: 'Opakowanie kartonowe, zwykle do ok. 30 kg.' },
      { code: 'CRT', name: 'Skrzynia', hint: 'Skrzynia drewniana lub plastikowa — towary nieregularne lub cięższe.' },
      { code: 'BAG', name: 'Worek', hint: 'Worek luzem — big-bag do ok. 1000 kg lub worek foliowy/papierowy.' },
      { code: 'DRM', name: 'Beczka', hint: 'Beczka metalowa lub plastikowa, zwykle 200 l — najczęściej ciecze i chemikalia.' },
      { code: 'ROL', name: 'Rolka', hint: 'Towar zwinięty w rolkę — folia, tkanina, papier, blacha w kręgach.' },
      { code: 'PCS', name: 'Sztuka', hint: 'Pojedyncza, niepakowana jednostka towaru.' },
      { code: 'SET', name: 'Zestaw', hint: 'Komplet kilku elementów pakowanych i liczonych razem.' },
    ],
  },
  {
    id: 'air',
    label: 'Lotnicze',
    units: [
      { code: 'ULD', name: 'ULD (kontener lotniczy)', hint: 'Unit Load Device — znormalizowany kontener lub paleta lotnicza (np. AKE, AKH).' },
      { code: 'LOOSE', name: 'Luzem (lotnicze)', hint: 'Ładunek bez jednostkowego opakowania, przewożony luzem w ładowni.' },
    ],
  },
  {
    id: 'bulk',
    label: 'Masowe i specjalne',
    units: [
      { code: 'TNK', name: 'Cysterna', hint: 'Ciecze lub gazy luzem — cysterna drogowa/kolejowa lub kontener-cysterna (ISO tank).' },
      { code: 'BLK', name: 'Luzem masowy', hint: 'Towar sypki bez opakowań jednostkowych, np. zboże, kruszywo, węgiel.' },
      { code: 'ROR', name: 'Ro-Ro', hint: 'Samojezdna jednostka ładunkowa (pojazd, naczepa) wjeżdżająca na prom lub statek własnymi kołami.' },
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
