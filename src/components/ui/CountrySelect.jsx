import { useState, useRef, useEffect } from 'react'
import { COUNTRIES } from '../../data/mockData'

function FlagImg({ code, size = 20 }) {
  return (
    <img
      src={`https://flagcdn.com/w${size}/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w${size * 2}/${code.toLowerCase()}.png 2x`}
      width={size}
      height={size * 0.75}
      alt={code}
      className="rounded-sm object-cover flex-shrink-0"
    />
  )
}

export default function CountrySelect({ value, onChange, placeholder = 'Wybierz kraj...' }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.code.toLowerCase().includes(query.toLowerCase())
  )

  const selected = COUNTRIES.find(c => c.code === value)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div
        className="flex items-center gap-2 w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 cursor-pointer bg-white dark:bg-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
        onClick={() => { setOpen(prev => !prev); setQuery('') }}
      >
        {selected ? (
          <>
            <FlagImg code={selected.code} size={20} />
            <span className="text-sm text-gray-800 dark:text-slate-100 flex-1">{selected.name}</span>
          </>
        ) : (
          <span className="text-sm text-gray-400 dark:text-slate-500 flex-1">{placeholder}</span>
        )}
        <svg className="w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-56 flex flex-col">
          {/* Wyszukiwarka */}
          <div className="p-2 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 dark:bg-slate-900 rounded-md">
              <svg className="w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                type="text"
                className="bg-transparent text-sm outline-none flex-1 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                placeholder="Szukaj kraju..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Lista */}
          <div className="overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">Brak wyników</p>
            ) : (
              filtered.map(country => (
                <button
                  key={country.code}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors text-left
                    ${country.code === value ? 'bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-slate-300'}`}
                  onClick={() => { onChange(country.code); setOpen(false); setQuery('') }}
                >
                  <FlagImg code={country.code} size={20} />
                  <span>{country.name}</span>
                  <span className="ml-auto text-xs text-gray-400 dark:text-slate-500">{country.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
