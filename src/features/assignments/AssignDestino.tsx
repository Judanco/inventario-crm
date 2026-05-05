import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchHolders, fetchAssignments, updateAssignmentDestination } from '../../data/api'
import { useAssignmentDraft } from '../../store/assignmentDraft'

export function AssignDestino() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { draftId, destinationHolderId, destinationEmail, setDestination, setToast } = useAssignmentDraft()

  const { data: allHolders = [] } = useQuery({ queryKey: ['holders'], queryFn: fetchHolders })
  const { data: myAssignments = [] } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => fetchAssignments(),
  })

  const activeAssignmentsByDestination = new Set(
    myAssignments
      .filter((a) =>
        a.id !== draftId &&
        (a.status === 'enBorrador' || a.status === 'pendiente' || a.status === 'enTransito'),
      )
      .map((a) => a.destinationHolderId),
  )

  const executives = allHolders.filter((h) => h.role === 'executive')

  const [selected, setSelected] = useState<{ id: string; email: string } | null>(() =>
    destinationHolderId && destinationEmail
      ? { id: destinationHolderId, email: destinationEmail }
      : null
  )
  const [open, setOpen] = useState(false)

  const hasConflict = selected !== null && activeAssignmentsByDestination.has(selected.id)

  async function handleSave() {
    if (!selected || hasConflict) return
    if (draftId) {
      await updateAssignmentDestination(draftId, selected.id, selected.email)
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    }
    setDestination(selected.id, selected.email)
    setToast('Agregaste la información de destino a la asignación.')
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
          Destino
        </h1>
        <div className="w-[102px]" />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-10 pb-32 flex flex-col gap-4">
        <p className="text-sm font-semibold text-[#121e6c]">
          Ejecutivo<span className="text-[#ff2947]">*</span>
        </p>

        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="w-full h-10 bg-white rounded-xl px-3 flex items-center justify-between"
          >
            <span className={selected ? 'text-sm font-medium text-[#1e1e1e]' : 'text-sm text-[#969696]'}>
              {selected ? selected.email : 'Elige una opción'}
            </span>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              className={`transition-transform ${open ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {open && (
            <div className="absolute top-[44px] left-0 right-0 bg-white rounded-xl shadow-[0px_4px_16px_rgba(0,0,0,0.08)] z-10 overflow-hidden">
              {executives.map((h, i) => (
                <button
                  key={h.id}
                  onClick={() => { setSelected({ id: h.id, email: h.email }); setOpen(false) }}
                  className={`w-full h-10 px-3 text-left text-sm text-[#121e6c] ${i === 0 ? 'bg-[#f7f8fb]' : 'bg-white'}`}
                >
                  {h.email}
                </button>
              ))}
              {executives.length === 0 && (
                <div className="h-10 px-3 flex items-center text-sm text-[#969696]">
                  Sin ejecutivos disponibles
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Error toast */}
      {hasConflict && (
        <div className="fixed bottom-[88px] left-4 right-4 bg-[#ff2947] rounded-2xl px-4 py-3 flex items-center gap-2 text-white text-sm z-20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
            <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          El ejecutivo que seleccionaste ya tiene una confirmación pendiente, selecciona otro ejecutivo.
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[rgba(247,248,251,0.9)] backdrop-blur-sm px-9 py-5 flex flex-col gap-3">
        {selected && !hasConflict && (
          <button
            onClick={handleSave}
            className="w-full h-10 bg-[#ff2947] rounded-[32px] flex items-center justify-center text-sm font-bold text-white"
          >
            Guardar
          </button>
        )}
        <button
          onClick={() => navigate(-1)}
          className="w-full h-10 bg-white rounded-[32px] border border-[#f1f2f6] flex items-center justify-center text-sm font-medium text-[#ff2947]"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
