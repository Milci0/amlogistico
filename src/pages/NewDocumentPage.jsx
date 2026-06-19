import TransportChip from '../components/ui/TransportChip'
import StepProgress from '../components/ui/StepProgress'
import { useState } from 'react'

const STEPS = ['Typ dokumentu', 'Dane trasy', 'Szczegóły towaru', 'Podgląd']
const TRANSPORT_TYPES = ['TIR', 'Morski', 'Lotniczy', 'Kolejowy']
const DOC_TYPES = ['CMR', 'Packing List', 'Faktura handlowa', 'SAD', 'Sea Waybill', 'Bill of Lading']

export default function NewDocumentPage() {
  const [transport, setTransport] = useState('TIR')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nowy dokument</h1>
        <p className="text-gray-500 text-sm mt-1">Wybierz typ dokumentu i środek transportu.</p>
      </div>

      <div className="mb-8">
        <StepProgress steps={STEPS} currentStep={1} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Środek transportu</h2>
        <TransportChip options={TRANSPORT_TYPES} selected={transport} onChange={setTransport} />

        <h2 className="text-base font-semibold text-gray-900 mt-6 mb-4">Typ dokumentu</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DOC_TYPES.map(type => (
            <button
              key={type}
              className="text-sm font-medium border border-gray-200 rounded-xl py-3 px-4 text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all text-left"
            >
              {type}
            </button>
          ))}
        </div>

        <button className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
          Dalej →
        </button>
      </div>
    </div>
  )
}
