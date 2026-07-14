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

import { CitesPermitTemplate } from '../generators/templates/global/cargo/CitesPermitTemplate'
import { VietnamImportDeclarationTemplate } from '../generators/templates/global/import/VietnamImportDeclarationTemplate'
import { ThailandImportDeclarationTemplate } from '../generators/templates/global/import/ThailandImportDeclarationTemplate'
import { LetterOfCreditTemplate } from '../generators/templates/global/special/LetterOfCreditTemplate'
import { BankGuaranteeTemplate } from '../generators/templates/global/special/BankGuaranteeTemplate'
import { InsuranceCertificateTemplate } from '../generators/templates/global/special/InsuranceCertificateTemplate'
import { IataDgrAirDeclarationTemplate } from '../generators/templates/global/cargo/IataDgrAirDeclarationTemplate'
import { FumigationCertificateTemplate } from '../generators/templates/global/cargo/FumigationCertificateTemplate'
import { WeightCertificateTemplate } from '../generators/templates/global/cargo/WeightCertificateTemplate'
import { QualityInspectionCertificateTemplate } from '../generators/templates/global/cargo/QualityInspectionCertificateTemplate'
import { PsiPreShipmentInspectionTemplate } from '../generators/templates/global/special/PsiPreShipmentInspectionTemplate'
import { MsdsSafetyDataSheetTemplate } from '../generators/templates/global/cargo/MsdsSafetyDataSheetTemplate'
import { BlacklistCertificateTemplate } from '../generators/templates/global/special/BlacklistCertificateTemplate'
import { FreeSaleCertificateTemplate } from '../generators/templates/global/cargo/FreeSaleCertificateTemplate'
import { ArgentinaImportSiraTemplate } from '../generators/templates/global/import/ArgentinaImportSiraTemplate'
import { ChileImportDinTemplate } from '../generators/templates/global/import/ChileImportDinTemplate'
import { ColombiaImportDianTemplate } from '../generators/templates/global/import/ColombiaImportDianTemplate'
import { PeruImportDuaTemplate } from '../generators/templates/global/import/PeruImportDuaTemplate'
import { EcuadorImportDaiTemplate } from '../generators/templates/global/import/EcuadorImportDaiTemplate'
import { PakistanImportWebocTemplate } from '../generators/templates/global/import/PakistanImportWebocTemplate'
import { BangladeshImportBillOfEntryTemplate } from '../generators/templates/global/import/BangladeshImportBillOfEntryTemplate'
import { SriLankaImportBillOfEntryTemplate } from '../generators/templates/global/import/SriLankaImportBillOfEntryTemplate'
import { PhilippinesImportBocTemplate } from '../generators/templates/global/import/PhilippinesImportBocTemplate'
import { MyanmarImportDeclarationTemplate } from '../generators/templates/global/import/MyanmarImportDeclarationTemplate'
import { CambodiaImportDeclarationTemplate } from '../generators/templates/global/import/CambodiaImportDeclarationTemplate'
import { MoroccoImportDumTemplate } from '../generators/templates/global/import/MoroccoImportDumTemplate'
import { AlgeriaImportDedTemplate } from '../generators/templates/global/import/AlgeriaImportDedTemplate'
import { TunisiaImportDdTemplate } from '../generators/templates/global/import/TunisiaImportDdTemplate'
import { GhanaImportIcumsTemplate } from '../generators/templates/global/import/GhanaImportIcumsTemplate'
import { SenegalImportDeclarationTemplate } from '../generators/templates/global/import/SenegalImportDeclarationTemplate'
import { TanzaniaImportTraTemplate } from '../generators/templates/global/import/TanzaniaImportTraTemplate'
import { EthiopiaImportErcaTemplate } from '../generators/templates/global/import/EthiopiaImportErcaTemplate'
import { JordanImportCustomsTemplate } from '../generators/templates/global/import/JordanImportCustomsTemplate'
import { IsraelImportDeclarationTemplate } from '../generators/templates/global/import/IsraelImportDeclarationTemplate'
import { IraqImportCustomsTemplate } from '../generators/templates/global/import/IraqImportCustomsTemplate'
import { LebanonImportCustomsTemplate } from '../generators/templates/global/import/LebanonImportCustomsTemplate'
import { KazakhstanImportCustomsTemplate } from '../generators/templates/global/import/KazakhstanImportCustomsTemplate'
import { UzbekistanImportCustomsTemplate } from '../generators/templates/global/import/UzbekistanImportCustomsTemplate'
import { GeorgiaImportCustomsTemplate } from '../generators/templates/global/import/GeorgiaImportCustomsTemplate'
import { ArgentinaExportDeclarationTemplate } from '../generators/templates/global/export/ArgentinaExportDeclarationTemplate'
import { ChileExportDeclarationTemplate } from '../generators/templates/global/export/ChileExportDeclarationTemplate'
import { PakistanExportDeclarationTemplate } from '../generators/templates/global/export/PakistanExportDeclarationTemplate'
import { PhilippinesExportDeclarationTemplate } from '../generators/templates/global/export/PhilippinesExportDeclarationTemplate'
import { CitesImportPermitTemplate } from '../generators/templates/global/cargo/CitesImportPermitTemplate'
import { EurMedCertificateTemplate } from '../generators/templates/global/special/EurMedCertificateTemplate'
import { FormAGspCertificateTemplate } from '../generators/templates/global/special/FormAGspCertificateTemplate'
import { T2LUnionStatusTemplate } from '../generators/templates/global/special/T2LUnionStatusTemplate'
import { FdaPriorNoticeTemplate } from '../generators/templates/global/cargo/FdaPriorNoticeTemplate'
import { CeDeclarationOfConformityTemplate } from '../generators/templates/global/cargo/CeDeclarationOfConformityTemplate'
import { RadiationCertificateTemplate } from '../generators/templates/global/cargo/RadiationCertificateTemplate'
import { PhytosanitaryImportPermitTemplate } from '../generators/templates/global/cargo/PhytosanitaryImportPermitTemplate'
import { IataDgPackingCertificateTemplate } from '../generators/templates/global/cargo/IataDgPackingCertificateTemplate'
import { NonGmoCertificateTemplate } from '../generators/templates/global/cargo/NonGmoCertificateTemplate'
import { OrganicCertificateTemplate } from '../generators/templates/global/cargo/OrganicCertificateTemplate'
import { KosherCertificateTemplate } from '../generators/templates/global/cargo/KosherCertificateTemplate'
import { EndUserCertificateMilitaryTemplate } from '../generators/templates/global/special/EndUserCertificateMilitaryTemplate'
import { ReExportCertificateTemplate } from '../generators/templates/global/special/ReExportCertificateTemplate'
import { TranshipmentDeclarationTemplate } from '../generators/templates/global/special/TranshipmentDeclarationTemplate'
import { TransitDeclarationT1T2Template } from '../generators/templates/global/special/TransitDeclarationT1T2Template'
import { TirCarnetTemplate } from '../generators/templates/global/special/TirCarnetTemplate'
import { DgRoadManifestAdrTemplate } from '../generators/templates/global/cargo/DgRoadManifestAdrTemplate'

