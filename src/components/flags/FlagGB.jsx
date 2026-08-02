import { useId } from 'react'

// Union Jack narysowany w proporcji 10:7 (a nie oryginalnej 1:2), żeby obie flagi
// w przełączniku miały ten sam rozmiar. Geometria przeskalowana proporcjonalnie:
// białe przekątne 1/5 wysokości, czerwone 1/15, biały krzyż 1/3, czerwony 1/5.
// Czerwone przekątne są przesunięte (counterchange) przez clipPath, tak jak w oryginale.
export default function FlagGB({ className = '', width = 20, height = 14 }) {
  const clipId = useId()

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 60 42"
      role="presentation"
      aria-hidden="true"
    >
      <clipPath id={clipId}>
        <path d="M30,21 h30 v21 z v21 h-30 z h-30 v-21 z v-21 h30 z" />
      </clipPath>
      <rect width="60" height="42" fill="#012169" />
      <path d="M0,0 L60,42 M60,0 L0,42" stroke="#FFFFFF" strokeWidth="8.4" />
      <path
        d="M0,0 L60,42 M60,0 L0,42"
        clipPath={`url(#${clipId})`}
        stroke="#C8102E"
        strokeWidth="5.6"
      />
      <path d="M30,0 V42 M0,21 H60" stroke="#FFFFFF" strokeWidth="14" />
      <path d="M30,0 V42 M0,21 H60" stroke="#C8102E" strokeWidth="8.4" />
    </svg>
  )
}
