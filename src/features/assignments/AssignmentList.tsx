import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { fetchAssignments } from '../../data/api'
import { useAssignmentDraft } from '../../store/assignmentDraft'
import type { Assignment } from '../../domain/types'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  enBorrador: { label: 'Borrador',              color: '#969696' },
  pendiente:  { label: 'Confirmación pendiente', color: '#f5a623' },
  enTransito: { label: 'En tránsito',            color: '#121e6c' },
  recibido:   { label: 'Recibido',               color: '#2e7d32' },
  devuelto:   { label: 'Devuelto',               color: '#ff2947' },
}

function SortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 4v8M5 10l3 3 3-3" stroke="#969696" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AssignmentList() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: fetchAssignments,
  })
  const draftStore = useAssignmentDraft()

  const displayItems = useMemo(() => {
    let base = items

    if (base.length === 0) {
      try {
        const raw = localStorage.getItem('assignments-data')
        if (raw) base = JSON.parse(raw) as Assignment[]
      } catch {}
    }

    const hasDraft = base.some((a) => a.status === 'enBorrador')
    if (!hasDraft && draftStore.draftId) {
      const synthetic: Assignment = {
        id: draftStore.draftId,
        originHolderId: '',
        destinationHolderId: draftStore.destinationHolderId || null,
        destinationEmail: draftStore.destinationEmail || null,
        lines: [],
        status: 'enBorrador',
        createdAt: '',
        expirationDate: null,
      }
      return [synthetic, ...base]
    }
    return base
  }, [items, draftStore.draftId, draftStore.destinationHolderId, draftStore.destinationEmail])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        Cargando asignaciones…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      {displayItems.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#121e6c] leading-5">Enviados</h2>
          <div className="flex items-center gap-2">
            <p className="text-[12px] text-[#969696] leading-4">
              Ordenado por <span className="font-bold">fecha de envío</span>
            </p>
            <SortIcon />
          </div>
        </div>
      )}

      {displayItems.length === 0 ? (
        <div className="flex flex-col items-center pt-16 gap-6">
          <div className="flex flex-col gap-3 items-center text-center w-full">
            <p className="text-base font-semibold text-[#121e6c] leading-5">
              ¡Aún no tienes asignaciones!
            </p>
            <p className="text-sm font-normal text-[#1e1e1e] leading-5">
              Cuando las hagas, podrás verlo aquí.
            </p>
          </div>
          <img
            src="/assets/illustrations/ill-time-out.svg"
            alt=""
            className="w-24 h-24 object-contain"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {[...displayItems]
            .sort((a, b) => {
              if (a.status === 'enBorrador' && b.status !== 'enBorrador') return -1
              if (a.status !== 'enBorrador' && b.status === 'enBorrador') return 1
              return 0
            })
            .map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
        </div>
      )}
    </div>
  )
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const navigate = useNavigate()
  const draftStore = useAssignmentDraft()

  const itemCount = assignment.status === 'enBorrador'
    ? draftStore.serialLines.reduce((sum, l) => sum + l.serials.length, 0)
      + draftStore.popLines.reduce((sum, l) => sum + l.quantity, 0)
    : assignment.lines.reduce(
        (sum, l) => sum + (l.serials?.length ?? 0) + (l.quantity ?? 0),
        0,
      )

  const status = STATUS_CONFIG[assignment.status] ?? { label: assignment.status, color: '#969696' }

  const expirationLabel = assignment.expirationDate
    ? `Vencimiento: ${formatDate(assignment.expirationDate)}`
    : null

  function handleClick() {
    if (assignment.status === 'enBorrador') {
      if (draftStore.draftId !== assignment.id) {
        draftStore.startDraft(assignment.id)
        if (assignment.destinationHolderId && assignment.destinationEmail) {
          draftStore.setDestination(assignment.destinationHolderId, assignment.destinationEmail)
        }
      }
      navigate('/inventario/asignaciones/nueva')
    } else {
      navigate(`/inventario/asignaciones/${assignment.id}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="bg-white rounded-2xl pl-3 pr-2 py-3 flex gap-4 items-start w-full text-left"
    >
      {/* Globe icon */}
      <div className="shrink-0 w-6 h-6 flex items-center justify-center mt-0.5">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8.5" stroke="#121e6c" strokeWidth="1.3" />
          <ellipse cx="10" cy="10" rx="3.5" ry="8.5" stroke="#121e6c" strokeWidth="1.3" />
          <path d="M1.5 10h17M2 6.5h16M2 13.5h16" stroke="#121e6c" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <p className="text-sm font-medium text-black leading-5">Asignación</p>

        <div className="flex flex-col gap-0.5">
          {assignment.destinationEmail && (
            <p className="text-sm text-black leading-5">{assignment.destinationEmail}</p>
          )}
          <p className="text-sm text-black leading-5">
            {itemCount} ítem{itemCount !== 1 ? 's' : ''}
          </p>
          {expirationLabel && (
            <p className="text-sm text-black leading-5">{expirationLabel}</p>
          )}
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: status.color }}
          />
          <span className="text-[12px] text-[#1e1e1e] leading-4">{status.label}</span>
        </div>
      </div>

      {/* Chevron */}
      <div className="shrink-0 w-6 h-6 flex items-center justify-center mt-0.5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 18l6-6-6-6"
            stroke="#121e6c"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} - ${hh}:${min}:${ss}`
}
