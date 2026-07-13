// src/data/templateCatalog.js
// Katalog PUSTYCH szablonów JSX gotowych do podglądu/pobrania jako PDF —
// wyłącznie dokumenty przerobione na komponenty React w src/generators/templates/
// (NIE mylić z src/data/documentCatalog.js, który wskazuje gotowe pliki PDF
// wklejone jako wzorce w public/templates/). Aktualizowany ręcznie w miarę
// konwersji kolejnych dokumentów (patrz docs/konwersja_status.md).

import { CmrTemplate } from '../generators/templates/eu/land/CmrTemplate'
import { ZlecenieTemplate } from '../generators/templates/eu/land/ZlecenieTemplate'
import { PODTemplate } from '../generators/templates/eu/land/PODTemplate'
import { PackingListTemplate } from '../generators/templates/eu/common/PackingListTemplate'
import { FakturaHandlowaTemplate } from '../generators/templates/eu/common/FakturaHandlowaTemplate'
import { FakturaProformaTemplate } from '../generators/templates/eu/common/FakturaProformaTemplate'
import { MultimodalTemplate } from '../generators/templates/eu/common/MultimodalTemplate'
import { BillOfLadingTemplate } from '../generators/templates/eu/sea/BillOfLadingTemplate'
import { SeaWaybillTemplate } from '../generators/templates/eu/sea/SeaWaybillTemplate'

import { CertificateOfOriginTemplate } from '../generators/templates/global/cargo/CertificateOfOriginTemplate'
import { EadSadExportTemplate } from '../generators/templates/global/export/EadSadExportTemplate'
import { Isf10Plus2Template } from '../generators/templates/global/import/Isf10Plus2Template'
import { AwbTemplate } from '../generators/templates/global/special/AwbTemplate'
import { Eur1Template } from '../generators/templates/global/special/Eur1Template'
import { AtaCarnetTemplate } from '../generators/templates/global/special/AtaCarnetTemplate'
import { AdrDeclarationTemplate } from '../generators/templates/global/cargo/AdrDeclarationTemplate'
import { ImdgDeclarationTemplate } from '../generators/templates/global/cargo/ImdgDeclarationTemplate'
import { PhytosanitaryCertificateTemplate } from '../generators/templates/global/cargo/PhytosanitaryCertificateTemplate'
import { VeterinaryCertificateTemplate } from '../generators/templates/global/cargo/VeterinaryCertificateTemplate'
import { HalalCertificateTemplate } from '../generators/templates/global/cargo/HalalCertificateTemplate'
import { Ispm15CertificateTemplate } from '../generators/templates/global/cargo/Ispm15CertificateTemplate'
import { Cbp7501Template } from '../generators/templates/global/import/Cbp7501Template'
import { UkC88ImportTemplate } from '../generators/templates/global/import/UkC88ImportTemplate'
import { BillOfEntryIndiaTemplate } from '../generators/templates/global/import/BillOfEntryIndiaTemplate'
import { ChinaExportDeclarationTemplate } from '../generators/templates/global/export/ChinaExportDeclarationTemplate'
import { DualUseLicenceTemplate } from '../generators/templates/global/special/DualUseLicenceTemplate'
import { CimRailWaybillTemplate } from '../generators/templates/global/special/CimRailWaybillTemplate'

// grupa: ue | celne_export | celne_import | transport | swiadectwo | towary_niebezp | finansowe | inne
export const GROUP_LABELS = {
  ue: 'UE',
  celne_export: 'Celne — eksport',
  celne_import: 'Celne — import',
  transport: 'Transport',
  swiadectwo: 'Świadectwo',
  towary_niebezp: 'Towary niebezpieczne',
  finansowe: 'Finansowe',
  inne: 'Inne',
}

