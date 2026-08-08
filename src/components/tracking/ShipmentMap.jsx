import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AttributionControl, MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useTranslation } from 'react-i18next'
import { MapPin, Maximize2 } from 'lucide-react'
import Modal from '../ui/Modal'
import 'leaflet/dist/leaflet.css'

// Własny komponent mapy trasy — rysuje GeoJSON zwrócony przez backend
// (GET /ocean/shipments/{id}/geojson, przycięty w api/_lib/shipsgo.js →
// trimGeojson). Zero domyślnych niebieskich znaczników Leaflet: markery to
// własne div-iconki w kolorze akcentu.
//
// Cała zakładka „Śledzenie ładunku" jest w ciemnym pomarańczu (patrz
// TrackingPage.jsx) — jeden akcent, dziś tylko w widoku „Numer kontenera"
// (ContainerDetail.jsx; „Lista przesyłek"/RealShipmentDetail USUNIĘTA
// 2026-08-08). `accent` zostaje jako prop (nie stała klasa) — tania furtka
// na przyszłość, ten sam wzorzec co ACCENTS w ContainerTrackerBlock.jsx.
//
// ── Dwa warianty (2026-08-07) ──────────────────────────────────────────────
//   full    – dotychczasowe zachowanie: mapa osadzona w karcie, przeciąganie
//             i kontrolka zoomu działają, kółko myszy przewija stronę
//   preview – niski podgląd BEZ żadnej interakcji z mapą; cała powierzchnia
//             jest jednym obszarem klikalnym, który otwiera tę samą mapę
//             w oknie modalnym (pełna interakcja, także zoom kółkiem)
// Zastąpiło to odnośnik wyprowadzający użytkownika na zewnętrzną mapę ShipsGo.
//
// ── Znaczenie properties.status ────────────────────────────────────────────
//   PAST    – odcinek przebyty: linia ciągła w kolorze akcentu
//   CURRENT – odcinek bieżący: linia ciągła + marker pozycji statku
//             z properties.current.coordinates (MOŻE być null, obsłużone)
//   FUTURE  – odcinek przed nami: linia przerywana, kolor przygaszony
// Brak statusu (starsze migawki zapisane przed rozszerzeniem trimGeojson)
// rysujemy jak PAST, żeby stara trasa nadal wyglądała sensownie.

const ACCENT_HEX = { orange: '#c2410c' }
const MUTED_HEX = '#94a3b8' // slate-400 — odcinki przyszłe

// Wysokość podglądu: widać kształt trasy, a karta nie zamienia się w mapę.
const PREVIEW_HEIGHT = 'h-40 sm:h-48'
// Wysokość mapy w oknie modalnym. Karta modalu ma max-h-[90vh], więc niższa
// wartość na małych ekranach chroni przed wewnętrznym paskiem przewijania.
const MODAL_HEIGHT = 'h-[60vh] sm:h-[70vh]'

function portIconHtml(color, filled) {
  return filled
    ? `<div style="width:22px;height:22px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35);"></div>`
    : `<div style="width:22px;height:22px;border-radius:9999px;background:white;border:3px solid ${color};box-shadow:0 1px 4px rgba(0,0,0,.35);"></div>`
}

function vesselIconHtml(color) {
  return `<div style="width:28px;height:28px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M12 2 L20 21 L12 17 L4 21 Z"/></svg>
  </div>`
}

function buildIcon(html, size) {
  return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -size / 2] })
}

function isVesselPoint(properties) {
  const type = (properties?.type || '').toLowerCase()
  return type.includes('vessel') || type.includes('position') || type.includes('current')
}

// react-leaflet nie dopasowuje widoku do zawartości automatycznie — osobny
// komponent w drzewie mapy, żeby użyć useMap() (musi być potomkiem MapContainer).
//
// Dopasowanie widoku POPRZEDZA invalidateSize(), bo Leaflet odczytuje rozmiar
// kontenera w chwili inicjalizacji: mapa montowana razem z otwarciem okna
// modalnego potrafi policzyć go, zanim przeglądarka ułoży kartę. Objawy to
// szare pola zamiast kafelków i zły zoom (fitBounds dopasowany do błędnych
// wymiarów), więc samo invalidateSize po fakcie by nie wystarczyło.
// Zmiany rozmiaru kontenera (obrót telefonu, zmiana okna) śledzi ResizeObserver
// — API przeglądarki, bez nowej zależności.
function FitBounds({ points }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return undefined

    let frame = null
    const apply = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        frame = null
        map.invalidateSize({ animate: false })
        if (points.length === 1) {
          map.setView(points[0], 5)
          return
        }
        map.fitBounds(L.latLngBounds(points), { padding: [32, 32] })
      })
    }

    apply()

    if (typeof ResizeObserver === 'undefined') return () => { if (frame) cancelAnimationFrame(frame) }
    const observer = new ResizeObserver(apply)
    observer.observe(map.getContainer())
    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [map, points])

  return null
}

