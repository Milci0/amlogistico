// Tłumaczenie ostrzeżeń zwracanych przez utils/documentEngine.js.
//
// Silnik doboru dokumentów jest CELOWO nietknięty: zwraca gotowe polskie zdania
// (a nie klucze i18n), bo jego wynik trafia też do `engineResult.warnings`
// zapisywanego w bazie razem z zestawem z „Pustych szablonów”. Zmiana kształtu
// tej struktury zmieniłaby dane historyczne, więc tłumaczymy dopiero na wyjściu,
// przy renderze.
//
// Dwie ścieżki dopasowania:
//  1. EXACT — zdania stałe, dopasowanie 1:1 po treści.
//  2. PATTERNS — zdania sklejane w silniku z kodem kraju lub listą krajów;
//     wyrażenie regularne wyciąga zmienną część i wstawia ją do wersji angielskiej.
//
// Brak dopasowania = zwracamy oryginał. Jeśli tekst w silniku się zmieni,
// użytkownik anglojęzyczny zobaczy zdanie po polsku (degradacja, nie awaria).

const EXACT = {
  'ISF 10+2 musi być złożony minimum 24h przed załadunkiem na statek w porcie wyjścia.':
    'The ISF 10+2 filing must be submitted at least 24 hours before the goods are loaded at the port of departure.',

  'Licencja importowa (LI) Brazylia może być wymagana przed wysyłką, sprawdź z importerem.':
    'A Brazilian import licence (LI) may be required before shipping. Check with the importer.',

  'Form M (Nigeria) musi być uzyskany przez importera PRZED wysyłką.':
    'Form M (Nigeria) must be obtained by the importer BEFORE the shipment leaves.',

  'Transport kolejowy towarów niebezpiecznych podlega Regulaminowi RID. Wymagane: DG Manifest + MSDS + dokumenty RID od przewoźnika kolejowego.':
    'Rail carriage of dangerous goods falls under the RID rules. You need a DG manifest, an MSDS and the RID paperwork from the rail carrier.',

  'Licencja Dual-Use (rozp. UE 2021/821) musi być uzyskana PRZED wysyłką.':
    'A dual-use licence (EU Regulation 2021/821) must be obtained BEFORE the shipment leaves.',

  'Blacklist Certificate może być wymagany przez urząd celny kraju docelowego. Skonsultuj z lokalnym agentem celnym.':
    'The destination customs authority may require a blacklist certificate. Check with a local customs agent.',

  'Faktura i CoO wymagają legalizacji przez KIG i ambasadę, planuj 7-10 dni roboczych.':
    'The invoice and certificate of origin need legalisation by the chamber of commerce and the embassy. Allow 7 to 10 working days.',

  'PSI (inspekcja przedwysyłkowa) wymagana, planuj 3-5 dni roboczych.':
    'A pre-shipment inspection (PSI) is required. Allow 3 to 5 working days.',

  'T2L wymagany przy morskim transporcie wewnątrz UE, bez niego towar traktowany jako import spoza UE w porcie docelowym.':
    'A T2L is required for sea transport inside the EU. Without it the goods count as a non-EU import at the destination port.',

  'UWAGA SANKCJE: Trasa do Rosji/Białorusi podlega sankcjom UE. Sprawdź listę towarów zakazanych: Rozporządzenie UE 833/2014 (Rosja) i 765/2006 (Białoruś) przed wysyłką. Wiele kategorii towarów jest zakazanych lub wymaga specjalnego zezwolenia eksportowego.':
    'SANCTIONS WARNING: routes to Russia and Belarus fall under EU sanctions. Check the prohibited goods lists in EU Regulation 833/2014 (Russia) and 765/2006 (Belarus) before shipping. Many categories are banned or need a special export authorisation.',

  'UWAGA SANKCJE: Import z Rosji/Białorusi do UE podlega sankcjom UE. Sprawdź listę zakazanych importów przed zawarciem kontraktu.':
    'SANCTIONS WARNING: imports from Russia and Belarus into the EU fall under EU sanctions. Check the prohibited import list before signing the contract.',

  'Import żywności do UE wymaga pre-notyfikacji CHED-P w systemie TRACES NT minimum 24h przed przybyciem do portu. Obowiązek spoczywa na importerze UE. Kontrola weterynaryjna na Border Control Post (BCP) jest obowiązkowa, brak CHED-P = zatrzymanie towaru.':
    'Importing food into the EU needs a CHED-P pre-notification in TRACES NT at least 24 hours before arrival at the port. The EU importer is responsible for it. The veterinary check at the Border Control Post is mandatory and without a CHED-P the goods are held.',

  'Żywność wymaga zachowania łańcucha chłodniczego: mrożona max −18°C, schłodzona 0-4°C. Transport musi spełniać wymagania Konwencji ATP. Dołącz zapis temperatury z rejestratora danych.':
    'Food must stay in the cold chain: frozen at a maximum of minus 18°C, chilled at 0 to 4°C. The transport must meet ATP Convention requirements. Attach the data logger temperature record.',

  'Od 01.05.2026 obowiązuje Umowa EU-Mercosur (iTA). Sprawdź wymagania dotyczące nowych certyfikatów pochodzenia. EC Notice 2026/875. Może być wymagany zaktualizowany format COO.':
    'The EU-Mercosur agreement (iTA) applies from 1 May 2026. Check the requirements for the new origin certificates, EC Notice 2026/875. An updated certificate of origin format may be required.',

  'Import do UE wymaga złożenia zgłoszenia celnego (SAD/H1) do wolnego obrotu przez importera lub licencjonowanego agenta celnego w kraju przeznaczenia. Cło i VAT naliczane przy odprawie celnej.':
    'Importing into the EU requires a customs declaration (SAD/H1) for release into free circulation, filed by the importer or a licensed customs agent in the destination country. Duty and VAT are charged at clearance.',

  'Norwegia/Islandia/Liechtenstein należą do EOG, ale nie do obszaru celnego UE. EAD wymagana jak przy eksporcie poza UE. Brak ceł dzięki umowie EOG, formalności celne są jednak obowiązkowe.':
    'Norway, Iceland and Liechtenstein are in the EEA but outside the EU customs territory. An EAD is required as for any non-EU export. The EEA agreement removes duty, but the customs formalities still apply.',

  'Eksport do Turcji (unia celna UE-TR): dla towarow przemyslowych w wolnym obrocie wymagane swiadectwo A.TR (status wolnego obrotu, stawka 0%). EUR.1/EUR-MED dotyczy tylko produktow rolnych oraz wegla i stali. UWAGA: szablon A.TR nie jest jeszcze dostepny w systemie.':
    'Export to Turkey (EU-TR customs union): industrial goods in free circulation need an A.TR certificate (free circulation status, 0% rate). EUR.1 and EUR-MED cover only agricultural products, coal and steel. Note: the A.TR template is not available in the system yet.',

  'GSP: Form A jest stopniowo zastepowany przez oswiadczenie o pochodzeniu w systemie REX. Sprawdz, czy kraj wysylki nadal wystawia Form A, czy juz przeszedl na REX.':
    'GSP: Form A is being replaced by the statement on origin in the REX system. Check whether the country of dispatch still issues Form A or has already moved to REX.',
}

