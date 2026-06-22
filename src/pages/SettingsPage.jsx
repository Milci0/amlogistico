import { Helmet } from 'react-helmet-async'
import AlertBox from '../components/ui/AlertBox'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Helmet>
        <title>Ustawienia | AMLogistico</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ustawienia</h1>
        <p className="text-gray-500 text-sm mt-1">Zarządzaj swoim kontem i preferencjami.</p>
      </div>

      <AlertBox type="warning" title="Tryb demo">
        To jest wersja demonstracyjna. Zmiany nie zostaną zapisane.
      </AlertBox>

      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {[
          { label: 'Imię i nazwisko', value: 'Jan Kowalski' },
          { label: 'E-mail', value: 'jan@firma.pl' },
          { label: 'Telefon', value: '+48 123 456 789' },
          { label: 'Język interfejsu', value: 'Polski' },
          { label: 'Waluta dokumentów', value: 'PLN' },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-gray-500">{row.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">{row.value}</span>
              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">Zmień</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Bezpieczeństwo</h2>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
          Zmień hasło →
        </button>
      </div>
    </div>
  )
}