// [lng, lat] z GeoJSON → [lat, lng] oczekiwane przez Leaflet.
function toLatLng(coord) {
  return [coord[1], coord[0]]
}

// Sama mapa. `interactive` steruje WSZYSTKIMI uchwytami naraz, żeby podgląd nie
// mógł przypadkiem zostać w połowie interaktywny. Przy interactive=false Leaflet
// nie dokłada też tabindex na kontener ani na markery, więc podgląd ma dokładnie
// jeden punkt zatrzymania tabulatora: obszar klikalny wokół niego.
//
// `isolate` na kontenerze jest KONIECZNE, nie kosmetyczne: Leaflet nadaje swoim
// warstwom z-index do 800 (kafelki 200, markery 600, kontrolki 800), a okno
// modalne ma z-50. Bez własnego kontekstu nakładania mapa stojąca na stronie
// przebija się NAD otwarte okno modalne (potwierdzone na zrzucie ekranu:
// widoczne dwie kontrolki zoomu, jedna z mapy pod spodem).
function MapCanvas({ height, data, color, icons, interactive, wheelZoom }) {
  const { routeLines, markers, vesselMarkers, allPoints } = data

  return (
    <div
      className={`${height} isolate w-full rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700
        dark:[&_.leaflet-tile-pane]:invert dark:[&_.leaflet-tile-pane]:brightness-90 dark:[&_.leaflet-tile-pane]:contrast-90 dark:[&_.leaflet-tile-pane]:hue-rotate-180`}
    >
      <MapContainer
        center={allPoints[0]}
        zoom={4}
        scrollWheelZoom={!!wheelZoom}
        dragging={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
        zoomControl={interactive}
        // Domyślna kontrolka wyłączona, bo jej prefiksu nie da się ustawić przez
        // MapContainer. Własna niżej, z `prefix={false}`.
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        {/* `prefix={false}` usuwa dopisek „Leaflet" wraz z flagą Ukrainy, którą
            biblioteka wstawia od wersji 1.8. Atrybucja OpenStreetMap ZOSTAJE:
            wymaga jej licencja ODbL kafelków. Atrybucja samego Leafletu jest
            dobrowolna, bo BSD-2 wymaga noty w kodzie źródłowym, nie na ekranie. */}
        <AttributionControl position="bottomright" prefix={false} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routeLines.map(({ line, status }, i) => {
          const future = status === 'FUTURE'
          return (
            <Polyline
              key={i}
              positions={line}
              interactive={interactive}
              pathOptions={{
                color: future ? MUTED_HEX : color,
                weight: 3,
                opacity: future ? 0.7 : 0.85,
                dashArray: future ? '6 7' : undefined,
              }}
            />
          )
        })}

        {markers.map((m, i) => (
          <Marker
            key={`p${i}`}
            position={m.point}
            icon={m.vessel ? icons.vessel : m.future ? icons.portFuture : icons.port}
            interactive={interactive}
            keyboard={interactive}
          >
            {m.name && interactive && <Popup>{m.name}</Popup>}
          </Marker>
        ))}

        {vesselMarkers.map((m, i) => (
          <Marker
            key={`v${i}`}
            position={m.point}
            icon={icons.vessel}
            interactive={interactive}
            keyboard={interactive}
          >
            {(m.vessel || m.voyage) && interactive && (
              <Popup>{[m.vessel, m.voyage].filter(Boolean).join(' · ')}</Popup>
            )}
          </Marker>
        ))}

        <FitBounds points={allPoints} />
      </MapContainer>
    </div>
  )
}

