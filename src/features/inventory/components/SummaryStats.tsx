interface Stat {
  label: string
  value: number
  color: string
}

interface Props {
  sinConfirmar: number
  confirmado: number
  enTransito: number
  conNovedad: number
}

export function SummaryStats({ sinConfirmar, confirmado, enTransito, conNovedad }: Props) {
  const stats: Stat[] = [
    { label: 'Sin confirmar', value: sinConfirmar, color: 'text-gray-700' },
    { label: 'Confirmados',   value: confirmado,   color: 'text-green-600' },
    { label: 'En tránsito',   value: enTransito,   color: 'text-blue-600'  },
    { label: 'Novedades',     value: conNovedad,   color: 'text-amber-600' },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl p-4 border border-[#E8E8EE]">
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
