export const COUNTRIES = [
  { code: 'PL', name: 'Polska', flag: '🇵🇱' },
  { code: 'DE', name: 'Niemcy', flag: '🇩🇪' },
  { code: 'FR', name: 'Francja', flag: '🇫🇷' },
  { code: 'NL', name: 'Holandia', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgia', flag: '🇧🇪' },
  { code: 'CZ', name: 'Czechy', flag: '🇨🇿' },
  { code: 'SK', name: 'Słowacja', flag: '🇸🇰' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'CH', name: 'Szwajcaria', flag: '🇨🇭' },
  { code: 'IT', name: 'Włochy', flag: '🇮🇹' },
  { code: 'ES', name: 'Hiszpania', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugalia', flag: '🇵🇹' },
  { code: 'GB', name: 'Wielka Brytania', flag: '🇬🇧' },
  { code: 'SE', name: 'Szwecja', flag: '🇸🇪' },
  { code: 'NO', name: 'Norwegia', flag: '🇳🇴' },
  { code: 'DK', name: 'Dania', flag: '🇩🇰' },
  { code: 'FI', name: 'Finlandia', flag: '🇫🇮' },
  { code: 'HU', name: 'Węgry', flag: '🇭🇺' },
  { code: 'RO', name: 'Rumunia', flag: '🇷🇴' },
  { code: 'BG', name: 'Bułgaria', flag: '🇧🇬' },
  { code: 'HR', name: 'Chorwacja', flag: '🇭🇷' },
  { code: 'UA', name: 'Ukraina', flag: '🇺🇦' },
  { code: 'TR', name: 'Turcja', flag: '🇹🇷' },
  { code: 'CN', name: 'Chiny', flag: '🇨🇳' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'LT', name: 'Litwa', flag: '🇱🇹' },
  { code: 'LV', name: 'Łotwa', flag: '🇱🇻' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'GR', name: 'Grecja', flag: '🇬🇷' },

  // ── Ameryka Płn. i Płd. ──────────────────────────────────────────
  { code: 'CA', name: 'Kanada', flag: '🇨🇦' },
  { code: 'MX', name: 'Meksyk', flag: '🇲🇽' },
  { code: 'BR', name: 'Brazylia', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentyna', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Kolumbia', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'EC', name: 'Ekwador', flag: '🇪🇨' },

  // ── Azja i Pacyfik ───────────────────────────────────────────────
  { code: 'JP', name: 'Japonia', flag: '🇯🇵' },
  { code: 'KR', name: 'Korea Południowa', flag: '🇰🇷' },
  { code: 'IN', name: 'Indie', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapur', flag: '🇸🇬' },
  { code: 'MY', name: 'Malezja', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonezja', flag: '🇮🇩' },
  { code: 'VN', name: 'Wietnam', flag: '🇻🇳' },
  { code: 'TH', name: 'Tajlandia', flag: '🇹🇭' },
  { code: 'PH', name: 'Filipiny', flag: '🇵🇭' },
  { code: 'MM', name: 'Mjanma (Birma)', flag: '🇲🇲' },
  { code: 'KH', name: 'Kambodża', flag: '🇰🇭' },
  { code: 'BD', name: 'Bangladesz', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'Nowa Zelandia', flag: '🇳🇿' },

  // ── Bliski Wschód i Azja Środkowa ────────────────────────────────
  { code: 'SA', name: 'Arabia Saudyjska', flag: '🇸🇦' },
  { code: 'AE', name: 'Zjednoczone Emiraty Arabskie', flag: '🇦🇪' },
  { code: 'JO', name: 'Jordania', flag: '🇯🇴' },
  { code: 'IL', name: 'Izrael', flag: '🇮🇱' },
  { code: 'IQ', name: 'Irak', flag: '🇮🇶' },
  { code: 'LB', name: 'Liban', flag: '🇱🇧' },
  { code: 'KZ', name: 'Kazachstan', flag: '🇰🇿' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'GE', name: 'Gruzja', flag: '🇬🇪' },

  // ── Afryka ───────────────────────────────────────────────────────
  { code: 'ZA', name: 'Republika Południowej Afryki', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenia', flag: '🇰🇪' },
  { code: 'EG', name: 'Egipt', flag: '🇪🇬' },
  { code: 'MA', name: 'Maroko', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algieria', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunezja', flag: '🇹🇳' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'ET', name: 'Etiopia', flag: '🇪🇹' },

  // ── UE — pozostałe państwa członkowskie ──────────────────────────
  { code: 'IE', name: 'Irlandia', flag: '🇮🇪' },
  { code: 'LU', name: 'Luksemburg', flag: '🇱🇺' },
  { code: 'SI', name: 'Słowenia', flag: '🇸🇮' },
  { code: 'CY', name: 'Cypr', flag: '🇨🇾' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },

  // ── EFTA / EOG ───────────────────────────────────────────────────
  { code: 'IS', name: 'Islandia', flag: '🇮🇸' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },

  // ── EAEU (Euroazjatycka Unia Gospodarcza) ────────────────────────
  { code: 'RU', name: 'Rosja', flag: '🇷🇺' },
  { code: 'BY', name: 'Białoruś', flag: '🇧🇾' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
  { code: 'KG', name: 'Kirgistan', flag: '🇰🇬' },
  { code: 'AZ', name: 'Azerbejdżan', flag: '🇦🇿' },
  { code: 'MD', name: 'Mołdawia', flag: '🇲🇩' },

  // ── Zatoka Perska (GCC) i Bliski Wschód ──────────────────────────
  { code: 'KW', name: 'Kuwejt', flag: '🇰🇼' },
  { code: 'QA', name: 'Katar', flag: '🇶🇦' },
  { code: 'BH', name: 'Bahrajn', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: 'YE', name: 'Jemen', flag: '🇾🇪' },
  { code: 'PS', name: 'Palestyna', flag: '🇵🇸' },

  // ── Azja Płd.-Wsch. (ASEAN) ──────────────────────────────────────
  { code: 'BN', name: 'Brunei', flag: '🇧🇳' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦' },

  // ── Ameryka Płd. (Mercosur) ──────────────────────────────────────
  { code: 'PY', name: 'Paragwaj', flag: '🇵🇾' },
  { code: 'UY', name: 'Urugwaj', flag: '🇺🇾' },

  // ── Afryka ───────────────────────────────────────────────────────
  { code: 'CI', name: 'Wybrzeże Kości Słoniowej', flag: '🇨🇮' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪' },
  { code: 'GN', name: 'Gwinea', flag: '🇬🇳' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲' },
  { code: 'GW', name: 'Gwinea Bissau', flag: '🇬🇼' },
  { code: 'CV', name: 'Republika Zielonego Przylądka', flag: '🇨🇻' },
  { code: 'MR', name: 'Mauretania', flag: '🇲🇷' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
  { code: 'SS', name: 'Sudan Południowy', flag: '🇸🇸' },
  { code: 'LY', name: 'Libia', flag: '🇱🇾' },
  { code: 'MZ', name: 'Mozambik', flag: '🇲🇿' },
  { code: 'CM', name: 'Kamerun', flag: '🇨🇲' },

  // ── Bałkany i mikropaństwa Europy ─────────────────────────────────
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'BA', name: 'Bośnia i Hercegowina', flag: '🇧🇦' },
  { code: 'ME', name: 'Czarnogóra', flag: '🇲🇪' },
  { code: 'MK', name: 'Macedonia Północna', flag: '🇲🇰' },
  { code: 'XK', name: 'Kosowo', flag: '🇽🇰' },
  { code: 'AD', name: 'Andora', flag: '🇦🇩' },
  { code: 'MC', name: 'Monako', flag: '🇲🇨' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'VA', name: 'Watykan', flag: '🇻🇦' },

  // ── Azja Środkowa i Południowa ─────────────────────────────────────
  { code: 'TJ', name: 'Tadżykistan', flag: '🇹🇯' },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: 'AF', name: 'Afganistan', flag: '🇦🇫' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹' },
  { code: 'MV', name: 'Malediwy', flag: '🇲🇻' },
  { code: 'KP', name: 'Korea Północna', flag: '🇰🇵' },
  { code: 'TL', name: 'Timor Wschodni', flag: '🇹🇱' },

  // ── Azja Wsch. — obszary celne ─────────────────────────────────────
  { code: 'TW', name: 'Tajwan', flag: '🇹🇼' },
  { code: 'HK', name: 'Hongkong', flag: '🇭🇰' },
  { code: 'MO', name: 'Makau', flag: '🇲🇴' },

  // ── Afryka — pozostałe państwa ─────────────────────────────────────
  { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
  { code: 'TD', name: 'Czad', flag: '🇹🇩' },
  { code: 'CF', name: 'Republika Środkowoafrykańska', flag: '🇨🇫' },
  { code: 'CD', name: 'Demokratyczna Republika Konga', flag: '🇨🇩' },
  { code: 'CG', name: 'Kongo', flag: '🇨🇬' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'GQ', name: 'Gwinea Równikowa', flag: '🇬🇶' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
  { code: 'MG', name: 'Madagaskar', flag: '🇲🇬' },
  { code: 'KM', name: 'Komory', flag: '🇰🇲' },
  { code: 'SC', name: 'Seszele', flag: '🇸🇨' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
  { code: 'DJ', name: 'Dżibuti', flag: '🇩🇯' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'ER', name: 'Erytrea', flag: '🇪🇷' },
  { code: 'ST', name: 'Wyspy Świętego Tomasza i Książęca', flag: '🇸🇹' },

  // ── Ameryka Środkowa i Karaiby ──────────────────────────────────────
  { code: 'CR', name: 'Kostaryka', flag: '🇨🇷' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: 'NI', name: 'Nikaragua', flag: '🇳🇮' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'SV', name: 'Salwador', flag: '🇸🇻' },
  { code: 'GT', name: 'Gwatemala', flag: '🇬🇹' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: 'CU', name: 'Kuba', flag: '🇨🇺' },
  { code: 'DO', name: 'Dominikana', flag: '🇩🇴' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹' },
  { code: 'JM', name: 'Jamajka', flag: '🇯🇲' },
  { code: 'TT', name: 'Trynidad i Tobago', flag: '🇹🇹' },
  { code: 'BS', name: 'Bahamy', flag: '🇧🇸' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩' },
  { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: 'VC', name: 'Saint Vincent i Grenadyny', flag: '🇻🇨' },
  { code: 'AG', name: 'Antigua i Barbuda', flag: '🇦🇬' },
  { code: 'DM', name: 'Dominika', flag: '🇩🇲' },
  { code: 'KN', name: 'Saint Kitts i Nevis', flag: '🇰🇳' },

  // ── Ameryka Południowa — pozostałe państwa ──────────────────────────
  { code: 'VE', name: 'Wenezuela', flag: '🇻🇪' },
  { code: 'BO', name: 'Boliwia', flag: '🇧🇴' },
  { code: 'GY', name: 'Gujana', flag: '🇬🇾' },
  { code: 'SR', name: 'Surinam', flag: '🇸🇷' },

  // ── Oceania ──────────────────────────────────────────────────────────
  { code: 'PG', name: 'Papua-Nowa Gwinea', flag: '🇵🇬' },
  { code: 'FJ', name: 'Fidżi', flag: '🇫🇯' },
  { code: 'SB', name: 'Wyspy Salomona', flag: '🇸🇧' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'FM', name: 'Mikronezja', flag: '🇫🇲' },
  { code: 'MH', name: 'Wyspy Marshalla', flag: '🇲🇭' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
]

// Pogrupowane menu boczne (układ wg projektu — GŁÓWNE / NARZĘDZIA / WIEDZA)
export const MENU_GROUPS = [
  {
    title: 'Główne',
    items: [
      { label: 'Strona główna', path: '/', icon: 'home' },
      { label: 'Wycena', path: '/quotation', icon: 'calculator', badge: 'Core' },
      { label: 'Dokumentacja', path: '/history', icon: 'document', badge: 'Core' },
      { label: 'Wersje robocze', path: '/drafts', icon: 'pencil', badge: '3' },
    ],
  },
  {
    title: 'Narzędzia',
    items: [
      { label: 'Gotowe formularze', path: '/new-document', icon: 'forms', badge: 'Beta' },
      { label: 'Ubezpieczenia', path: '/insurance', icon: 'shield' },
      { label: 'Trasy handlowe', path: '/routes', icon: 'map' },
      { label: 'Puste szablony', path: '/blank-templates', icon: 'template' },
    ],
  },
  {
    title: 'Wiedza',
    items: [
      { label: 'Newsy', path: '/news', icon: 'news' },
      { label: 'Incoterms', path: '/incoterms', icon: 'globe' },
    ],
  },
]

// Dolne pozycje sidebara
export const MENU_BOTTOM = [
  { label: 'Ustawienia', path: '/settings', icon: 'cog' },
  { label: 'Profil', path: '/profile', icon: 'user' },
]

// Statystyki na stronie głównej (hero)
export const HOME_STATS = [
  { value: '+150', label: 'krajów w bazie',             icon: 'pin',   color: 'teal'   },
  { value: '+99',  label: 'dokumentów transportowych',  icon: 'docs',  color: 'blue'   },
  { value: '4',    label: 'środki transportu',          icon: 'truck', color: 'orange' },
  { value: '11',   label: 'warunków Incoterms',         icon: 'globe', color: 'red'    },
]

export const PRICING_PLANS = [
  {
    name: 'Free',
    price: 0,
    period: 'zawsze',
    description: 'Dla pojedynczych użytkowników i testów',
    highlighted: false,
    features: [
      '5 dokumentów miesięcznie',
      'CMR i Packing List',
      'Eksport PDF',
      'Wsparcie e-mail',
    ],
    cta: 'Zacznij bezpłatnie',
  },
  {
    name: 'Pro',
    price: 49,
    period: 'miesięcznie',
    description: 'Dla małych i średnich firm spedycyjnych',
    highlighted: true,
    features: [
      'Nieograniczone dokumenty',
      'Wszystkie typy dokumentów',
      'Eksport PDF i Excel',
      'Zarządzanie wieloma firmami',
      'Priorytetowe wsparcie',
      'Historia dokumentów 2 lata',
    ],
    cta: 'Wybierz Pro',
  },
  {
    name: 'Enterprise',
    price: null,
    period: '',
    description: 'Dla dużych firm i integracji API',
    highlighted: false,
    features: [
      'Wszystko z planu Pro',
      'Integracja API',
      'Dedykowany opiekun',
      'SLA 99.9%',
      'Niestandardowe szablony',
      'Szkolenie zespołu',
    ],
    cta: 'Skontaktuj się',
  },
]

export const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Wybierz typ dokumentu',
    description: 'CMR, Packing List, Faktura handlowa, SAD — wybierz co potrzebujesz i jaki środek transportu.',
  },
  {
    number: '02',
    title: 'Uzupełnij dane',
    description: 'Formularz krok po kroku — nadawca, odbiorca, towar, trasa. System podpowiada dane z poprzednich wysyłek.',
  },
  {
    number: '03',
    title: 'Weryfikacja automatyczna',
    description: 'System sprawdza kompletność danych, kody celne i wymagania kraju docelowego.',
  },
  {
    number: '04',
    title: 'Pobierz i wyślij',
    description: 'Dokument gotowy w PDF lub Excel. Wyślij bezpośrednio do przewoźnika lub wydrukuj.',
  },
]

export const FEATURES = [
  {
    icon: '⚡',
    title: 'CMR w 2 minuty',
    description: 'Wypełnij formularz, a system wygeneruje poprawny dokument CMR gotowy do druku lub wysyłki e-mail.',
  },
  {
    icon: '📄',
    title: '10+ typów dokumentów',
    description: 'CMR, Packing List, Faktura handlowa, SAD, Sea Waybill, Certificate of Origin i więcej.',
  },
  {
    icon: '📊',
    title: 'Eksport PDF i Excel',
    description: 'Dokumenty w formacie PDF do druku lub Excel do dalszej edycji. Zawsze zgodne z wymogami celnymi.',
  },
]

export const MOCK_DOCUMENTS = [
  { id: 1, type: 'CMR', number: 'CMR-2024-001', date: '15.01.2024', status: 'Gotowy', route: 'PL → DE' },
  { id: 2, type: 'Packing List', number: 'PL-2024-002', date: '14.01.2024', status: 'Gotowy', route: 'PL → FR' },
  { id: 3, type: 'Faktura', number: 'INV-2024-003', date: '13.01.2024', status: 'Szkic', route: 'PL → NL' },
  { id: 4, type: 'Sea Waybill', number: 'SW-2024-004', date: '12.01.2024', status: 'W trakcie', route: 'PL → CN' },
]

export const MOCK_METRICS = [
  { value: '24', label: 'Dokumenty w tym miesiącu', trend: '+12%', up: true },
  { value: '8', label: 'Aktywne wysyłki', trend: null, up: null },
  { value: '3', label: 'Zarejestrowane firmy', trend: null, up: null },
  { value: '156', label: 'Dokumentów łącznie', trend: '+28%', up: true },
]
