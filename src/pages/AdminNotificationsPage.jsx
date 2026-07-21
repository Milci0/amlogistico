import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { ApiError } from '../lib/api'
import { sendNotification } from '../services/notificationsRepo'
import AlertBox from '../components/ui/AlertBox'
import { inputCls, labelCls, submitCls } from '../components/auth/AuthShell'

const TYPE_OPTIONS = [
  { value: 'info', label: 'Info (niebieskie)' },
  { value: 'success', label: 'Sukces (zielone)' },
  { value: 'warning', label: 'Ważne (bursztynowe)' },
]

// Kolory kafelka podglądu wg typu — spójne z dzwonkiem (Topbar NOTIF_STYLE).
const PREVIEW_TILE = {
  info: 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
  success: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300',
  warning: 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300',
}

function Field({ label, htmlFor, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelCls}>{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

export default function AdminNotificationsPage() {
  const [target, setTarget] = useState('user')
  const [email, setEmail] = useState('')
  const [type, setType] = useState('info')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [ctaLabel, setCtaLabel] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')

  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [fieldErrors, setFieldErrors] = useState({})
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setFieldErrors({})
    setMessage('')
    try {
      const payload = {
        target,
        type,
        title,
        body,
        ...(target === 'user' ? { email } : {}),
        ...(ctaLabel.trim() || ctaUrl.trim() ? { ctaLabel, ctaUrl } : {}),
      }
      const res = await sendNotification(payload)
      setStatus('success')
      setMessage(
        target === 'all'
          ? `Wysłano do wszystkich (${res.count} ${res.count === 1 ? 'konto' : 'kont'}).`
          : `Wysłano do ${email}.`
      )
      // Wyczyść treść, zostaw ustawienia odbiorcy/typu na kolejną wysyłkę.
      setTitle(''); setBody(''); setCtaLabel(''); setCtaUrl('')
    } catch (err) {
      if (err instanceof ApiError && (err.status === 400 || err.status === 404)) {
        setFieldErrors(err.data?.fields || {})
        setStatus('error')
        setMessage(err.data?.fields ? '' : (err.message || 'Nie udało się wysłać.'))
      } else {
        setStatus('error')
        setMessage('Nie udało się wysłać powiadomienia. Spróbuj ponownie.')
      }
    }
  }

  const previewTitle = title.trim() || 'Tytuł powiadomienia'
  const previewBody = body.trim() || 'Treść powiadomienia pojawi się tutaj.'

  return (
    <div className="max-w-2xl mx-auto">
      <Helmet>
        <title>Wyślij powiadomienie | AMLogistico</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wyślij powiadomienie</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Powiadomienie pojawi się w dzwonku odbiorcy — na dowolnym urządzeniu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-5">
        {/* Odbiorca */}
        <div>
          <span className={labelCls}>Odbiorca</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => setTarget('user')}
              className={
                'text-left px-4 py-3 rounded-lg border transition-colors ' +
                (target === 'user'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-400'
                  : 'border-gray-300 dark:border-slate-600 hover:border-emerald-400')
              }
            >
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Konkretne konto</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Po adresie email</p>
            </button>
            <button
              type="button"
              onClick={() => setTarget('all')}
              className={
                'text-left px-4 py-3 rounded-lg border transition-colors ' +
                (target === 'all'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-400'
                  : 'border-gray-300 dark:border-slate-600 hover:border-emerald-400')
              }
            >
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Wszyscy użytkownicy</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Do każdego konta</p>
            </button>
          </div>
        </div>

        {target === 'user' && (
          <Field label="Email odbiorcy" htmlFor="notif-email" error={fieldErrors.email}>
            <input
              id="notif-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jan@firma.pl"
              className={inputCls}
            />
          </Field>
        )}

        <Field label="Typ" htmlFor="notif-type">
          <select id="notif-type" value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="Tytuł" htmlFor="notif-title" error={fieldErrors.title}>
          <input
            id="notif-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="np. Nowa funkcja w platformie"
            className={inputCls}
          />
        </Field>

        <Field label="Treść" htmlFor="notif-body" error={fieldErrors.body}>
          <textarea
            id="notif-body"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Krótka wiadomość dla użytkownika…"
            className={inputCls + ' resize-y'}
          />
        </Field>

        {/* CTA (opcjonalne) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Etykieta przycisku (opcjonalnie)" htmlFor="notif-cta-label" error={fieldErrors.ctaLabel}>
            <input
              id="notif-cta-label"
              type="text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="np. Uzupełnij profil"
              className={inputCls}
            />
          </Field>
          <Field label="Link przycisku (opcjonalnie)" htmlFor="notif-cta-url" error={fieldErrors.ctaUrl}>
            <input
              id="notif-cta-url"
              type="text"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="np. /profile?tab=firma"
              className={inputCls}
            />
          </Field>
        </div>

        {/* Podgląd */}
        <div>
          <span className={labelCls}>Podgląd</span>
          <div className="mt-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5">
            <div className="flex items-start gap-3">
              <div className={'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ' + PREVIEW_TILE[type]}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white break-words">{previewTitle}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed whitespace-pre-line break-words">{previewBody}</p>
                {ctaLabel.trim() && (
                  <span className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-white bg-emerald-600 px-3 py-1.5 rounded-lg">
                    {ctaLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {status === 'success' && message && <AlertBox type="success" title="Wysłano">{message}</AlertBox>}
        {status === 'error' && message && <AlertBox type="error" title="Błąd">{message}</AlertBox>}

        <button type="submit" disabled={status === 'loading'} className={submitCls}>
          {status === 'loading' ? 'Wysyłanie…' : 'Wyślij powiadomienie'}
        </button>
      </form>
    </div>
  )
}
