import { Helmet } from 'react-helmet-async'
import DocumentWizard from '../components/wizard/DocumentWizard'

export default function NewDocumentPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Helmet>
        <title>Nowe zlecenie | AMLogistico</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nowe zlecenie</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Wypełnij formularz a my dobierzemy dokumenty automatycznie.
        </p>
      </div>
      <DocumentWizard />
    </div>
  )
}
