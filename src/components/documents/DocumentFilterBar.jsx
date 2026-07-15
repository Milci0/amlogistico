export default function DocumentFilterBar({ query, onQueryChange, typeFilter, onTypeFilterChange, types, sortBy, onSortByChange, sortOptions }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <input
        type="text"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        placeholder="Szukaj po nazwie, typie lub trasie…"
        className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      />
      <select
        value={typeFilter}
        onChange={e => onTypeFilterChange(e.target.value)}
        className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      >
        <option value="all">Wszystkie typy</option>
        {types.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <select
        value={sortBy}
        onChange={e => onSortByChange(e.target.value)}
        className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      >
        {sortOptions.map(opt => (
          <option key={opt.key} value={opt.key}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
