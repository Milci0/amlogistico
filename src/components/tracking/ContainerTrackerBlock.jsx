import { useTranslation } from 'react-i18next'
import { identifyContainer } from '../../utils/containerNumber'
import AlertBox from '../ui/AlertBox'

// Blok „kontener leasingowany / nierozpoznane" dla DANEGO numeru kontenera —
// WSPÓLNY dla ContainerLookup.jsx (wyszukiwarka w zakładce „Śledzenie ładunku")
// i widoku szczegółów przesyłki (numer wzięty z zapisanego zestawu dokumentów).
// Rozpoznawanie linii NIE jest tu duplikowane względem ContainerLookup — oba
// miejsca wołają identifyContainer().
//
// showCheckDigitWarning=false w widoku przesyłki (numer pochodzi z zapisanych
// danych, nie ze świeżo wpisywanego pola) — zostaje jako przełącznik, bo
// literówka w kreatorze też jest możliwa i warto ją sygnalizować.
//
// Blok „rozpoznano linię + link do trackera przewoźnika" i sekcja „Tracking
// aggregators" USUNIĘTE (2026-08-07) — pochodziły z okresu przed integracją
// z ShipsGo API, dziś zbędne obok realnego śledzenia (ShipsGoLookupResult).

export default function ContainerTrackerBlock({ containerNo, showCheckDigitWarning = true }) {
  const { t } = useTranslation('pages')
  const result = identifyContainer(containerNo)

  return (
    <div className="space-y-4">
      {showCheckDigitWarning && result.valid === false && (
        <AlertBox type="warning">{t('tracking.container.checkDigitWarning')}</AlertBox>
      )}

      {result.carrier?.type === 'lessor' && (
        <AlertBox type="warning">
          {t('tracking.container.leased', { lessor: result.carrier.name })}
        </AlertBox>
      )}

      {!result.carrier && (
        <AlertBox type="info">{t('tracking.container.unrecognized')}</AlertBox>
      )}
    </div>
  )
}
