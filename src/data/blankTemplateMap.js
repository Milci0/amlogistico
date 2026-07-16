// src/data/blankTemplateMap.js
// Łączy klucze silnika doboru dokumentów (documentCatalog.js, np. "01_CMR") z
// gotowymi szablonami JSX (templateCatalog.js, np. "cmr") — dzięki temu puste
// formularze w /blank-templates są generowane tym samym silnikiem co dokumenty
// wypełnione w kreatorze (generatePdf + pusty obiekt data), a nie serwowane jako
// statyczne pliki PDF. "22_China_Import" nie ma dedykowanego dokumentu — mapowany
// na tę samą deklarację UE (ead_sad), którą już podstawiał statyczny plik.

import { TEMPLATE_CATALOG } from './templateCatalog'

const DOCUMENT_ID_TO_TEMPLATE_KEY = {
  '01_CMR': 'cmr', '09_Zlecenie': 'zlecenie', '10_POD': 'pod',
  '05_BL': 'bol', '26_SeaWaybill': 'seawaybill',
  '11_AWB': 'awb', '27_CIM': 'cim', '28_MTD': 'multimodal',
  '02_PackingList': 'packing', '03_Invoice': 'faktura', '04_Proforma': 'proforma',
  '07_EAD': 'ead_sad', '22_China_Import': 'ead_sad',
  '31_UK_Export': 'uk_export', '30_USA_AES': 'usa_aes', '33_Canada_Export': 'canada_export',
  '32_Australia_Export': 'australia_export', '23_China_Export': 'china_export',
  '34_Japan_Export': 'japan_export', '35_Korea_Export': 'korea_export',
  '36_Brazil_Export': 'brazil_export', '37_India_Export': 'india_shipping_bill',
  '38_UAE_Export': 'uae_export', '39_Saudi_Export': 'saudi_export',
  '40_Turkey_Export': 'turkey_export', '41_SouthAfrica_Export': 'southafrica_export',
  '97_Argentina_Export': 'argentina_export', '98_Chile_Export': 'chile_export',
  '99_Pakistan_Export': 'pakistan_export', '100_Philippines_Export': 'philippines_export',
  '08_ISF': 'isf', '20_CBP7501': 'cbp7501', '21_UK_Import': 'ukc88',
  '42_Canada_Import': 'canada_import', '43_Australia_Import': 'australia_import',
  '44_India_Import': 'boe_india', '45_Japan_Import': 'japan_import',
  '46_Korea_Import': 'korea_import', '47_Brazil_Import': 'brazil_import',
  '50_Saudi_Import': 'saudi_import', '49_UAE_Import': 'uae_import', '51_UAE_Import': 'uae_import',
  '53_Nigeria_Import': 'nigeria_import', '83_Morocco_Import': 'morocco_import',
  '84_Algeria_Import': 'algeria_import', '85_Tunisia_Import': 'tunisia_import',
  '43_NewZealand_Import': 'newzealand_import', '48_Mexico_Import': 'mexico_import',
  '51_Turkey_Import': 'turkey_import', '52_SouthAfrica_Import': 'southafrica_import',
  '54_Kenya_Import': 'kenya_import', '55_Egypt_Import': 'egypt_import',
  '56_Singapore_Import': 'singapore_import', '57_Malaysia_Import': 'malaysia_import',
  '58_Indonesia_Import': 'indonesia_import', '59_Vietnam_Import': 'vietnam_import',
  '60_Thailand_Import': 'thailand_import', '72_Argentina_Import': 'argentina_import',
  '73_Chile_Import': 'chile_import', '74_Colombia_Import': 'colombia_import',
  '75_Peru_Import': 'peru_import', '76_Ecuador_Import': 'ecuador_import',
  '77_Pakistan_Import': 'pakistan_import', '78_Bangladesh_Import': 'bangladesh_import',
  '79_SriLanka_Import': 'srilanka_import', '80_Philippines_Import': 'philippines_import',
  '81_Myanmar_Import': 'myanmar_import', '82_Cambodia_Import': 'cambodia_import',
  '86_Ghana_Import': 'ghana_import', '87_Senegal_Import': 'senegal_import',
  '88_Tanzania_Import': 'tanzania_import', '89_Ethiopia_Import': 'ethiopia_import',
  '90_Jordan_Import': 'jordan_import', '91_Israel_Import': 'israel_import',
  '92_Iraq_Import': 'iraq_import', '93_Lebanon_Import': 'lebanon_import',
  '94_Kazakhstan_Import': 'kazakhstan_import', '95_Uzbekistan_Import': 'uzbekistan_import',
  '96_Georgia_Import': 'georgia_import',
  '06_COO': 'coo', '12_EUR1': 'eur1', '102_EUR_MED': 'eurmed', '103_Form_A': 'forma_gsp',
  '16_Fitosanitarne': 'phyto', '17_Weterynaryjne': 'vet',
  '108_PhytoImport': 'phyto_import_permit', '105_FDA': 'fda_prior_notice',
  '15_IMDG': 'imdg', '29_DG_Manifest': 'dg_manifest', '69_MSDS': 'msds',
  '14_ADR': 'adr', '118_ADR': 'dg_road_manifest',
  '64_IATA_DGR': 'iata_dgr_air', '109_IATA_Packing': 'iata_dg_packing',
  '13_ATA': 'ata', '18_Halal': 'halal', '19_ISPM15': 'ispm15', '65_Fumigation': 'fumigation',
  '63_Insurance': 'insurance_cert', '68_PSI': 'psi', '70_Blacklist': 'blacklist',
  '71_FreeSale': 'free_sale', '104_T2L': 't2l', '106_CE': 'ce_doc',
  '110_NonGMO': 'nongmo', '111_Organic': 'organic', '112_Kosher': 'kosher',
  '113_EUC': 'euc_military', '114_ReExport': 'reexport', '115_Transhipment': 'transhipment',
  '116_Transit': 'transit_t1t2', '117_TIR': 'tir', '107_Radiation': 'radiation',
  '101_CITES': 'cites_import', '24_DualUse': 'dualuse',
  '25_CITES_Permit': 'cites_permit',
  '61_LC': 'lc', '62_BankGuarantee': 'bank_guarantee',
  '66_WeightCertificate': 'weight_cert', '67_QualityInspection': 'quality_inspection',
}

const BY_KEY = Object.fromEntries(TEMPLATE_CATALOG.map((t) => [t.key, t]))

// Zwraca wpis z templateCatalog ({ key, name, template, ... }) dla danego id z
// documentCatalog, albo null gdy dokument nie ma jeszcze szablonu JSX.
export function getBlankTemplate(documentCatalogId) {
  const templateKey = DOCUMENT_ID_TO_TEMPLATE_KEY[documentCatalogId]
  return templateKey ? BY_KEY[templateKey] || null : null
}
