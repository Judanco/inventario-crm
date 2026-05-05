import { useState } from 'react'
import { Outlet, useMatch, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useInventoryOverview } from './hooks/useInventory'
import { NavTabs } from './components/NavTabs'
import { CategoryCard } from './components/CategoryCard'
import { useAssignmentDraft } from '../../store/assignmentDraft'
import {
  findDraftAssignment,
  createDraftAssignment,
  deleteDraftAssignment,
} from '../../data/api'
import { assignments } from '../../data/fixtures'

export function InventoryOverview() {
  const isRoot = useMatch('/inventario')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [fabOpen, setFabOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [pendingDraftId, setPendingDraftId] = useState<string | null>(null)
  const draftStore = useAssignmentDraft()

  async function handleReasignacion() {
    setFabOpen(false)
    const existingDraft = findDraftAssignment()
    if (existingDraft) {
      setPendingDraftId(existingDraft.id)
      setShowModal(true)
    } else {
      const draft = await createDraftAssignment()
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      draftStore.startDraft(draft.id)
      navigate('/inventario/asignaciones/nueva')
    }
  }

  async function handleResume() {
    setShowModal(false)
    if (pendingDraftId) {
      if (draftStore.draftId !== pendingDraftId) {
        const draft = assignments.find((a) => a.id === pendingDraftId)
        if (draft) {
          draftStore.startDraft(draft.id)
          if (draft.destinationHolderId && draft.destinationEmail) {
            draftStore.setDestination(draft.destinationHolderId, draft.destinationEmail)
          }
        }
      }
      navigate('/inventario/asignaciones/nueva')
    }
  }

  async function handleCreateNew() {
    setShowModal(false)
    if (pendingDraftId) {
      await deleteDraftAssignment(pendingDraftId)
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    }
    const draft = await createDraftAssignment()
    queryClient.invalidateQueries({ queryKey: ['assignments'] })
    draftStore.startDraft(draft.id)
    navigate('/inventario/asignaciones/nueva')
  }

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
            <NavTabs />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-10 pb-24 flex flex-col gap-10">
        {isRoot ? <InventoryGeneralTab /> : <Outlet />}
      </div>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-2.5">
        {fabOpen && (
          <button
            onClick={handleReasignacion}
            className="bg-[#ff2947] rounded-[32px] px-5 h-11 flex items-center justify-center text-white text-base font-bold shadow-lg whitespace-nowrap"
          >
            Reasignación
          </button>
        )}
        <button
          onClick={() => setFabOpen((prev) => !prev)}
          className="w-11 h-11 bg-[#ff2947] rounded-[32px] flex items-center justify-center shadow-lg"
          aria-label={fabOpen ? 'Cerrar menú' : 'Nueva asignación'}
        >
          {fabOpen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Draft modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#1e1e1e] opacity-70"
            onClick={() => setShowModal(false)}
          />
          {/* Card */}
          <div className="relative bg-white rounded-[24px] w-[288px] px-4 pt-[60px] pb-8 flex flex-col gap-6 items-center shadow-[0px_8px_10px_rgba(0,0,0,0.08)]">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-4 w-6 h-6 flex items-center justify-center"
              aria-label="Cerrar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Content */}
            <div className="flex flex-col gap-4 items-center w-full">
              {/* Warning icon */}
              <div className="w-9 h-9 flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="18" r="18" fill="#FFF3CD" />
                  <path d="M18 12v7" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="18" cy="23" r="1.5" fill="#F5A623" />
                </svg>
              </div>
              <p className="text-base font-semibold text-[#1e1e1e] text-center leading-5">
                Ya hay una asignación en proceso
              </p>
              <p className="text-base font-normal text-[#1e1e1e] text-center leading-5">
                ¿Quieres retomarla o crear una nueva?
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={handleResume}
                className="w-full h-11 bg-[#ff2947] rounded-[32px] flex items-center justify-center text-sm font-medium text-white"
              >
                Retomar asignación
              </button>
              <button
                onClick={handleCreateNew}
                className="w-full h-11 bg-white border border-[#ff2947] rounded-[32px] flex items-center justify-center text-sm font-medium text-[#ff2947]"
              >
                Crear nueva asignación
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full h-11 flex items-center justify-center text-sm font-medium text-[#121e6c]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
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
