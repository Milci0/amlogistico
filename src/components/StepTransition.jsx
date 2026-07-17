import { useState, useEffect } from 'react'

// Krótkie przejście (fade + slide) między krokami kreatora. Animowany jest sam
// kontener — treść kroków trzyma rodzic (WizardContext), więc React podmienia ją
// natychmiast; to celowe i wystarczające (patrz ETAP 4 w zadaniu).
// Przy prefers-reduced-motion: reduce klasy `motion-reduce:*` wyłączają animację.
export function StepTransition({ children, stepKey }) {
  const [displayKey, setDisplayKey] = useState(stepKey)
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    if (stepKey !== displayKey) {
      setPhase('exit')
      const t = setTimeout(() => {
        setDisplayKey(stepKey)
        setPhase('enter')
      }, 150)
      return () => clearTimeout(t)
    }
  }, [stepKey, displayKey])

  return (
    <div
      className={`transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        phase === 'enter'
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 -translate-x-2'
      }`}
    >
      {children}
    </div>
  )
}

export default StepTransition
