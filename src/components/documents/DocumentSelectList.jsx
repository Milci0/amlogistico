// Wspólna lista dokumentów do zaznaczania — używana zarówno przez widok pustych
// formularzy (BlankTemplatesPage) jak i krok „Dokumenty” kreatora (Step4 w
// DocumentWizard.jsx). Wygląd = wzorzec z widoku generowania: sekcje
// Wymagane/Opcjonalne, wiersz wymagany ma zielone tło/ramkę (niezależnie od tego,
// czy jest akurat zaznaczony — required steruje stylem sekcji, nie checked).
// Komponent nie zna kontekstu (puste vs gotowe) — wszystko przez propsy.

function DocIcon() {
  return (
    <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function SpinnerIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function DownloadTrayIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

function StatusBadge({ status }) {
  if (status === 'loading') return <SpinnerIcon className="w-4 h-4 text-emerald-400 shrink-0" />
  if (status === 'done') {
    return (
      <span className="shrink-0 flex items-center gap-1 text-xs font-medium text-green-600">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        Gotowe
      </span>
    )
  }
  if (status === 'error') {
    return <span className="shrink-0 text-xs font-medium text-red-600">Błąd</span>
  }
  return null
}

function DocRow({ doc, checked, onToggle, status }) {
  return (
    <div
      onClick={() => onToggle(doc.id)}
      className={`flex items-center gap-3 px-4 py-3.5 border rounded-xl cursor-pointer transition-colors
        ${doc.required ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200 bg-white hover:border-emerald-300'}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(doc.id)}
        onClick={(e) => e.stopPropagation()}
        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-400 shrink-0"
      />
      <DocIcon />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-900">{doc.namePl}</p>
          {doc.required && (
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              Wymagany
            </span>
          )}
        </div>
        {(doc.description || doc.nameEn) && (
          <p className="text-xs text-gray-400 mt-0.5">{doc.description || doc.nameEn}</p>
        )}
      </div>
      <StatusBadge status={status} />
    </div>
  )
}

// documents: [{ id, namePl, nameEn?, description?, required }]
// selectedIds: Set<string>
export default function DocumentSelectList({
  documents,
  selectedIds,
  onToggle,
  actionLabel,
  onAction,
  disabled = false,
  errorMessage = null,
  statusFor = null,
  actionLoading = false,
  loadingLabel = null,
}) {
  const required = documents.filter((d) => d.required)
  const optional = documents.filter((d) => !d.required)
  const selectedCount = documents.filter((d) => selectedIds.has(d.id)).length
  const actionDisabled = disabled || selectedCount === 0

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
        Wymagane ({required.length})
      </p>
      <div className="space-y-2 mb-4">
        {required.map((doc) => (
          <DocRow
            key={doc.id}
            doc={doc}
            checked={selectedIds.has(doc.id)}
            onToggle={onToggle}
            status={statusFor?.(doc.id)}
          />
        ))}
      </div>

      {optional.length > 0 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Opcjonalne ({optional.length})
          </p>
          <div className="space-y-2 mb-6">
            {optional.map((doc) => (
              <DocRow
                key={doc.id}
                doc={doc}
                checked={selectedIds.has(doc.id)}
                onToggle={onToggle}
                status={statusFor?.(doc.id)}
              />
            ))}
          </div>
        </>
      )}
      {optional.length === 0 && <div className="mb-6" />}

      <button
        onClick={onAction}
        disabled={actionDisabled}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-colors text-sm"
      >
        {actionLoading ? <SpinnerIcon /> : <DownloadTrayIcon />}
        {actionLoading && loadingLabel ? loadingLabel : actionLabel}
      </button>
      {errorMessage && <p className="mt-2 text-xs text-red-600">{errorMessage}</p>}
    </div>
  )
}
