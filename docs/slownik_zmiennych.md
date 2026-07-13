# Słownik zmiennych szablonów dokumentów

> Źródło prawdy: 9 gotowych szablonów UE w `src/generators/templates/eu/`.
> Słownik zweryfikowany 2026-07-13 przez inwentaryzację wszystkich odwołań `data.*`
> w szablonach. **Repo wygrywa nad propozycjami z zewnątrz.**

## Konwencja składni (WAŻNE — różni się od założenia „{{zmienna}}")

Szablony w tym repo **nie są plikami HTML z placeholderami `{{...}}`**.
Każdy szablon to **komponent React (JSX)** przyjmujący jeden props `{ data }`:

```jsx
export function XxxTemplate({ data }) {
  return (
    <div style={{ width: '794px', fontFamily: 'Arial, Helvetica, sans-serif', ... }}>
      <div>{data.sender?.name}</div>
    </div>
  )
}
```

- „Placeholder" = wyrażenie JSX `{data.pole?.podpole}` (zawsze z optional chaining `?.`).
- Style **inline** (obiekty JS), brak wspólnego arkusza CSS. Stałe lokalne w każdym
  szablonie: `b` (border `1px solid #c0c0c0`), `lbl` (etykieta 7px szara),
  `val` (wartość 9px), `thStyle` (nagłówek tabeli, białe litery na `#2c5fa8`).
- Kontener: `width: 794px`, Arial, `fontSize: 8px`, padding `8px 10px`.
- Kolory: granat nagłówka `#1a3a6b`, niebieski tabel `#2c5fa8`, ramki `#c0c0c0`.
- Daty **wyłącznie** przez `formatDocumentDate(...)` z `src/utils/formatDate.js`
  (format DD.MM.RRRR). Data wystawienia = `formatDocumentDate(new Date())`.
- Rejestracja szablonu: 1 wpis w `DOCUMENTS` w `src/generators/documents.js`
  (poza zakresem zadania konwersji — silnika nie dotykamy).

## Mechanizm tabeli pozycji (powtarzalne wiersze)

Szablony UE **nie mają tablicy pozycji**. Tabela towarów to:
1. **jeden wiersz z danymi** wypełniany zbiorczymi polami `data.cargo.*`,
2. **N pustych wierszy** renderowanych stałą `emptyRow` (flex-div z samymi ramkami),
   powtórzoną literalnie (`{emptyRow}{emptyRow}...` — CMR 4×, Faktura 8×).

Zmienne per-pozycja (`poz_lp`, `poz_opis`, ...) są **odrzucone jako zbędna
abstrakcja** (decyzja 2026-07-13) — nawet dokumenty celne z tabelą wielopozycyjną
mają w repo trzymać wzorzec UE: 1 wiersz zbiorczy `data.cargo.*` + N pustych
wierszy `emptyRow`. Nie wprowadzać ich w żadnym nowym szablonie.

## Zmienne kanoniczne (rzeczywiście używane w szablonach UE)

### Trasa (poziom główny `data.*`)
| Zmienna | Znaczenie | Używana w |
|---|---|---|
| `data.fromCity` | miejsce załadunku (miasto / port załadunku) | CMR, BL, SWB, MTD, Zlecenie |
| `data.fromCountry` | kraj nadania (też: kraj pochodzenia na fakturach) | wszystkie |
| `data.toCity` | miejsce dostawy (miasto / port rozładunku / miejsce Incoterms) | CMR, BL, SWB, MTD, Zlecenie, faktury |
| `data.toCountry` | kraj docelowy | wszystkie |
| `data.loadDate` | data załadunku (przez `formatDocumentDate`) | CMR, BL, SWB, PL, POD, Zlecenie, Proforma |

### Nadawca `data.sender.*`
| Zmienna | Znaczenie |
|---|---|
| `data.sender.name` | nazwa firmy |
| `data.sender.address` | adres (jedno pole: ulica, kod, miasto) |
| `data.sender.country` | kraj |
| `data.sender.vat` | NIP/VAT |
| `data.sender.contact` | osoba kontaktowa (Zlecenie) |
| `data.sender.phone` | telefon (Zlecenie) |
| `data.sender.iban` | IBAN (Faktura handlowa) |
| `data.sender.swift` | BIC/SWIFT (Faktura handlowa) |
| `data.sender.bank` | nazwa banku (Faktura handlowa) |

### Odbiorca `data.receiver.*`
| Zmienna | Znaczenie |
|---|---|
| `data.receiver.name` | nazwa firmy (w B/L pełni też rolę Notify Party) |
| `data.receiver.address` | adres |
| `data.receiver.country` | kraj |
| `data.receiver.vat` | NIP/VAT |

### Przewoźnik `data.carrier.*`
| Zmienna | Znaczenie |
|---|---|
| `data.carrier.name` | nazwa |
| `data.carrier.address` | adres |
| `data.carrier.vatNumber` | VAT (**uwaga: inna nazwa niż `sender.vat`!**) |
| `data.carrier.contact` | osoba kontaktowa |
| `data.carrier.phone` | telefon |

