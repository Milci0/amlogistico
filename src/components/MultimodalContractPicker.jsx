import { useTranslation } from 'react-i18next'

// Pytanie „Jak zorganizowany jest przewóz?" — wspólne dla kroku „Trasa" w
// kreatorze (DocumentWizard.jsx, Step1) i formularza „Puste szablony"
// (BlankTemplatesPage.jsx). Wydzielone z Step1 (2026-08-08), żeby oba miejsca
// pytały o to samo, tymi samymi słowami (namespace i18n `wizard`,
// `route.multimodalStructure.*`), zamiast duplikować JSX.
//
// Świadomie NIE zawiera podglądu dokumentów (MultimodalDocsPreview w
// DocumentWizard.jsx) ani edytora etapów (MultimodalSection, Krok „Towar") —
// oba zależą od realnych danych trasy (legs z from/to/carrier), których
// „Puste szablony" celowo nie zbiera. `visible` steruje wyłącznie animacją
// rozwinięcia (`.wizard-collapse`, ta sama filozofia ruchu co reszta
// kreatora) — treść zostaje zamontowana, żeby nie migotała przy toggle.
export default function MultimodalContractPicker({ visible, contractType, onChange }) {
  const { t } = useTranslation('wizard')

  return (
    <div className={`wizard-collapse mb-5 ${visible ? 'is-open' : ''}`} aria-hidden={!visible}>
      <div>
        <div className="pl-4 border-l-2 border-emerald-400 dark:border-emerald-600">
          <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
            {t('route.multimodalStructure.question')}
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 mb-3">
            {t('route.multimodalStructure.hint')}
          </p>

          <div className="space-y-2">
            {['single', 'separate'].map(opt => {
              const active = contractType === opt
              return (
                <label
                  key={opt}
                  className={`flex items-start gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-colors
                    ${active
                      ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'}`}
                >
                  <input
                    type="radio"
                    name="multimodalContractType"
                    className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer flex-shrink-0"
                    checked={active}
                    onChange={() => onChange(opt)}
                  />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${active ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-800 dark:text-slate-200'}`}>
                      {t(`route.multimodalStructure.${opt}.title`)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      {t(`route.multimodalStructure.${opt}.desc`)}
                    </p>
                    <p className={`text-xs font-medium mt-1 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}>
                      {t(`route.multimodalStructure.${opt}.consequence`)}
                    </p>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
