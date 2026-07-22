// Katalog kategorii i podkategorii towaru (jedyne źródło prawdy).
//
// Zastąpił dawną listę 5 „rodzajów ładunku” zaszytą w DocumentWizard.jsx
// i BlankTemplatesPage.jsx. Struktura odwzorowuje bazę spedycyjną:
//   kategoria (19) → podkategoria (260) → { kod HS, flagi cargo, typowe dokumenty, ostrzeżenie }
//
// Konsumenci:
//  - components/cargo/CargoCategoryPicker.jsx — widget wyboru (kreator + puste szablony)
//  - utils/documentEngine.js — przez `engineCategoryFor()` (mapowanie na kategorie silnika)
//
// Pole `docs` to typowe dokumenty handlowe dla danego towaru (klucze robocze, jeszcze
// NIE klucze z documentCatalog.js) — na razie nie są renderowane, zostają jako podstawa
// pod przyszłą warstwę silnika doboru „per podkategoria”.

import {
  Sprout, Beef, Soup, Wine, Laptop, Cog, FlaskConical, Droplets, Pill, Sparkles,
  Shirt, Car, Blocks, Trees, Stethoscope, Flame, Building2, Gem, Shield,
  Snowflake, Thermometer, AlertTriangle, Biohazard, Atom, Cloud, Bomb, Radiation,
  BatteryCharging, Moon, Star, Leaf, Dna, PawPrint, ShieldCheck, Box, Maximize,
  Clock, GlassWater, SprayCan, Wifi, Fuel, History, Palette, Coins, Diamond,
} from 'lucide-react'

// ── Flagi cargo ────────────────────────────────────────────────────────────────
// Opisują właściwości towaru istotne dla transportu (temperatura, ADR, licencje).
// `adrClass` = klasa ADR/IMDG, jeśli flaga jednoznacznie ją wyznacza.

export const CARGO_FLAGS = {
  chilled:        { label: 'Wymaga chłodzenia (2-8°C)',            icon: Thermometer,      adrClass: null },
  frozen:         { label: 'Mrożony (−18°C i poniżej)',            icon: Snowflake,        adrClass: null },
  dangerous:      { label: 'Towar niebezpieczny (DG)',             icon: AlertTriangle,    adrClass: 'różna' },
  flammable:      { label: 'Łatwopalny',                           icon: Flame,            adrClass: '3' },
  corrosive:      { label: 'Żrący',                                icon: Droplets,         adrClass: '8' },
  toxic:          { label: 'Toksyczny',                            icon: Biohazard,        adrClass: '6.1' },
  oxidizing:      { label: 'Utleniający',                          icon: Atom,             adrClass: '5.1' },
  gas:            { label: 'Gaz (sprężony/skroplony)',             icon: Cloud,            adrClass: '2' },
  explosive:      { label: 'Materiał wybuchowy',                   icon: Bomb,             adrClass: '1' },
  radioactive:    { label: 'Radioaktywny',                         icon: Radiation,        adrClass: '7' },
  lithium:        { label: 'Baterie litowe (UN3480/3481)',         icon: BatteryCharging,  adrClass: '9' },
  halal:          { label: 'Produkt halal',                        icon: Moon,             adrClass: null },
  kosher:         { label: 'Produkt koszerny',                     icon: Star,             adrClass: null },
  organic:        { label: 'Produkt ekologiczny (bio)',            icon: Leaf,             adrClass: null },
  gmo_risk:       { label: 'Ryzyko GMO',                           icon: Dna,              adrClass: null },
  cites:          { label: 'Gatunek chroniony (CITES)',            icon: PawPrint,         adrClass: null },
  dual_use:       { label: 'Podwójne zastosowanie (Dual-Use)',     icon: ShieldCheck,      adrClass: null },
  wooden_pkg:     { label: 'Drewniane opakowania (ISPM15)',        icon: Box,              adrClass: null },
  oversize:       { label: 'Ponadgabarytowy (OOG)',                icon: Maximize,         adrClass: null },
  valuable:       { label: 'Wartościowy (>10 000 EUR)',            icon: Diamond,          adrClass: null },
  perishable:     { label: 'Łatwo psujący się',                    icon: Clock,            adrClass: null },
  fragile:        { label: 'Kruchy',                               icon: GlassWater,       adrClass: null },
  pesticides:     { label: 'Traktowany pestycydami',               icon: SprayCan,         adrClass: null },
  cold_chain:     { label: 'Łańcuch chłodniczy GDP',               icon: Thermometer,      adrClass: null },
  narcotic:       { label: 'Substancja psychotropowa',             icon: Pill,             adrClass: null },
  live_animal:    { label: 'Żywe zwierzęta',                       icon: PawPrint,         adrClass: null },
  military:       { label: 'Zastosowanie wojskowe',                icon: Shield,           adrClass: null },
  xinjiang:       { label: 'Bawełna z Xinjiangu (USA: zakaz)',     icon: AlertTriangle,    adrClass: null },
  precursor:      { label: 'Prekursor narkotykowy',                icon: AlertTriangle,    adrClass: null },
  fur:            { label: 'Futro / skóra egzotyczna',             icon: PawPrint,         adrClass: null },
  artwork:        { label: 'Dzieło sztuki / antyk',                icon: Palette,          adrClass: null },
  precious_metal: { label: 'Metal szlachetny',                     icon: Coins,            adrClass: null },
  kimberley:      { label: 'Diamenty surowe (Kimberley)',          icon: Diamond,          adrClass: null },
  sterile:        { label: 'Produkt sterylny',                     icon: ShieldCheck,      adrClass: null },
  wireless:       { label: 'Urządzenie bezprzewodowe',             icon: Wifi,             adrClass: null },
  fuel_tank:      { label: 'Zbiornik z paliwem',                   icon: Fuel,             adrClass: '3' },
  used_vehicle:   { label: 'Pojazd używany',                       icon: History,          adrClass: null },
}

// Flagi, które same z siebie kwalifikują przesyłkę jako towar niebezpieczny —
// niezależnie od kategorii (np. wódka w kategorii „Napoje” = ADR klasa 3).
const DG_FLAGS = ['dangerous', 'flammable', 'corrosive', 'toxic', 'oxidizing', 'gas', 'explosive', 'radioactive']

// ── Kategorie ──────────────────────────────────────────────────────────────────
// `engine` = kategoria rozumiana przez utils/documentEngine.js (warstwa 5).

export const CARGO_CATEGORIES = [
  { id: 'food_plant',      name: 'Żywność roślinna',            icon: Sprout,       engine: 'food_plant',
    hint: 'Wymagane świadectwo fitosanitarne. Przy imporcie do UE dodatkowo pre-notyfikacja CHED-PP w systemie TRACES NT.' },
  { id: 'food_animal',     name: 'Żywność zwierzęca',           icon: Beef,         engine: 'food_animal',
    hint: 'Wymagane świadectwo weterynaryjne i zakład zatwierdzony w kraju docelowym (USDA FSIS, GACC, TRACES).' },
  { id: 'food_processed',  name: 'Żywność przetworzona',        icon: Soup,         engine: 'general',
    hint: 'Zwykle wystarczy certyfikat analizy i zgodne etykietowanie; do USA dodatkowo FDA Prior Notice.' },
  { id: 'beverages',       name: 'Napoje i alkohol',            icon: Wine,         engine: 'general',
    hint: 'Alkohol wymaga licencji importowej i akcyzy; mocne alkohole to jednocześnie ADR klasa 3.' },
  { id: 'electronics',     name: 'Elektronika',                 icon: Laptop,       engine: 'electronics',
    hint: 'Deklaracja CE (UE), FCC (USA), CCC (Chiny). Baterie litowe oznaczają ograniczenia transportowe.' },
  { id: 'machinery',       name: 'Maszyny i urządzenia',        icon: Cog,          engine: 'general',
    hint: 'Deklaracja CE (dyrektywa maszynowa). Ładunki ponadgabarytowe wymagają zezwoleń na transport specjalny.' },
  { id: 'chemicals',       name: 'Chemikalia przemysłowe',      icon: FlaskConical, engine: 'dangerous_goods',
    hint: 'Karta charakterystyki (MSDS/SDS), dokumenty ADR/IMDG, rejestracja REACH przy wprowadzaniu do UE.' },
  { id: 'chemicals_cons',  name: 'Chemikalia konsumenckie',     icon: Droplets,     engine: 'chemicals',
    hint: 'Karta charakterystyki i REACH/SVHC; aerozole i produkty łatwopalne podlegają ADR.' },
  { id: 'medicines',       name: 'Leki i farmaceutyki',         icon: Pill,         engine: 'medicines',
    hint: 'Certyfikat GMP, zwolnienie serii i pozwolenie na dopuszczenie do obrotu; zwykle łańcuch chłodniczy GDP.' },
  { id: 'cosmetics',       name: 'Kosmetyki',                   icon: Sparkles,     engine: 'general',
    hint: 'Raport bezpieczeństwa (UE), Free Sale Certificate; do Chin rejestracja NMPA. Perfumy = ADR klasa 3.' },
  { id: 'textiles',        name: 'Odzież i tekstylia',          icon: Shirt,        engine: 'general',
    hint: 'Etykieta składu surowcowego i REACH/SVHC. Bawełna z Chin, sprawdź UFLPA przy eksporcie do USA.' },
  { id: 'vehicles',        name: 'Pojazdy',                     icon: Car,          engine: 'general',
    hint: 'Świadectwo zgodności (CoC), homologacja i certyfikat emisji. Pojazdy używane, ograniczenia wieku.' },
  { id: 'metals',          name: 'Metale i surowce',            icon: Blocks,       engine: 'general',
    hint: 'Certyfikat hutniczy (mill certificate) i świadectwo wagi. Sprawdź cła antydumpingowe.' },
  { id: 'wood',            name: 'Drewno i wyroby drzewne',     icon: Trees,        engine: 'general',
    hint: 'FLEGT (legalne pozyskanie), ISPM15 dla opakowań drewnianych, CITES dla gatunków chronionych.' },
  { id: 'medical',         name: 'Wyroby medyczne i optyczne',  icon: Stethoscope,  engine: 'general',
    hint: 'Oznakowanie CE wg MDR/IVDR, certyfikat jednostki notyfikowanej; do USA FDA 510(k) lub PMA.' },
  { id: 'energy',          name: 'Energetyka i paliwa',         icon: Flame,        engine: 'general',
    hint: 'Paliwa to ADR/IMDG klasa 2 lub 3 z akcyzą. Przy surowcach sprawdź listy sankcyjne.' },
  { id: 'construction',    name: 'Materiały budowlane',         icon: Building2,    engine: 'general',
    hint: 'Certyfikat jakości i deklaracja właściwości użytkowych; materiały pylące wymagają MSDS.' },
  { id: 'luxury',          name: 'Towary luksusowe i specjalne', icon: Gem,         engine: 'general',
    hint: 'Wartość celna musi być dokładna. Wymagane ubezpieczenie, często CITES lub pozwolenie na wywóz dóbr kultury.' },
  { id: 'defence',         name: 'Towary kontrolowane i obrona', icon: Shield,      engine: 'weapons_dual_use',
    hint: 'Licencja eksportowa i End User Certificate. Sprawdź embarga ONZ/UE/USA przed zawarciem kontraktu.' },
]

