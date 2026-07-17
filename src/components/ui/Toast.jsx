// Lekki, samo-znikający komunikat w rogu ekranu — użyty przez WizardContext do
// sygnalizowania zapisu wersji roboczej (ETAP 6). Nie blokuje layoutu, nie wymaga
// żadnej nowej biblioteki.

export default function Toast({ message, type = 'success' }) {
  const styles = type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium ${styles}`}>
        {message}
      </div>
    </div>
  )
}
