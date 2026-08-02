import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import InsuranceCalculator, { DEFAULT_QUOTE } from '../components/insurance/InsuranceCalculator'
import OfferCard from '../components/insurance/OfferCard'
import PolicyPurchaseModal from '../components/insurance/PolicyPurchaseModal'
import ClaimModal from '../components/insurance/ClaimModal'
import PolicyList from '../components/insurance/PolicyList'
import Modal from '../components/ui/Modal'
import AlertBox from '../components/ui/AlertBox'
import { PROVIDERS } from '../data/insuranceProviders'
import { MOCK_POLICIES } from '../data/mockData'

// Zakładka „Ubezpieczenia" — na tym etapie WYŁĄCZNIE layout. Zero wywołań sieciowych,
// zero zapisu: kalkulator liczy lokalnie, oferty i polisy są danymi statycznymi,
// a oba modale kończą się komunikatem informacyjnym. Realny zakup ruszy dopiero
// po podpisaniu umowy z ubezpieczycielem.

function SectionHeading({ children }) {
  return <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-3">{children}</h2>
}

export default function InsurancePage() {
  const { t } = useTranslation('pages')
  const [quote, setQuote] = useState(DEFAULT_QUOTE)
  const [purchase, setPurchase] = useState(null)   // { provider, premium }
  const [claimPolicy, setClaimPolicy] = useState(null)
  const [certificatePolicy, setCertificatePolicy] = useState(null)

  return (
    <>
    <div className="max-w-3xl mx-auto">
      <Helmet>
        <title>{t('insurance.metaTitle')}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Nagłówek z akcentem */}
      <div className="flex items-start gap-4 border border-gray-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-800 mb-6">
        <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
          <Shield className="w-[26px] h-[26px]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('insurance.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('insurance.subtitle')}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <InsuranceCalculator onQuoteChange={setQuote} />
      </div>

      <div className="mb-6">
        <SectionHeading>{t('insurance.offers')}</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROVIDERS.map((provider) => (
            <OfferCard
              key={provider.id}
              provider={provider}
              quote={quote}
              onSelect={(p, premium) => setPurchase({ provider: p, premium })}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <SectionHeading>{t('insurance.myPolicies')}</SectionHeading>
        <PolicyList
          policies={MOCK_POLICIES}
          onCertificate={setCertificatePolicy}
          onClaim={setClaimPolicy}
        />
      </div>

    </div>

      {/* Zastrzeżenie celowo POZA kolumną max-w-3xl: przy 12 px ten tekst potrzebuje
          ~830 px, więc w kolumnie 768 px fizycznie nie zmieści się w jednej linii.
          Na pełnej szerokości obszaru treści mieści się; text-pretty pilnuje podziału,
          gdy okno jest na tyle wąskie, że złamanie i tak musi nastąpić. */}
      <p className="text-xs text-gray-400 dark:text-slate-500 text-pretty text-center">
        {t('insurance.disclaimer')}
      </p>

      {purchase && (
        <PolicyPurchaseModal
          provider={purchase.provider}
          premium={purchase.premium}
          quote={quote}
          onClose={() => setPurchase(null)}
        />
      )}

      {claimPolicy && (
        <ClaimModal policy={claimPolicy} onClose={() => setClaimPolicy(null)} />
      )}

      {certificatePolicy && (
        <Modal
          title={t('insurance.certificateTitle')}
          onClose={() => setCertificatePolicy(null)}
          maxWidth="max-w-md"
        >
          <AlertBox type="info" title={t('insurance.certificateSoonTitle')}>
            {t('insurance.certificateSoonPrefix')}{' '}
            <span className="font-mono">{certificatePolicy.ref}</span> {t('insurance.certificateSoonSuffix')}
          </AlertBox>
          <div className="flex justify-end mt-5">
            <button
              type="button"
              onClick={() => setCertificatePolicy(null)}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
            >
              {t('actions.close', { ns: 'common' })}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