// ── Podkategorie ───────────────────────────────────────────────────────────────
// sub(id, categoryId, nazwa, kod HS, flagi, typowe dokumenty, ostrzeżenie)

const sub = (id, categoryId, name, hsCode, flags = [], docs = [], warning = null) =>
  ({ id, categoryId, name, hsCode, flags, docs, warning })

export const CARGO_SUBCATEGORIES = [
  // ── Żywność roślinna ────────────────────────────────────────────────────────
  sub('fp001', 'food_plant', 'Jabłka świeże', '0808.10.80', ['perishable', 'chilled', 'pesticides'], ['phytosanitary', 'MRL_certificate', 'packing_list', 'commercial_invoice']),
  sub('fp002', 'food_plant', 'Gruszki świeże', '0808.30.10', ['perishable', 'chilled', 'pesticides'], ['phytosanitary', 'MRL_certificate']),
  sub('fp003', 'food_plant', 'Wiśnie i czereśnie świeże', '0809.21.00', ['perishable', 'chilled', 'pesticides'], ['phytosanitary', 'MRL_certificate']),
  sub('fp004', 'food_plant', 'Śliwki świeże', '0809.40.05', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp005', 'food_plant', 'Brzoskwinie i morele świeże', '0809.10.00', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp006', 'food_plant', 'Truskawki świeże', '0810.10.00', ['perishable', 'chilled', 'pesticides'], ['phytosanitary', 'MRL_certificate']),
  sub('fp007', 'food_plant', 'Maliny i jeżyny świeże', '0810.20.10', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp008', 'food_plant', 'Jagody i borówki świeże', '0810.40.30', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp009', 'food_plant', 'Winogrona świeże', '0806.10.10', ['perishable', 'chilled', 'pesticides'], ['phytosanitary', 'MRL_certificate']),
  sub('fp010', 'food_plant', 'Pomarańcze świeże', '0805.10.22', ['perishable', 'chilled'], ['phytosanitary', 'citrus_canker_free'], 'USA: wymóg certyfikatu wolności od raka cytrusowego.'),
  sub('fp011', 'food_plant', 'Mandarynki i klementynki', '0805.21.10', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp012', 'food_plant', 'Cytryny świeże', '0805.50.10', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp013', 'food_plant', 'Grejpfruty', '0805.40.00', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp014', 'food_plant', 'Banany świeże', '0803.90.10', ['perishable'], ['phytosanitary']),
  sub('fp015', 'food_plant', 'Mango świeże', '0804.50.00', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp016', 'food_plant', 'Awokado świeże', '0804.40.00', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp017', 'food_plant', 'Ananasy świeże', '0804.30.00', ['perishable'], ['phytosanitary']),
  sub('fp018', 'food_plant', 'Papaje świeże', '0807.20.00', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp019', 'food_plant', 'Melony świeże', '0807.11.00', ['perishable'], ['phytosanitary']),
  sub('fp020', 'food_plant', 'Orzechy migdałowe', '0802.11.00', [], ['phytosanitary']),
  sub('fp021', 'food_plant', 'Orzechy nerkowca', '0801.31.00', [], ['phytosanitary']),
  sub('fp022', 'food_plant', 'Orzechy włoskie', '0802.31.00', [], ['phytosanitary']),
  sub('fp023', 'food_plant', 'Orzeszki ziemne (arachidowe)', '1202.41.00', ['pesticides'], ['phytosanitary', 'aflatoxin_certificate'], 'Wymagany certyfikat aflatoksyn, normy bardzo rygorystyczne w UE i Japonii.'),
  sub('fp024', 'food_plant', 'Owoce suszone (daktyle, figi, rodzynki)', '0804.10.00', ['pesticides'], ['phytosanitary', 'MRL_certificate']),
  sub('fp025', 'food_plant', 'Owoce mrożone', '0811.10.11', ['frozen'], ['phytosanitary']),
  sub('fp026', 'food_plant', 'Pomidory świeże', '0702.00.00', ['perishable', 'chilled', 'pesticides'], ['phytosanitary', 'MRL_certificate'], 'Australia: pomidory z wielu krajów zakazane, sprawdź BICON.'),
  sub('fp027', 'food_plant', 'Ziemniaki świeże', '0701.90.50', ['perishable'], ['phytosanitary'], 'Australia: świeże ziemniaki ZAKAZANE. USA: tylko z zatwierdzonych krajów.'),
  sub('fp028', 'food_plant', 'Cebula i szalotka', '0703.10.19', [], ['phytosanitary']),
  sub('fp029', 'food_plant', 'Czosnek świeży', '0703.20.00', [], ['phytosanitary'], 'Chiny: główny eksporter, sprawdź cła antydumpingowe przy imporcie do UE.'),
  sub('fp030', 'food_plant', 'Marchew i rzodkiew', '0706.10.00', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp031', 'food_plant', 'Kapusta i brokuły', '0704.10.00', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp032', 'food_plant', 'Sałata i cykoria', '0705.11.00', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp033', 'food_plant', 'Papryka świeża', '0709.60.10', ['perishable', 'chilled', 'pesticides'], ['phytosanitary', 'MRL_certificate']),
  sub('fp034', 'food_plant', 'Ogórki świeże', '0707.00.05', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp035', 'food_plant', 'Warzywa mrożone (mix)', '0710.80.61', ['frozen'], ['phytosanitary']),
  sub('fp036', 'food_plant', 'Grzyby świeże', '0709.51.00', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp037', 'food_plant', 'Zioła świeże (bazylia, pietruszka)', '0709.99.60', ['perishable', 'chilled', 'pesticides'], ['phytosanitary', 'MRL_certificate']),
  sub('fp038', 'food_plant', 'Pszenica', '1001.99.00', ['gmo_risk', 'pesticides'], ['phytosanitary', 'fumigation_certificate', 'weight_certificate'], 'Sprawdź normy mykotoksyn (DON, aflatoksyny) dla kraju docelowego.'),
  sub('fp039', 'food_plant', 'Kukurydza', '1005.90.00', ['gmo_risk', 'pesticides'], ['phytosanitary', 'non_gmo_certificate', 'fumigation_certificate'], 'Ryzyko GMO: UE, Japonia i Australia wymagają certyfikatu Non-GMO.'),
  sub('fp040', 'food_plant', 'Ryż', '1006.30.27', ['pesticides'], ['phytosanitary', 'MRL_certificate']),
  sub('fp041', 'food_plant', 'Nasiona soi', '1201.90.00', ['gmo_risk'], ['phytosanitary', 'non_gmo_certificate'], 'Soja = najwyższe ryzyko GMO. UE wymaga znakowania powyżej 0,9% GMO.'),
  sub('fp042', 'food_plant', 'Nasiona rzepaku', '1205.10.90', ['gmo_risk'], ['phytosanitary', 'non_gmo_certificate']),
  sub('fp043', 'food_plant', 'Kawa zielona (surowa)', '0901.11.00', [], ['phytosanitary', 'quality_certificate']),
  sub('fp044', 'food_plant', 'Kawa palona', '0901.21.00', [], ['packing_list', 'commercial_invoice']),
  sub('fp045', 'food_plant', 'Herbata (liście)', '0902.10.00', ['pesticides'], ['phytosanitary', 'MRL_certificate']),
  sub('fp046', 'food_plant', 'Kakao (ziarna)', '1801.00.00', [], ['phytosanitary', 'quality_certificate']),
  sub('fp047', 'food_plant', 'Pieprz i inne przyprawy', '0904.11.00', ['pesticides'], ['phytosanitary', 'MRL_certificate']),
  sub('fp048', 'food_plant', 'Cukier surowy trzcinowy', '1701.13.10', [], ['quality_certificate', 'weight_certificate']),
  sub('fp049', 'food_plant', 'Olej słonecznikowy rafinowany', '1512.19.10', [], ['quality_certificate', 'analysis_certificate']),
  sub('fp050', 'food_plant', 'Olej palmowy', '1511.10.10', [], ['quality_certificate', 'RSPO_certificate'], 'RSPO (zrównoważony olej palmowy) coraz częściej wymagany przez kupujących w UE.'),
  sub('fp051', 'food_plant', 'Oliwa z oliwek', '1509.10.10', [], ['quality_certificate', 'analysis_certificate', 'origin_certificate']),
  sub('fp052', 'food_plant', 'Rośliny żywe, sadzonki drzew', '0602.10.90', ['cites'], ['phytosanitary', 'phytosanitary_import_permit', 'CITES_if_applicable'], 'Sprawdź, czy gatunek jest na liście CITES (np. mahoń, palisander).'),
  sub('fp053', 'food_plant', 'Kwiaty cięte świeże', '0603.11.00', ['perishable', 'chilled'], ['phytosanitary']),
  sub('fp054', 'food_plant', 'Tytoń, liście surowe', '2401.10.35', [], ['phytosanitary', 'import_licence_tobacco', 'excise_bond'], 'Import tytoniu wymaga specjalnych licencji w większości krajów.'),

  // ── Żywność zwierzęca ───────────────────────────────────────────────────────
  sub('fa001', 'food_animal', 'Wołowina świeża/chłodzona', '0201.30.00', ['perishable', 'chilled', 'halal'], ['veterinary_certificate', 'health_mark', 'halal_if_required'], 'USA: zakład musi być zatwierdzony przez USDA FSIS. Chiny: rejestracja GACC.'),
  sub('fa002', 'food_animal', 'Wołowina mrożona', '0202.30.90', ['frozen', 'halal'], ['veterinary_certificate', 'halal_if_required']),
  sub('fa003', 'food_animal', 'Wieprzowina świeża/chłodzona', '0203.19.55', ['perishable', 'chilled'], ['veterinary_certificate'], 'Zakaz importu wieprzowiny do krajów muzułmańskich (SA, AE, MY, ID itp.).'),
  sub('fa004', 'food_animal', 'Wieprzowina mrożona', '0203.29.55', ['frozen'], ['veterinary_certificate'], 'Zakaz importu do krajów muzułmańskich.'),
  sub('fa005', 'food_animal', 'Mięso drobiowe świeże (kurczak)', '0207.13.10', ['perishable', 'chilled', 'halal'], ['veterinary_certificate', 'halal_if_required']),
  sub('fa006', 'food_animal', 'Mięso drobiowe mrożone', '0207.14.10', ['frozen', 'halal'], ['veterinary_certificate', 'halal_if_required']),
  sub('fa007', 'food_animal', 'Mięso jagnięce / baranie', '0204.41.00', ['perishable', 'chilled', 'halal'], ['veterinary_certificate', 'halal_if_required']),
  sub('fa008', 'food_animal', 'Mięso końskie', '0205.00.00', ['perishable', 'chilled'], ['veterinary_certificate', 'horse_passport'], 'Koń musi mieć paszport. Wiele krajów nie akceptuje mięsa końskiego.'),
  sub('fa009', 'food_animal', 'Wędliny i kiełbasy', '1601.00.91', ['perishable', 'halal'], ['veterinary_certificate', 'halal_if_required']),
  sub('fa010', 'food_animal', 'Konserwy mięsne', '1602.32.11', ['halal'], ['veterinary_certificate', 'halal_if_required']),
  sub('fa011', 'food_animal', 'Łosoś świeży/chłodzony', '0302.11.10', ['perishable', 'chilled'], ['veterinary_certificate', 'catch_certificate']),
  sub('fa012', 'food_animal', 'Łosoś mrożony', '0303.11.00', ['frozen'], ['veterinary_certificate', 'catch_certificate']),
  sub('fa013', 'food_animal', 'Tuńczyk świeży', '0302.31.10', ['perishable', 'chilled'], ['veterinary_certificate', 'catch_certificate', 'SIMP_if_US'], 'USA: SIMP, dokumentacja połowu wymagana dla tuńczyka.'),
  sub('fa014', 'food_animal', 'Krewetki mrożone', '0306.17.10', ['frozen', 'halal'], ['veterinary_certificate', 'halal_if_required']),
  sub('fa015', 'food_animal', 'Małże i ostrygi', '0307.11.10', ['perishable', 'chilled'], ['veterinary_certificate', 'biotoxin_certificate'], 'Wymagany certyfikat braku biotoksyn morskich.'),
  sub('fa016', 'food_animal', 'Ryby wędzone (łosoś wędzony)', '0305.41.00', ['perishable', 'chilled'], ['veterinary_certificate']),
  sub('fa017', 'food_animal', 'Mleko płynne UHT', '0401.10.10', ['halal'], ['veterinary_certificate', 'halal_if_required', 'pasteurization_certificate'], 'USA: zakład musi być zarejestrowany w FDA.'),
  sub('fa018', 'food_animal', 'Mleko w proszku', '0402.10.11', ['halal'], ['veterinary_certificate', 'analysis_certificate']),
  sub('fa019', 'food_animal', 'Masło', '0405.10.11', ['chilled', 'halal'], ['veterinary_certificate', 'analysis_certificate']),
  sub('fa020', 'food_animal', 'Sery twarde (gouda, cheddar)', '0406.90.86', ['halal', 'kosher'], ['veterinary_certificate', 'analysis_certificate'], 'Chiny: rejestracja zakładu w GACC wymagana.'),
  sub('fa021', 'food_animal', 'Sery miękkie (brie, camembert)', '0406.10.20', ['perishable', 'chilled', 'halal'], ['veterinary_certificate'], 'USA: sery z surowego mleka, specjalne wymagania FDA (min. 60 dni dojrzewania).'),
  sub('fa022', 'food_animal', 'Jaja kurze w skorupkach', '0407.11.00', ['perishable'], ['veterinary_certificate', 'salmonella_certificate'], 'Wymagany certyfikat wolności od Salmonelli.'),
  sub('fa023', 'food_animal', 'Miód naturalny', '0409.00.00', ['halal', 'kosher'], ['veterinary_certificate', 'residue_certificate'], 'Certyfikat braku pozostałości antybiotyków wymagany.'),

  // ── Żywność przetworzona ────────────────────────────────────────────────────
  sub('pr001', 'food_processed', 'Konserwy warzywne', '2005.10.00', ['halal'], ['FDA_prior_notice_if_US', 'FSSAI_if_IN', 'analysis_certificate']),
  sub('pr002', 'food_processed', 'Dżemy i konfitury', '2007.10.10', ['halal'], ['analysis_certificate', 'labelling_compliance']),
  sub('pr003', 'food_processed', 'Sosy (keczup, majonez, musztarda)', '2103.20.00', ['halal'], ['analysis_certificate', 'halal_if_required']),
  sub('pr004', 'food_processed', 'Zupy i buliony instant', '2104.10.00', ['halal'], ['analysis_certificate', 'halal_if_required']),
  sub('pr005', 'food_processed', 'Makarony i kluski', '1902.11.00', [], ['labelling_compliance']),
  sub('pr006', 'food_processed', 'Pieczywo i wyroby cukiernicze', '1905.31.11', ['perishable', 'halal'], ['analysis_certificate', 'halal_if_required']),
  sub('pr007', 'food_processed', 'Czekolada i wyroby czekoladowe', '1806.31.00', ['halal', 'kosher'], ['analysis_certificate', 'halal_if_required']),
  sub('pr008', 'food_processed', 'Cukierki i karmelki', '1704.90.51', ['halal', 'kosher'], ['analysis_certificate', 'halal_if_required']),
  sub('pr009', 'food_processed', 'Chipsy i przekąski', '1905.90.30', ['gmo_risk', 'halal'], ['analysis_certificate', 'non_gmo_if_required', 'halal_if_required']),
  sub('pr010', 'food_processed', 'Płatki śniadaniowe', '1904.10.10', ['gmo_risk'], ['analysis_certificate', 'non_gmo_if_required']),
  sub('pr011', 'food_processed', 'Lody i mrożone desery', '2105.00.10', ['frozen', 'halal'], ['veterinary_certificate', 'halal_if_required']),
  sub('pr012', 'food_processed', 'Mąka pszenna', '1101.00.11', [], ['analysis_certificate', 'phytosanitary']),
  sub('pr013', 'food_processed', 'Oleje rafinowane w butelkach', '1512.19.99', ['halal'], ['analysis_certificate', 'halal_if_required']),
  sub('pr014', 'food_processed', 'Karma dla zwierząt domowych', '2309.10.11', [], ['veterinary_certificate', 'analysis_certificate'], 'USA: rejestracja FDA wymagana. AU: DAFF permit dla produktów mięsnych.'),
  sub('pr015', 'food_processed', 'Suplementy diety, tabletki i kapsułki', '2106.90.92', ['halal', 'kosher'], ['free_sale_certificate', 'analysis_certificate', 'FDA_prior_notice_if_US'], 'Klasyfikacja różni się w krajach: UE = suplement, USA = dietary supplement, inne = lek. Sprawdź przed wysyłką.'),

  // ── Napoje i alkohol ────────────────────────────────────────────────────────
  sub('bv001', 'beverages', 'Woda mineralna niegazowana', '2201.10.11', [], ['analysis_certificate']),
  sub('bv002', 'beverages', 'Napoje gazowane (cola, soda)', '2202.10.00', [], ['FDA_prior_notice_if_US']),
  sub('bv003', 'beverages', 'Soki owocowe (jabłkowy, pomarańczowy)', '2009.11.11', ['perishable'], ['analysis_certificate', 'FDA_prior_notice_if_US']),
  sub('bv004', 'beverages', 'Napoje energetyczne', '2202.99.19', [], ['FDA_prior_notice_if_US', 'ingredient_declaration'], 'Niektóre składniki (tauryna, kofeina w dużych dawkach) zakazane w części krajów.'),
  sub('bv005', 'beverages', 'Piwo', '2203.00.01', [], ['analysis_certificate', 'import_licence_alcohol', 'FDA_prior_notice_if_US', 'TTB_COLA_if_US'], 'USA: TTB COLA wymagane. Importerzy muszą być licencjonowani (stan po stanie).'),
  sub('bv006', 'beverages', 'Wino gronowe czerwone', '2204.21.18', [], ['analysis_certificate', 'import_licence_alcohol', 'TTB_COLA_if_US'], 'Arabia Saudyjska, Kuwejt, Katar: ZAKAZ importu alkoholu.'),
  sub('bv007', 'beverages', 'Wino gronowe białe', '2204.21.06', [], ['analysis_certificate', 'import_licence_alcohol']),
  sub('bv008', 'beverages', 'Wino musujące (szampan, prosecco)', '2204.10.11', [], ['analysis_certificate', 'import_licence_alcohol', 'TTB_COLA_if_US', 'geographic_indication_protection'], 'Szampan: tylko z regionu Champagne (Francja), ochrona geograficzna.'),
  sub('bv009', 'beverages', 'Wódka', '2208.60.11', ['flammable', 'dangerous'], ['analysis_certificate', 'import_licence_alcohol', 'TTB_COLA_if_US', 'MSDS_transport'], 'Transport: ADR klasa 3 (UN1170, alkohol etylowy). Arabia Saudyjska: ZAKAZ.'),
  sub('bv010', 'beverages', 'Whisky', '2208.30.11', ['flammable', 'dangerous'], ['analysis_certificate', 'import_licence_alcohol', 'TTB_COLA_if_US'], 'Scotch Whisky: tylko ze Szkocji. Bourbon: tylko z USA, ochrony geograficzne.'),
  sub('bv011', 'beverages', 'Rum', '2208.40.11', ['flammable', 'dangerous'], ['analysis_certificate', 'import_licence_alcohol']),
  sub('bv012', 'beverages', 'Gin', '2208.50.11', ['flammable', 'dangerous'], ['analysis_certificate', 'import_licence_alcohol']),
  sub('bv013', 'beverages', 'Brandy i koniak', '2208.20.12', ['flammable', 'dangerous'], ['analysis_certificate', 'import_licence_alcohol'], 'Koniak: tylko z regionu Cognac (Francja).'),
  sub('bv014', 'beverages', 'Likiery i nalewki', '2208.70.10', ['flammable'], ['analysis_certificate', 'import_licence_alcohol']),
  sub('bv015', 'beverages', 'Ocet (winny, jabłkowy)', '2209.00.11', [], ['analysis_certificate']),
  sub('bv016', 'beverages', 'Piwo bezalkoholowe', '2202.91.00', [], ['analysis_certificate']),

  // ── Elektronika ─────────────────────────────────────────────────────────────
  sub('el001', 'electronics', 'Smartfony', '8517.13.00', ['lithium', 'wireless'], ['CE_declaration', 'FCC_if_US', 'CCC_if_CN', 'lithium_battery_declaration', 'WEEE_RoHS'], 'Baterie litowe: ograniczenia lotnicze. CE obowiązkowe dla UE.'),
  sub('el002', 'electronics', 'Tablety', '8471.30.00', ['lithium', 'wireless'], ['CE_declaration', 'FCC_if_US', 'CCC_if_CN', 'lithium_battery_declaration']),
  sub('el003', 'electronics', 'Laptopy i notebooki', '8471.30.00', ['lithium', 'wireless'], ['CE_declaration', 'FCC_if_US', 'CCC_if_CN', 'lithium_battery_declaration'], 'Stan naładowania baterii max 30% przy wysyłce lotniczej luzem.'),
  sub('el004', 'electronics', 'Komputery stacjonarne PC', '8471.41.00', ['wireless'], ['CE_declaration', 'FCC_if_US', 'CCC_if_CN', 'WEEE_RoHS']),
  sub('el005', 'electronics', 'Serwery i infrastruktura IT', '8471.50.00', ['dual_use', 'wireless'], ['CE_declaration', 'dual_use_check', 'EAR_if_US'], 'Zaawansowane serwery mogą wymagać licencji Dual-Use przy eksporcie do niektórych krajów.'),
  sub('el006', 'electronics', 'Telewizory', '8528.72.40', ['wireless'], ['CE_declaration', 'FCC_if_US', 'CCC_if_CN', 'WEEE_RoHS', 'energy_label_EU'], 'UE: obowiązkowa etykieta energetyczna i rejestracja w EPREL.'),
  sub('el007', 'electronics', 'Monitory', '8528.52.91', [], ['CE_declaration', 'WEEE_RoHS']),
  sub('el008', 'electronics', 'Aparaty fotograficzne', '9006.53.10', [], ['CE_declaration']),
  sub('el009', 'electronics', 'Słuchawki i głośniki', '8518.30.95', ['wireless'], ['CE_declaration', 'FCC_if_US', 'WEEE_RoHS']),
  sub('el010', 'electronics', 'Konsole do gier', '9504.50.00', ['lithium', 'wireless'], ['CE_declaration', 'FCC_if_US', 'CCC_if_CN', 'lithium_battery_declaration']),
  sub('el011', 'electronics', 'Smartwatche i opaski fitness', '9102.12.00', ['lithium', 'wireless'], ['CE_declaration', 'FCC_if_US', 'lithium_battery_declaration']),
  sub('el012', 'electronics', 'Routery i modemy', '8517.62.00', ['wireless', 'dual_use'], ['CE_declaration', 'FCC_if_US', 'SRRC_if_CN'], 'Urządzenia sieciowe mogą wymagać zezwolenia telekomunikacyjnego w kraju importu.'),
  sub('el013', 'electronics', 'Baterie litowo-jonowe (samodzielne)', '8507.60.00', ['lithium', 'dangerous'], ['MSDS', 'lithium_battery_declaration_UN3480', 'IMDG_if_sea', 'ADR_if_road'], 'UN3480 (samodzielne baterie), ograniczenia w transporcie lotniczym, wiele linii odmawia.'),
  sub('el014', 'electronics', 'Panele słoneczne (fotowoltaiczne)', '8541.43.00', [], ['CE_declaration', 'antidumping_check'], 'UE: sprawdź cła antydumpingowe dla paneli z Chin.'),
  sub('el015', 'electronics', 'Klimatyzatory', '8415.10.11', [], ['CE_declaration', 'F_gas_certificate', 'energy_label_EU'], 'UE: certyfikat F-gas dla urządzeń z czynnikiem chłodniczym.'),
  sub('el016', 'electronics', 'Pralki', '8450.11.11', [], ['CE_declaration', 'WEEE_RoHS', 'energy_label_EU']),
  sub('el017', 'electronics', 'Lodówki i zamrażarki', '8418.10.20', [], ['CE_declaration', 'F_gas_certificate', 'energy_label_EU'], 'Czynniki chłodnicze HFC, certyfikat F-gas.'),
  sub('el018', 'electronics', 'Kable elektryczne', '8544.42.90', [], ['CE_declaration', 'RoHS_declaration']),
  sub('el019', 'electronics', 'Silniki elektryczne', '8501.20.00', [], ['CE_declaration']),
  sub('el020', 'electronics', 'Transformatory', '8504.21.00', [], ['CE_declaration']),
  sub('el021', 'electronics', 'Oświetlenie LED', '8539.52.00', [], ['CE_declaration', 'WEEE_RoHS', 'energy_label_EU']),
  sub('el022', 'electronics', 'Drony / UAV', '8806.21.00', ['wireless', 'dual_use'], ['CE_declaration', 'dual_use_check', 'aviation_authority_approval'], 'Drony mogą wymagać zezwolenia lotniczego w kraju importu. Sprawdź przepisy EASA/FAA.'),
  sub('el023', 'electronics', 'Roboty przemysłowe', '8479.89.97', ['dual_use'], ['CE_machinery', 'dual_use_check']),

  // ── Maszyny i urządzenia ────────────────────────────────────────────────────
  sub('mach001', 'machinery', 'Maszyny do obróbki metali (tokarki CNC)', '8457.10.10', ['dual_use', 'oversize'], ['CE_machinery', 'dual_use_check', 'special_transport_if_oversize'], 'Precyzyjne tokarki CNC mogą wymagać licencji Dual-Use (produkcja rakiet i broni).'),
  sub('mach002', 'machinery', 'Prasy hydrauliczne', '8462.10.10', ['oversize'], ['CE_machinery', 'pressure_vessel_certificate']),
  sub('mach003', 'machinery', 'Kompresory i sprężarki', '8414.80.11', ['dual_use'], ['CE_machinery', 'dual_use_check', 'pressure_vessel_certificate'], 'Sprężarki wysokociśnieniowe mogą być Dual-Use.'),
  sub('mach004', 'machinery', 'Pompy (wodne, przemysłowe)', '8413.70.10', [], ['CE_machinery']),
  sub('mach005', 'machinery', 'Turbiny wiatrowe (komponenty)', '8502.31.00', ['oversize'], ['CE_declaration', 'special_transport_permit', 'project_cargo_insurance'], 'Łopaty turbin: długość do 70 m. Transport specjalny, zezwolenia drogowe w każdym kraju tranzytu.'),
  sub('mach006', 'machinery', 'Generatory prądu', '8502.11.20', ['fuel_tank', 'flammable'], ['CE_machinery', 'MSDS_if_fuel', 'emission_certificate'], 'Z paliwem w zbiorniku: transport lotniczy zakazany. Zbiornik opróżnić i oczyścić.'),
  sub('mach007', 'machinery', 'Reaktory przemysłowe (chemiczne)', '8419.89.30', ['dual_use', 'oversize'], ['CE_pressure_equipment', 'dual_use_check', 'pressure_vessel_certificate'], 'Reaktory chemiczne mogą być Dual-Use (produkcja substancji chemicznych).'),

  // ── Chemikalia przemysłowe ──────────────────────────────────────────────────
  sub('ch001', 'chemicals', 'Kwas siarkowy', '2807.00.10', ['corrosive', 'dangerous'], ['MSDS', 'ADR_class8', 'IMDG_class8', 'REACH_EU'], 'ADR klasa 8 (żrący). UN1830. Specjalne pojazdy i kontenery.'),
  sub('ch002', 'chemicals', 'Kwas solny (chlorowodorowy)', '2806.10.00', ['corrosive', 'dangerous', 'precursor'], ['MSDS', 'ADR_class8', 'REACH_EU', 'precursor_check'], 'Prekursor do produkcji narkotyków, rejestracja wymagana w UE.'),
  sub('ch003', 'chemicals', 'Kwas azotowy', '2808.00.00', ['corrosive', 'oxidizing', 'dangerous'], ['MSDS', 'ADR_class8', 'dual_use_check'], 'Dual-Use: może być użyty do produkcji materiałów wybuchowych.'),
  sub('ch004', 'chemicals', 'Wodorotlenek sodu (soda kaustyczna)', '2815.11.00', ['corrosive', 'dangerous'], ['MSDS', 'ADR_class8', 'IMDG_class8'], 'UN1823 to postać stała, UN1824 to roztwór. Klasa 8.'),
  sub('ch005', 'chemicals', 'Aceton', '2914.11.00', ['flammable', 'dangerous', 'precursor'], ['MSDS', 'ADR_class3', 'IMDG_class3', 'precursor_registration'], 'UN1090, ADR klasa 3. Prekursor narkotykowy, rejestracja wymagana.'),
  sub('ch006', 'chemicals', 'Etanol techniczny (alkohol etylowy)', '2207.10.00', ['flammable', 'dangerous'], ['MSDS', 'ADR_class3', 'denatured_certificate'], 'UN1170, ADR klasa 3. Może wymagać denaturacji i specjalnych zezwoleń.'),
  sub('ch007', 'chemicals', 'Toluen', '2902.30.00', ['flammable', 'toxic', 'dangerous', 'precursor'], ['MSDS', 'ADR_class3', 'REACH_EU', 'dual_use_check'], 'Prekursor narkotykowy. Dual-Use. ADR klasa 3.'),
  sub('ch008', 'chemicals', 'Amoniak (ciecz)', '2814.10.00', ['toxic', 'dangerous', 'gas'], ['MSDS', 'ADR_class2', 'IMDG_class2', 'dual_use_check'], 'UN1005, ADR klasa 2. Toksyczny. Może być użyty do produkcji materiałów wybuchowych.'),
  sub('ch009', 'chemicals', 'Chlor gazowy', '2801.10.00', ['toxic', 'dangerous', 'gas', 'dual_use'], ['MSDS', 'ADR_class2', 'dual_use_licence'], 'CWC, broń chemiczna, Lista 3. Wymaga licencji Dual-Use przy eksporcie.'),
  sub('ch010', 'chemicals', 'Nawozy azotowe (saletra amonowa)', '3102.30.10', ['oxidizing', 'explosive', 'dangerous'], ['MSDS', 'ADR_class5_1', 'explosive_precursor_registration'], 'Powyżej 16% azotu może być materiałem wybuchowym. Kontrola UE, rozp. 2019/1148.'),
  sub('ch011', 'chemicals', 'Nawozy NPK mieszane', '3105.20.10', [], ['analysis_certificate', 'MSDS_if_DG']),
  sub('ch012', 'chemicals', 'Herbicydy (glifosat)', '3808.93.15', ['toxic', 'dangerous', 'dual_use'], ['MSDS', 'ADR_class6_1', 'import_permit_pesticide'], 'Glifosat, kontrowersyjny w UE. Sprawdź aktualne zezwolenia.'),
  sub('ch013', 'chemicals', 'Insektycydy', '3808.91.10', ['toxic', 'dangerous'], ['MSDS', 'ADR_class6_1', 'import_permit_pesticide', 'Rotterdam_convention_check'], 'Sprawdź konwencję rotterdamską, niektóre substancje wymagają Prior Informed Consent (PIC).'),
  sub('ch014', 'chemicals', 'Farby i lakiery (z rozpuszczalnikami)', '3209.10.00', ['flammable', 'dangerous'], ['MSDS', 'ADR_class3_if_flammable', 'REACH_EU', 'VOC_declaration'], 'Sprawdź zawartość VOC (lotne związki organiczne), limity w UE i USA.'),
  sub('ch015', 'chemicals', 'Kleje (epoksydowe, cyjanoakrylowe)', '3506.10.00', ['flammable', 'dangerous'], ['MSDS', 'ADR_if_flammable', 'REACH_EU']),
  sub('ch016', 'chemicals', 'Tworzywa sztuczne, granulat PE/PP', '3901.10.10', [], ['analysis_certificate', 'REACH_EU']),
  sub('ch017', 'chemicals', 'Gazy techniczne (tlen, azot, argon)', '2804.40.00', ['gas', 'dangerous'], ['MSDS', 'ADR_class2', 'cylinder_test_certificate'], 'Butla musi mieć ważny test ciśnieniowy. Specjalne przepisy dla cieczy kriogenicznych.'),
  sub('ch018', 'chemicals', 'Żywice epoksydowe', '3907.30.00', ['corrosive', 'dangerous'], ['MSDS', 'REACH_EU']),

  // ── Chemikalia konsumenckie ─────────────────────────────────────────────────
  sub('cc001', 'chemicals_cons', 'Środki do prania (płyn, proszek)', '3402.20.20', [], ['REACH_SVHC', 'labelling_compliance', 'biodegradability_certificate_EU'], 'UE: obowiązkowa informacja o biodegradowalności surfaktantów.'),
  sub('cc002', 'chemicals_cons', 'Środki czyszczące do łazienki / WC', '3808.94.90', ['corrosive', 'dangerous'], ['MSDS', 'REACH_SVHC', 'biocide_registration_if_applicable'], 'Jeśli zawierają biocyd: rejestracja BPR wymagana w UE.'),
  sub('cc003', 'chemicals_cons', 'Farby do ścian (emulsyjne)', '3209.10.00', [], ['MSDS', 'VOC_declaration', 'REACH_SVHC'], 'UE: limit VOC (dyrektywa 2004/42/EC). Brak ołowiu i chromu, certyfikat.'),
  sub('cc004', 'chemicals_cons', 'Kleje do tapet i podłóg', '3506.91.10', ['flammable'], ['MSDS', 'VOC_declaration', 'REACH_SVHC']),
  sub('cc005', 'chemicals_cons', 'Oleje silnikowe', '2710.19.81', ['dangerous'], ['MSDS', 'quality_certificate_API'], 'API Service Classification wymagana na etykiecie.'),
  sub('cc006', 'chemicals_cons', 'Płyny eksploatacyjne (hamulcowy, chłodniczy)', '3820.00.00', ['dangerous', 'flammable'], ['MSDS', 'ADR_if_flammable']),
  sub('cc007', 'chemicals_cons', 'Insektycydy domowe (spray)', '3808.91.10', ['toxic', 'dangerous', 'gas'], ['MSDS', 'ADR_class2_aerosol', 'biocide_registration_EU', 'import_permit_pesticide'], 'Aerozol: ADR klasa 2. Biocyd: rejestracja BPR. Niektóre substancje zakazane w UE.'),

  // ── Leki i farmaceutyki ─────────────────────────────────────────────────────
  sub('med001', 'medicines', 'Leki gotowe, tabletki i kapsułki', '3004.90.00', ['cold_chain', 'halal'], ['free_sale_certificate', 'GMP_certificate', 'batch_release', 'MA_certificate', 'halal_if_required'], 'USA: FDA NDA/ANDA. Chiny: NMPA. Indie: CDSCO. Brazylia: ANVISA.'),
  sub('med002', 'medicines', 'Leki iniekcyjne (ampułki, fiolki)', '3002.13.00', ['cold_chain', 'sterile'], ['free_sale_certificate', 'GMP_certificate', 'batch_release', 'cold_chain_certificate'], 'Sterylność krytyczna, dokumentacja temperature excursion wymagana.'),
  sub('med003', 'medicines', 'Szczepionki', '3002.20.00', ['cold_chain', 'sterile'], ['WHO_prequalification', 'batch_release', 'cold_chain_certificate', 'import_licence_vaccines'], 'Łańcuch chłodniczy 2-8°C absolutnie krytyczny. Każde odchylenie = zniszczenie partii.'),
  sub('med004', 'medicines', 'Substancje farmaceutyczne (API)', '2941.10.00', ['dual_use', 'cold_chain'], ['GMP_certificate', 'DMF_certificate', 'REACH_EU', 'MSDS'], 'Drug Master File (DMF) wymagany przez FDA i inne organy.'),
  sub('med005', 'medicines', 'Suplementy diety', '2106.90.92', ['halal', 'kosher'], ['free_sale_certificate', 'analysis_certificate', 'novel_food_check_EU'], 'Klasyfikacja różni się w krajach. USA = dietary supplement (FDA). UE = suplement diety. Japonia = FoSHU.'),
  sub('med006', 'medicines', 'Narkotyki i psychotropy (kontrolowane)', '2939.11.00', ['narcotic', 'cold_chain'], ['export_licence_narcotic_GIF', 'import_licence_narcotic', 'batch_release', 'cold_chain_certificate'], 'Podwójna licencja obowiązkowa: eksportowa (GIF Polska) + importowa (organ kraju docelowego). Konwencje ONZ 1961/1971.'),
  sub('med007', 'medicines', 'Produkty weterynaryjne', '3004.50.00', [], ['free_sale_certificate', 'veterinary_authority_approval', 'GMP_certificate']),
  sub('med008', 'medicines', 'Środki dezynfekcyjne (biocydy)', '3808.94.20', ['corrosive', 'dangerous'], ['biocide_registration_EU', 'MSDS', 'ADR_if_corrosive'], 'UE: rozporządzenie o biocydach (BPR) 528/2012, wymagana rejestracja produktu.'),

  // ── Kosmetyki ───────────────────────────────────────────────────────────────
  sub('cos001', 'cosmetics', 'Perfumy i wody toaletowe', '3303.00.10', ['flammable', 'dangerous'], ['safety_assessment_EU', 'free_sale_certificate', 'MSDS_if_DG', 'NMPA_if_CN'], 'ADR klasa 3 jeśli powyżej 24% alkoholu. Chiny: rejestracja NMPA wymagana (długa procedura).'),
  sub('cos002', 'cosmetics', 'Kremy i lotiony do twarzy', '3304.99.00', ['halal'], ['safety_assessment_EU', 'free_sale_certificate', 'NMPA_if_CN', 'halal_if_required'], 'Chiny: produkty specjalne (np. z SPF) wymagają pełnej rejestracji NMPA, nawet 2 lata.'),
  sub('cos003', 'cosmetics', 'Szampony i odżywki', '3305.10.00', [], ['safety_assessment_EU', 'free_sale_certificate']),
  sub('cos004', 'cosmetics', 'Farby do włosów', '3305.90.90', ['dangerous', 'corrosive'], ['safety_assessment_EU', 'MSDS', 'REACH_EU_SVHC'], 'Fenylenodiamina (PPD), regulowana w UE. Niektóre substancje zakazane.'),
  sub('cos005', 'cosmetics', 'Lakier do paznokci', '3304.30.00', ['flammable', 'dangerous'], ['safety_assessment_EU', 'MSDS', 'ADR_class3'], 'ADR klasa 3 (łatwopalny). UN1210. Ograniczenia w transporcie lotniczym.'),
  sub('cos006', 'cosmetics', 'Dezodoranty i antyperspiranty (spray)', '3307.20.00', ['flammable', 'dangerous', 'gas'], ['safety_assessment_EU', 'MSDS', 'ADR_class2_or_3'], 'Aerozole: ADR klasa 2 (UN1950). Ograniczenia w transporcie lotniczym.'),
  sub('cos007', 'cosmetics', 'Kremy z filtrem SPF', '3304.99.00', [], ['safety_assessment_EU', 'free_sale_certificate', 'SPF_test_certificate', 'NMPA_if_CN'], 'Chiny: filtry UV klasyfikowane jako „special cosmetics”, pełna rejestracja NMPA. Australia: TGA.'),
  sub('cos008', 'cosmetics', 'Pasta do zębów', '3306.10.00', [], ['safety_assessment_EU', 'free_sale_certificate', 'fluoride_check'], 'Zawartość fluorku regulowana w wielu krajach, sprawdź limity.'),
  sub('cos009', 'cosmetics', 'Kosmetyki dla niemowląt', '3304.99.00', [], ['safety_assessment_EU', 'free_sale_certificate', 'pediatric_safety_assessment'], 'Surowsze normy bezpieczeństwa niż dla dorosłych, brak SLS, parabenów itp.'),

  // ── Odzież i tekstylia ──────────────────────────────────────────────────────
  sub('tx001', 'textiles', 'Odzież damska wierzchnia (sukienki, bluzki)', '6204.42.00', [], ['textile_composition_label', 'CE_if_PPE', 'REACH_SVHC']),
  sub('tx002', 'textiles', 'Odzież męska wierzchnia (koszule, spodnie)', '6205.20.00', [], ['textile_composition_label', 'REACH_SVHC']),
  sub('tx003', 'textiles', 'Odzież dziecięca (0-14 lat)', '6209.20.00', ['xinjiang'], ['textile_composition_label', 'flammability_certificate', 'CPSC_if_US', 'REACH_SVHC'], 'USA: CPSC, standardy palności dla odzieży dziecięcej. Sprawdź UFLPA (bawełna z Xinjiangu).'),
  sub('tx004', 'textiles', 'Bielizna i piżamy', '6108.21.00', ['xinjiang'], ['textile_composition_label', 'REACH_SVHC']),
  sub('tx005', 'textiles', 'Odzież sportowa', '6211.33.10', [], ['textile_composition_label', 'REACH_SVHC']),
  sub('tx006', 'textiles', 'Kurtki i płaszcze zimowe', '6201.92.00', [], ['textile_composition_label', 'down_certificate_if_puch', 'REACH_SVHC'], 'Pierze i puch: certyfikat RDS (Responsible Down Standard) coraz częściej wymagany.'),
  sub('tx007', 'textiles', 'Obuwie sportowe', '6404.11.00', [], ['REACH_SVHC', 'EN_standard_if_PPE']),
  sub('tx008', 'textiles', 'Obuwie skórzane formalne', '6403.51.05', ['cites'], ['REACH_SVHC', 'CITES_if_exotic_leather'], 'Skóra egzotyczna (krokodyl, wąż, struś) wymaga zezwolenia CITES.'),
  sub('tx009', 'textiles', 'Tkaniny bawełniane (surowe)', '5208.11.10', ['xinjiang'], ['textile_composition_certificate', 'origin_declaration'], 'USA: UFLPA, domniemanie pracy przymusowej dla bawełny z Xinjiangu (Chiny).'),
  sub('tx010', 'textiles', 'Tkaniny syntetyczne (poliester)', '5407.61.10', [], ['REACH_SVHC']),
  sub('tx011', 'textiles', 'Torby i plecaki', '4202.22.90', ['cites'], ['REACH_SVHC', 'CITES_if_exotic_leather']),
  sub('tx012', 'textiles', 'Dywany i wykładziny', '5703.20.00', [], ['REACH_SVHC', 'labelling_EU']),
  sub('tx013', 'textiles', 'Pościel i ręczniki', '6302.21.00', ['xinjiang', 'organic'], ['textile_composition_label', 'organic_if_claimed']),
  sub('tx014', 'textiles', 'Rękawiczki i czapki', '6116.10.20', ['xinjiang'], ['textile_composition_label']),

  // ── Pojazdy ─────────────────────────────────────────────────────────────────
  sub('veh001', 'vehicles', 'Samochody osobowe nowe', '8703.23.19', [], ['certificate_of_conformity', 'type_approval', 'emission_certificate'], 'USA: NHTSA Form HS-7 + EPA 3520-1. Japonia: własna homologacja. AU: ADR compliance.'),
  sub('veh002', 'vehicles', 'Samochody osobowe używane', '8703.23.19', ['used_vehicle'], ['deregistration_certificate', 'certificate_of_conformity', 'mileage_declaration'], 'Większość krajów ma ograniczenia wieku pojazdu. Japonia i AU: kierownica po prawej stronie.'),
  sub('veh003', 'vehicles', 'Samochody elektryczne (BEV)', '8703.80.10', ['lithium', 'used_vehicle'], ['certificate_of_conformity', 'lithium_battery_transport_docs', 'emission_certificate'], 'Pakiet baterii: duży ładunek litowy, specjalne wymagania transportowe. Stan naładowania 20-30%.'),
  sub('veh004', 'vehicles', 'Motocykle', '8711.20.00', [], ['certificate_of_conformity', 'type_approval']),
  sub('veh005', 'vehicles', 'Ciągniki siodłowe (TIR)', '8701.21.10', [], ['certificate_of_conformity', 'emission_certificate_Euro6', 'ADR_if_applicable']),
  sub('veh006', 'vehicles', 'Maszyny rolnicze (traktory, kombajny)', '8701.91.10', ['oversize'], ['CE_machinery', 'special_transport_permit_if_oversize'], 'Kombajny często ponadgabarytowe, wymagają zezwolenia na transport drogowy.'),
  sub('veh007', 'vehicles', 'Maszyny budowlane (koparki, ładowarki)', '8429.51.99', ['oversize', 'fuel_tank'], ['CE_machinery', 'special_transport_permit', 'fuel_drain_certificate_if_air'], 'Transport lotniczy: zbiornik paliwa musi być opróżniony i oczyszczony.'),
  sub('veh008', 'vehicles', 'Wózki widłowe', '8427.20.19', ['lithium'], ['CE_machinery', 'lithium_if_electric']),
  sub('veh009', 'vehicles', 'Części silnikowe (bloki, głowice)', '8409.91.00', [], ['commercial_invoice', 'packing_list', 'origin_declaration']),
  sub('veh010', 'vehicles', 'Opony samochodowe', '4011.10.00', [], ['EU_tyre_label', 'REACH_SVHC', 'antidumping_check'], 'UE: etykieta opony (efektywność paliwowa, hamowanie, hałas). Sprawdź antydumping dla opon z Chin.'),
  sub('veh011', 'vehicles', 'Rowery elektryczne', '8712.00.30', ['lithium'], ['CE_declaration', 'lithium_battery_declaration', 'EN_15194_certificate'], 'EN 15194, europejski standard dla rowerów elektrycznych.'),
  sub('veh012', 'vehicles', 'Akumulatory samochodowe (kwasowo-ołowiowe)', '8507.10.20', ['corrosive', 'dangerous'], ['MSDS', 'ADR_class8', 'battery_recycling_deposit'], 'ADR klasa 8 (żrący) + klasa 9. Kwas siarkowy. Depozyt recyklingowy w wielu krajach.'),

  // ── Metale i surowce ────────────────────────────────────────────────────────
  sub('met001', 'metals', 'Stal walcowana na gorąco (blachy)', '7208.51.20', [], ['mill_certificate', 'quality_inspection'], 'Sprawdź cła antydumpingowe dla stali z Chin i Rosji w UE/USA.'),
  sub('met002', 'metals', 'Stal nierdzewna (blachy, pręty)', '7219.11.00', [], ['mill_certificate', 'analysis_certificate']),
  sub('met003', 'metals', 'Stal zbrojeniowa (pręty)', '7214.20.00', [], ['mill_certificate']),
  sub('met004', 'metals', 'Rury stalowe', '7304.31.20', [], ['mill_certificate', 'pressure_test_certificate_if_required']),
  sub('met005', 'metals', 'Aluminium pierwotne (gąski)', '7601.10.00', [], ['quality_certificate', 'weight_certificate'], 'LME grade, wymagany certyfikat uznania przez London Metal Exchange.'),
  sub('met006', 'metals', 'Miedź katodowa', '7403.11.00', [], ['quality_certificate', 'weight_certificate', 'LME_certificate'], 'LME Grade A Copper, wymagany certyfikat.'),
  sub('met007', 'metals', 'Złom metalowy (stalowy)', '7204.10.00', [], ['radiation_certificate', 'analysis_certificate', 'Basel_convention_check'], 'Konwencja bazylejska, wywóz odpadów do krajów rozwijających się wymaga zezwolenia. Certyfikat braku radioaktywności.'),
  sub('met008', 'metals', 'Ruda żelaza', '2601.11.00', [], ['weight_certificate', 'analysis_certificate', 'moisture_certificate'], 'Wilgotność krytyczna, mokra ruda może ulec upłynnieniu w kontenerze (liquefaction risk).'),
  sub('met009', 'metals', 'Węgiel kamienny', '2701.12.10', [], ['quality_certificate', 'weight_certificate', 'self_heating_declaration'], 'Ryzyko samozapłonu przy długim transporcie. Deklaracja skłonności do samoogrzewania.'),

  // ── Drewno i wyroby drzewne ─────────────────────────────────────────────────
  sub('wd001', 'wood', 'Drewno okrągłe (kłody)', '4403.21.10', ['cites', 'perishable'], ['phytosanitary', 'FLEGT_if_applicable', 'CITES_if_applicable', 'fumigation_if_required'], 'FLEGT (legalne pozyskanie drewna). Palisander/mahoń: CITES. Australia/USA: fumigacja.'),
  sub('wd002', 'wood', 'Tarcica (deski, belki)', '4407.11.10', ['wooden_pkg'], ['phytosanitary', 'FLEGT_if_applicable', 'ISPM15_if_packing', 'fumigation_if_AU_NZ'], 'ISPM15 dla opakowań drewnianych. Lacey Act (USA), deklaracja gatunku i kraju.'),
  sub('wd003', 'wood', 'Sklejka', '4412.31.10', [], ['formaldehyde_certificate', 'TSCA_if_US', 'FLEGT_if_applicable'], 'USA: TSCA Title VI, certyfikat emisji formaldehydu obowiązkowy.'),
  sub('wd004', 'wood', 'Płyta wiórowa i MDF', '4410.11.10', [], ['formaldehyde_certificate', 'TSCA_if_US'], 'USA: EPA TSCA Title VI. Japonia: standard emisji formaldehydu F★★★★.'),
  sub('wd005', 'wood', 'Podłogi drewniane', '4418.73.10', [], ['formaldehyde_certificate', 'FLEGT_if_applicable', 'TSCA_if_US']),
  sub('wd006', 'wood', 'Meble z drewna', '9403.60.10', ['wooden_pkg', 'cites'], ['FLEGT_if_applicable', 'CITES_if_applicable', 'formaldehyde_certificate'], 'Sprawdź gatunek drewna pod kątem CITES (palisander, mahoń, teak).'),
  sub('wd007', 'wood', 'Palety drewniane', '4415.20.90', ['wooden_pkg'], ['ISPM15_certificate'], 'ISPM 15 obowiązkowe dla eksportu do USA, AU, CN, JP i innych. Oznaczenie IPPC na każdej palecie.'),
  sub('wd008', 'wood', 'Pellet i biomasa drzewna', '4401.31.00', [], ['quality_certificate', 'sustainability_certificate_FSC_PEFC', 'phytosanitary_if_raw'], 'UE: dyrektywa RED II, wymóg certyfikatu zrównoważoności dla biomasy.'),

  // ── Wyroby medyczne i optyczne ──────────────────────────────────────────────
  sub('mdc001', 'medical', 'Wyroby medyczne klasy I (plastry, bandaże)', '3005.10.00', [], ['CE_MDR', 'declaration_of_conformity', 'registration_if_non_EU'], 'CE klasy I, producent może samodzielnie ocenić zgodność (bez jednostki notyfikowanej).'),
  sub('mdc002', 'medical', 'Wyroby medyczne klasy IIa (ciśnieniomierze)', '9018.19.10', [], ['CE_MDR_class_IIa', 'notified_body_certificate', 'registration_if_non_EU'], 'Jednostka notyfikowana wymagana. FDA 510(k) dla USA. TGA dla Australii.'),
  sub('mdc003', 'medical', 'Wyroby medyczne klasy III (implanty, stenty)', '9021.39.10', ['sterile', 'cold_chain'], ['CE_MDR_class_III', 'notified_body_certificate', 'clinical_investigation', 'FDA_PMA_if_US'], 'Najwyższe wymagania. FDA PMA (Pre-Market Approval). Sterylność absolutnie krytyczna.'),
  sub('mdc004', 'medical', 'Respiratory i koncentratory tlenu', '9019.20.00', ['gas'], ['CE_MDR', 'ISO_13485', 'FDA_510k_if_US'], 'Gaz medyczny: certyfikat czystości. ADR/IMDG klasa 2 dla butli tlenowych.'),
  sub('mdc005', 'medical', 'Aparaty USG', '9018.12.00', [], ['CE_MDR_class_IIa', 'FDA_510k_if_US', 'NMPA_if_CN']),
  sub('mdc006', 'medical', 'Strzykawki jednorazowe', '9018.31.10', ['sterile'], ['CE_MDR', 'ISO_13485', 'sterility_certificate']),
  sub('mdc007', 'medical', 'Rękawiczki medyczne nitrylowe', '4015.12.00', [], ['CE_MDR_class_I', 'EN_455_certificate', 'FDA_if_US']),
  sub('mdc008', 'medical', 'Testy diagnostyczne (COVID, ciążowe)', '3822.19.00', [], ['CE_IVDR', 'FDA_EUA_or_510k_if_US', 'performance_evaluation_certificate'], 'Testy IVD: nowe rozporządzenie IVDR 2017/746 w UE. FDA EUA lub 510(k).'),
  sub('mdc009', 'medical', 'Okulary korekcyjne', '9004.10.18', [], ['CE_MDR', 'EN_ISO_12870_certificate']),

  // ── Energetyka i paliwa ─────────────────────────────────────────────────────
  sub('en001', 'energy', 'Ropa naftowa surowa', '2709.00.90', ['flammable', 'dangerous'], ['MSDS', 'IMDG_class3', 'quantity_certificate', 'quality_certificate', 'bill_of_lading_tanker', 'sanctions_check'], 'Sprawdź sankcje (Rosja, Iran, Wenezuela). Wymagany tankowiec. Zgodność z MARPOL.'),
  sub('en002', 'energy', 'Olej napędowy (diesel)', '2710.19.43', ['flammable', 'dangerous'], ['MSDS', 'ADR_class3', 'IMDG_class3', 'quality_certificate', 'excise_bond'], 'Akcyza w większości krajów. UN1202, ADR klasa 3.'),
  sub('en003', 'energy', 'Benzyna', '2710.12.25', ['flammable', 'dangerous'], ['MSDS', 'ADR_class3', 'IMDG_class3', 'quality_certificate', 'excise_bond'], 'UN1203, ADR klasa 3. Najwyższy stopień zapalności.'),
  sub('en004', 'energy', 'LPG (propan-butan)', '2711.12.11', ['gas', 'flammable', 'dangerous'], ['MSDS', 'ADR_class2', 'IMDG_class2', 'tank_inspection_certificate'], 'UN1075, ADR klasa 2. Specjalne cysterny ciśnieniowe.'),
  sub('en005', 'energy', 'Węgiel kamienny (energetyczny)', '2701.12.10', [], ['quality_certificate', 'weight_certificate', 'calorific_value_certificate'], 'Ryzyko samozapłonu. Sprawdź sankcje dla węgla z Rosji.'),
  sub('en006', 'energy', 'Panele słoneczne (moduły PV)', '8541.43.00', ['xinjiang'], ['CE_declaration', 'IEC_61215_certificate', 'antidumping_check_EU_US'], 'Sprawdź UFLPA (krzem z Xinjiangu). Antydumping dla paneli z Chin w UE i USA.'),

  // ── Materiały budowlane ─────────────────────────────────────────────────────
  sub('con001', 'construction', 'Cement portlandzki', '2523.29.00', ['corrosive'], ['quality_certificate', 'MSDS', 'analysis_certificate'], 'Cement jest żrący dla skóry i oczu. MSDS wymagany.'),
  sub('con002', 'construction', 'Płytki ceramiczne', '6907.21.20', [], ['quality_certificate', 'radiation_check_for_granite'], 'Granit: sprawdź poziom radioaktywności (radon), niektóre partie z Chin przekraczają normy UE.'),
  sub('con003', 'construction', 'Szkło float (tafle)', '7005.29.25', ['fragile', 'oversize'], ['quality_certificate'], 'Transport specjalny, stojaki A-frame. Kruchość ekstremalna.'),
  sub('con004', 'construction', 'Granit i marmur (płyty)', '2516.11.00', ['fragile', 'oversize', 'valuable'], ['quality_certificate', 'radiation_certificate']),
  sub('con005', 'construction', 'Rury PVC i HDPE', '3917.21.10', [], ['quality_certificate', 'REACH_SVHC']),
  sub('con006', 'construction', 'Izolacje (wełna mineralna)', '6806.10.00', ['dangerous'], ['MSDS', 'REACH_SVHC', 'asbestos_free_certificate'], 'Certyfikat braku azbestu wymagany. Wełna mineralna: ryzyko respirabilności: MSDS.'),

  // ── Towary luksusowe i specjalne ────────────────────────────────────────────
  sub('lux001', 'luxury', 'Złoto (monety, sztabki)', '7108.12.00', ['valuable', 'precious_metal'], ['assay_certificate', 'chain_of_custody', 'insurance_certificate', 'customs_declaration_accurate_value'], 'Wartość celna musi być dokładna, zaniżenie to przestępstwo celne. Ubezpieczenie i eskorta zalecane.'),
  sub('lux002', 'luxury', 'Srebro przemysłowe i inwestycyjne', '7106.91.10', ['valuable', 'precious_metal'], ['assay_certificate', 'insurance_certificate']),
  sub('lux003', 'luxury', 'Diamenty surowe', '7102.31.00', ['valuable', 'kimberley'], ['Kimberley_Process_Certificate', 'assay_certificate', 'insurance_certificate'], 'Kimberley Process Certificate OBOWIĄZKOWY. Bez niego import zakazany w większości krajów.'),
  sub('lux004', 'luxury', 'Diamenty szlifowane', '7102.39.00', ['valuable'], ['gemological_certificate_GIA', 'insurance_certificate', 'customs_accurate_value'], 'Certyfikat GIA/IGI/HRD dla kamieni powyżej 0,5 ct. Wartość musi być dokładna.'),
  sub('lux005', 'luxury', 'Biżuteria złota', '7113.19.00', ['valuable', 'cites'], ['hallmarking_certificate', 'assay_certificate', 'CITES_if_exotic_materials', 'insurance_certificate'], 'UK: obowiązkowe cechowanie w Assay Office. CITES jeśli zawiera kość słoniową, koralowce itp.'),
  sub('lux006', 'luxury', 'Zegarki luksusowe', '9102.11.00', ['valuable'], ['insurance_certificate', 'authenticity_certificate']),
  sub('lux007', 'luxury', 'Dzieła sztuki (obrazy, rzeźby)', '9701.10.00', ['valuable', 'fragile', 'artwork', 'cites'], ['provenance_documentation', 'authenticity_certificate', 'export_permit_cultural_goods', 'insurance_certificate', 'CITES_if_applicable'], 'MKiDN (Polska): pozwolenie na wywóz dóbr kultury. Konwencja UNESCO 1970, proweniencja.'),
  sub('lux008', 'luxury', 'Antyki (ponad 100 lat)', '9706.10.00', ['valuable', 'artwork'], ['provenance_documentation', 'authenticity_certificate', 'export_permit_MKiDN', 'insurance_certificate'], 'Polska: obowiązkowe pozwolenie MKiDN dla antyków powyżej określonej wartości.'),
  sub('lux009', 'luxury', 'Skóra krokodyla / wężowa (wyroby)', '4205.00.90', ['cites'], ['CITES_export_permit', 'CITES_import_permit', 'GDOS_permit'], 'CITES Appendix I lub II. Zezwolenie GDOŚ wymagane. Bez CITES, konfiskata i kara.'),
  sub('lux010', 'luxury', 'Futra naturalne', '4303.10.90', ['cites', 'fur'], ['CITES_if_applicable', 'origin_declaration', 'anti_fur_check_UK_US'], 'USA: Fur Products Labeling Act. Sprawdź CITES dla gatunków chronionych. UE: import futer z niektórych krajów ograniczony.'),
  sub('lux011', 'luxury', 'Instrumenty muzyczne (skrzypce, gitary)', '9202.10.00', ['cites'], ['CITES_if_rosewood', 'authenticity_certificate'], 'Palisander (Dalbergia spp.): CITES Appendix II. Dotyczy podstrunnic gitar i skrzypiec.'),

  // ── Towary kontrolowane i obrona ────────────────────────────────────────────
  sub('def001', 'defence', 'Broń palna cywilna (pistolety, karabiny)', '9302.00.00', ['military', 'dangerous'], ['export_licence_MSZ', 'import_licence_country', 'end_user_certificate', 'ATT_compliance'], 'Traktat o Handlu Bronią (ATT). Licencja MSZ (Polska). Sprawdź embarga ONZ/UE/USA.'),
  sub('def002', 'defence', 'Amunicja', '9306.30.90', ['military', 'explosive', 'dangerous'], ['export_licence_MSZ', 'import_licence_country', 'end_user_certificate', 'ADR_class1'], 'ADR klasa 1 (materiały wybuchowe). Podwójne zezwolenie. Embarga ONZ.'),
  sub('def003', 'defence', 'Oprogramowanie szyfrujące', '8523.49.20', ['dual_use'], ['dual_use_licence_MRiT', 'EAR_if_US', 'end_user_certificate'], 'ECCN 5E002 (USA) / ML21 (UE). Licencja eksportowa wymagana do większości krajów.'),
  sub('def004', 'defence', 'Noktowizory i termowizory', '9013.20.00', ['dual_use', 'military'], ['dual_use_licence_MRiT', 'end_user_certificate', 'military_export_licence'], 'Dual-Use kategoria 6. Eksport do krajów objętych embargiem zakazany.'),
  sub('def005', 'defence', 'Chemikalia bojowe (zakazane)', '2929.90.00', ['dual_use', 'military', 'dangerous', 'toxic'], ['CWC_compliance_check'], 'Konwencja o Zakazie Broni Chemicznej (CWC), eksport w celach wojskowych ZAKAZANY globalnie.'),
]

// ── Helpery ────────────────────────────────────────────────────────────────────

export function getCategory(categoryId) {
  return CARGO_CATEGORIES.find((c) => c.id === categoryId) || null
}

// Lista do wyboru w UI — alfabetycznie wg nazwy (kolacja polska: ą po a, ł po l itd.).
// W CARGO_SUBCATEGORIES kolejność jest tematyczna (owoce → warzywa → zboża…), bo tak
// czyta się źródło; sortowanie robimy tutaj, żeby nie rozjechały się id-ki.
export function getSubcategories(categoryId) {
  return CARGO_SUBCATEGORIES
    .filter((s) => s.categoryId === categoryId)
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
}

export function getSubcategory(subcategoryId) {
  return CARGO_SUBCATEGORIES.find((s) => s.id === subcategoryId) || null
}

// Etykieta do podsumowań i historii: „Elektronika — Smartfony”.
export function cargoLabel(categoryId, subcategoryId) {
  const cat = getCategory(categoryId)
  if (!cat) return ''
  const s = getSubcategory(subcategoryId)
  return s && s.categoryId === categoryId ? `${cat.name}: ${s.name}` : cat.name
}

// Kategoria dla utils/documentEngine.js. Podkategoria może podnieść kategorię do
// „dangerous_goods”, jeśli niesie flagę ADR (np. wódka w kategorii „Napoje”).
export function engineCategoryFor(categoryId, subcategoryId) {
  const cat = getCategory(categoryId)
  if (!cat) return 'general'
  const s = getSubcategory(subcategoryId)
  if (s && s.categoryId === categoryId && s.flags.some((f) => DG_FLAGS.includes(f))) {
    return 'dangerous_goods'
  }
  return cat.engine
}
