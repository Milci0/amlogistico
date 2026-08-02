import { Helmet } from 'react-helmet-async'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { setPendingIncoterm } from '../services/pendingIncoterm'

// Wyłącznie dane strukturalne reguły: gałąź transportu, podział kosztów
// sprzedający/kupujący (sp/bp), rodzaj ostrzeżenia i dopuszczalne środki
// transportu. Cała treść (nazwa, opis, obowiązki, ostrzeżenie) jest
// w tłumaczeniach: namespace `incoterms`, klucz `rules.<CODE>`.
const DATA = {
  EXW: { type: 'land', sp: 4, bp: 96, warnType: 'warn', modes: ['road', 'sea', 'air', 'rail'] },
  FCA: { type: 'land', sp: 28, bp: 72, warnType: 'info', modes: ['road', 'sea', 'air', 'rail'] },
  CPT: { type: 'land', sp: 45, bp: 55, warnType: 'warn', modes: ['road', 'sea', 'air'] },
  CIP: { type: 'land', sp: 70, bp: 30, warnType: 'info', modes: ['road', 'sea', 'air'] },
  DAP: { type: 'land', sp: 82, bp: 18, warnType: 'warn', modes: ['road', 'sea', 'air'] },
  DPU: { type: 'land', sp: 90, bp: 10, warnType: 'info', modes: ['road', 'sea', 'air'] },
  DDP: { type: 'land', sp: 97, bp: 3, warnType: 'warn', modes: ['road', 'sea', 'air'] },
  FAS: { type: 'sea', sp: 22, bp: 78, warnType: 'warn', modes: ['sea', 'inland'] },
  FOB: { type: 'sea', sp: 35, bp: 65, warnType: 'warn', modes: ['sea', 'inland'] },
  CFR: { type: 'sea', sp: 50, bp: 50, warnType: 'warn', modes: ['sea', 'inland'] },
  CIF: { type: 'sea', sp: 58, bp: 42, warnType: 'warn', modes: ['sea', 'inland'] },
}

const LIST = Object.entries(DATA).map(([code, d]) => ({ code, ...d }))


function barStyle(pct) {
  if (pct >= 90) return { color: '#D85A30', key: 'max' }
  if (pct >= 80) return { color: '#D85A30', key: 'veryHigh' }
  if (pct >= 60) return { color: '#EF9F27', key: 'high' }
  if (pct >= 45) return { color: '#EF9F27', key: 'medium' }
  if (pct >= 20) return { color: '#639922', key: 'low' }
  return { color: '#1D9E75', key: 'min' }
}

function MiniBar({ pct, label }) {
  const { t } = useTranslation('incoterms')
  const s = barStyle(pct)
  return (
    <div className="mb-1 last:mb-0">
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold" style={{ color: s.color }}>{t(`page.risk.${s.key}`)}</span>
      </div>
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
      </div>
    </div>
  )
}

