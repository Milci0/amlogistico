import { useState, useEffect } from 'react'

// Przejście przy zmianie kroku (kreator, slide=true — zachowanie sprzed zmiany)
// lub zakładki/strony (slide=false — czysty fade, bez migania).
//
// slide=true (kreator): klasyczne exit→enter z krótkim odczekaniem 150ms —
// kontener chowa się (opacity-0, przesunięcie), po 150ms treść (już podmieniona
// przez rodzica) zostaje pokazana z powrotem. Efekt „idziesz dalej w prawo".
//
// slide=false (nawigacja/zakładki): bez przerwy — na jedną klatkę kontener wraca
// do stanu "niewidoczny", po czym od razu zaczyna przejście do "widoczny", więc
// nowa treść po prostu płynnie się pojawia (bez efektu zniknij-i-pojaw-się).
//
// Przy prefers-reduced-motion: reduce klasy `motion-reduce:*` wyłączają animację.
export function StepTransition({ children, stepKey, className = '', slide = true }) {
  const [displayKey, setDisplayKey] = useState(stepKey)
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    if (stepKey === displayKey) return
    if (slide) {
      setPhase('exit')
      const t = setTimeout(() => {
        setDisplayKey(stepKey)
        setPhase('enter')
      }, 150)
      return () => clearTimeout(t)
    }
    setDisplayKey(stepKey)
    setPhase('exit')
    const raf = requestAnimationFrame(() => setPhase('enter'))
    return () => cancelAnimationFrame(raf)
  }, [stepKey, displayKey, slide])

  return (
    <div
      className={`transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none ${className} ${
        phase === 'enter'
          ? `opacity-100 ${slide ? 'translate-x-0' : ''}`
          : `opacity-0 ${slide ? '-translate-x-2' : ''}`
      }`}
    >
      {children}
    </div>
  )
}

export default StepTransition