// Synonimy dopisywane do wyszukiwania automatycznie na podstawie grupy dokumentu.
const GROUP_TAGS = {
  ue: ['ue', 'unia europejska', 'unia', 'eu', 'europejska'],
  celne_export: ['export', 'eksport', 'clo', 'celne', 'customs'],
  celne_import: ['import', 'clo', 'celne', 'customs'],
  transport: ['transport'],
  swiadectwo: ['swiadectwo', 'certyfikat', 'certificate'],
  towary_niebezp: ['niebezpieczne', 'dangerous', 'hazmat'],
  finansowe: ['finanse', 'finansowe', 'bank'],
  inne: [],
}

// tags: dodatkowe słowa kluczowe (kraje, skróty) niewynikające z nazwy/grupy
export const TEMPLATE_CATALOG = [
  { key: 'cmr', name: 'CMR — List Przewozowy', grupa: 'ue', filename: 'CMR_pusty.pdf', template: CmrTemplate, tags: [] },
  { key: 'bol', name: 'Bill of Lading', grupa: 'ue', filename: 'Bill_of_Lading_pusty.pdf', template: BillOfLadingTemplate, tags: ['morski', 'sea'] },
  { key: 'packing', name: 'Packing List', grupa: 'ue', filename: 'Packing_List_pusty.pdf', template: PackingListTemplate, tags: [] },
  { key: 'faktura', name: 'Faktura Handlowa', grupa: 'ue', filename: 'Faktura_Handlowa_pusty.pdf', template: FakturaHandlowaTemplate, tags: ['invoice'] },
  { key: 'proforma', name: 'Faktura Proforma', grupa: 'ue', filename: 'Faktura_Proforma_pusty.pdf', template: FakturaProformaTemplate, tags: ['invoice'] },
  { key: 'zlecenie', name: 'Zlecenie Transportowe', grupa: 'ue', filename: 'Zlecenie_Transportowe_pusty.pdf', template: ZlecenieTemplate, tags: ['drogowy', 'road'] },
  { key: 'pod', name: 'Protokół Odbioru (POD)', grupa: 'ue', filename: 'POD_pusty.pdf', template: PODTemplate, tags: ['drogowy', 'road'] },
  { key: 'seawaybill', name: 'Sea Waybill', grupa: 'ue', filename: 'Sea_Waybill_pusty.pdf', template: SeaWaybillTemplate, tags: ['morski', 'sea'] },
  { key: 'multimodal', name: 'Multimodal Transport Document', grupa: 'ue', filename: 'Multimodal_pusty.pdf', template: MultimodalTemplate, tags: [] },

  { key: 'coo', name: 'Certificate of Origin — Świadectwo Pochodzenia', grupa: 'swiadectwo', filename: 'Certificate_of_Origin_pusty.pdf', template: CertificateOfOriginTemplate, tags: ['pochodzenie', 'origin'] },
  { key: 'ead_sad', name: 'Deklaracja Eksportowa UE (EAD/SAD)', grupa: 'celne_export', filename: 'EAD_SAD_pusty.pdf', template: EadSadExportTemplate, tags: ['ue', 'aes'] },
  { key: 'isf', name: 'ISF 10+2 — USA (Importer Security Filing)', grupa: 'celne_import', filename: 'ISF_10plus2_pusty.pdf', template: Isf10Plus2Template, tags: ['usa', 'stany zjednoczone', 'ameryka', 'cbp'] },
  { key: 'awb', name: 'AWB — Lotniczy List Przewozowy', grupa: 'transport', filename: 'AWB_pusty.pdf', template: AwbTemplate, tags: ['lotniczy', 'air'] },
  { key: 'eur1', name: 'EUR.1 — Świadectwo Przewozowe', grupa: 'swiadectwo', filename: 'EUR1_pusty.pdf', template: Eur1Template, tags: ['ue', 'pochodzenie'] },
  { key: 'ata', name: 'Karnet ATA', grupa: 'inne', filename: 'Karnet_ATA_pusty.pdf', template: AtaCarnetTemplate, tags: ['tymczasowy wywoz'] },
  { key: 'adr', name: 'Deklaracja ADR — Towary Niebezpieczne (Drogowa)', grupa: 'towary_niebezp', filename: 'ADR_pusty.pdf', template: AdrDeclarationTemplate, tags: ['drogowy', 'road'] },
  { key: 'imdg', name: 'IMDG — Towary Niebezpieczne (Morska)', grupa: 'towary_niebezp', filename: 'IMDG_pusty.pdf', template: ImdgDeclarationTemplate, tags: ['morski', 'sea'] },
  { key: 'phyto', name: 'Świadectwo Fitosanitarne', grupa: 'swiadectwo', filename: 'Fitosanitarne_pusty.pdf', template: PhytosanitaryCertificateTemplate, tags: ['rosliny', 'phytosanitary'] },
  { key: 'vet', name: 'Świadectwo Weterynaryjne', grupa: 'swiadectwo', filename: 'Weterynaryjne_pusty.pdf', template: VeterinaryCertificateTemplate, tags: ['zwierzeta', 'veterinary'] },
  { key: 'halal', name: 'Certyfikat Halal', grupa: 'swiadectwo', filename: 'Halal_pusty.pdf', template: HalalCertificateTemplate, tags: [] },
  { key: 'ispm15', name: 'ISPM 15 — Certyfikat Opakowań Drewnianych', grupa: 'swiadectwo', filename: 'ISPM15_pusty.pdf', template: Ispm15CertificateTemplate, tags: ['drewno', 'palety', 'wood'] },
  { key: 'cbp7501', name: 'CBP 7501 — USA Import Entry', grupa: 'celne_import', filename: 'CBP7501_pusty.pdf', template: Cbp7501Template, tags: ['usa', 'stany zjednoczone', 'ameryka'] },
  { key: 'ukc88', name: 'UK Import Declaration (C88)', grupa: 'celne_import', filename: 'UK_C88_pusty.pdf', template: UkC88ImportTemplate, tags: ['uk', 'wielka brytania', 'brytania', 'anglia'] },
  { key: 'boe_india', name: 'Bill of Entry — Indie', grupa: 'celne_import', filename: 'Bill_of_Entry_India_pusty.pdf', template: BillOfEntryIndiaTemplate, tags: ['india', 'indie'] },
  { key: 'china_export', name: 'Chińska Deklaracja Eksportowa', grupa: 'celne_export', filename: 'China_Export_pusty.pdf', template: ChinaExportDeclarationTemplate, tags: ['china', 'chiny'] },
  { key: 'dualuse', name: 'Licencja Eksportowa Dual-Use', grupa: 'inne', filename: 'Dual_Use_pusty.pdf', template: DualUseLicenceTemplate, tags: ['ue', 'eksport'] },
  { key: 'cim', name: 'CIM — Kolejowy List Przewozowy', grupa: 'transport', filename: 'CIM_pusty.pdf', template: CimRailWaybillTemplate, tags: ['kolejowy', 'rail'] },
]

// Usuwa znaki diakrytyczne (np. ą→a, ę→e) rozkładając na NFD i odfiltrowując
// combining marks (zakres kodowy 0x0300-0x036F) — bez literałów diakrytycznych w kodzie.
function normalize(s) {
  return Array.from(s.normalize('NFD'))
    .filter(ch => {
      const code = ch.codePointAt(0)
      return code < 0x0300 || code > 0x036f
    })
    .join('')
    .toLowerCase()
}

// Prosty mechanizm: dopasowanie substring po nazwie + tagach grupy + tagach własnych.
// Puste zapytanie = cały katalog (przeglądanie), niepuste = filtrowanie.
export function searchTemplates(query) {
  const q = normalize(query.trim())
  if (!q) return TEMPLATE_CATALOG
  return TEMPLATE_CATALOG.filter(doc => {
    const haystack = normalize([doc.name, ...(GROUP_TAGS[doc.grupa] || []), ...doc.tags].join(' '))
    return haystack.includes(q)
  })
}