### Przewoźnicy per etap (tylko Multimodal) `data.carrierLegs.*`
`data.carrierLegs.preCarriage` · `data.carrierLegs.mainCarriage` · `data.carrierLegs.onCarriage`

### Towar (zbiorczo) `data.cargo.*`
| Zmienna | Znaczenie |
|---|---|
| `data.cargo.name` | opis towaru |
| `data.cargo.hsCode` | kod HS |
| `data.cargo.packages` | liczba opakowań |
| `data.cargo.weight` | waga brutto kg |
| `data.cargo.weightNet` | waga netto kg |
| `data.cargo.volume` | objętość m³ |
| `data.cargo.value` | wartość towaru (= wartość celna na fakturze) |
| `data.cargo.currency` | waluta |
| `data.cargo.notes` | uwagi / instrukcje nadawcy |
| `data.cargo.incoterms` | Incoterms |
| `data.cargo.containerType` | typ kontenera |
| `data.cargo.containerNo` | nr kontenera |
| `data.cargo.sealNo` | nr plomby |
| `data.cargo.marksNos` | znaki i numery (Marks & Nos) |
| `data.cargo.vessel` | nazwa statku |
| `data.cargo.voyageNo` | nr rejsu |
| `data.cargo.quantity` | ilość (jednostki inne niż liczba opakowań, np. Certificate of Origin poz. 10 „Quantity" vs poz. 7 „No. of packages") — ZATWIERDZONE 2026-07-14, wprowadzone w: Certificate of Origin |

### Ogólne — środek transportu `data.transportMeans` (ZATWIERDZONE 2026-07-14)
| Zmienna | Znaczenie | Wprowadzone w |
|---|---|---|
| `data.transportMeans` | opisowy środek transportu (np. nazwa statku/nr lotu/nr pojazdu jako wolny tekst) — odrębne od `data.vehicle.*` (szczegóły pojazdu drogowego) i `data.cargo.vessel/voyageNo` (szczegóły morskie); pole ogólne dla dokumentów, które proszą o jedno zbiorcze pole tekstowe | Certificate of Origin |

### Pojazd (drogowy) `data.vehicle.*`
| Zmienna | Znaczenie |
|---|---|
| `data.vehicle.type` | typ pojazdu (Plandeka/Chłodnia/Mroźnia) |
| `data.vehicle.tempFrom` / `data.vehicle.tempTo` | zakres temperatur |
| `data.vehicle.adr` | czy ADR (bool) |
| `data.vehicle.adrClass` | klasa ADR / nr UN |
| `data.vehicle.reg` | nr rejestracyjny pojazdu |
| `data.vehicle.driverCertNo` | nr certyfikatu ADR kierowcy (Driver ADR certificate No.) — ZATWIERDZONE 2026-07-14, wprowadzone w: Deklaracja ADR (14) |

### Morskie `data.sea.*`
| Zmienna | Znaczenie |
|---|---|
| `data.sea.eta` | przewidywana data przybycia (ETA) |
| `data.sea.etd` | przewidywana data wyjścia/wypłynięcia (ETD) — symetryczne do `eta` — ZATWIERDZONE 2026-07-14, wprowadzone w: ISF 10+2 USA (08) |
| `data.sea.flag` | bandera statku (B/L) |
| `data.sea.freightTerms` | Prepaid / Collect |
| `data.sea.bookingNo` | nr bookingu |

### Warunki handlowe `data.terms.*`
| Zmienna | Znaczenie |
|---|---|
| `data.terms.freightPrice` | koszt frachtu |
| `data.terms.freightCurrency` | waluta frachtu (fallback: `data.cargo.currency`) |
| `data.terms.paymentDays` | termin płatności (liczba dni) |

### Celne `data.customs.*` (ZATWIERDZONE 2026-07-13 — namespace nowy, klucze dopisywane na bieżąco)
Dokumenty celne poza UE realnie potrzebują pól, których nie ma we wzorcach UE.
Zamiast wymyślać je ad hoc w szablonie, każdy nowy klucz jest **najpierw dopisywany
tutaj**, dopiero potem użyty. Na start (przed pierwszym użyciem) namespace jest pusty —
klucze dopisze ten, kto pierwszy ich użyje, wraz z dokumentem źródłowym w komentarzu.

| Zmienna | Znaczenie | Wprowadzone w |
|---|---|---|
| `data.customs.eori` | Nr EORI eksportera (EORI Number) | Deklaracja Eksportowa UE (07) |
| `data.customs.procedureCode` | Kod procedury celnej (Customs procedure code) — jedna wartość używana zarówno w nagłówku, jak i w kolumnie "Procedura" tabeli pozycji (pojedyncza pozycja towarowa = jedna procedura) | Deklaracja Eksportowa UE (07) |
| `data.customs.exitOffice` | Urząd wyjścia (Office of exit) | Deklaracja Eksportowa UE (07) |
| `data.customs.permitNo` | Nr pozwolenia (Permit No.) w sekcji załączonych dokumentów | Deklaracja Eksportowa UE (07) |

