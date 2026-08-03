import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CARGO_UNIT_GROUPS, getUnitType } from '../../data/cargoUnits'

// Pole „Typ i liczba jednostek ładunku" — krok 2 kreatora (DocumentWizard).
// Zastępuje dawne samo „Liczba paczek": `packages` zostaje gołą liczbą (zasila
// ~20 szablonów PDF przez data.cargo.packages), typ jednostki jest osobnym
// polem `packageType` (kod, np. 'PLT') doklejanym obok w documentGeneration.
//
// Styl 1:1 z CargoCategoryPicker.jsx (input jak w DocumentWizard.cls.input,
// info-box emerald na hint) — celowo bez własnego importu cls z DocumentWizard,
// żeby komponent kategorii `cargo/` nie zależał od komponentu-strony.

const inputCls =
  'w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-colors'

export default function CargoUnitField({
  packageType = '',
  packages = '',
  onChange,
  label,
}) {
  const { t, i18n } = useTranslation('cargo')
  const unit = getUnitType(packageType)
  // Katalog jednostek niesie już `nameEn`, więc nazwa nie potrzebuje osobnego
  // wpisu w plikach tłumaczeń — bierzemy ją wprost z danych.
  const unitName = (u) => (i18n.language === 'en' && u.nameEn ? u.nameEn : u.name)

  function setType(value) {
    onChange({ packageType: value, packages })
  }

  function setCount(value) {
    onChange({ packageType, packages: value })
  }

  return (
    <div>
      <p className="block text-sm text-gray-700 dark:text-slate-300 mb-1">{label ?? t('units.label')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <select className={inputCls} value={packageType} onChange={(e) => setType(e.target.value)}>
            <option value="">{t('units.selectType')}</option>
            {CARGO_UNIT_GROUPS.map((group) => (
              <optgroup key={group.id} label={t(`units.groups.${group.id}`, { defaultValue: group.label })}>
                {group.units.map((u) => (
                  <option key={u.code} value={u.code}>
                    {unitName(u)} ({u.code})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <input
            type="number"
            min={1}
            placeholder={t('units.quantity')}
            className={inputCls}
            value={packages}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>
      </div>

      {unit && packages && (
        <div className="mt-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {packages} × {unitName(unit)} ({unit.code})
          </span>
        </div>
      )}

      {unit?.hint && (
        <div className="mt-2 flex items-start gap-2 px-3.5 py-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-lg">
          <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            {t(`units.hints.${unit.code}`, { defaultValue: unit.hint })}
          </p>
        </div>
      )}
    </div>
  )
}
