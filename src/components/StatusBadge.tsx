import type { ItemStatus } from '../domain/types'

const CONFIG: Record<ItemStatus, { label: string; dot: string; bg: string; text: string }> = {
  sinConfirmar: { label: 'Sin confirmar', dot: 'bg-gray-400',   bg: 'bg-gray-100',   text: 'text-gray-600'   },
  confirmado:   { label: 'Confirmado',    dot: 'bg-green-500',  bg: 'bg-green-50',   text: 'text-green-700'  },
  disponible:   { label: 'Disponible',    dot: 'bg-green-500',  bg: 'bg-green-50',   text: 'text-green-700'  },
  enTransito:   { label: 'En tránsito',   dot: 'bg-blue-500',   bg: 'bg-blue-50',    text: 'text-blue-700'   },
  conNovedad:   { label: 'Con novedad',   dot: 'bg-amber-500',  bg: 'bg-amber-50',   text: 'text-amber-700'  },
  devuelto:     { label: 'Devuelto',      dot: 'bg-purple-500', bg: 'bg-purple-50',  text: 'text-purple-700' },
}

interface Props {
  status: ItemStatus
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const { label, dot, bg, text } = CONFIG[status]
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padding} ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {label}
    </span>
  )
}
