import { useTranslation } from 'react-i18next'
import { ArrowLeft, Ship, Hash, Clock, Repeat, RefreshCw, ExternalLink, AlertCircle, Archive, Loader2 } from 'lucide-react'
import { formatDocumentDate } from '../../utils/formatDate'
import ContainerStatusBadge from './ContainerStatusBadge'
import ContainerRouteBar from './ContainerRouteBar'
import ContainerTimeline from './ContainerTimeline'
import ContainerTrackerBlock from './ContainerTrackerBlock'
import ShipmentMap from './ShipmentMap'
import AlertBox from '../ui/AlertBox'

// Stany 5, 5b i 6 makiety w jednym komponencie, bo różnią się nagłówkiem
// i jednym blokiem, a nie budową:
//   5  – pełne dane rejsu
//   5b – to samo, ale z paskiem „dane archiwalne" i przyciskiem nowego rejsu
//   6  – status UNTRACKED: zamiast trasy blok z przyczynami i dwiema akcjami

function Tile({ icon: Icon, label, value, empty }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-gray-400 dark:text-slate-500 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" strokeWidth={2} />}
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5 truncate">
        {value || <span className="text-gray-400 dark:text-slate-500">{empty}</span>}
      </p>
    </div>
  )
}

export default function ContainerDetail({
  container,
  onBack,
  onRefresh,
  refreshing,
  onRemove,
  onPickCarrier,
  onStartNewVoyage,
}) {
  const { t } = useTranslation('pages')
  const s = container.snapshot || {}
  const untracked = container.status === 'UNTRACKED'
  const archived = !!container.archived

  const transhipment = s.transhipments?.length
    ? `${s.transhipments.length} · ${s.transhipments.map((x) => x.name).filter(Boolean).join(', ')}`
    : null

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-300 font-medium hover:text-orange-700 dark:hover:text-orange-400 transition-colors mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
        {t('tracking.container.backToContainers')}
      </button>

      {/* Stan 5b: pasek nad kartą. Dane archiwalne NIGDY nie pokazują się bez
          adnotacji — pokazanie starej trasy jako bieżącej byłoby dla spedytora
          gorsze niż brak danych. */}
      {archived && (
        <div className="mb-4">
          <AlertBox type="info" title={t('tracking.container.archived.title')}>
            {container.discardedAt
              ? t('tracking.container.archived.bodyWithDate', { date: formatDocumentDate(container.discardedAt) })
              : t('tracking.container.archived.body')}
          </AlertBox>
        </div>
      )}

      <div className="border border-orange-300 dark:border-orange-900 rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20">
          <div className="min-w-0">
            <p className="text-base font-mono tracking-wider font-semibold text-orange-900 dark:text-orange-200">
              {container.containerNumber}
            </p>
            <p className="text-xs text-orange-800/80 dark:text-orange-300/70 mt-0.5">
              {describeHeader(t, container, s)}
            </p>
          </div>
          <ContainerStatusBadge status={container.status} archived={archived} />
        </div>

        <div className="p-5 space-y-6 bg-white dark:bg-slate-800">
          {untracked ? (
            <UntrackedBlock t={t} onPickCarrier={onPickCarrier} onRemove={onRemove} />
          ) : (
            <>
              <ContainerRouteBar
                loading={s.loadingLocation}
                discharge={s.dischargeLocation}
                loadingDate={s.loadingDate}
                dischargeDate={s.dischargeDate}
              />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Tile icon={Ship} label={t('tracking.container.shipsgo.vessel')} value={s.vessel} empty={t('tracking.container.shipsgo.etaUnknown')} />
                <Tile icon={Hash} label={t('tracking.voyageFields.voyageNo')} value={s.voyageNo} empty={t('tracking.container.shipsgo.etaUnknown')} />
                <Tile
                  icon={Clock}
                  label={t('tracking.map.transitProgress')}
                  value={typeof s.transitTime === 'number' ? t('tracking.map.transitDays', { count: s.transitTime }) : null}
                  empty={t('tracking.container.shipsgo.etaUnknown')}
                />
                <Tile icon={Repeat} label={t('tracking.transshipments')} value={transhipment} empty={t('tracking.noTransshipments')} />
              </div>

              <ShipmentMap
                geojson={container.geojson}
                accent="orange"
                fallbackPorts={{ from: s.loadingLocation?.name, to: s.dischargeLocation?.name }}
              />

              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  {t('tracking.container.shipsgo.timelineTitle')}
                </p>
                <ContainerTimeline
                  movements={s.movements}
                  dischargeDate={s.dischargeDate}
                  dischargeDateInitial={s.dischargeDateInitial}
                />
              </div>
            </>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {archived ? (
              <button
                type="button"
                onClick={onStartNewVoyage}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-orange-700 hover:bg-orange-800 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                {t('tracking.container.archived.startNew')}
              </button>
            ) : (
              !untracked && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 hover:text-orange-700 dark:hover:text-orange-400 disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.75} />
                  {refreshing ? t('tracking.refreshing') : t('tracking.refresh')}
                </button>
              )
            )}

            {!untracked && (
              <button
                type="button"
                onClick={onRemove}
                className="text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
              >
                {t('tracking.container.removeFromList')}
              </button>
            )}

            {/* Pełna mapa ShipsGo jako opcja poboczna, celowo dyskretna: nasza
                mapa jest głównym widokiem, a tamta wyprowadza użytkownika z aplikacji. */}
            {container.mapToken && container.shipsgoId && (
              <a
                href={`https://map.shipsgo.com/ocean/shipments/${container.shipsgoId}?token=${container.mapToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 hover:text-orange-700 dark:hover:text-orange-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
              >
                {t('tracking.map.openInShipsgo')}
                <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Poprzednie rejsy tego kontenera, do których użytkownik ma dostęp.
          Stary rekord zostaje w bazie po utworzeniu nowego śledzenia. */}
      {container.previousVoyages?.length > 0 && (
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 dark:text-slate-400">
          <Archive className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.75} />
          <p>{t('tracking.container.previousVoyages', { count: container.previousVoyages.length })}</p>
        </div>
      )}

      {/* Linki do trackera przewoźnika i agregatorów — istniejący blok, przydatny
          zwłaszcza wtedy, gdy ShipsGo nie ma danych. */}
      <div className="mt-6">
        <ContainerTrackerBlock containerNo={container.containerNumber} showCheckDigitWarning={false} accent="orange" />
      </div>
    </div>
  )
}

// Nagłówek: przewoźnik, liczba i typ kontenerów, czas ostatniej aktualizacji.
function describeHeader(t, container, s) {
  const parts = []
  if (container.carrier?.name) parts.push(container.carrier.name)
  if (s.containerCount) {
    parts.push(t('tracking.container.containerCount', { count: s.containerCount, type: s.containerType || '' }).trim())
  }
  if (container.updatedAt) {
    parts.push(t('tracking.container.updatedAt', { date: formatDocumentDate(container.updatedAt, true) }))
  }
  return parts.join(' · ')
}

// Stan 6: trzy realne przyczyny i dwie akcje. Kredyt został zużyty, więc nie
// można udawać, że nic się nie stało — ekran mówi wprost, co jest przyczyną
// i co użytkownik może z tym zrobić.
function UntrackedBlock({ t, onPickCarrier, onRemove }) {
  return (
    <div>
      <div className="flex gap-3 px-4 py-3 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={1.75} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-red-900 dark:text-red-200">
            {t('tracking.container.untracked.title')}
          </p>
          <ul className="text-sm text-red-800 dark:text-red-300 mt-2 space-y-1 list-disc list-inside">
            <li>{t('tracking.container.untracked.reason1')}</li>
            <li>{t('tracking.container.untracked.reason2')}</li>
            <li>{t('tracking.container.untracked.reason3')}</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          type="button"
          onClick={onPickCarrier}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-orange-700 hover:bg-orange-800 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          {t('tracking.container.untracked.pickCarrier')}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          {t('tracking.container.removeFromList')}
        </button>
      </div>
    </div>
  )
}

// Spinner używany przez wywołującego przy przejściu do szczegółów.
export function ContainerDetailSkeleton() {
  return (
    <div className="flex items-center justify-center py-16 text-gray-400 dark:text-slate-500">
      <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.75} />
    </div>
  )
}
