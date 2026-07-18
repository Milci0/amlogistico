import { useState, useRef, useEffect } from 'react'

// Wczytane pliki miast trzymamy w pamięci, żeby nie pobierać ich ponownie
// przy każdym przełączeniu kraju tam i z powrotem.
const cache = new Map()

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/ł/g, 'l') // "ł" nie rozkłada się przez NFD (to osobny znak, nie l + akcent)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // usuń znaki diakrytyczne (ą, ę, ó, ü...)
}

export default function CitySelect({ country, value, onChange, placeholder = '' }) {
  const [cities, setCities] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    setOpen(false)
    if (!country) {
      setCities([])
      return
    }
    if (cache.has(country)) {
      setCities(cache.get(country))
      return
    }
    let cancelled = false
    import(`../../data/cities/${country}.json`)
      .then(mod => {
        if (cancelled) return
        const list = mod.default ?? []
        cache.set(country, list)
        setCities(list)
      })
      .catch(() => {
        if (!cancelled) setCities([])
      })
    return () => { cancelled = true }
  }, [country])

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const query = value ?? ''
  const filtered = query
    ? cities.filter(c => normalize(c).includes(normalize(query)))
    : cities

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        disabled={!country}
        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700
          focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors"
        placeholder={country ? placeholder : 'Najpierw wybierz kraj'}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
      />

      {open && country && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-3 px-3">
              Brak podpowiedzi — możesz wpisać nazwę ręcznie
            </p>
          ) : (
            filtered.map(city => (
              <button
                key={city}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors
                  ${city === value ? 'bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-slate-300'}`}
                onClick={() => { onChange(city); setOpen(false) }}
              >
                {city}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
