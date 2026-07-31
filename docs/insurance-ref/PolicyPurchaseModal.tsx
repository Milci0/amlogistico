'use client'

// ============================================================
// PolicyPurchaseModal.tsx — Modal zakupu polisy
// ClaimModal.tsx — Modal zgłoszenia szkody
//
// Nowy plik — wrzuć do: src/components/insurance/PolicyPurchaseModal.tsx
// (oba komponenty w jednym pliku dla wygody Miłosza)
// ============================================================

import { useState } from 'react'
import type { InsuranceQuote, Policy } from '@/lib/insuranceService'

// ──────────────────────────────────────────────────────
// MODAL ZAKUPU POLISY
// ──────────────────────────────────────────────────────

interface PolicyPurchaseModalProps {
  quote:     InsuranceQuote
  onSuccess: (policyId: string) => void
  onCancel:  () => void
}

export function PolicyPurchaseModal({ quote, onSuccess, onCancel }: PolicyPurchaseModalProps) {
  const [step,    setStep]    = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const [form, setForm] = useState({
    shipperCompany:   '',
    shipperEmail:     '',
    shipperCountry:   'PL',
    shipperTaxId:     '',
    consigneeCompany: '',
    consigneeEmail:   '',
    consigneeCountry: 'US',
    departureDate:    '',
    vesselName:       '',
    containerNo:      '',
    blNumber:         '',
    shipmentId:       '',  // podmień na ID aktywnego zlecenia
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/insurance/bind', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          quoteId:    quote.quoteId,
          shipmentId: form.shipmentId || 'manual',
          userId:     'current_user',  // podmień na ID z sesji
          shipper: {
            companyName: form.shipperCompany,
            email:       form.shipperEmail,
            country:     form.shipperCountry,
            taxId:       form.shipperTaxId,
          },
          consignee: {
            companyName: form.consigneeCompany,
            email:       form.consigneeEmail,
            country:     form.consigneeCountry,
          },
          departureDate: form.departureDate,
          vesselName:    form.vesselName || undefined,
          containerNo:   form.containerNo || undefined,
          blNumber:      form.blNumber || undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? 'Błąd zakupu polisy')
      onSuccess(data.policyId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieoczekiwany błąd')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalShell title="Kup ubezpieczenie cargo" onClose={onCancel}>

      {/* PODSUMOWANIE OFERTY */}
      <div className="bg-green-500/8 border border-green-500/20 rounded-xl p-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Loadsure · Thames All-Risk · {quote.coverageType.replace('_', '(').replace('ICC', 'ICC') + ')'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Pokrycie do ${(quote.coverageLimit).toLocaleString()} · Franszyza ${quote.deductible}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-green-400">€{quote.premium.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500">jednorazowa składka</p>
          </div>
        </div>
      </div>

      {/* KROKI */}
      <div className="flex border-b border-white/8 mb-4">
        {(['Strony', 'Szczegóły'] as const).map((label, i) => (
          <button
            key={label}
            onClick={() => setStep((i + 1) as 1 | 2)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              step === i + 1
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-500'
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {/* KROK 1 — Nadawca i Odbiorca */}
      {step === 1 && (
        <div className="grid grid-cols-2 gap-3">
          <p className="col-span-2 text-xs font-medium text-gray-400">Nadawca (Shipper)</p>
          <Field label="Nazwa firmy *"    value={form.shipperCompany}   onChange={set('shipperCompany')}   full />
          <Field label="Email *"          value={form.shipperEmail}     onChange={set('shipperEmail')}     type="email" />
          <CountrySelect label="Kraj *"   value={form.shipperCountry}   onChange={set('shipperCountry')}   />
          <Field label="NIP / VAT / EORI" value={form.shipperTaxId}     onChange={set('shipperTaxId')}     />

          <div className="col-span-2 h-px bg-white/8 my-1" />

          <p className="col-span-2 text-xs font-medium text-gray-400">Odbiorca (Consignee)</p>
          <Field label="Nazwa firmy *"    value={form.consigneeCompany} onChange={set('consigneeCompany')} full />
          <Field label="Email *"          value={form.consigneeEmail}   onChange={set('consigneeEmail')}   type="email" />
          <CountrySelect label="Kraj *"   value={form.consigneeCountry} onChange={set('consigneeCountry')} />
        </div>
      )}

      {/* KROK 2 — Szczegóły transportu */}
      {step === 2 && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data załadunku *"   value={form.departureDate} onChange={set('departureDate')} type="date" full />
          <Field label="Nazwa statku"       value={form.vesselName}    onChange={set('vesselName')}    />
          <Field label="Nr kontenera"       value={form.containerNo}   onChange={set('containerNo')}   placeholder="MSCU1234567" />
          <Field label="Nr Bill of Lading"  value={form.blNumber}      onChange={set('blNumber')}      />
          <Field label="ID zlecenia AMLogistico" value={form.shipmentId} onChange={set('shipmentId')} full placeholder="Opcjonalne — powiązanie ze zleceniem" />
        </div>
      )}

      {error && (
        <div className="mt-3 p-2.5 bg-red-500/10 border border-red-500/25 rounded-lg text-xs text-red-400">{error}</div>
      )}

      {/* STOPKA */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8">
        <button
          onClick={() => step > 1 ? setStep(1) : onCancel()}
          className="px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-lg hover:border-white/20"
        >
          {step === 1 ? 'Anuluj' : '← Wstecz'}
        </button>
        {step < 2 ? (
          <button
            onClick={() => setStep(2)}
            className="px-4 py-2 text-sm font-semibold bg-green-500 text-gray-900 rounded-lg hover:bg-green-400"
          >
            Dalej →
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold bg-green-500 text-gray-900 rounded-lg hover:bg-green-400 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <span className="animate-spin">⏳</span>}
            {loading ? 'Kupuję polisę...' : 'Kup polisę i pobierz certyfikat →'}
          </button>
        )}
      </div>
    </ModalShell>
  )
}

export default PolicyPurchaseModal

// ──────────────────────────────────────────────────────
// MODAL ZGŁOSZENIA SZKODY
// ──────────────────────────────────────────────────────

interface ClaimModalProps {
  policy:    Policy
  onSuccess: () => void
  onCancel:  () => void
}

export function ClaimModal({ policy, onSuccess, onCancel }: ClaimModalProps) {
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [lossDate,    setLossDate]    = useState('')
  const [lossAmount,  setLossAmount]  = useState('')

  const submit = async () => {
    if (!description || !lossDate || !lossAmount) {
      setError('Wypełnij wszystkie pola')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/insurance/claims', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          policyId:    policy.id,
          shipmentId:  policy.shipmentId,
          description,
          lossDate,
          lossAmount:  Number(lossAmount),
          currency:    policy.currency,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? 'Błąd zgłoszenia')
      onSuccess()
      alert(`Szkoda zgłoszona! ID: ${data.claimId}. Loadsure skontaktuje się w ciągu 24h.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalShell title="Zgłoś szkodę" onClose={onCancel}>
      <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-3 mb-4">
        <p className="text-xs text-gray-400">Polisa: <span className="text-white font-mono">{policy.loadsureRef}</span></p>
        <p className="text-xs text-gray-400 mt-1">{policy.origin} → {policy.destination} · pokrycie do €{policy.coverageLimit.toLocaleString()}</p>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs text-gray-400 mb-1">Data szkody *</p>
          <input type="date" value={lossDate} onChange={e => setLossDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Kwota roszczenia ({policy.currency}) *</p>
          <input type="number" value={lossAmount} onChange={e => setLossAmount(e.target.value)} className={inputCls} placeholder="np. 5000" />
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Opis szkody *</p>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className={`${inputCls} resize-none`}
            placeholder="Opisz co się stało, kiedy i gdzie..."
          />
        </div>
      </div>

      {error && <div className="mt-2 p-2.5 bg-red-500/10 border border-red-500/25 rounded-lg text-xs text-red-400">{error}</div>}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-lg">Anuluj</button>
        <button
          onClick={submit}
          disabled={loading}
          className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-400 disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <span className="animate-spin">⏳</span>}
          {loading ? 'Zgłaszam...' : 'Zgłoś szkodę →'}
        </button>
      </div>
    </ModalShell>
  )
}

// ── HELPERY UI ──────────────────────────────────────────────

const inputCls = 'w-full bg-[#0f1623] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500'

function ModalShell({ title, onClose, children }: {
  title:    string
  onClose:  () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a2338] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/8">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, full }: {
  label: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string; placeholder?: string; full?: boolean
}) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={inputCls} />
    </div>
  )
}

const COUNTRIES = [
  ['PL','Polska'], ['DE','Niemcy'], ['US','USA'], ['GB','Wielka Brytania'],
  ['CN','Chiny'], ['NL','Holandia'], ['FR','Francja'], ['JP','Japonia'],
  ['AE','ZEA'], ['SA','Arabia Saudyjska'], ['SG','Singapur'], ['IN','Indie'],
]

function CountrySelect({ label, value, onChange }: {
  label: string; value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <select value={value} onChange={onChange} className={inputCls}>
        {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
      </select>
    </div>
  )
}
