import DocumentCard from '../components/ui/DocumentCard'
import { MOCK_DOCUMENTS } from '../data/mockData'

export default function HistoryPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Historia dokumentów</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Wszystkie wygenerowane dokumenty.</p>
      </div>

      <div className="flex flex-col gap-2">
        {[...MOCK_DOCUMENTS, ...MOCK_DOCUMENTS].map((doc, i) => (
          <DocumentCard
            key={i}
            type={doc.type}
            number={`${doc.number}-${i}`}
            date={doc.date}
            status={doc.status}
            route={doc.route}
            onDownload={() => {}}
          />
        ))}
      </div>
    </div>
  )
}
