import { Outlet, useMatch, useNavigate } from 'react-router-dom'
import { useInventoryOverview } from './hooks/useInventory'
import { NavTabs } from './components/NavTabs'
import { CategoryCard } from './components/CategoryCard'

export function InventoryOverview() {
  const isRoot = useMatch('/inventario')
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-[#f7f8fb] flex flex-col">
      {/* Sticky header */}
      <div className="bg-[#f7f8fb] pt-6 px-4 flex flex-col gap-8">

        {/* Back + title row */}
        <div className="flex flex-col gap-8">
          <button
            onClick={() => navigate(-1)}
            className="w-6 h-6 flex items-center justify-center"
            aria-label="Volver"
          >
            {/* Left-pointing chevron inline SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="#121e6c"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex flex-col gap-8">
            <h1 className="text-[20px] font-bold leading-6 text-[#121e6c]">
              Inventario
            </h1>
            {/* Tab navigation */}
            <NavTabs />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-10 pb-24 flex flex-col gap-10">
        {isRoot ? <InventoryGeneralTab /> : <Outlet />}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/inventario/asignaciones/nueva')}
        className="fixed bottom-8 right-8 w-11 h-11 bg-[#ff2947] rounded-[32px] flex items-center justify-center shadow-lg"
        aria-label="Nueva asignación"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

function InventoryGeneralTab() {
  const { overview, isLoading, isError } = useInventoryOverview()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        Cargando inventario…
      </div>
    )
  }

  if (isError || !overview) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[#ff2947]">
        Error al cargar el inventario.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Búsqueda por scaneo */}
      <button className="w-full flex gap-3 items-start bg-white rounded-2xl pl-3 pr-2 py-3 text-left">
        <div className="shrink-0 w-8 h-8 overflow-hidden rounded-full">
          <img
            src="/assets/icons/scan.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-0 justify-center">
          <p className="text-sm font-bold text-[#121e6c] leading-5">
            Búsqueda por scaneo
          </p>
          <p className="text-sm font-normal text-[#1e1e1e] leading-5">
            Confirma el estado de cualquier serial.
          </p>
        </div>
        <div className="shrink-0 w-6 h-6 self-center">
          <img
            src="/assets/icons/chevron.png"
            alt=""
            className="w-full h-full object-contain rotate-90"
          />
        </div>
      </button>

      {/* Artículos confirmados */}
      <div className="flex flex-col gap-2">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#121e6c] leading-5">
            Artículos confirmados
          </span>
          <button className="w-6 h-6">
            <img
              src="/assets/icons/tooltip.png"
              alt="Info"
              className="w-full h-full object-contain"
            />
          </button>
        </div>

        {/* Category cards */}
        <div className="flex flex-col gap-3">
          {overview.byCategory.map((s) => (
            <CategoryCard key={s.category.id} summary={s} />
          ))}

          {overview.byCategory.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-gray-400 text-sm">Sin artículos confirmados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
