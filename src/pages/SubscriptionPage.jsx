import { Helmet } from 'react-helmet-async'
import { PRICING_PLANS } from '../data/mockData'

export default function SubscriptionPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Helmet>
        <title>Abonament | AMLogistico</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Abonament</h1>
        <p className="text-gray-500 text-sm mt-1">Aktualny plan: <strong>Free</strong>. Wybierz plan dopasowany do Twoich potrzeb.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PRICING_PLANS.map(plan => (
          <div
            key={plan.name}
            className={`rounded-2xl p-5 border ${
              plan.highlighted
                ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-100'
                : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            {plan.highlighted && (
              <span className="inline-block bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">
                Najpopularniejszy
              </span>
            )}
            <h3 className={`text-lg font-bold mb-1 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
              {plan.name}
            </h3>
            <div className="mb-4">
              {plan.price === null ? (
                <p className={`text-2xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>Kontakt</p>
              ) : (
                <p className={`text-2xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price === 0 ? 'Gratis' : `${plan.price} zł/mies.`}
                </p>
              )}
            </div>
            <ul className="space-y-2 mb-5">
              {plan.features.map(f => (
                <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlighted ? 'text-blue-50' : 'text-gray-600'}`}>
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button className={`w-full text-sm font-semibold py-2.5 rounded-xl transition-colors ${
              plan.highlighted
                ? 'bg-white text-blue-600 hover:bg-blue-50'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
