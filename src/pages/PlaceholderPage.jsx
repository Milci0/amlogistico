export default function PlaceholderPage({ title, description }) {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {description && <p className="text-slate-500 text-sm mt-1">{description}</p>}

      <div className="mt-8 flex flex-col items-center justify-center text-center bg-white border border-dashed border-slate-300 rounded-2xl py-16 px-6">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-medium text-slate-700">Wkrótce dostępne</p>
        <p className="text-sm text-slate-500 mt-1">Ten moduł jest w przygotowaniu.</p>
      </div>
    </div>
  )
}
