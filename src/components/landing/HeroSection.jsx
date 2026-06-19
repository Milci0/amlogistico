import { useState } from 'react'
import WizardModal from './WizardModal'

export default function HeroSection() {
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <>
    <section className="relative bg-gradient-to-br from-white via-blue-50 to-indigo-100 pt-20 pb-28 px-4 overflow-hidden">
      {/* Dekoracje tła */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          Platforma dokumentów transportowych
        </span>

        {/* Nagłówek */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Generuj dokumenty<br />
          <span className="text-blue-600">transportowe</span> w minuty
        </h1>

        {/* Podtytuł */}
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Ponad 99+ dokumentów spedycyjnych w jednym miejscu — faktury, listy przewozowe,
          świadectwa i deklaracje celne. Wypełniasz jeden formularz, a my dobieramy i generujemy
          wszystko, co potrzebne na Twoją trasę.
        </p>

        {/* CTA */}
        <div className="flex justify-center mb-14">
          <button
            onClick={() => setWizardOpen(true)}
            className="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold px-12 py-4 rounded-xl shadow-lg shadow-blue-200 text-lg transition-all hover:-translate-y-0.5"
          >
            Rozpocznij
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* Mockup karty dokumentu */}
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl shadow-blue-100 border border-gray-100 p-5 text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md">CMR</span>
              <span className="text-sm font-medium text-gray-800">CMR-2024-001</span>
            </div>
            <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">Gotowy</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            <div>
              <p className="text-gray-400 mb-0.5">Nadawca</p>
              <p className="font-medium text-gray-700">Firma ABC Sp. z o.o.</p>
              <p className="text-gray-500">Warszawa, Polska 🇵🇱</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Odbiorca</p>
              <p className="font-medium text-gray-700">Müller GmbH</p>
              <p className="text-gray-500">Berlin, Niemcy 🇩🇪</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Towar</p>
              <p className="font-medium text-gray-700">Elektronika</p>
              <p className="text-gray-500">1 240 kg · 6 palet</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Data</p>
              <p className="font-medium text-gray-700">15.01.2024</p>
              <p className="text-gray-500">PL → DE · TIR</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Pobierz PDF
          </button>
        </div>
      </div>
    </section>
    {wizardOpen && <WizardModal onClose={() => setWizardOpen(false)} />}
    </>
  )
}
