import { PRICING_PLANS } from '../../data/mockData'

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Prosty i przejrzysty cennik
          </h2>
          <p className="text-gray-500 text-lg">
            Zacznij bezpłatnie, skaluj gdy jesteś gotowy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PRICING_PLANS.map(plan => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 border transition-all ${
                plan.highlighted
                  ? 'bg-blue-600 border-blue-600 shadow-2xl shadow-blue-200 scale-105'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              {plan.highlighted && (
                <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                  Najpopularniejszy
                </span>
              )}

              <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-4 ${plan.highlighted ? 'text-blue-100' : 'text-gray-500'}`}>
                {plan.description}
              </p>

              <div className="mb-6">
                {plan.price === null ? (
                  <p className={`text-3xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    Kontakt
                  </p>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price === 0 ? 'Gratis' : `${plan.price} zł`}
                    </span>
                    {plan.price > 0 && (
                      <span className={`text-sm mb-1 ${plan.highlighted ? 'text-blue-200' : 'text-gray-400'}`}>
                        / {plan.period}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <svg className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? 'text-blue-200' : 'text-green-500'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={plan.highlighted ? 'text-blue-50' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full font-semibold py-2.5 rounded-xl transition-all text-sm ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
