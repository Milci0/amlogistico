import MetricCard from '../components/ui/MetricCard'
import DocumentCard from '../components/ui/DocumentCard'
import AlertBox from '../components/ui/AlertBox'
import { MOCK_METRICS, MOCK_DOCUMENTS } from '../data/mockData'

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Witaj z powrotem! Oto podsumowanie Twojej aktywności.</p>
      </div>

      <AlertBox type="info" title="Twój plan Free — limit 5 dokumentów/miesiąc">
        Wykorzystano 4 z 5 dostępnych dokumentów. Przejdź na plan Pro, aby generować bez limitów.
      </AlertBox>

      {/* Metryki */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {MOCK_METRICS.map((m, i) => (
          <MetricCard key={i} value={m.value} label={m.label} trend={m.trend} up={m.up} />
        ))}
      </div>

      {/* Ostatnie dokumenty */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Ostatnie dokumenty</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
            Zobacz wszystkie →
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {MOCK_DOCUMENTS.map(doc => (
            <DocumentCard
              key={doc.id}
              type={doc.type}
              number={doc.number}
              date={doc.date}
              status={doc.status}
              route={doc.route}
              onDownload={() => alert(`Pobieranie ${doc.number}...`)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
