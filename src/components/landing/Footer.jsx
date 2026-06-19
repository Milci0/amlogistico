import { Link } from 'react-router-dom'

const LINKS = {
  Produkt: [
    { label: 'Jak to działa', href: '#how-it-works' },
    { label: 'Cennik', href: '#pricing' },
    { label: 'Typy dokumentów', href: '#' },
    { label: 'Zmiany i nowości', href: '#' },
  ],
  Firma: [
    { label: 'O nas', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Kariera', href: '#' },
    { label: 'Kontakt', href: '#contact' },
  ],
  Pomoc: [
    { label: 'Dokumentacja', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Polityka prywatności', href: '#' },
    { label: 'Regulamin', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-900 text-slate-400 pt-14 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-white text-lg mb-3">
              <span className="bg-blue-500 text-white rounded-lg w-7 h-7 flex items-center justify-center text-xs font-black">A</span>
              Am<span className="text-blue-400">Logistico</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Automatyczne generowanie dokumentów transportowych dla spedytorów i firm logistycznych.
            </p>
          </div>

          {/* Kolumny linków */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-white text-sm font-semibold mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AmLogistico. Wszelkie prawa zastrzeżone.</p>
          <p>Zbudowane z ❤️ dla branży TSL</p>
        </div>
      </div>
    </footer>
  )
}
