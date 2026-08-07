import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generateGrid, probePosition } from '../generators/calibrate'

const TEMPLATES = [
  { label: 'CMR (List Przewozowy)',          path: '/templates/eu/land/01_CMR_List_Przewozowy.pdf' },
  { label: 'Packing List',                   path: '/templates/eu/common/02_Packing_List.pdf' },
  { label: 'Faktura Handlowa',               path: '/templates/eu/common/03_Faktura_Handlowa.pdf' },
  { label: 'Faktura Proforma',               path: '/templates/eu/common/04_Faktura_Proforma.pdf' },
  { label: 'Bill of Lading',                 path: '/templates/eu/sea/05_Bill_of_Lading.pdf' },
  { label: 'Sea Waybill',                    path: '/templates/eu/sea/26_Sea_Waybill.pdf' },
  { label: 'Zlecenie Transportowe',          path: '/templates/eu/land/09_Zlecenie_Transportowe.pdf' },
  { label: 'Protokol Odbioru (POD)',         path: '/templates/eu/land/10_Protokol_Odbioru_POD.pdf' },
  { label: 'Multimodal Transport Document',  path: '/templates/eu/common/28_Multimodal_Transport_Document.pdf' },
]

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100'

export default function CalibratePage() {
  const { t } = useTranslation('pages')
  const [template, setTemplate] = useState(TEMPLATES[0].path)
  const [probeX, setProbeX]     = useState('35')
  const [probeY, setProbeY]     = useState('125')
  const [probeText, setProbeText] = useState('TUTAJ')
  const [probeSize, setProbeSize] = useState('9')
  const [loading, setLoading]   = useState('')
  const [error, setError]       = useState('')

  async function run(fn, label) {
    setLoading(label)
    setError('')
    try { await fn() }
    catch (e) { setError(e.message) }
    finally { setLoading('') }
  }

  return (
    <div className="min-h-dvh bg-gray-50 p-8">
      <div className="max-w-xl mx-auto">

        {/* Nagłówek */}
        <div className="mb-6">
          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded mb-2">
            {t('calibrate.devTool')}
          </span>
          <h1 className="text-2xl font-bold text-gray-900">{t('calibrate.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('calibrate.subtitle')}
          </p>
        </div>

        {/* Wybór szablonu */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('calibrate.template')}</label>
          <select className={input} value={template} onChange={e => setTemplate(e.target.value)}>
            {TEMPLATES.map(t => (
              <option key={t.path} value={t.path}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Sekcja: Siatka */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-1">{t('calibrate.gridTitle')}</h2>
          <p className="text-xs text-gray-400 mb-4">
            {t('calibrate.gridHint')}
          </p>
          <button
            onClick={() => run(() => generateGrid(template), 'grid')}
            disabled={!!loading}
            className="w-full bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            {loading === 'grid' ? t('calibrate.generating') : t('calibrate.downloadGrid')}
          </button>
        </div>

        {/* Sekcja: Celownik */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-1">{t('calibrate.probeTitle')}</h2>
          <p className="text-xs text-gray-400 mb-4">
            {t('calibrate.probeHint')}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('calibrate.x')}</label>
              <input type="number" className={input} value={probeX} onChange={e => setProbeX(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('calibrate.y')}</label>
              <input type="number" className={input} value={probeY} onChange={e => setProbeY(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('calibrate.testText')}</label>
              <input type="text" className={input} value={probeText} onChange={e => setProbeText(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('calibrate.size')}</label>
              <input type="number" className={input} value={probeSize} onChange={e => setProbeSize(e.target.value)} />
            </div>
          </div>

          <button
            onClick={() => run(
              () => probePosition(template, Number(probeX), Number(probeY), probeText, Number(probeSize)),
              'probe'
            )}
            disabled={!!loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            {loading === 'probe' ? t('calibrate.generating') : t('calibrate.downloadProbe')}
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Instrukcja */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mt-2">
          <p className="text-xs font-semibold text-blue-700 mb-2">{t('calibrate.howToTitle')}</p>
          <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
            <li>{t('calibrate.step1')}</li>
            <li>{t('calibrate.step2')}</li>
            <li>{t('calibrate.step3')}</li>
            <li>{t('calibrate.step4')}</li>
            <li>
              {t('calibrate.step5prefix')}{' '}
              <code className="bg-blue-100 px-1 rounded">src/generators/fillXxx.js</code>.
            </li>
          </ol>
        </div>

      </div>
    </div>
  )
}
