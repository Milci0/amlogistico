import { useTranslation } from 'react-i18next'
import PlaceholderPage from './PlaceholderPage'

// PlaceholderPage dostaje tytuł i opis jako zwykłe stringi (jest używana też
// z gotowym tekstem). Trasy w App.jsx nie mogą wołać hooka, więc tłumaczenie
// kluczy odbywa się w tym cienkim opakowaniu.
export default function TranslatedPlaceholder({ titleKey, descriptionKey }) {
  const { t } = useTranslation('pages')

  return (
    <PlaceholderPage
      title={t(titleKey)}
      description={descriptionKey ? t(descriptionKey) : undefined}
    />
  )
}
