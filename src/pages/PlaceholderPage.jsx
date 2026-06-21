export default function PlaceholderPage({ title, description }) {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
      {description && <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{description}</p>}

      <div className="mt-8 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 rounded-2xl py-16 px-6">
        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-medium text-slate-700 dark:text-slate-200">Wkrótce dostępne</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ten moduł jest w przygotowaniu.</p>
      </div>
    </div>
  )
}
