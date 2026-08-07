import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Własny komponent mapy trasy — rysuje GeoJSON zwrócony przez backend
// (GET /ocean/shipments/{id}/geojson, przycięty w api/_lib/shipsgo.js →
// trimGeojson). Zero domyślnych niebieskich znaczników Leaflet: markery to
// własne div-iconki w kolorze akcentu.
//
// Cała zakładka „Śledzenie ładunku" jest w ciemnym pomarańczu (patrz
// TrackingPage.jsx) — jeden akcent dla obu widoków (własne przesyłki
// w RealShipmentDetail i zakładka „Numer kontenera"). `accent` zostaje jako
// prop (nie stała klasa) — tania furtka na przyszłość, ten sam wzorzec co
// ACCENTS w ContainerTrackerBlock.jsx.
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
function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 5)
      return
    }
    map.fitBounds(L.latLngBounds(points), { padding: [32, 32] })
  }, [map, points])
  return null
}

// [lng, lat] z GeoJSON → [lat, lng] oczekiwane przez Leaflet.
function toLatLng(coord) {
  return [coord[1], coord[0]]
}

export default function ShipmentMap({ geojson, accent = 'orange', fallbackPorts, height = 'h-64 sm:h-80' }) {
  const { t } = useTranslation('pages')
  const color = ACCENT_HEX[accent] || ACCENT_HEX.orange
  const portIcon = useMemo(() => buildIcon(portIconHtml(color, true), 22), [color])
  const portIconFuture = useMemo(() => buildIcon(portIconHtml(color, false), 22), [color])
  const vesselIcon = useMemo(() => buildIcon(vesselIconHtml(color), 28), [color])

  const { routeLines, markers, vesselMarkers, allPoints } = useMemo(() => {
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

  // Status NEW/INPROGRESS albo pusty geojson: prostokąt z informacją zamiast
  // pustej mapy świata. Pusta mapa wygląda jak awaria, a to normalny etap.
  if (allPoints.length === 0) {
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

  return (
    <div
      className={`${height} w-full rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700
        dark:[&_.leaflet-tile-pane]:invert dark:[&_.leaflet-tile-pane]:brightness-90 dark:[&_.leaflet-tile-pane]:contrast-90 dark:[&_.leaflet-tile-pane]:hue-rotate-180`}
    >
      <MapContainer center={allPoints[0]} zoom={4} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
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
          <Marker key={`p${i}`} position={m.point} icon={m.vessel ? vesselIcon : m.future ? portIconFuture : portIcon}>
            {m.name && <Popup>{m.name}</Popup>}
          </Marker>
        ))}

        {vesselMarkers.map((m, i) => (
          <Marker key={`v${i}`} position={m.point} icon={vesselIcon}>
            {(m.vessel || m.voyage) && (
              <Popup>{[m.vessel, m.voyage].filter(Boolean).join(' · ')}</Popup>
            )}
          </Marker>
        ))}

        <FitBounds points={allPoints} />
      </MapContainer>
    </div>
  )
}
