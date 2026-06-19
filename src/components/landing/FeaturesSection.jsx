import { FEATURES } from '../../data/mockData'

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Wszystko czego potrzebujesz
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Jedna platforma do zarządzania całą dokumentacją spedycyjną.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group bg-gray-50 hover:bg-blue-50 rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-200"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Typy dokumentów */}
        <div className="mt-14 text-center">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-4">
            Obsługiwane dokumenty
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['CMR', 'Packing List', 'Faktura handlowa', 'SAD', 'Sea Waybill', 'Bill of Lading', 'Certificate of Origin', 'T1/T2', 'EUR.1'].map(doc => (
              <span
                key={doc}
                className="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg shadow-sm"
              >
                {doc}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
