import { useState } from 'react'
import { COUNTRIES } from '../data/mockData'
import CountrySelect from './ui/CountrySelect'
import { isEUCountry } from '../utils/documentEngine'

function getCountryName(code) {
  return COUNTRIES.find(c => c.code === code)?.name ?? code
}

export default function TransitCountryPicker({ value = [], onChange, excludeCountries = [] }) {
  const [showSelect, setShowSelect] = useState(false)
  const [selectKey, setSelectKey] = useState(0)

  function handleAdd(code) {
    if (!code) return
    if (value.includes(code) || excludeCountries.includes(code)) return
    onChange([...value, code])
    setSelectKey(k => k + 1)
    setShowSelect(false)
  }

  function handleRemove(code) {
    onChange(value.filter(c => c !== code))
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm text-gray-700">Kraje tranzytowe</span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">opcjonalne</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Dodaj kraje, przez ktore przejezdza transport. System sam rozpozna, czy trasa wychodzi poza UE.
      </p>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map((code, idx) => {
            const eu = isEUCountry(code)
            return (
              <div
                key={code}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-gray-200 bg-white text-sm"
              >
                <span className="text-gray-400 text-xs w-4">{idx + 1}.</span>
                <img
                  src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`}
                  srcSet={`https://flagcdn.com/w40/${code.toLowerCase()}.png 2x`}
                  width={20}
                  height={15}
                  alt={code}
                  className="rounded-sm object-cover flex-shrink-0"
                />
                <span className="text-gray-800">{getCountryName(code)}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    eu
                      ? 'bg-[#ecfdf5] text-[#047857]'
                      : 'bg-[#fffbeb] text-[#b45309]'
                  }`}
                >
                  {eu ? 'UE' : 'poza UE'}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(code)}
                  className="text-gray-400 hover:text-gray-600 ml-0.5 transition-colors"
                  aria-label={`Usun ${getCountryName(code)}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {showSelect ? (
        <div className="space-y-1.5">
          <CountrySelect
            key={selectKey}
            value=""
            onChange={handleAdd}
            placeholder="Wybierz kraj tranzytowy..."
          />
          <button
            type="button"
            onClick={() => setShowSelect(false)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Anuluj
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowSelect(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 text-blue-600 text-sm hover:bg-blue-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Dodaj kraj tranzytowy
        </button>
      )}
    </div>
  )
}
