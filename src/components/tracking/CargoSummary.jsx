import { Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cargoLabel, getTempRange } from '../../data/cargoCategories'
import { getUnitType } from '../../data/cargoUnits'
import TempRangeNote from '../cargo/TempRangeNote'

// Sekcja "Ładunek" w widoku szczegółów przesyłki — celowo używa tego samego
// słownictwa co reszta aplikacji (CargoCategoryPicker/CargoUnitField), żeby
// makieta wyglądała jak realne dane, nie wymyślone na potrzeby tego widoku.

export default function CargoSummary({ cargo }) {
  const { t, i18n } = useTranslation('pages')
  const { t: tCargo } = useTranslation('cargo')
  // Nazwa kategorii i podkategorii z tłumaczeń; cargoLabel() zostaje kanonicznie
  // polskie, bo trafia też do migawki zapisywanej w bazie.
  const catName = cargo.cargoCategory
    ? tCargo(`categories.${cargo.cargoCategory}.name`, { defaultValue: '' })
    : ''
  const subName = cargo.cargoSubcategory
    ? tCargo(`subcategories.${cargo.cargoSubcategory}`, { defaultValue: '' })
    : ''
  const label = [catName, subName].filter(Boolean).join(' — ')
    || cargoLabel(cargo.cargoCategory, cargo.cargoSubcategory)
  const unit = getUnitType(cargo.packageType)
  const tempRange = getTempRange(cargo.cargoSubcategory)

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">{t('tracking.cargo')}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-[11px] text-gray-400 dark:text-slate-500">{t('tracking.category')}</p>
          <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5">{label || '-'}</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400 dark:text-slate-500">{t('tracking.units')}</p>
          {unit ? (
            <span className="inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {cargo.packages} × {i18n.language.startsWith('en') && unit.nameEn ? unit.nameEn : unit.name} ({unit.code})
            </span>
          ) : (
            <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5">{cargo.packages ?? '-'}</p>
          )}
        </div>
        <div>
          <p className="text-[11px] text-gray-400 dark:text-slate-500">{t('tracking.weight')}</p>
          <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5">
            {cargo.weight != null ? `${cargo.weight} kg` : '-'}
          </p>
        </div>
      </div>

      <TempRangeNote range={tempRange} />
    </div>
  )
}
