const STORAGE_KEY = 'amlogistico_documents'

function generateId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const SEED_DOCUMENTS = [
  {
    id: generateId(),
    type: 'CMR',
    status: 'completed',
    routeFrom: 'PL',
    routeTo: 'DE',
    createdAt: '2026-07-10T09:15:00.000Z',
    updatedAt: '2026-07-10T09:15:00.000Z',
    currentStep: null,
    stepLabel: null,
    files: [],
  },
  {
    id: generateId(),
    type: 'Packing List',
    status: 'completed',
    routeFrom: 'PL',
    routeTo: 'FR',
    createdAt: '2026-07-09T14:20:00.000Z',
    updatedAt: '2026-07-09T14:20:00.000Z',
    currentStep: null,
    stepLabel: null,
    files: [],
  },
  {
    id: generateId(),
    type: 'Faktura',
    status: 'completed',
    routeFrom: 'PL',
    routeTo: 'NL',
    createdAt: '2026-07-08T11:00:00.000Z',
    updatedAt: '2026-07-08T11:00:00.000Z',
    currentStep: null,
    stepLabel: null,
    files: [],
  },
  {
    id: generateId(),
    type: 'Sea Waybill',
    status: 'completed',
    routeFrom: 'PL',
    routeTo: 'CN',
    createdAt: '2026-07-05T08:30:00.000Z',
    updatedAt: '2026-07-05T08:30:00.000Z',
    currentStep: null,
    stepLabel: null,
    files: [],
  },
  {
    id: generateId(),
    type: 'CMR',
    status: 'completed',
    routeFrom: 'PL',
    routeTo: 'CZ',
    createdAt: '2026-07-01T16:45:00.000Z',
    updatedAt: '2026-07-01T16:45:00.000Z',
    currentStep: null,
    stepLabel: null,
    files: [],
  },
  {
    id: generateId(),
    type: 'Faktura',
    status: 'draft',
    routeFrom: 'PL',
    routeTo: 'NL',
    createdAt: '2026-07-12T10:00:00.000Z',
    updatedAt: '2026-07-13T09:00:00.000Z',
    currentStep: 3,
    stepLabel: 'Dane towaru',
    files: [],
  },
  {
    id: generateId(),
    type: 'CMR',
    status: 'draft',
    routeFrom: 'PL',
    routeTo: 'DE',
    createdAt: '2026-07-11T15:30:00.000Z',
    updatedAt: '2026-07-11T15:30:00.000Z',
    currentStep: 1,
    stepLabel: 'Trasa',
    files: [],
  },
  {
    id: generateId(),
    type: 'Sea Waybill',
    status: 'draft',
    routeFrom: 'PL',
    routeTo: 'CN',
    createdAt: '2026-07-07T12:00:00.000Z',
    updatedAt: '2026-07-07T12:40:00.000Z',
    currentStep: 2,
    stepLabel: 'Strony',
    files: [],
  },
]

function readAll() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DOCUMENTS))
    return SEED_DOCUMENTS
  }
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeAll(docs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
}

export function list() {
  return readAll()
}

export function getById(id) {
  return readAll().find(doc => doc.id === id) || null
}

export function save(doc) {
  const docs = readAll()
  const now = new Date().toISOString()

  if (doc.id) {
    const index = docs.findIndex(d => d.id === doc.id)
    if (index !== -1) {
      const updated = { ...docs[index], ...doc, updatedAt: now }
      docs[index] = updated
      writeAll(docs)
      return updated
    }
  }

  const created = { ...doc, id: doc.id || generateId(), createdAt: doc.createdAt || now, updatedAt: now }
  docs.push(created)
  writeAll(docs)
  return created
}

export function remove(id) {
  const docs = readAll().filter(doc => doc.id !== id)
  writeAll(docs)
}
