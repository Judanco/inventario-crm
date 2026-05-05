import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCategories, confirmDraft, deleteDraftAssignment } from '../../data/api'
import { useAssignmentDraft } from '../../store/assignmentDraft'
import { DropdownMenu } from '../../components/DropdownMenu'

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function NewAssignment() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { draftId, destinationHolderId, reset, destinationEmail, toast, clearToast, popLines, setPopQty, serialLines, removeSerial } = useAssignmentDraft()
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
  const [showToast, setShowToast] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [menuOpenSerialId, setMenuOpenSerialId] = useState<string | null>(null)

  useEffect(() => {
    if (toast) {
      setShowToast(true)
      const t = setTimeout(() => { setShowToast(false); clearToast() }, 3000)
      return () => clearTimeout(t)
    }
  }, [toast, clearToast])

  async function handleCancelAssignment() {
    if (draftId) {
      await deleteDraftAssignment(draftId)
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    }
    reset()
    navigate('/inventario/asignaciones')
  }

  async function handleConfirm() {
    if (draftId) {
      const lines = [
        ...serialLines.map((l) => ({ categoryId: l.categoryId, isSerializable: true, serials: l.serials })),
        ...popLines.map((l) => ({ categoryId: l.categoryId, isSerializable: false, quantity: l.quantity })),
      ]
      await confirmDraft(draftId, destinationHolderId || null, destinationEmail || null, lines)
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    }
    reset()
    navigate('/inventario/asignaciones')
  }

  function handleClearAllPop() {
    popLines.forEach((l) => setPopQty(l.categoryId, 0))
  }

  return (
    <div className="min-h-screen bg-[#f7f8fb] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f7f8fb] pt-4 pb-5 px-3 flex items-center">
        <div className="w-[102px] flex items-center">
          <button
            onClick={() => navigate('/inventario/asignaciones')}
            className="w-6 h-6 flex items-center justify-center"
            aria-label="Volver"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <h1 className="flex-1 text-base font-bold text-[#121e6c] text-center leading-5">
          Asignación de inventario
        </h1>
        <div className="w-[102px] flex items-center justify-end">
          <button className="bg-white rounded-full px-3 h-8 flex items-center justify-center text-sm font-medium text-[#121e6c] shadow-[0px_4px_6px_rgba(18,30,108,0.08)]">
            Ayuda
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 px-4 pt-10 pb-40 flex flex-col gap-10">

        {/* Destino */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[#121e6c] leading-5">Destino</h2>
          <div className="bg-white rounded-2xl p-3 flex flex-col gap-6">
            <div className="flex items-center gap-3 h-4">
              <p className="flex-1 text-[12px] text-[#1e1e1e] leading-4">
                {destinationEmail || 'Ejecutivo'}
              </p>
              {!destinationEmail && (
                <span className="bg-[#f3f3f3] rounded-full px-2 py-1 text-[12px] text-[#1e1e1e] leading-4">
                  Pendiente
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/inventario/asignaciones/nueva/destino')}
              className="w-full h-10 bg-[#f1f2f6] rounded-xl flex items-center justify-center text-sm font-bold text-[#121e6c]"
            >
              {destinationEmail ? 'Editar datos' : 'Agregar datos'}
            </button>
          </div>
        </div>

        {/* Artículos PoP */}
        <div className="flex flex-col gap-2">
          {/* Section header */}
          <div className="flex items-start justify-between">
            <h2 className="text-sm font-semibold text-[#121e6c] leading-5">Artículos PoP</h2>
            {popLines.length > 0 && (
              <button
                onClick={handleClearAllPop}
                className="flex items-center gap-1 pl-2 rounded-full h-5"
              >
                <span className="text-[12px] font-bold text-[#121e6c] underline decoration-solid leading-4">
                  Eliminar todos
                </span>
                <div className="size-5 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            )}
          </div>

          {/* Items list */}
          <div className="flex flex-col gap-3">
            {popLines.map((line) => {
              const cat = categories.find((c) => c.id === line.categoryId)
              return (
                <div key={line.categoryId} className="bg-white rounded-[12px] pl-[12px] pr-[8px] py-[12px] relative">
                  <div className="flex gap-[16px] items-center">
                    {/* Thumbnail */}
                    <div className="shrink-0 w-[68px] h-[68px] bg-[#f1f2f6] rounded-[12px] flex items-center justify-center overflow-hidden">
                      {cat && (
                        <img
                          src={cat.iconPath}
                          alt={cat.name}
                          className="w-full h-full object-contain p-2"
                        />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#1e1e1e] leading-5">
                          {cat?.name ?? line.categoryId}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === line.categoryId ? null : line.categoryId) }}
                          className="size-5 flex flex-col items-center justify-center gap-[3px]"
                          aria-label="Opciones"
                        >
                          {[0, 1, 2].map((i) => (
                            <span key={i} className="w-[3px] h-[3px] rounded-full bg-[#1e1e1e]" />
                          ))}
                        </button>
                      </div>
                      <p className="text-base text-[#1e1e1e] leading-5">
                        <span className="font-bold">Cantidad </span>
                        <span className="font-normal">{line.quantity}</span>
                      </p>
                    </div>
                  </div>
                  {menuOpenId === line.categoryId && (
                    <DropdownMenu
                      className="absolute right-2 top-10 z-20"
                      items={[
                        {
                          label: 'Editar',
                          onClick: () => navigate('/inventario/asignaciones/nueva/pop', { state: { categoryId: line.categoryId } }),
                        },
                        {
                          label: 'Eliminar',
                          onClick: () => setPopQty(line.categoryId, 0),
                        },
                      ]}
                      onClose={() => setMenuOpenId(null)}
                    />
                  )}
                </div>
              )
            })}

            {/* Agregar card */}
            <div className="bg-white rounded-[16px] p-3 flex items-center gap-3">
              <p className="flex-1 text-[12px] text-[#6c759f] leading-4">Agregar productos PoP</p>
              <button
                onClick={() => navigate('/inventario/asignaciones/nueva/pop')}
                className="w-10 h-10 bg-[#ff2947] rounded-[32px] flex items-center justify-center shrink-0"
                aria-label="Agregar PoP"
              >
                <PlusIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Artículos con serial */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[#121e6c] leading-5">Artículos con serial</h2>
          <div className="flex flex-col gap-3">
            {serialLines.map((line) => {
              const cat = categories.find((c) => c.id === line.categoryId)
              return (
                <div key={line.categoryId} className="bg-white rounded-[12px] pl-[12px] pr-[8px] py-[12px] relative">
                  <div className="flex gap-[16px] items-center">
                    <div className="shrink-0 w-[68px] h-[68px] bg-[#f1f2f6] rounded-[12px] flex items-center justify-center overflow-hidden">
                      {cat && (
                        <img src={cat.iconPath} alt={cat.name} className="w-full h-full object-contain p-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#1e1e1e] leading-5">
                          {cat?.name ?? line.categoryId}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuOpenSerialId(menuOpenSerialId === line.categoryId ? null : line.categoryId) }}
                          className="size-5 flex flex-col items-center justify-center gap-[3px]"
                          aria-label="Opciones"
                        >
                          {[0, 1, 2].map((i) => (
                            <span key={i} className="w-[3px] h-[3px] rounded-full bg-[#1e1e1e]" />
                          ))}
                        </button>
                      </div>
                      <p className="text-base text-[#1e1e1e] leading-5">
                        <span className="font-bold">Cantidad </span>
                        <span className="font-normal">{line.serials.length}</span>
                      </p>
                    </div>
                  </div>
                  {menuOpenSerialId === line.categoryId && (
                    <DropdownMenu
                      className="absolute right-2 top-10 z-20"
                      items={[
                        {
                          label: 'Ver detalle',
                          onClick: () => {},
                        },
                        {
                          label: 'Eliminar',
                          onClick: () => line.serials.forEach((s) => removeSerial(line.categoryId, s)),
                        },
                      ]}
                      onClose={() => setMenuOpenSerialId(null)}
                    />
                  )}
                </div>
              )
            })}

            <div className="bg-white rounded-[16px] p-3 flex items-center gap-3">
              <p className="flex-1 text-[12px] text-[#6c759f] leading-4">Agregar productos con serial</p>
              <button
                onClick={() => navigate('/inventario/asignaciones/nueva/serial')}
                className="w-10 h-10 bg-[#ff2947] rounded-[32px] flex items-center justify-center shrink-0"
                aria-label="Agregar serial"
              >
                <PlusIcon />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-[88px] left-4 right-4 bg-[#3f3f3f] rounded-2xl px-4 py-3 flex items-center gap-2 text-white text-sm z-20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
            <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {toast}
        </div>
      )}

      {/* Bottom actions — fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-[rgba(247,248,251,0.45)] backdrop-blur-sm px-[72px] py-5 flex flex-col gap-2">
        {!!destinationEmail && (serialLines.length > 0 || popLines.length > 0) && (
          <button
            onClick={handleConfirm}
            className="h-10 bg-[#ff2947] rounded-[32px] flex items-center justify-center text-sm font-medium text-white"
          >
            Confirmar asignación
          </button>
        )}
        <button
          onClick={() => setShowCancelModal(true)}
          className="h-10 bg-white rounded-[32px] flex items-center justify-center text-sm font-medium text-[#ff2947]"
        >
          Cancelar
        </button>
      </div>
      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1e1e1e] opacity-70" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white rounded-[24px] w-[288px] px-4 pt-[60px] pb-8 flex flex-col gap-6 items-center shadow-[0px_8px_10px_rgba(0,0,0,0.08)]">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-5 right-4 w-6 h-6 flex items-center justify-center"
              aria-label="Cerrar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex flex-col gap-4 items-center w-full">
              <div className="w-9 h-9 flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="18" r="18" fill="#FFF3CD" />
                  <path d="M18 12v7" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="18" cy="23" r="1.5" fill="#F5A623" />
                </svg>
              </div>
              <p className="text-base font-semibold text-[#1e1e1e] text-center leading-5">
                ¿Quieres cancelar esta asignación?
              </p>
              <p className="text-base font-normal text-[#1e1e1e] text-center leading-5">
                No se enviará el inventario al correo destino y seguirá siendo tu responsabilidad.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleCancelAssignment}
                className="w-full h-11 bg-[#ff2947] rounded-[32px] flex items-center justify-center text-sm font-medium text-white"
              >
                Cancelar asignación
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full h-11 bg-white border border-[#ff2947] rounded-[32px] flex items-center justify-center text-sm font-medium text-[#ff2947]"
              >
                Seguir configurando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
