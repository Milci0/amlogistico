const VARIANTS = {
  info: {
    wrapper: 'bg-blue-50 border-blue-400',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    body: 'text-blue-700',
    svg: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  warning: {
    wrapper: 'bg-amber-50 border-amber-400',
    icon: 'text-amber-500',
    title: 'text-amber-800',
    body: 'text-amber-700',
    svg: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    ),
  },
  error: {
    wrapper: 'bg-red-50 border-red-400',
    icon: 'text-red-500',
    title: 'text-red-800',
    body: 'text-red-700',
    svg: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  success: {
    wrapper: 'bg-green-50 border-green-400',
    icon: 'text-green-500',
    title: 'text-green-800',
    body: 'text-green-700',
    svg: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
}

export default function AlertBox({ type = 'info', title, children }) {
  const v = VARIANTS[type]
  return (
    <div className={`flex gap-3 p-4 rounded-lg border-l-4 ${v.wrapper}`}>
      <svg className={`w-5 h-5 shrink-0 mt-0.5 ${v.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {v.svg}
      </svg>
      <div>
        {title && <p className={`text-sm font-semibold ${v.title}`}>{title}</p>}
        <div className={`text-sm ${v.body} ${title ? 'mt-0.5' : ''}`}>{children}</div>
      </div>
    </div>
  )
}
