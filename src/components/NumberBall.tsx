interface Props {
  number: number
  type: 'red' | 'blue'
  selected?: boolean
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const sizes = {
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
}

export default function NumberBall({ number, type, selected, size = 'md', onClick }: Props) {
  const base = type === 'red'
    ? selected ? 'bg-red-600 shadow-red-300' : 'bg-gradient-to-b from-red-400 to-red-600'
    : selected ? 'bg-blue-600 shadow-blue-300' : 'bg-gradient-to-b from-blue-400 to-blue-600'

  const ring = selected ? 'ring-2 ring-offset-1 ring-yellow-400 scale-110 shadow-lg' : ''

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ${sizes[size]} ${base} ${ring}
        inline-flex items-center justify-center rounded-full
        text-white font-bold transition-all duration-150
        active:scale-95 select-none shrink-0
      `}
    >
      {String(number).padStart(2, '0')}
    </button>
  )
}
