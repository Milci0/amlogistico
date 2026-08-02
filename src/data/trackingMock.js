// Dane przykładowe dla makiety „Śledzenie ładunku" (/tracking).
//
// MAKIETA — zero wywołań sieciowych. Wszystko poniżej jest zaszyte na stałe,
// nie ma żadnej integracji z przewoźnikami/liniami/AWB. Cel: ocena układu
// i przepływu (lista → szczegóły), nie działająca funkcja śledzenia.
//
// Cargo w przykładach celowo odwołuje się do PRAWDZIWYCH id z cargoCategories.js
// / cargoUnits.js (nie wymyślonych kategorii), żeby sekcja „Ładunek" w widoku
// szczegółów wyglądała jak realne dane z reszty aplikacji — patrz CargoSummary.jsx.

import { Truck, Ship, Plane, Waypoints, Package, ArrowUpRight, ClipboardCheck, RefreshCw, AlertTriangle, MapPin, CheckCircle2 } from 'lucide-react'

export const BRANCHES = {
  road:       { label: 'Drogowy',     icon: Truck },
  sea:        { label: 'Morski',      icon: Ship },
  air:        { label: 'Lotniczy',    icon: Plane },
  multimodal: { label: 'Multimodalny', icon: Waypoints },
}

export const TRACKING_STATUSES = {
  in_transit: { label: 'W drodze',    badgeClass: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  delivered:  { label: 'Dostarczone', badgeClass: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
  delayed:    { label: 'Opóźnione',   badgeClass: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  pending:    { label: 'Oczekujące',  badgeClass: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300' },
}

// Typ zdarzenia na osi czasu → ikona. Semantyka zdarzenia, nie gałąź transportu
// (ta sama ikona "departure" pasuje do wyjścia z portu, wylotu i wyjazdu ciężarówki).
export const EVENT_TYPES = {
  pickup:        { icon: Package },
  departure:     { icon: ArrowUpRight },
  customs:       { icon: ClipboardCheck },
  transit:       { icon: RefreshCw },
  delay:         { icon: AlertTriangle },
  arrival:       { icon: MapPin },
  delivered:     { icon: CheckCircle2 },
}

export const MOCK_SHIPMENTS = [
  {
    id: 'SHP-2026-1042',
    branch: 'sea',
    status: 'in_transit',
    route: { fromCity: 'Gdańsk', fromCountry: 'PL', toCity: 'Rotterdam', toCountry: 'NL' },
    eta: '2026-08-06',
    cargo: { cargoCategory: 'food_plant', cargoSubcategory: 'fp016', packages: 24, packageType: 'PLT', weight: 9600 },
    branchDetails: {
      containerNo: 'MSCU 728461-5',
      vessel: 'MSC Brianna',
      voyageNo: '412W',
      portOfLoading: 'Gdańsk',
      portOfDischarge: 'Rotterdam',
      transshipments: [],
    },
    events: [
      { date: '2026-08-02', time: '06:15', location: 'Gdańsk, PL', description: 'Załadunek do kontenera reefer, plomba założona', type: 'pickup' },
      { date: '2026-08-02', time: '14:40', location: 'Port Gdańsk, PL', description: 'Wyjście z portu — MSC Brianna, rejs 412W', type: 'departure' },
      { date: '2026-08-04', time: '09:00', location: 'Cieśnina Kilońska', description: 'Tranzyt przez Kanał Kiloński', type: 'transit' },
      { date: '2026-08-06', time: '07:00', location: 'Rotterdam, NL', description: 'Planowane rozładowanie w porcie docelowym', type: 'arrival', planned: true },
    ],
  },
  {
    id: 'SHP-2026-1038',
    branch: 'road',
    status: 'delivered',
    route: { fromCity: 'Warszawa', fromCountry: 'PL', toCity: 'Berlin', toCountry: 'DE' },
    eta: '2026-07-29',
    cargo: { cargoCategory: 'electronics', cargoSubcategory: 'el001', packages: 40, packageType: 'CTN', weight: 1200 },
    branchDetails: {
      carrier: 'DB Schenker Sp. z o.o.',
      vehicleReg: 'WA 4521A',
      driver: 'Marek Kowalski',
      temperature: null,
    },
    events: [
      { date: '2026-07-28', time: '07:30', location: 'Warszawa, PL', description: 'Załadunek towaru, wyjazd z magazynu nadawcy', type: 'pickup' },
      { date: '2026-07-28', time: '11:05', location: 'Świecko, PL/DE', description: 'Odprawa graniczna PL/DE', type: 'customs' },
      { date: '2026-07-29', time: '08:20', location: 'Berlin, DE', description: 'Rozładunek u odbiorcy, dokumenty podpisane', type: 'delivered' },
    ],
  },
  {
    id: 'SHP-2026-1051',
    branch: 'sea',
    status: 'delayed',
    route: { fromCity: 'Szanghaj', fromCountry: 'CN', toCity: 'Hamburg', toCountry: 'DE' },
    eta: '2026-08-14',
    cargo: { cargoCategory: 'machinery', cargoSubcategory: 'mach002', packages: 6, packageType: 'CRT', weight: 18400 },
    branchDetails: {
      containerNo: 'CSNU 559120-3',
      vessel: 'CMA CGM Antoine',
      voyageNo: '229E',
      portOfLoading: 'Shanghai',
      portOfDischarge: 'Hamburg',
      transshipments: ['Singapur'],
    },
    events: [
      { date: '2026-07-18', time: '10:00', location: 'Szanghaj, CN', description: 'Załadunek do kontenera, odprawa eksportowa', type: 'pickup' },
      { date: '2026-07-19', time: '22:15', location: 'Port Szanghaj, CN', description: 'Wyjście z portu — CMA CGM Antoine, rejs 229E', type: 'departure' },
      { date: '2026-07-31', time: '13:00', location: 'Singapur', description: 'Przeładunek na jednostkę relacji Singapur-Hamburg', type: 'transit' },
      { date: '2026-08-02', time: '16:45', location: 'Singapur', description: 'Opóźnienie — przeciążenie terminala przeładunkowego, nowe ETA +6 dni', type: 'delay' },
      { date: '2026-08-14', time: '06:00', location: 'Hamburg, DE', description: 'Nowe planowane rozładowanie', type: 'arrival', planned: true },
    ],
  },
  {
    id: 'SHP-2026-1055',
    branch: 'air',
    status: 'in_transit',
    route: { fromCity: 'Warszawa', fromCountry: 'PL', toCity: 'Chicago', toCountry: 'US' },
    eta: '2026-08-03',
    cargo: { cargoCategory: 'medicines', cargoSubcategory: 'med003', packages: 15, packageType: 'CTN', weight: 340 },
    branchDetails: {
      awbNo: '020-4567 1288',
      carrier: 'LOT Cargo',
      layoverAirports: ['Frankfurt (FRA)'],
    },
    events: [
      { date: '2026-08-01', time: '18:00', location: 'Warszawa (WAW), PL', description: 'Przyjęcie przesyłki cold-chain na terminal cargo', type: 'pickup' },
      { date: '2026-08-01', time: '23:40', location: 'Warszawa (WAW), PL', description: 'Wylot LO-CARGO 8821', type: 'departure' },
      { date: '2026-08-02', time: '02:10', location: 'Frankfurt (FRA), DE', description: 'Przeładunek na rejs transatlantycki', type: 'transit' },
      { date: '2026-08-03', time: '11:25', location: 'Chicago O’Hare (ORD), US', description: 'Planowany przylot i odprawa celna', type: 'arrival', planned: true },
    ],
  },
  {
    id: 'SHP-2026-1060',
    branch: 'multimodal',
    status: 'pending',
    route: { fromCity: 'Kraków', fromCountry: 'PL', toCity: 'Los Angeles', toCountry: 'US' },
    eta: '2026-09-02',
    cargo: { cargoCategory: 'textiles', cargoSubcategory: 'tx001', packages: 80, packageType: 'CTN', weight: 2100 },
    branchDetails: {
      legs: [
        { branch: 'road', fromCity: 'Kraków', toCity: 'Gdańsk', status: 'pending', carrier: 'Raben Logistics' },
        { branch: 'sea', fromCity: 'Gdańsk', toCity: 'Los Angeles', status: 'pending', vessel: 'do przydzielenia' },
      ],
    },
    events: [
      { date: '2026-08-05', time: '09:00', location: 'Kraków, PL', description: 'Zlecenie przyjęte, oczekiwanie na awizację załadunku', type: 'pickup', planned: true },
    ],
  },
]

export function getShipment(id) {
  return MOCK_SHIPMENTS.find((s) => s.id === id) || null
}
