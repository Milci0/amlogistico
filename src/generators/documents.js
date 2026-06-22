import { generatePdf } from './generatePdf'
import { CmrTemplate } from './templates/eu/land/CmrTemplate'
import { ZlecenieTemplate } from './templates/eu/land/ZlecenieTemplate'
import { PODTemplate } from './templates/eu/land/PODTemplate'
import { PackingListTemplate } from './templates/eu/common/PackingListTemplate'
import { FakturaHandlowaTemplate } from './templates/eu/common/FakturaHandlowaTemplate'
import { FakturaProformaTemplate } from './templates/eu/common/FakturaProformaTemplate'
import { MultimodalTemplate } from './templates/eu/common/MultimodalTemplate'
import { BillOfLadingTemplate } from './templates/eu/sea/BillOfLadingTemplate'
import { SeaWaybillTemplate } from './templates/eu/sea/SeaWaybillTemplate'

// ── Jedyne źródło prawdy dla wszystkich dokumentów ──────────────────────────────
// Dodanie nowego dokumentu = utwórz szablon JSX + dopisz tu jeden wpis. Bez nowych
// skryptów. Konwersję HTML→PDF robi wspólny silnik generatePdf (generatePdf.jsx).
//
// Pola wpisu:
//   key       – unikalny identyfikator (klucz stanu w wizardzie)
//   transport – w których trasach dokument się pojawia: ['road'] | ['sea'] | ['road','sea']
//   required  – bool albo (ctx) => bool  (ctx = { bothEU })
//   show      – opcjonalny warunek widoczności: (ctx) => bool (domyślnie zawsze)
//   name/desc/icon – metadane do listy w kroku 4
//   filename  – nazwa pobieranego pliku PDF
//   template  – komponent szablonu (React → HTML)
//   blankFile – ścieżka do gotowego pustego PDF w /public (do pobrania bez generowania)
//
// Kolejność tablicy = kolejność wyświetlania na liście.
export const DOCUMENTS = [
  {
    key: 'cmr', transport: ['road'], required: true,
    name: 'CMR — list przewozowy', desc: 'Podstawowy dokument transportu drogowego',
    icon: 'doc', filename: 'CMR.pdf', template: CmrTemplate,
    blankFile: '/templates/eu/land/01_CMR_List_Przewozowy.pdf',
  },
  {
    key: 'bol', transport: ['sea'], required: true,
    name: 'Bill of Lading', desc: 'Konosament morski — negocjowalny dokument tytułowy',
    icon: 'doc', filename: 'Bill_of_Lading.pdf', template: BillOfLadingTemplate,
    blankFile: '/templates/eu/sea/05_Bill_of_Lading.pdf',
  },
  {
    key: 'packing', transport: ['road', 'sea'], required: true,
    name: 'Packing List', desc: 'Szczegółowy wykaz zawartości przesyłki',
    icon: 'list', filename: 'Packing_List.pdf', template: PackingListTemplate,
    blankFile: '/templates/eu/common/02_Packing_List.pdf',
  },
  {
    key: 'faktura', transport: ['road', 'sea'], required: true,
    name: 'Faktura handlowa', desc: 'Dokument rozliczeniowy między sprzedającym a kupującym',
    icon: 'doc', filename: 'Faktura_Handlowa.pdf', template: FakturaHandlowaTemplate,
    blankFile: '/templates/eu/common/03_Faktura_Handlowa.pdf',
  },
  {
    key: 'proforma', transport: ['road', 'sea'], required: true, show: ({ bothEU }) => !bothEU,
    name: 'Faktura Proforma', desc: 'Dokument celny do odprawy eksportowej',
    icon: 'doc', filename: 'Faktura_Proforma.pdf', template: FakturaProformaTemplate,
    blankFile: '/templates/eu/common/04_Faktura_Proforma.pdf',
  },
  {
    key: 'zlecenie', transport: ['road'], required: false,
    name: 'Zlecenie transportowe', desc: 'Umowa między zleceniodawcą a przewoźnikiem',
    icon: 'clipboard', filename: 'Zlecenie_Transportowe.pdf', template: ZlecenieTemplate,
    blankFile: '/templates/eu/land/09_Zlecenie_Transportowe.pdf',
  },
  {
    key: 'pod', transport: ['road'], required: false,
    name: 'Protokół odbioru (POD)', desc: 'Potwierdzenie dostarczenia towaru przez odbiorcę',
    icon: 'sign', filename: 'Protokol_Odbioru_POD.pdf', template: PODTemplate,
    blankFile: '/templates/eu/land/10_Protokol_Odbioru_POD.pdf',
  },
  {
    key: 'seawaybill', transport: ['sea'], required: false,
    name: 'Sea Waybill', desc: 'Morski list przewozowy — szybszy odbiór niż B/L',
    icon: 'doc', filename: 'Sea_Waybill.pdf', template: SeaWaybillTemplate,
    blankFile: '/templates/eu/sea/26_Sea_Waybill.pdf',
  },
  {
    key: 'multimodal', transport: ['road', 'sea'],
    required: ({ multimodal }) => !!multimodal,
    name: 'Multimodal Transport Document', desc: 'Dokument transportu multimodalnego (kilka środków transportu)',
    icon: 'doc', filename: 'Multimodal_Transport_Document.pdf', template: MultimodalTemplate,
    blankFile: '/templates/eu/common/28_Multimodal_Transport_Document.pdf',
  },
]

// Lista dokumentów dla danej trasy i statusu UE (1:1 z poprzednią logiką wizardu).
export function getDocsList(transport, bothEU, multimodal = false) {
  const ctx = { bothEU, multimodal }
  return DOCUMENTS
    .filter(d => d.transport.includes(transport))
    .filter(d => !d.show || d.show(ctx))
    .map(d => ({
      ...d,
      required: typeof d.required === 'function' ? d.required(ctx) : d.required,
    }))
}

// Generyczny dispatcher — zastępuje wszystkie pliki fill*.js
export function generateDocument(doc, data) {
  return generatePdf(doc.template, data, doc.filename)
}
