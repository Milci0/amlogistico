const TRANSPORT_ICONS = {
  TIR: '🚛',
  Morski: '🚢',
  Lotniczy: '✈️',
  Kolejowy: '🚂',
}

export default function TransportChip({ options, selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all
            ${selected === option
              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
              : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600'
            }`}
        >
          <span>{TRANSPORT_ICONS[option] || '📦'}</span>
          {option}
        </button>
      ))}
    </div>
  )
}
