// Współdzielony słownik etykiet dla dokumentów Grupy C (deklaracje celne per
// kraj + certyfikaty w generators/templates/global/{export,import,cargo}) —
// ciało tych dokumentów jest już w większości po angielsku, ale współdzielony
// nagłówek tabeli towarów (skopiowany do dziesiątek plików) został po polsku
// bez odpowiednika angielskiego. To NIE jest tłumaczenie całego dokumentu na
// PL/EN (ono nie istnieje i nie jest budowane — patrz CLAUDE.md), tylko
// uzupełnienie brakującego EN dla tych kilku powtarzalnych etykiet.
//
// Użycie w szablonie: {docLabel('hsCode', data.language)}

const LABELS = {
  no:        { pl: 'Lp.',        en: 'No.' },
  hsCode:    { pl: 'Kod HS',     en: 'HS Code' },
  quantity:  { pl: 'Ilość',      en: 'Quantity' },
  unit:      { pl: 'Jedn.',      en: 'Unit' },
  weightKg:  { pl: 'Waga kg',    en: 'Weight (kg)' },
  value:     { pl: 'Wartość',    en: 'Value' },
}

export function docLabel(key, language) {
  const entry = LABELS[key]
  if (!entry) return ''
  return language === 'EN' ? entry.en : entry.pl
}