export default function ShipmentMap({ geojson, accent = 'orange', fallbackPorts, height = 'h-64 sm:h-80', variant = 'full' }) {
  const { t } = useTranslation('pages')
  const [zoomed, setZoomed] = useState(false)
  const triggerRef = useRef(null)

  const color = ACCENT_HEX[accent] || ACCENT_HEX.orange
  const icons = useMemo(() => ({
    port: buildIcon(portIconHtml(color, true), 22),
    portFuture: buildIcon(portIconHtml(color, false), 22),
    vessel: buildIcon(vesselIconHtml(color), 28),
  }), [color])

  const data = useMemo(() => {
    const features = geojson?.features || []
    const routeLines = []
    const markers = []
    const vesselMarkers = []
    const allPoints = []

    for (const f of features) {
      const { type, coordinates } = f.geometry
      const status = f.properties?.status || null

      if (type === 'Point') {
        const point = toLatLng(coordinates)
        allPoints.push(point)
        markers.push({
          point,
          vessel: isVesselPoint(f.properties),
          future: status === 'FUTURE',
          name: f.properties?.name,
        })
      } else if (type === 'LineString' || type === 'MultiLineString') {
        const parts = type === 'LineString' ? [coordinates] : coordinates
        for (const part of parts) {
          const line = part.filter((c) => Array.isArray(c) && c.length >= 2).map(toLatLng)
          if (line.length < 2) continue
          routeLines.push({ line, status })
          allPoints.push(...line)
        }
      }

      // Pozycja statku przychodzi w properties odcinka CURRENT, nie jako
      // osobny Feature. Bywa null i to normalny stan (armator nie podał).
      if (status === 'CURRENT' && f.properties?.current) {
        const point = toLatLng(f.properties.current)
        vesselMarkers.push({
          point,
          vessel: f.properties.vessel,
          voyage: f.properties.voyage,
        })
        allPoints.push(point)
      }
    }
    return { routeLines, markers, vesselMarkers, allPoints }
  }, [geojson])

  // Po zamknięciu okna ogniskowanie wraca na podgląd, z którego je otwarto.
  // requestAnimationFrame, bo w tej samej klatce portal modalu jest jeszcze
  // w drzewie i fokus by do niego wrócił.
  const closeZoom = useCallback(() => {
    setZoomed(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }, [])

  function handleTriggerKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault()
      setZoomed(true)
    }
  }

  // Status NEW/INPROGRESS albo pusty geojson: prostokąt z informacją zamiast
  // pustej mapy świata. Pusta mapa wygląda jak awaria, a to normalny etap.
  // Dotyczy OBU wariantów: bez trasy podgląd nie jest klikalny i nie obiecuje
  // powiększenia, bo nie ma czego powiększać.
  if (data.allPoints.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 p-5">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-400 dark:text-slate-500 shrink-0 mt-0.5" strokeWidth={1.75} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-700 dark:text-slate-200">{t('tracking.map.noDataTitle')}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {fallbackPorts?.from || fallbackPorts?.to
                ? `${fallbackPorts.from || '-'} → ${fallbackPorts.to || '-'}`
                : t('tracking.map.noDataBody')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (variant !== 'preview') {
    return <MapCanvas height={height} data={data} color={color} icons={icons} interactive wheelZoom={false} />
  }

  return (
    <>
      {/* `isolate` tworzy kontekst nakładania: wewnętrzne warstwy Leafleta
          (kafelki 200, markery 600, kontrolki 800) nie mogą wtedy przebić się
          nad okno modalne, które ma z-50 i siedzi w portalu na body. */}
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-label={t('tracking.map.previewAria')}
        onClick={() => setZoomed(true)}
        onKeyDown={handleTriggerKeyDown}
        className="relative isolate w-full cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
      >
        <MapCanvas height={PREVIEW_HEIGHT} data={data} color={color} icons={icons} interactive={false} wheelZoom={false} />

        {/* Warstwa przechwytująca kliknięcia: mapa pod spodem nie dostaje
            żadnego zdarzenia, a kółko myszy przewija stronę, bo overlay nie ma
            uchwytu zoomu. Zaczyna się nad kontrolkami Leafleta (z-800). */}
        <div className="absolute inset-0 z-[900] rounded-xl" aria-hidden="true" />

        {/* Wskazówka w prawym GÓRNYM rogu: prawy dolny zajmuje atrybucja
            OpenStreetMap, której zasłonić nie wolno. */}
        <span className="pointer-events-none absolute top-2 right-2 z-[950] inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/85 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-200 shadow-sm">
          <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.75} />
          {t('tracking.map.previewHint')}
        </span>
      </div>

      {zoomed && (
        <Modal title={t('tracking.map.modalTitle')} maxWidth="max-w-5xl" onClose={closeZoom}>
          <MapCanvas height={MODAL_HEIGHT} data={data} color={color} icons={icons} interactive wheelZoom />
        </Modal>
      )}
    </>
  )
}
