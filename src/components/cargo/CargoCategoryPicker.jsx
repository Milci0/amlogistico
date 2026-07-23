import { useMemo, useState, useRef, useEffect } from 'react'
import { Info, Search, ChevronDown } from 'lucide-react'
import AlertBox from '../ui/AlertBox'
import {
  CARGO_CATEGORIES,
  CARGO_FLAGS,
  getCategory,
  getSubcategories,
  getSubcategory,
} from '../../data/cargoCategories'

// Wspólny widget „Kategoria towaru" — używany w kroku 2 kreatora (DocumentWizard)
// i na stronie „Puste szablony" (BlankTemplatesPage), żeby wygląd i słownictwo
// były identyczne w całej aplikacji.
//
// Kafelki mają ten sam styl co poprzednia lista 5 rodzajów ładunku (emerald przy
// zaznaczeniu, neutralny w spoczynku) — działa w motywie jasnym i ciemnym.
//
// Props:
//  - categoryId / subcategoryId — aktualny wybór ('' = brak)
//  - onChange({ categoryId, subcategoryId, subcategory }) — subcategory to pełny
//    obiekt (lub null), żeby wywołujący mógł np. uzupełnić kod HS

// Lista podkategorii bywa długa (żywność roślinna: 54 pozycje), więc zamiast
// natywnego <select> jest tu combobox z wyszukiwarką — ten sam wzorzec co
// CountrySelect (klik otwiera listę, wpisywanie filtruje), tylko w akcencie emerald.
function SubcategorySelect({ subcategories, value, onChange, placeholder }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const selected = subcategories.find((s) => s.id === value) || null
  const q = query.trim().toLowerCase()
  const filtered = q
    ? subcategories.filter(
        (s) => s.name.toLowerCase().includes(q) || s.hsCode.toLowerCase().includes(q)
      )
    : subcategories

  useEffect(() => {
    if (!open) return
    function onPointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function pick(id) {
    onChange(id)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setQuery('') }}
        className="flex items-center gap-2 w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-left bg-white dark:bg-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors"
      >
        {selected ? (
          <>
            <span className="text-sm text-gray-800 dark:text-slate-100 flex-1">{selected.name}</span>
            <span className="text-xs text-gray-400 dark:text-slate-400">{selected.hsCode}</span>
          </>
        ) : (
          <span className="text-sm text-gray-400 dark:text-slate-400 flex-1">{placeholder}</span>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-[26rem] flex flex-col">
          <div className="p-2 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 dark:bg-slate-900 rounded-md">
              <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" strokeWidth={2} />
              <input
                autoFocus
                type="text"
                className="bg-transparent text-sm outline-none flex-1 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                placeholder="Wpisz nazwę towaru lub kod HS..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-y-auto">
            {selected && (
              <button
                type="button"
                onClick={() => pick('')}
                className="w-full px-3 py-2 text-sm text-left text-gray-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
              >
                Wyczyść wybór
              </button>
            )}
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">Brak wyników</p>
            ) : (
              filtered.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => pick(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors
                    ${s.id === value ? 'bg-emerald-50 dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-medium' : 'text-gray-700 dark:text-slate-300'}`}
                >
                  <span className="flex-1">{s.name}</span>
                  <span className="text-xs text-gray-400 dark:text-slate-500">{s.hsCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CargoCategoryPicker({
  categoryId = '',
  subcategoryId = '',
  onChange,
  label = 'Kategoria towaru',
}) {
  const category = getCategory(categoryId)
  const subcategories = useMemo(() => (categoryId ? getSubcategories(categoryId) : []), [categoryId])
  const subcategory = getSubcategory(subcategoryId)
  // Podkategoria z innej kategorii (np. po zmianie kategorii) nie jest brana pod uwagę.
  const activeSub = subcategory && subcategory.categoryId === categoryId ? subcategory : null

  function pickCategory(id) {
    // Ponowne kliknięcie w aktywny kafelek = odznaczenie całego wyboru.
    const next = categoryId === id ? '' : id
    onChange({ categoryId: next, subcategoryId: '', subcategory: null })
  }

  function pickSubcategory(id) {
    onChange({ categoryId, subcategoryId: id, subcategory: getSubcategory(id) })
  }

  return (
    <div>
      <p className="block text-sm text-gray-700 dark:text-slate-300 mb-2">{label}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {CARGO_CATEGORIES.map((c) => {
          const Icon = c.icon
          const active = categoryId === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => pickCategory(c.id)}
              className={`flex flex-col items-center justify-start gap-1.5 p-3 border-2 rounded-xl text-center transition-all
                ${active
                  ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'}`}
            >
              <Icon
                className={active ? 'w-5 h-5 text-emerald-500' : 'w-5 h-5 text-gray-400 dark:text-slate-500'}
                strokeWidth={1.5}
              />
              <span className={`text-xs font-medium leading-tight ${active ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-slate-300'}`}>
                {c.name}
              </span>
            </button>
          )
        })}
      </div>

      {category && (
        <div className="mt-3 flex items-start gap-2 px-3.5 py-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-lg">
          <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-xs text-emerald-700 dark:text-emerald-300">{category.hint}</p>
        </div>
      )}

      {category && (
        <div className="mt-4">
          <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5">
            Podkategoria (konkretny towar)
          </label>
          <SubcategorySelect
            subcategories={subcategories}
            value={activeSub ? activeSub.id : ''}
            onChange={pickSubcategory}
            placeholder="Wybierz lub wpisz towar..."
          />
        </div>
      )}

      {activeSub && (
        <div className="mt-3 space-y-3">
          {activeSub.flags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activeSub.flags.map((key) => {
                const flag = CARGO_FLAGS[key]
                if (!flag) return null
                const FlagIcon = flag.icon
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-[11px] text-gray-700 dark:text-slate-300"
                  >
                    <FlagIcon className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" strokeWidth={1.5} />
                    {flag.label}
                    {flag.adrClass && <span className="text-gray-400 dark:text-slate-500">ADR {flag.adrClass}</span>}
                  </span>
                )
              })}
            </div>
          )}

          {activeSub.warning && (
            <AlertBox type="warning">{activeSub.warning}</AlertBox>
          )}
        </div>
      )}
    </div>
  )
}
