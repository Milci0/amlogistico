import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Własny komponent mapy trasy — rysuje GeoJSON zwrócony przez backend
// (GET /ocean/shipments/{id}/geojson, przycięty w api/_lib/shipsgo.js →
// trimGeojson). Zero domyślnych niebieskich znaczników Leaflet: markery to
// własne div-iconki w kolorze akcentu (emerald dla własnych przesyłek w
// RealShipmentDetail, amber dla wolnego wyszukiwania w ShipsGoLookupResult —
// ten sam podział co reszta zakładki „Śledzenie ładunku").
//
// Kształt GeoJSON-a jest NIEZWERYFIKOWANY bez realnego tokena ShipsGo (patrz
// uwaga przy trimGeojson) — klasyfikacja punktów jest więc obronna: Point z
// properties.type zawierającym „vessel"/„position" dostaje znacznik pozycji,
// każdy inny Point to port/węzeł trasy. Brak dopasowania nie wywala mapy,
// tylko renderuje punkt jako port.

const ACCENT_HEX = { emerald: '#059669', amber: '#d97706' }

function portIconHtml(color) {
  return `<div style="width:22px;height:22px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35);"></div>`
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

export default function ShipmentMap({ geojson, accent = 'emerald', fallbackPorts, height = 'h-64 sm:h-80' }) {
  const { t } = useTranslation('pages')
  const color = ACCENT_HEX[accent] || ACCENT_HEX.emerald
  const portIcon = useMemo(() => buildIcon(portIconHtml(color), 22), [color])
  const vesselIcon = useMemo(() => buildIcon(vesselIconHtml(color), 28), [color])

  const { routeLines, markers, allPoints } = useMemo(() => {
    const features = geojson?.features || []
    const routeLines = []
    const markers = []
    const allPoints = []

    for (const f of features) {
      const { type, coordinates } = f.geometry
      if (type === 'Point') {
        const point = [coordinates[1], coordinates[0]]
        allPoints.push(point)
        markers.push({ point, vessel: isVesselPoint(f.properties), name: f.properties?.name })
      } else if (type === 'LineString') {
        const line = coordinates.map(([lng, lat]) => [lat, lng])
        routeLines.push(line)
        allPoints.push(...line)
      } else if (type === 'MultiLineString') {
        for (const part of coordinates) {
          const line = part.map(([lng, lat]) => [lat, lng])
          routeLines.push(line)
          allPoints.push(...line)
        }
      }
    }
    return { routeLines, markers, allPoints }
  }, [geojson])

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
        {routeLines.map((line, i) => (
          <Polyline key={i} positions={line} pathOptions={{ color, weight: 3, opacity: 0.85 }} />
        ))}
        {markers.map((m, i) => (
          <Marker key={i} position={m.point} icon={m.vessel ? vesselIcon : portIcon}>
            {m.name && <Popup>{m.name}</Popup>}
          </Marker>
        ))}
        <FitBounds points={allPoints} />
      </MapContainer>
    </div>
  )
}