// Zdania sklejane w silniku z kodem kraju lub listą kodów.
const PATTERNS = [
  {
    re: /^Eksport do (.+?): preferencyjne pochodzenie deklaruje sie na fakturze/,
    build: (m) =>
      `Export to ${m[1]}: preferential origin is declared on the invoice (REX system, statement on origin), ` +
      'not through EUR.1. Up to 6,000 EUR any exporter may issue it. Above that, only a registered or ' +
      'approved exporter (REX) may do so.',
  },
  {
    re: /^Trasa przez kraj spoza Konwencji o wspolnej procedurze tranzytowej \((.*?)\)\./,
    build: (m) =>
      `The route passes through a country outside the Common Transit Convention (${m[1]}). ` +
      'A TIR carnet is required: road transport, a TIR approved vehicle and a customs guarantee. ' +
      'TIR does not cover alcohol or tobacco products.',
  },
  {
    re: /^Tranzyt przez kraj CTC \((.*?)\)\./,
    build: (m) =>
      `Transit through a Common Transit Convention country (${m[1]}). A T1/T2 transit declaration in NCTS ` +
      'with a customs guarantee is enough, a TIR carnet is not needed.',
  },
  {
    re: /^Import z (.+?) do UE: importer moze ubiegac sie/,
    build: (m) =>
      `Import from ${m[1]} into the EU: the importer can claim a preferential duty rate under the free trade ` +
      'agreement. The exporter must attach a statement on origin to the invoice (REX system). Up to 6,000 EUR ' +
      'any exporter may issue it. Above that, only a registered REX exporter or an approved exporter (AE).',
  },
]

export function translateEngineWarning(text, language) {
  if (!text || !language || !language.startsWith('en')) return text

  const exact = EXACT[text]
  if (exact) return exact

  for (const { re, build } of PATTERNS) {
    const m = text.match(re)
    if (m) return build(m)
  }

  return text
}
