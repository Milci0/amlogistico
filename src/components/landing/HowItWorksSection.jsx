import { HOW_IT_WORKS_STEPS } from '../../data/mockData'

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Jak to działa?
          </h2>
          <p className="text-gray-500 text-lg">
            Od wyboru dokumentu do gotowego PDF — 4 proste kroki.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div key={index} className="relative">
              {/* Linia łącząca — desktop */}
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-full w-full h-0.5 bg-blue-100 z-0 -ml-3" />
              )}

              <div className="relative z-10 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-full">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-black text-blue-100 select-none">{step.number}</span>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA pod krokami */}
        <div className="text-center mt-12">
          <a
            href="/app/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-blue-100 transition-all hover:-translate-y-0.5"
          >
            Wypróbuj za darmo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
