import { Helmet } from 'react-helmet-async'

export default function CompaniesPage() {
  const companies = [
    { name: 'Firma ABC Sp. z o.o.', nip: '123-456-78-90', country: '🇵🇱 Polska', role: 'Nadawca' },
    { name: 'Müller GmbH', nip: 'DE987654321', country: '🇩🇪 Niemcy', role: 'Odbiorca' },
    { name: 'Transport XYZ', nip: '987-654-32-10', country: '🇵🇱 Polska', role: 'Przewoźnik' },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <Helmet>
        <title>Moje firmy | AMLogistico</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moje firmy</h1>
          <p className="text-gray-500 text-sm mt-1">Zapisane dane firm do szybkiego uzupełniania dokumentów.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          + Dodaj firmę
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {companies.map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                {c.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-400">{c.nip} · {c.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{c.role}</span>
              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">Edytuj</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
