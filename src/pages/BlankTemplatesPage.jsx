import { useState } from 'react'
import { DOCUMENTS } from '../generators/documents'

const TRANSPORT_TABS = [
  {
    key: 'road', label: 'Drogowy', sub: 'TIR, ciężarówka',
    svg: (active) => (
      <svg className={`w-7 h-7 ${active ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3h1.4a2 2 0 0 1 1.7.9l1.7 2.6a2 2 0 0 1 .3 1V17h-2" />
        <circle cx="7.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    ),
  },
  {
    key: 'sea', label: 'Morski', sub: 'Kontener FCL/LCL',
    svg: (active) => (
      <svg className={`w-7 h-7 ${active ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M2 21c.6.5 1.2 1 2.5 1C7 22 7 20 9.5 20c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.2.5 4.3 1.62 6" />
        <path d="M12 10V2" />
        <path d="M12 2H9" />
      </svg>
    ),
  },
]

function DocIcon({ type }) {
  if (type === 'list') return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h10" />
    </svg>
  )
  if (type === 'clipboard') return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
  if (type === 'sign') return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-9 9H9v-3z" />
    </svg>
  )
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

export default function BlankTemplatesPage() {
  const [transport, setTransport] = useState('road')

  const docs = DOCUMENTS.filter(d => d.transport.includes(transport) && d.blankFile)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Puste szablony dokumentów</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Pobierz gotowy do wydruku pusty formularz.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {TRANSPORT_TABS.map(({ key, label, sub, svg }) => {
          const active = transport === key
          return (
            <button
              key={key}
              onClick={() => setTransport(key)}
              className={`flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-all
                ${active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              {svg(active)}
              <div>
                <p className={`text-sm font-semibold ${active ? 'text-blue-700' : 'text-gray-800'}`}>{label}</p>
                <p className={`text-xs mt-0.5 ${active ? 'text-blue-400' : 'text-gray-400'}`}>{sub}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {docs.map(doc => (
          <div key={doc.key} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                <DocIcon type={doc.icon} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800 leading-tight">{doc.name}</div>
                <div className="text-xs text-gray-400 mt-0.5 leading-snug">{doc.desc}</div>
              </div>
            </div>

            <a
              href={doc.blankFile}
              download
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Pobierz PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
