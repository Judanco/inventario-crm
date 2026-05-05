import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchCategories, fetchBatches } from '../../data/api'
import { CURRENT_USER_ID } from '../../data/fixtures'
import { useAssignmentDraft } from '../../store/assignmentDraft'

export function NewPopItem() {
  const navigate = useNavigate()
  const location = useLocation()
  const { popLines, setPopQty } = useAssignmentDraft()

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
  const { data: allBatches = [] } = useQuery({
    queryKey: ['batches', CURRENT_USER_ID],
    queryFn: () => fetchBatches(CURRENT_USER_ID),
  })

  const availableByCategory = allBatches
    .filter((b) => b.status === 'disponible')
    .reduce<Record<string, number>>((acc, b) => {
      acc[b.categoryId] = (acc[b.categoryId] ?? 0) + b.quantity
      return acc
    }, {})

  const availableCategories = categories.filter(
    (c) => !c.isSerializable && (availableByCategory[c.id] ?? 0) > 0,
  )

  const editingCategoryId = (location.state as { categoryId?: string } | null)?.categoryId ?? null
  const [selectedId, setSelectedId] = useState<string | null>(editingCategoryId)
  const [qty, setQty] = useState(() => {
    if (!editingCategoryId) return 1
    return popLines.find((l) => l.categoryId === editingCategoryId)?.quantity ?? 1
  })
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const selectedCategory = categories.find((c) => c.id === selectedId)
  const maxQty = selectedId ? (availableByCategory[selectedId] ?? 1) : 1

  function handleSelect(categoryId: string) {
    setSelectedId(categoryId)
    setDropdownOpen(false)
    const existing = popLines.find((l) => l.categoryId === categoryId)
    setQty(existing?.quantity ?? 1)
  }

  function handleAdd() {
    if (!selectedId || qty <= 0) return
    setPopQty(selectedId, qty)
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-[#f7f8fb] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f7f8fb] py-4 px-3 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="w-[102px] flex items-center"
          aria-label="Volver"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="flex-1 text-base font-bold text-[#121e6c] text-center leading-5">
          Nuevo artículo PoP
        </h1>
        <div className="w-[102px]" />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-10 pb-40 flex flex-col gap-10">

        {/* Dropdown SKU */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#121e6c] leading-5">
            ¿Qué artículo quieres agregar?
          </label>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="w-full bg-white rounded-xl px-3 h-10 flex items-center justify-between gap-2"
            >
              <span className={`text-sm leading-5 ${selectedCategory ? 'text-[#1e1e1e]' : 'text-[#969696]'}`}>
                {selectedCategory?.name ?? 'Seleccionar artículo'}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className={`shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              >
                <path d="M6 9l6 6 6-6" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-white rounded-xl shadow-[0px_8px_20px_rgba(18,30,108,0.08)] overflow-hidden">
                {availableCategories.length === 0 ? (
                  <div className="px-3 h-10 flex items-center text-sm text-[#969696]">
                    Sin stock disponible
                  </div>
                ) : (
                  availableCategories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelect(c.id)}
                      className="w-full px-3 h-10 flex items-center text-sm text-[#1e1e1e] hover:bg-[#f7f8fb] text-left"
                    >
                      {c.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cantidad disponible + contador */}
        {selectedId && (
          <>
            {/* Cantidad disponible — read only */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#121e6c] leading-5">
                Cantidad disponible
              </label>
              <div className="bg-white rounded-xl px-3 h-10 flex items-center opacity-50">
                <span className="text-sm font-medium text-[#1e1e1e]">{availableByCategory[selectedId]}</span>
              </div>
            </div>

            {/* Cantidad a transferir — stepper */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#121e6c] leading-5">
                Cantidad a transferir
                <span className="text-[#ff2947] ml-0.5">*</span>
              </label>
              <div className="flex justify-center">
                <div className="bg-white rounded-full flex items-center gap-7 px-6 py-2">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="w-6 h-6 flex items-center justify-center text-[#121e6c] disabled:opacity-30"
                    aria-label="Decrementar"
                  >
                    <svg width="16" height="2" viewBox="0 0 16 2" fill="none">
                      <path d="M1 1h14" stroke="#121e6c" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                  <span className="w-12 text-center text-2xl font-normal text-[#121e6c] leading-7">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    disabled={qty >= maxQty}
                    className="w-6 h-6 flex items-center justify-center text-[#121e6c] disabled:opacity-30"
                    aria-label="Incrementar"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1v14M1 8h14" stroke="#121e6c" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-[rgba(247,248,251,0.9)] backdrop-blur-sm flex flex-col gap-2 px-[72px] py-5">
        <button
          onClick={handleAdd}
          disabled={!selectedId}
          className="h-10 bg-[#ff2947] rounded-[32px] flex items-center justify-center text-sm font-medium text-white disabled:opacity-40"
        >
          Agregar ítem
        </button>
        <button
          onClick={() => navigate(-1)}
          className="h-10 bg-white rounded-[32px] border border-[#f1f2f6] flex items-center justify-center text-sm font-medium text-[#ff2947]"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