function IconCheck({ color }) {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function DetailPanel({ code, onClose }) {
  const { t } = useTranslation('incoterms')
  const d = DATA[code]
  const rule = t(`rules.${code}`, { returnObjects: true })
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (ref.current) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
    }
  }, [code])

  // /incoterms jest za RequireAuth — user jest tu zawsze zalogowany, więc od razu
  // na wybór ścieżki (jak „Rozpocznij" na stronie głównej dla zalogowanego usera).
  function handleUseInOrder() {
    setPendingIncoterm(code)
    navigate('/wybor-sciezki')
  }

  const { dark } = useTheme()
  const sellerDominant = d.sp >= d.bp
  // W ciemnym motywie te same barwy (bursztynowa/zielona) w bardziej nasyconej,
  // ciemniejszej wersji — jasne pastele z jasnego motywu ginęły na granatowym tle.
  const AMBER = dark ? { bg: '#7C4A0A', color: '#FDE9C8' } : { bg: '#FAEEDA', color: '#633806' }
  const TEAL  = dark ? { bg: '#0F6B54', color: '#D3FBEE' } : { bg: '#E1F5EE', color: '#085041' }
  const sSide = sellerDominant ? AMBER : TEAL
  const bSide = sellerDominant ? TEAL : AMBER

  return (
    <div
      ref={ref}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-4"
    >
      {/* Nagłówek */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{code}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{d.full}</div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
            d.type === 'land'
              ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          }`}>
            {d.type === 'land' ? t('page.typeLand') : t('page.typeSea')}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            aria-label="Zamknij"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* CTA: użyj w nowym zleceniu */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
        <p className="text-xs text-slate-600 dark:text-slate-300">
          {t('page.ctaQuestionPrefix')}{' '}
          <span className="font-semibold text-slate-800 dark:text-white">{code}</span>{' '}
          {t('page.ctaQuestionSuffix')}
        </p>
        <button
          onClick={handleUseInOrder}
          className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap"
        >
          {t('page.cta')}
        </button>
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-700 mb-4" />

      {/* Pasek ryzyka */}
      <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
        Punkt przeniesienia ryzyka
      </div>
      <div className="flex h-8 rounded-lg overflow-hidden mb-3">
        <div
          className="flex items-center justify-center text-xs font-semibold transition-all"
          style={{ width: `${d.sp}%`, background: sSide.bg, color: sSide.color }}
        >
          {d.sp > 15 ? t('page.seller') : t('page.sellerShort')}
        </div>
        <div
          className="flex items-center justify-center text-xs font-semibold transition-all"
          style={{ width: `${d.bp}%`, background: bSide.bg, color: bSide.color }}
        >
          {d.bp > 15 ? t('page.buyer') : t('page.buyerShort')}
        </div>
      </div>
      <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 mb-5">
        <IconPin />
        <span>{rule.pt}</span>
      </div>

      {/* Obowiązki */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">
            {t('page.sellerResponsible')}
          </div>
          <div className="space-y-1.5">
            {rule.sl.map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <IconCheck color="#1D9E75" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide mb-2">
            {t('page.buyerResponsible')}
          </div>
          <div className="space-y-1.5">
            {rule.bl.map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <IconCheck color="#D85A30" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ostrzeżenie / info */}
      {rule.warn && (
        <div className={`flex items-start gap-3 p-3 rounded-r-lg text-sm leading-relaxed mb-4 border-l-[3px] ${
          d.warnType === 'info'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-slate-600 dark:text-slate-300'
            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 text-slate-600 dark:text-slate-300'
        }`}>
          <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${d.warnType === 'info' ? 'text-emerald-500' : 'text-amber-400'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {d.warnType === 'info'
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            }
          </svg>
          <span>{rule.warn}</span>
        </div>
      )}

      {/* Chipy trybów transportu */}
      <div className="flex flex-wrap gap-2">
        {d.modes.map(m => (
          <span key={m} className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
            {t(`modes.${m}`)}
          </span>
        ))}
      </div>
    </div>
  )
}

const FILTER_IDS = ['all', 'sea', 'land']

export default function IncotermsPage() {
  const { t } = useTranslation('incoterms')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const visible = filter === 'all' ? LIST : LIST.filter(i => i.type === filter)

  function handleSelect(code) {
    setSelected(prev => prev === code ? null : code)
  }

  function handleFilter(id) {
    setFilter(id)
    setSelected(null)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Helmet>
        <title>{t('page.metaTitle')}</title>
        <meta name="description" content={t('page.metaDescription')} />
      </Helmet>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Incoterms 2020</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('page.hint')}
        </p>
      </div>

      {/* Filtry */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTER_IDS.map(id => (
          <button
            key={id}
            onClick={() => handleFilter(id)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-all ${
              filter === id
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-600 font-medium'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400'
            }`}
          >
            {t(`page.filters.${id}`)}
          </button>
        ))}
      </div>

      {/* Siatka kart */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-3">
        {visible.map(item => (
          <button
            key={item.code}
            onClick={() => handleSelect(item.code)}
            className={`text-left bg-white dark:bg-slate-800 border rounded-xl p-3.5 transition-all cursor-pointer ${
              selected === item.code
                ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm ring-1 ring-emerald-400'
                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-lg font-bold ${selected === item.code ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                {item.code}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                item.type === 'land'
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              }`}>
                {item.type === 'land' ? t('page.typeLandShort') : t('page.typeSea')}
              </span>
            </div>
            <p className={`text-[11px] mb-3 leading-snug ${selected === item.code ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
              {t(`rules.${item.code}.name`)}
            </p>
            <MiniBar pct={item.sp} label={t('page.seller')} />
            <MiniBar pct={item.bp} label={t('page.buyer')} />
          </button>
        ))}
      </div>

      {/* Panel szczegółów */}
      {selected && DATA[selected] && (
        <DetailPanel key={selected} code={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