import { DangerousGoodsManifestTemplate } from '../generators/templates/global/cargo/DangerousGoodsManifestTemplate'
import { UsaAesExportTemplate } from '../generators/templates/global/export/UsaAesExportTemplate'
import { UkExportDeclarationTemplate } from '../generators/templates/global/export/UkExportDeclarationTemplate'
import { AustraliaExportDeclarationTemplate } from '../generators/templates/global/export/AustraliaExportDeclarationTemplate'
import { CanadaB13aExportTemplate } from '../generators/templates/global/export/CanadaB13aExportTemplate'
import { JapanExportDeclarationTemplate } from '../generators/templates/global/export/JapanExportDeclarationTemplate'
import { KoreaExportDeclarationTemplate } from '../generators/templates/global/export/KoreaExportDeclarationTemplate'
import { BrazilSiscomexExportTemplate } from '../generators/templates/global/export/BrazilSiscomexExportTemplate'
import { IndiaShippingBillTemplate } from '../generators/templates/global/export/IndiaShippingBillTemplate'
import { UaeExportDeclarationTemplate } from '../generators/templates/global/export/UaeExportDeclarationTemplate'
import { SaudiArabiaExportTemplate } from '../generators/templates/global/export/SaudiArabiaExportTemplate'
import { TurkeyExportDeclarationTemplate } from '../generators/templates/global/export/TurkeyExportDeclarationTemplate'
import { SouthAfricaExportDa550Template } from '../generators/templates/global/export/SouthAfricaExportDa550Template'
import { AustraliaImportN10Template } from '../generators/templates/global/import/AustraliaImportN10Template'
import { NewZealandImportEntryTemplate } from '../generators/templates/global/import/NewZealandImportEntryTemplate'
import { CanadaCbsaB3ImportTemplate } from '../generators/templates/global/import/CanadaCbsaB3ImportTemplate'
import { JapanImportDeclarationTemplate } from '../generators/templates/global/import/JapanImportDeclarationTemplate'
import { KoreaImportDeclarationTemplate } from '../generators/templates/global/import/KoreaImportDeclarationTemplate'
import { BrazilDiSiscomexImportTemplate } from '../generators/templates/global/import/BrazilDiSiscomexImportTemplate'
import { MexicoPedimentoAduanalTemplate } from '../generators/templates/global/import/MexicoPedimentoAduanalTemplate'
import { UaeImportDeclarationTemplate } from '../generators/templates/global/import/UaeImportDeclarationTemplate'
import { SaudiArabiaImportTemplate } from '../generators/templates/global/import/SaudiArabiaImportTemplate'
import { TurkeyImportDeclarationTemplate } from '../generators/templates/global/import/TurkeyImportDeclarationTemplate'
import { SouthAfricaSad500ImportTemplate } from '../generators/templates/global/import/SouthAfricaSad500ImportTemplate'
import { NigeriaFormMTemplate } from '../generators/templates/global/import/NigeriaFormMTemplate'
import { KenyaCustomsEntryTemplate } from '../generators/templates/global/import/KenyaCustomsEntryTemplate'
import { EgyptImportDeclarationTemplate } from '../generators/templates/global/import/EgyptImportDeclarationTemplate'
import { SingaporeImportTradeNetTemplate } from '../generators/templates/global/import/SingaporeImportTradeNetTemplate'
import { MalaysiaK1ImportTemplate } from '../generators/templates/global/import/MalaysiaK1ImportTemplate'
import { IndonesiaPibImportTemplate } from '../generators/templates/global/import/IndonesiaPibImportTemplate'

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

  { key: 'cites_permit', name: 'Zezwolenie CITES (Eksport/Import/Reeksport)', grupa: 'swiadectwo', filename: 'CITES_Zezwolenie_pusty.pdf', template: CitesPermitTemplate, tags: ['cites', 'zwierzeta', 'rosliny'] },
  { key: 'vietnam_import', name: 'Deklaracja Importowa Wietnam', grupa: 'celne_import', filename: 'Vietnam_Import_pusty.pdf', template: VietnamImportDeclarationTemplate, tags: ['vietnam', 'wietnam'] },
  { key: 'thailand_import', name: 'Deklaracja Importowa Tajlandia', grupa: 'celne_import', filename: 'Thailand_Import_pusty.pdf', template: ThailandImportDeclarationTemplate, tags: ['thailand', 'tajlandia'] },
  { key: 'lc', name: 'Letter of Credit (L/C)', grupa: 'finansowe', filename: 'Letter_of_Credit_pusty.pdf', template: LetterOfCreditTemplate, tags: ['akredytywa', 'bank'] },
  { key: 'bank_guarantee', name: 'Gwarancja Bankowa', grupa: 'finansowe', filename: 'Bank_Guarantee_pusty.pdf', template: BankGuaranteeTemplate, tags: ['bank', 'gwarancja'] },
  { key: 'insurance_cert', name: 'Certyfikat Ubezpieczenia Cargo', grupa: 'finansowe', filename: 'Insurance_Certificate_pusty.pdf', template: InsuranceCertificateTemplate, tags: ['ubezpieczenie', 'insurance'] },
  { key: 'iata_dgr_air', name: 'IATA DGR — Towary Niebezpieczne (Lotnicza)', grupa: 'towary_niebezp', filename: 'IATA_DGR_pusty.pdf', template: IataDgrAirDeclarationTemplate, tags: ['lotniczy', 'air'] },
  { key: 'fumigation', name: 'Certyfikat Fumigacji', grupa: 'swiadectwo', filename: 'Fumigation_pusty.pdf', template: FumigationCertificateTemplate, tags: ['fumigacja'] },
  { key: 'weight_cert', name: 'Weight Certificate — Świadectwo Wagi', grupa: 'swiadectwo', filename: 'Weight_Certificate_pusty.pdf', template: WeightCertificateTemplate, tags: ['waga'] },
  { key: 'quality_inspection', name: 'Quality Inspection Certificate', grupa: 'swiadectwo', filename: 'Quality_Inspection_pusty.pdf', template: QualityInspectionCertificateTemplate, tags: ['jakosc', 'inspekcja'] },
  { key: 'psi', name: 'PSI — Inspekcja Przedwysyłkowa', grupa: 'swiadectwo', filename: 'PSI_pusty.pdf', template: PsiPreShipmentInspectionTemplate, tags: ['inspekcja', 'przedwysylkowa'] },
  { key: 'msds', name: 'MSDS — Karta Charakterystyki', grupa: 'towary_niebezp', filename: 'MSDS_pusty.pdf', template: MsdsSafetyDataSheetTemplate, tags: ['chemikalia', 'ghs'] },
  { key: 'blacklist', name: 'Blacklist Certificate', grupa: 'swiadectwo', filename: 'Blacklist_pusty.pdf', template: BlacklistCertificateTemplate, tags: ['izrael', 'bojkot'] },
  { key: 'free_sale', name: 'Free Sale Certificate — Leki', grupa: 'swiadectwo', filename: 'Free_Sale_pusty.pdf', template: FreeSaleCertificateTemplate, tags: ['leki', 'farmaceutyki'] },
  { key: 'argentina_import', name: 'SIRA — Deklaracja Importowa Argentyna', grupa: 'celne_import', filename: 'Argentina_Import_SIRA_pusty.pdf', template: ArgentinaImportSiraTemplate, tags: ['argentyna', 'argentina'] },
  { key: 'chile_import', name: 'DIN — Deklaracja Importowa Chile', grupa: 'celne_import', filename: 'Chile_Import_DIN_pusty.pdf', template: ChileImportDinTemplate, tags: ['chile'] },
  { key: 'colombia_import', name: 'DIAN — Deklaracja Importowa Kolumbia', grupa: 'celne_import', filename: 'Colombia_Import_DIAN_pusty.pdf', template: ColombiaImportDianTemplate, tags: ['kolumbia', 'colombia'] },
  { key: 'peru_import', name: 'DUA (SUNAT) — Deklaracja Importowa Peru', grupa: 'celne_import', filename: 'Peru_Import_DUA_pusty.pdf', template: PeruImportDuaTemplate, tags: ['peru'] },
  { key: 'ecuador_import', name: 'DAI (SENAE) — Deklaracja Importowa Ekwador', grupa: 'celne_import', filename: 'Ecuador_Import_DAI_pusty.pdf', template: EcuadorImportDaiTemplate, tags: ['ekwador', 'ecuador'] },
  { key: 'pakistan_import', name: 'WeBOC — Deklaracja Importowa Pakistan', grupa: 'celne_import', filename: 'Pakistan_Import_WeBOC_pusty.pdf', template: PakistanImportWebocTemplate, tags: ['pakistan'] },
  { key: 'bangladesh_import', name: 'Bill of Entry — Bangladesz', grupa: 'celne_import', filename: 'Bangladesh_BillOfEntry_pusty.pdf', template: BangladeshImportBillOfEntryTemplate, tags: ['bangladesz', 'bangladesh'] },
  { key: 'srilanka_import', name: 'Bill of Entry — Sri Lanka', grupa: 'celne_import', filename: 'SriLanka_BillOfEntry_pusty.pdf', template: SriLankaImportBillOfEntryTemplate, tags: ['sri lanka'] },
  { key: 'philippines_import', name: 'BOC — Deklaracja Importowa Filipiny', grupa: 'celne_import', filename: 'Philippines_Import_BOC_pusty.pdf', template: PhilippinesImportBocTemplate, tags: ['filipiny', 'philippines'] },
  { key: 'myanmar_import', name: 'Deklaracja Importowa Mjanma', grupa: 'celne_import', filename: 'Myanmar_Import_pusty.pdf', template: MyanmarImportDeclarationTemplate, tags: ['mjanma', 'myanmar', 'birma'] },
  { key: 'cambodia_import', name: 'Deklaracja Importowa Kambodża', grupa: 'celne_import', filename: 'Cambodia_Import_pusty.pdf', template: CambodiaImportDeclarationTemplate, tags: ['kambodza', 'cambodia'] },
  { key: 'morocco_import', name: 'DUM — Deklaracja Importowa Maroko', grupa: 'celne_import', filename: 'Morocco_Import_DUM_pusty.pdf', template: MoroccoImportDumTemplate, tags: ['maroko', 'morocco'] },
  { key: 'algeria_import', name: 'DED — Deklaracja Importowa Algieria', grupa: 'celne_import', filename: 'Algeria_Import_DED_pusty.pdf', template: AlgeriaImportDedTemplate, tags: ['algieria', 'algeria'] },
  { key: 'tunisia_import', name: 'Deklaracja Importowa Tunezja', grupa: 'celne_import', filename: 'Tunisia_Import_pusty.pdf', template: TunisiaImportDdTemplate, tags: ['tunezja', 'tunisia'] },
  { key: 'ghana_import', name: 'ICUMS — Deklaracja Importowa Ghana', grupa: 'celne_import', filename: 'Ghana_Import_ICUMS_pusty.pdf', template: GhanaImportIcumsTemplate, tags: ['ghana'] },
  { key: 'senegal_import', name: 'Deklaracja Importowa Senegal', grupa: 'celne_import', filename: 'Senegal_Import_pusty.pdf', template: SenegalImportDeclarationTemplate, tags: ['senegal'] },
  { key: 'tanzania_import', name: 'TRA — Deklaracja Importowa Tanzania', grupa: 'celne_import', filename: 'Tanzania_Import_TRA_pusty.pdf', template: TanzaniaImportTraTemplate, tags: ['tanzania'] },
  { key: 'ethiopia_import', name: 'ERCA — Deklaracja Importowa Etiopia', grupa: 'celne_import', filename: 'Ethiopia_Import_ERCA_pusty.pdf', template: EthiopiaImportErcaTemplate, tags: ['etiopia', 'ethiopia'] },
  { key: 'jordan_import', name: 'Zgłoszenie Celne — Jordania', grupa: 'celne_import', filename: 'Jordan_Import_pusty.pdf', template: JordanImportCustomsTemplate, tags: ['jordania', 'jordan'] },
  { key: 'israel_import', name: 'Deklaracja Importowa Izrael', grupa: 'celne_import', filename: 'Israel_Import_pusty.pdf', template: IsraelImportDeclarationTemplate, tags: ['izrael', 'israel'] },
  { key: 'iraq_import', name: 'Zgłoszenie Celne — Irak', grupa: 'celne_import', filename: 'Iraq_Import_pusty.pdf', template: IraqImportCustomsTemplate, tags: ['irak', 'iraq'] },
  { key: 'lebanon_import', name: 'Zgłoszenie Celne — Liban', grupa: 'celne_import', filename: 'Lebanon_Import_pusty.pdf', template: LebanonImportCustomsTemplate, tags: ['liban', 'lebanon'] },
  { key: 'kazakhstan_import', name: 'Zgłoszenie Celne — Kazachstan', grupa: 'celne_import', filename: 'Kazakhstan_Import_pusty.pdf', template: KazakhstanImportCustomsTemplate, tags: ['kazachstan', 'kazakhstan'] },
  { key: 'uzbekistan_import', name: 'Zgłoszenie Celne — Uzbekistan', grupa: 'celne_import', filename: 'Uzbekistan_Import_pusty.pdf', template: UzbekistanImportCustomsTemplate, tags: ['uzbekistan'] },
  { key: 'georgia_import', name: 'Zgłoszenie Celne — Gruzja', grupa: 'celne_import', filename: 'Georgia_Import_pusty.pdf', template: GeorgiaImportCustomsTemplate, tags: ['gruzja', 'georgia'] },
  { key: 'argentina_export', name: 'Deklaracja Eksportowa Argentyna', grupa: 'celne_export', filename: 'Argentina_Export_pusty.pdf', template: ArgentinaExportDeclarationTemplate, tags: ['argentyna', 'argentina'] },
  { key: 'chile_export', name: 'Deklaracja Eksportowa Chile', grupa: 'celne_export', filename: 'Chile_Export_pusty.pdf', template: ChileExportDeclarationTemplate, tags: ['chile'] },
  { key: 'pakistan_export', name: 'Deklaracja Eksportowa Pakistan', grupa: 'celne_export', filename: 'Pakistan_Export_pusty.pdf', template: PakistanExportDeclarationTemplate, tags: ['pakistan'] },
  { key: 'philippines_export', name: 'Deklaracja Eksportowa Filipiny', grupa: 'celne_export', filename: 'Philippines_Export_pusty.pdf', template: PhilippinesExportDeclarationTemplate, tags: ['filipiny', 'philippines'] },
  { key: 'cites_import', name: 'CITES — Import Permit (Żywe Zwierzęta)', grupa: 'swiadectwo', filename: 'CITES_Import_Permit_pusty.pdf', template: CitesImportPermitTemplate, tags: ['cites', 'zwierzeta'] },
  { key: 'eurmed', name: 'EUR-MED — Świadectwo Pochodzenia', grupa: 'swiadectwo', filename: 'EUR_MED_pusty.pdf', template: EurMedCertificateTemplate, tags: ['pochodzenie', 'origin'] },
  { key: 'forma_gsp', name: 'Form A — GSP Certificate of Origin', grupa: 'swiadectwo', filename: 'Form_A_GSP_pusty.pdf', template: FormAGspCertificateTemplate, tags: ['gsp', 'pochodzenie'] },
  { key: 't2l', name: 'T2L — Dowód Unijnego Statusu Towaru', grupa: 'inne', filename: 'T2L_pusty.pdf', template: T2LUnionStatusTemplate, tags: ['ue', 'status unijny'] },
  { key: 'fda_prior_notice', name: 'FDA Prior Notice — Żywność (USA)', grupa: 'celne_import', filename: 'FDA_Prior_Notice_pusty.pdf', template: FdaPriorNoticeTemplate, tags: ['usa', 'zywnosc', 'food'] },
  { key: 'ce_doc', name: 'CE Declaration of Conformity', grupa: 'swiadectwo', filename: 'CE_Declaration_pusty.pdf', template: CeDeclarationOfConformityTemplate, tags: ['ce', 'zgodnosc'] },
  { key: 'radiation', name: 'Radiation Non-Contamination Certificate', grupa: 'swiadectwo', filename: 'Radiation_Certificate_pusty.pdf', template: RadiationCertificateTemplate, tags: ['radioaktywnosc', 'fukushima'] },
  { key: 'phyto_import_permit', name: 'Phytosanitary Import Permit', grupa: 'swiadectwo', filename: 'Phytosanitary_Import_Permit_pusty.pdf', template: PhytosanitaryImportPermitTemplate, tags: ['rosliny', 'phytosanitary'] },
  { key: 'iata_dg_packing', name: 'IATA DG Packing Certificate', grupa: 'towary_niebezp', filename: 'IATA_DG_Packing_pusty.pdf', template: IataDgPackingCertificateTemplate, tags: ['lotniczy', 'air'] },
  { key: 'nongmo', name: 'Non-GMO Certificate', grupa: 'swiadectwo', filename: 'NonGMO_pusty.pdf', template: NonGmoCertificateTemplate, tags: ['gmo'] },
  { key: 'organic', name: 'Organic Certificate', grupa: 'swiadectwo', filename: 'Organic_pusty.pdf', template: OrganicCertificateTemplate, tags: ['ekologiczny', 'bio'] },
  { key: 'kosher', name: 'Kosher Certificate', grupa: 'swiadectwo', filename: 'Kosher_pusty.pdf', template: KosherCertificateTemplate, tags: ['koszerne'] },
  { key: 'euc_military', name: 'End User Certificate (Military)', grupa: 'swiadectwo', filename: 'EUC_Military_pusty.pdf', template: EndUserCertificateMilitaryTemplate, tags: ['wojskowy', 'uzbrojenie'] },
  { key: 'reexport', name: 'Re-Export Certificate', grupa: 'inne', filename: 'Re_Export_pusty.pdf', template: ReExportCertificateTemplate, tags: ['reeksport'] },
  { key: 'transhipment', name: 'Transhipment Declaration', grupa: 'inne', filename: 'Transhipment_pusty.pdf', template: TranshipmentDeclarationTemplate, tags: ['przeladunek'] },
  { key: 'transit_t1t2', name: 'Transit Declaration T1/T2', grupa: 'inne', filename: 'Transit_T1_T2_pusty.pdf', template: TransitDeclarationT1T2Template, tags: ['tranzyt', 'ncts'] },
  { key: 'tir', name: 'Karnet TIR', grupa: 'inne', filename: 'TIR_Carnet_pusty.pdf', template: TirCarnetTemplate, tags: ['tir'] },
  { key: 'dg_road_manifest', name: 'ADR — Manifest Drogowy Towarów Niebezpiecznych', grupa: 'towary_niebezp', filename: 'DG_Road_Manifest_pusty.pdf', template: DgRoadManifestAdrTemplate, tags: ['adr', 'drogowy'] },

  { key: 'dg_manifest', name: 'Dangerous Goods Manifest', grupa: 'towary_niebezp', filename: 'DG_Manifest_pusty.pdf', template: DangerousGoodsManifestTemplate, tags: ['morski', 'sea'] },
  { key: 'usa_aes', name: 'AES Filing (EEI) — USA', grupa: 'celne_export', filename: 'USA_AES_pusty.pdf', template: UsaAesExportTemplate, tags: ['usa', 'stany zjednoczone', 'ameryka'] },
  { key: 'uk_export', name: 'UK Export Declaration (NES)', grupa: 'celne_export', filename: 'UK_Export_pusty.pdf', template: UkExportDeclarationTemplate, tags: ['uk', 'wielka brytania', 'brytania', 'anglia'] },
  { key: 'australia_export', name: 'Export Declaration N30 — Australia', grupa: 'celne_export', filename: 'Australia_Export_pusty.pdf', template: AustraliaExportDeclarationTemplate, tags: ['australia'] },
  { key: 'canada_export', name: 'B13A — Deklaracja Eksportowa Kanada', grupa: 'celne_export', filename: 'Canada_Export_B13A_pusty.pdf', template: CanadaB13aExportTemplate, tags: ['kanada', 'canada'] },
  { key: 'japan_export', name: 'Japońska Deklaracja Eksportowa', grupa: 'celne_export', filename: 'Japan_Export_pusty.pdf', template: JapanExportDeclarationTemplate, tags: ['japonia', 'japan'] },
  { key: 'korea_export', name: 'Koreańska Deklaracja Eksportowa', grupa: 'celne_export', filename: 'Korea_Export_pusty.pdf', template: KoreaExportDeclarationTemplate, tags: ['korea'] },
  { key: 'brazil_export', name: 'Registro de Exportação — Brazylia', grupa: 'celne_export', filename: 'Brazil_Export_pusty.pdf', template: BrazilSiscomexExportTemplate, tags: ['brazylia', 'brazil'] },
  { key: 'india_shipping_bill', name: 'Shipping Bill — Indie', grupa: 'celne_export', filename: 'India_Shipping_Bill_pusty.pdf', template: IndiaShippingBillTemplate, tags: ['indie', 'india'] },
  { key: 'uae_export', name: 'Deklaracja Eksportowa ZEA', grupa: 'celne_export', filename: 'UAE_Export_pusty.pdf', template: UaeExportDeclarationTemplate, tags: ['zea', 'uae', 'emiraty'] },
  { key: 'saudi_export', name: 'Deklaracja Eksportowa Arabia Saudyjska', grupa: 'celne_export', filename: 'Saudi_Export_pusty.pdf', template: SaudiArabiaExportTemplate, tags: ['arabia saudyjska', 'saudi'] },
  { key: 'turkey_export', name: 'Deklaracja Eksportowa Turcja', grupa: 'celne_export', filename: 'Turkey_Export_pusty.pdf', template: TurkeyExportDeclarationTemplate, tags: ['turcja', 'turkey'] },
  { key: 'southafrica_export', name: 'Deklaracja Eksportowa RPA (DA 550)', grupa: 'celne_export', filename: 'SouthAfrica_Export_DA550_pusty.pdf', template: SouthAfricaExportDa550Template, tags: ['rpa', 'poludniowa afryka', 'south africa'] },
  { key: 'australia_import', name: 'Deklaracja Importowa Australia (N10)', grupa: 'celne_import', filename: 'Australia_Import_N10_pusty.pdf', template: AustraliaImportN10Template, tags: ['australia'] },
  { key: 'newzealand_import', name: 'Deklaracja Importowa Nowa Zelandia', grupa: 'celne_import', filename: 'NewZealand_Import_pusty.pdf', template: NewZealandImportEntryTemplate, tags: ['nowa zelandia', 'new zealand'] },
  { key: 'canada_import', name: 'B3 — Deklaracja Importowa Kanada', grupa: 'celne_import', filename: 'Canada_Import_B3_pusty.pdf', template: CanadaCbsaB3ImportTemplate, tags: ['kanada', 'canada'] },
  { key: 'japan_import', name: 'Deklaracja Importowa Japonia', grupa: 'celne_import', filename: 'Japan_Import_pusty.pdf', template: JapanImportDeclarationTemplate, tags: ['japonia', 'japan'] },
  { key: 'korea_import', name: 'Deklaracja Importowa Korea', grupa: 'celne_import', filename: 'Korea_Import_pusty.pdf', template: KoreaImportDeclarationTemplate, tags: ['korea'] },
  { key: 'brazil_import', name: 'DI — Declaração de Importação Brazylia', grupa: 'celne_import', filename: 'Brazil_Import_pusty.pdf', template: BrazilDiSiscomexImportTemplate, tags: ['brazylia', 'brazil'] },
  { key: 'mexico_import', name: 'Pedimento Aduanal — Meksyk', grupa: 'celne_import', filename: 'Mexico_Import_pusty.pdf', template: MexicoPedimentoAduanalTemplate, tags: ['meksyk', 'mexico'] },
  { key: 'uae_import', name: 'Deklaracja Importowa ZEA', grupa: 'celne_import', filename: 'UAE_Import_pusty.pdf', template: UaeImportDeclarationTemplate, tags: ['zea', 'uae', 'emiraty'] },
  { key: 'saudi_import', name: 'Deklaracja Importowa Arabia Saudyjska', grupa: 'celne_import', filename: 'Saudi_Import_pusty.pdf', template: SaudiArabiaImportTemplate, tags: ['arabia saudyjska', 'saudi'] },
  { key: 'turkey_import', name: 'Deklaracja Importowa Turcja', grupa: 'celne_import', filename: 'Turkey_Import_pusty.pdf', template: TurkeyImportDeclarationTemplate, tags: ['turcja', 'turkey'] },
  { key: 'southafrica_import', name: 'SAD500 — Deklaracja Importowa RPA', grupa: 'celne_import', filename: 'SouthAfrica_Import_SAD500_pusty.pdf', template: SouthAfricaSad500ImportTemplate, tags: ['rpa', 'poludniowa afryka', 'south africa'] },
  { key: 'nigeria_import', name: 'Form M — Nigeria', grupa: 'celne_import', filename: 'Nigeria_FormM_pusty.pdf', template: NigeriaFormMTemplate, tags: ['nigeria'] },
  { key: 'kenya_import', name: 'Zgłoszenie Celne — Kenia', grupa: 'celne_import', filename: 'Kenya_Import_pusty.pdf', template: KenyaCustomsEntryTemplate, tags: ['kenia', 'kenya'] },
  { key: 'egypt_import', name: 'Deklaracja Importowa Egipt', grupa: 'celne_import', filename: 'Egypt_Import_pusty.pdf', template: EgyptImportDeclarationTemplate, tags: ['egipt', 'egypt'] },
  { key: 'singapore_import', name: 'Deklaracja Importowa Singapur', grupa: 'celne_import', filename: 'Singapore_Import_pusty.pdf', template: SingaporeImportTradeNetTemplate, tags: ['singapur', 'singapore'] },
  { key: 'malaysia_import', name: 'K1 — Deklaracja Importowa Malezja', grupa: 'celne_import', filename: 'Malaysia_Import_K1_pusty.pdf', template: MalaysiaK1ImportTemplate, tags: ['malezja', 'malaysia'] },
  { key: 'indonesia_import', name: 'PIB — Deklaracja Importowa Indonezja', grupa: 'celne_import', filename: 'Indonesia_Import_PIB_pusty.pdf', template: IndonesiaPibImportTemplate, tags: ['indonezja', 'indonesia'] },
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
