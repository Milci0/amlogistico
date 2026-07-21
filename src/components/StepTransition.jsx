import { useState, useEffect } from 'react'

// Przejście przy zmianie kroku (kreator, slide=true — zachowanie sprzed zmiany)
// lub zakładki/strony (slide=false — czysty fade, bez migania).
//
// slide=true (kreator): klasyczne exit→enter z krótkim odczekaniem 150ms —
// kontener chowa się (opacity-0, przesunięcie), po 150ms treść (już podmieniona
// przez rodzica) zostaje pokazana z powrotem. Efekt „idziesz dalej w prawo".
//
// slide=false (nawigacja/zakładki): treść jest remontowana przy zmianie `stepKey`
// (React `key`), przez co animacja CSS „page-in" (fade + lekkie uniesienie,
// index.css) odgrywa się OD NOWA przy każdej zmianie strony — realnie widoczne
// zanikanie-do-widoczności (poprzednia wersja tylko na chwilę zerowała opacity,
// więc efekt był niezauważalny). prefers-reduced-motion wyłącza animację w CSS.
export function StepTransition({ children, stepKey, className = '', slide = true }) {
  const [displayKey, setDisplayKey] = useState(stepKey)
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    if (!slide) return // slide=false: przejście robi remount + animacja CSS
    if (stepKey === displayKey) return
    setPhase('exit')
    const t = setTimeout(() => {
      setDisplayKey(stepKey)
      setPhase('enter')
    }, 150)
    return () => clearTimeout(t)
  }, [stepKey, displayKey, slide])

  // Nawigacja / zakładki — remount po `key` odpala animację „page-in".
  if (!slide) {
    return (
      <div key={stepKey} className={`animate-page-in ${className}`}>
        {children}
      </div>
    )
  }

  // Kreator — exit→enter ze slajdem w poziomie (bez zmian).
  return (
    <div
      className={`transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none ${className} ${
        phase === 'enter' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
      }`}
    >
      {children}
    </div>
  )
}

export default StepTransition
