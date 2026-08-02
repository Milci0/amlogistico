// Dostawcy ubezpieczenia cargo prezentowani na /insurance.
//
// Dane statyczne, wyłącznie do warstwy prezentacji. Rozmowy z ubezpieczycielami trwają —
// do czasu podpisania umowy żadna z tych ofert nie jest ofertą w rozumieniu przepisów
// i nic się realnie nie kupuje. `premiumMultiplier` koryguje szacunek z kalkulatora,
// żeby karty różniły się między sobą tak jak w realnym porównaniu.
//
// UWAGA: `tagline`, `features` i `ctaLabel` są renderowane z tłumaczeń
// (`pages` → insurance.providers.<id>), a wartości tutaj zostają jako zapasowy
// tekst, gdyby brakowało klucza.

export const PROVIDERS = [
  {
    id: 'loadsure',
    name: 'Loadsure',
    type: 'instant',
    tagline: 'Polisa natychmiastowa',
    premiumMultiplier: 1.0,
    deductible: 500,
    features: [
      'Certyfikat PDF w kilkadziesiąt sekund',
      'Zakres all-risk ICC (A)',
      'Zgłoszenie szkody online',
    ],
    ctaLabel: 'Kup teraz',
    recommended: true,
  },
  {
    id: 'marsh',
    name: 'Marsh',
    type: 'broker',
    tagline: 'Wycena brokerska',
    premiumMultiplier: 0.92,
    deductible: 1000,
    features: [
      'Indywidualna wycena brokera',
      'Negocjowane warunki przy większych ładunkach',
      'Opiekun polisy',
    ],
    ctaLabel: 'Poproś o wycenę',
    recommended: false,
  },
]