**Uwaga MRN:** pole "MRN (nadawany przez AES)" na Deklaracji Eksportowej UE **nie
jest zmienną danych** — MRN nadaje system AES dopiero po złożeniu zgłoszenia,
analogicznie do "Nr dokumentu"/"Nr faktury" w innych szablonach UE (puste ramki,
wypełniane później/ręcznie). Zostawione jako pusta ramka, nie dodane do słownika.

Kandydaci zgłoszeni wcześniej, wciąż NIE dodani (dopóki konkretny dokument tego
nie wymusi): `data.customs.declarationNo`, `.portCode`, `.customsValue`, `.agent`,
`.producerMid`, `.guaranteeNo`.

### Notify Party `data.notify.*` (ZATWIERDZONE 2026-07-13 — namespace nowy)
B/L UE używa `data.receiver.*` jako Notify Party (brak osobnej strony). Dokumenty,
które realnie wymagają odrębnego Notify Party, dostają osobny namespace zamiast
nadpisywać `receiver`. Puste do pierwszego użycia.

| Zmienna | Znaczenie | Wprowadzone w |
|---|---|---|
| _(brak — dopisać przy pierwszym użyciu)_ | | |

Kandydaci: `data.notify.name`, `.address`.

## Mapowanie propozycji zewnętrznych → konwencja repo

| Propozycja | Odpowiednik w repo |
|---|---|
| nadawca_nazwa / adres / kraj / vat | `data.sender.name` / `.address` / `.country` / `.vat` |
| odbiorca_nazwa / adres / kraj / vat | `data.receiver.name` / `.address` / `.country` / `.vat` |
| przewoznik_nazwa / adres | `data.carrier.name` / `.address` (VAT: `.vatNumber`) |
| kraj_nadania / kraj_docelowy | `data.fromCountry` / `data.toCountry` |
| miejsce_zaladunku / miejsce_dostawy | `data.fromCity` / `data.toCity` |
| data_zaladunku | `data.loadDate` |
| port_zaladunku / port_rozladunku | repo używa `data.fromCity` / `data.toCity` (B/L, SWB) |
| statek / nr_rejsu | `data.cargo.vessel` / `data.cargo.voyageNo` |
| incoterms | `data.cargo.incoterms` |
| nr_kontenera / nr_plomby / znaki_numery | `data.cargo.containerNo` / `.sealNo` / `.marksNos` |
| opis_towaru / kod_hs / liczba_paczek | `data.cargo.name` / `.hsCode` / `.packages` |
| waga_brutto_kg / waga_netto_kg / objetosc_m3 | `data.cargo.weight` / `.weightNet` / `.volume` |
| wartosc_towaru / waluta | `data.cargo.value` / `.currency` |
| warunki_platnosci | `data.terms.paymentDays` |
| kraj_pochodzenia / kraj_przeznaczenia | repo używa `data.fromCountry` / `data.toCountry` |
| wartosc_celna | repo używa `data.cargo.value` |
| data_wystawienia | nie jest zmienną — zawsze `formatDocumentDate(new Date())` |
| bank_nazwa / bank_iban / bank_swift | `data.sender.bank` / `.iban` / `.swift` |
| srodek_transportu | `data.vehicle.type` (drogowy); morze/lotnictwo — brak, patrz niżej |

## Propozycje BEZ odpowiednika w repo (wymagają decyzji — NIE używać samowolnie)

| Propozycja | Uwaga |
|---|---|
| nadawca_miasto, nadawca_kod_pocztowy (i odbiorca_) | adres w repo to jedno pole `address` |
| przewoznik_kraj | `data.carrier` nie ma pola `country` |
| typ_transportu | wybór trasy steruje doborem szablonu, nie jest polem w `data` |
| data_dostawy | pole puste na CMR (box 6); morskie ETA = `data.sea.eta` |
| nr_bl_awb, numer_dokumentu, numer_faktury | numery dokumentów w szablonach UE = puste ramki (wpisywane ręcznie) |
| miejsce_wystawienia | brak w szablonach UE |
| rodzaj_opakowania | pole puste na CMR (box 9) |
| bank_nazwa dla odbiorcy, L/C, gwarancje | brak — kandydaci przy dokumentach finansowych (61, 62), na razie BLOCKED |

Namespace `data.customs.*` i `data.notify.*` — patrz sekcje wyżej (zatwierdzone,
klucze dopisywane na bieżąco, nie odrzucone).

Nowe pole wolno dodać **dopiero po akceptacji** — do tego czasu w szablonie zostaje
pusta ramka (jak numery dokumentów w UE), a propozycja trafia do kolumny „uwagi"
w `docs/konwersja_status.md`.
