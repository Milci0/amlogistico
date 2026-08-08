import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Navigation } from 'lucide-react'
import ContainerLookup from '../components/tracking/ContainerLookup'

// Zakładka „Śledzenie ładunku" (wysuwana spod „Trasy handlowe" w menu).
// Do 2026-08-08 miała dwa widoki („Lista przesyłek" — projekcja zestawów
// dokumentów kreatora, i „Numer kontenera" — realny rejestr ShipsGo). „Lista
// przesyłek" USUNIĘTA razem z przełącznikiem — zostaje wyłącznie śledzenie
// po numerze kontenera (patrz ContainerLookup.jsx), jedyny widok tej zakładki.

export default function TrackingPage() {
  const { t } = useTranslation('pages')
  const [searchParams] = useSearchParams()

  // Trwały odnośnik do konkretnego rejsu: /tracking?trackingId=<id>. Tędy
  // wchodzi przycisk z powiadomienia „kontener gotowy do śledzenia".
  const trackingId = searchParams.get('trackingId')

  return (
    <div className="max-w-5xl mx-auto">
      <Helmet>
        <title>{t('tracking.metaTitle')}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="flex items-start gap-4 border border-gray-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-800 mb-6">
        <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/40 dark:to-amber-900/30 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900">
          <Navigation className="w-[26px] h-[26px]" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('tracking.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('tracking.subtitle')}
          </p>
        </div>
      </div>

      <ContainerLookup initialTrackingId={trackingId} />
    </div>
  )
}
