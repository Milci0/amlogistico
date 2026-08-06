import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink } from 'lucide-react'
import { findCarrierByName, resolveHomeUrl } from '../../data/containerPrefixes'
import { addContainer, getContainer, refreshContainer, removeContainer } from '../../services/containerTrackingRepo'
import { useContainerList, useContainerPolling } from '../../hooks/useContainerTracking'
import { isPendingStatus } from '../../data/containerStatus'
import AlertBox from '../ui/AlertBox'
import ConfirmDialog from '../ui/ConfirmDialog'
import ContainerSearchForm from './ContainerSearchForm'
import ContainerList from './ContainerList'
import ContainerPendingCard from './ContainerPendingCard'
import ContainerDetail from './ContainerDetail'
import CarrierPickerModal from './CarrierPickerModal'

// Zakładka „Numer kontenera" — orkiestracja sześciu stanów z makiety.
//
// Wynik wyszukiwania NIE żyje już wyłącznie w stanie Reacta: każdy sprawdzony
// kontener trafia do naszej bazy i jest podpięty pod konto użytkownika, więc
// odświeżenie strony (F5) go nie gubi. To była główna wada poprzedniej wersji:
// użytkownik tracił dostęp do przesyłki, za którą pobrano już kredyt ShipsGo.
//
// Ciemny pomarańcz w tej zakładce celowo — „Śledzenie ładunku" wisi pod
// „Trasy handlowe" w menu, pokrewny akcent co TradeRoutesPage (/routes), ale
// wyraźnie ciemniejszy (patrz TrackingPage.jsx, komentarz przy TAB_ACCENT).
export default function ContainerLookup() {
  const { t } = useTranslation('pages')
  const { containers, loading, upsert, remove } = useContainerList()

  const [selected, setSelected] = useState(null) // pełne dane otwartego kontenera
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [carrierHint, setCarrierHint] = useState(null) // wyszukiwanie po nazwie linii
  const [refreshing, setRefreshing] = useState(false)
  const [confirm, setConfirm] = useState(null) // { kind: 'remove' | 'newVoyage' }
  const [carrierPicker, setCarrierPicker] = useState(false)
  // Ostatni numer, który w tej sesji przeszedł walidację poprawnie. Trzymany
  // TUTAJ, a nie w formularzu: otwarcie kontenera i powrót do listy
  // przemontowuje formularz, więc jego stan wewnętrzny by przepadł.
  const [lastValidNumber, setLastValidNumber] = useState('')

  // Odświeżenie widoku w tle: polling pyta NASZ endpoint, nie ShipsGo.
  const applyPolled = useCallback((fresh) => {
    setSelected(fresh)
    upsert(fresh)
  }, [upsert])
  const { pollingExhausted } = useContainerPolling(selected, applyPolled)

  async function handleSearch(containerNumber) {
    // Nazwa przewoźnika zamiast numeru („CMA CGM", „maersk") — istniejąca
    // funkcja wyszukiwarki, zachowana. Numer ma zawsze 7 cyfr, więc wejście
    // bez cyfr na pewno nim nie jest.
    setCarrierHint(null)
    setError(null)
    setBusy(true)
    try {
      const res = await addContainer(containerNumber)
      const full = res.container
      setSelected(full)
      upsert(full)
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  // Wejście, które nie wygląda na numer kontenera, obsługujemy bez ruszania
  // backendu: podpowiadamy stronę przewoźnika, jeśli rozpoznamy nazwę.
  function handleRawInput(raw) {
    const carrier = findCarrierByName(raw)
    setCarrierHint(carrier || null)
    return !!carrier
  }

  async function openContainer(item) {
    setError(null)
    setBusy(true)
    try {
      setSelected(await getContainer(item.containerNumber))
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  async function handleRefresh() {
    if (!selected) return
    setRefreshing(true)
    setError(null)
    try {
      const fresh = await refreshContainer(selected.containerNumber)
      setSelected(fresh)
      upsert(fresh)
    } catch (e) {
      setError(e)
    } finally {
      setRefreshing(false)
    }
  }

  // „Usuń z listy" ukrywa wpis u nas i NIE woła DELETE w ShipsGo: tam usunięcie
  // jest nieodwracalne, a ponowne dodanie to nowy kredyt.
  async function handleRemove() {
    const number = selected.containerNumber
    setConfirm(null)
    try {
      await removeContainer(number)
      remove(number)
      setSelected(null)
    } catch (e) {
      setError(e)
    }
  }

  // Nowy rejs dla numeru z zakończonego transportu. Potwierdzenie jest
  // OBOWIĄZKOWE: bez niego użytkownik nie wie, że wydaje kolejny kredyt.
  async function handleStartNewVoyage() {
    const number = selected.containerNumber
    setConfirm(null)
    setBusy(true)
    setError(null)
    try {
      const res = await addContainer(number, { startNewVoyage: true })
      setSelected(res.container)
      upsert(res.container)
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  async function handleCarrierConfirm(scac) {
    const number = selected.containerNumber
    setBusy(true)
    setError(null)
    try {
      const res = await addContainer(number, { carrier: scac, startNewVoyage: true })
      setSelected(res.container)
      upsert(res.container)
      setCarrierPicker(false)
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  // ── Widok szczegółów (stany 3, 5, 5b, 6) ──────────────────────────────────
  if (selected) {
    const pending = !selected.archived && isPendingStatus(selected.status)
    return (
      <div>
        {error && (
          <div className="mb-4">
            <AlertBox type="warning">{error.message}</AlertBox>
          </div>
        )}

        {pending ? (
          <div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-sm text-gray-600 dark:text-slate-300 font-medium hover:text-orange-700 dark:hover:text-orange-400 transition-colors mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
            >
              {t('tracking.container.backToContainers')}
            </button>
            <ContainerPendingCard
              container={selected}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              pollingExhausted={pollingExhausted}
            />
          </div>
        ) : (
          <ContainerDetail
            container={selected}
            onBack={() => setSelected(null)}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            onRemove={() => setConfirm({ kind: 'remove' })}
            onPickCarrier={() => setCarrierPicker(true)}
            onStartNewVoyage={() => setConfirm({ kind: 'newVoyage' })}
          />
        )}

        <ConfirmDialog
          open={confirm?.kind === 'remove'}
          title={t('tracking.container.confirmRemove.title')}
          description={t('tracking.container.confirmRemove.body')}
          confirmLabel={t('tracking.container.confirmRemove.confirm')}
          destructive
          onConfirm={handleRemove}
          onCancel={() => setConfirm(null)}
        />

        <ConfirmDialog
          open={confirm?.kind === 'newVoyage'}
          title={t('tracking.container.confirmNewVoyage.title')}
          description={t('tracking.container.confirmNewVoyage.body')}
          confirmLabel={t('tracking.container.confirmNewVoyage.confirm')}
          onConfirm={handleStartNewVoyage}
          onCancel={() => setConfirm(null)}
        />

        {carrierPicker && (
          <CarrierPickerModal
            containerNumber={selected.containerNumber}
            submitting={busy}
            onCancel={() => setCarrierPicker(false)}
            onConfirm={handleCarrierConfirm}
          />
        )}
      </div>
    )
  }

  // ── Widok główny (stany 1, 2, 4) ──────────────────────────────────────────
  return (
    <div>
      <ContainerSearchForm
        onSubmit={handleSearch}
        onRawInput={handleRawInput}
        busy={busy}
        lastValidNumber={lastValidNumber}
        onValidNumber={setLastValidNumber}
      />

      {error && (
        <div className="mb-5">
          <AlertBox type="warning">{error.message}</AlertBox>
        </div>
      )}

      {carrierHint && (
        <div className="mb-5 space-y-3">
          <AlertBox type="info">{t('tracking.container.nameSearchNote')}</AlertBox>
          <a
            href={resolveHomeUrl(carrierHint)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 p-4 rounded-xl border border-orange-200 dark:border-orange-900 bg-white dark:bg-slate-800 hover:border-orange-600 dark:hover:border-orange-700 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {t('tracking.container.directLinkLabel', { carrier: carrierHint.name })}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-400 font-medium mt-0.5">
                {t('tracking.container.directLinkBadge')}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-orange-600 shrink-0" strokeWidth={1.75} />
          </a>
        </div>
      )}

      <ContainerList containers={containers} loading={loading} onOpen={openContainer} />
    </div>
  )
}
