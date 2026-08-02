// Flaga Polski: biel na górze, czerwień na dole. Proporcja 10:7, taka sama jak FlagGB,
// żeby oba znaczki w przełączniku były równej wielkości.
export default function FlagPL({ className = '', width = 20, height = 14 }) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 60 42"
      role="presentation"
      aria-hidden="true"
    >
      <rect width="60" height="21" fill="#FFFFFF" />
      <rect y="21" width="60" height="21" fill="#DC143C" />
    </svg>
  )
}
