import { useNavigate } from 'react-router-dom'
import type { CategoryInventorySummary } from '../../../domain/types'

interface Props {
  summary: CategoryInventorySummary
}

export function CategoryCard({ summary }: Props) {
  const { category, confirmedTotal, isLowStock } = summary
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/inventario/productos/${category.id}`)}
      className="w-full flex gap-3 items-start bg-white rounded-2xl pl-3 pr-2 py-3 text-left"
    >
      {/* Product icon */}
      <div className="relative shrink-0 w-10 h-10 overflow-hidden">
        <img
          src={category.iconPath}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 flex-1 min-w-0 justify-center">
        <p className="text-sm font-bold text-[#121e6c] leading-5">
          {category.name}
        </p>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-normal text-[#1e1e1e] leading-5">
            {confirmedTotal} {confirmedTotal === 1 ? category.unit : `${category.unit}es`}
          </p>
        </div>

        {/* Low stock tag */}
        {isLowStock && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 inline-block" />
            <span className="text-[12px] leading-4 text-[#1e1e1e]">Stock bajo</span>
          </div>
        )}
      </div>

      {/* Chevron — rotate 90° because the raw PNG points up */}
      <div className="shrink-0 w-6 h-6 flex items-center justify-center self-center">
        <img
          src="/assets/icons/chevron.png"
          alt=""
          className="w-full h-full object-contain rotate-90"
        />
      </div>
    </button>
  )
}
