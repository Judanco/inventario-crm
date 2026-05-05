import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAssignment, fetchCategories, updateAssignmentStatus } from '../../data/api'
import { useAssignmentDraft } from '../../store/assignmentDraft'
import type { AssignmentLine, ProductCategory } from '../../domain/types'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  enBorrador: { label: 'Borrador',              color: '#969696' },
  pendiente:  { label: 'Confirmación pendiente', color: '#f5a623' },
  enTransito: { label: 'En tránsito',            color: '#121e6c' },
  recibido:   { label: 'Recibido',               color: '#2e7d32' },
  devuelto:   { label: 'Devuelto',               color: '#ff2947' },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} - ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12px] font-semibold text-[#121e6c] leading-4">{label}</p>
      <p className="text-[12px] text-[#1e1e1e] leading-4">{value}</p>
    </div>
  )
}

function LineCard({ line, category }: { line: AssignmentLine; category: ProductCategory | undefined }) {
  const count = line.isSerializable ? (line.serials?.length ?? 0) : (line.quantity ?? 0)
  const name = category?.name ?? line.categoryId

  return (
    <div className="bg-white rounded-2xl pl-3 pr-2 py-3 flex gap-3 items-center">
      <div className="shrink-0 w-8 h-8">
        {category && (
          <img src={category.iconPath} alt={name} className="w-full h-full object-contain" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#121e6c] leading-5">{count} {name}</p>
      </div>
    </div>
  )
}

export function AssignmentDetail() {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { reset } = useAssignmentDraft()

  const { data: assignment, isLoading, isError } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => fetchAssignment(assignmentId!),
  })
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fb] flex items-center justify-center text-sm text-gray-400">
        Cargando asignación…
      </div>
    )
  }

  if (isError || !assignment) {
    return (
      <div className="min-h-screen bg-[#f7f8fb] flex items-center justify-center text-sm text-[#ff2947]">
        Error al cargar la asignación.
      </div>
    )
  }

  async function handleCancel() {
    await updateAssignmentStatus(assignmentId!, 'cancelada')
    queryClient.invalidateQueries({ queryKey: ['assignments'] })
    reset()
    navigate('/inventario/asignaciones')
  }

  const status = STATUS_CONFIG[assignment.status] ?? { label: assignment.status, color: '#969696' }
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]))

  return (
    <div className="min-h-screen bg-[#f7f8fb] flex flex-col">
      {/* Header */}
      <div className="bg-[#f7f8fb] pt-6 px-4 pb-0 flex flex-col gap-8">
        <button
          onClick={() => navigate(-1)}
          className="w-6 h-6 flex items-center justify-center"
          aria-label="Volver"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <h1 className="flex-1 text-[20px] font-bold text-[#121e6c] leading-6 min-w-0">
            Asignación
          </h1>
          <span
            className="shrink-0 bg-white rounded-lg px-2 py-1 text-[12px] font-normal leading-4"
            style={{ color: status.color }}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-10 pb-32 flex flex-col gap-10">
        {/* Datos de la asignación */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[#121e6c] leading-5">Datos de la asignación</h2>
          <div className="bg-white rounded-2xl p-3 flex flex-col gap-4">
            {assignment.destinationEmail && (
              <>
                <DataRow label="Destino" value={assignment.destinationEmail} />
                <hr className="border-t border-[#f1f2f6]" />
              </>
            )}
            {assignment.createdAt && (
              <DataRow label="Fecha de creación" value={formatDate(assignment.createdAt)} />
            )}
            {assignment.expirationDate && (
              <>
                <hr className="border-t border-[#f1f2f6]" />
                <DataRow label="Vencimiento" value={formatDate(assignment.expirationDate)} />
              </>
            )}
          </div>
        </div>

        {/* Artículos */}
        {(() => {
          const serialLines = assignment.lines.filter((l) => l.isSerializable)
          const popLines = assignment.lines.filter((l) => !l.isSerializable)
          const popTotal = popLines.reduce((sum, l) => sum + (l.quantity ?? 0), 0)
          const hasItems = serialLines.length > 0 || popTotal > 0

          return (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-[#121e6c] leading-5">Artículos</h2>
              <div className="flex flex-col gap-3">
                {serialLines.map((line) => (
                  <LineCard key={line.categoryId} line={line} category={categoryMap[line.categoryId]} />
                ))}
                {popTotal > 0 && (
                  <div className="bg-white rounded-2xl pl-3 pr-2 py-3 flex gap-3 items-center">
                    <div className="shrink-0 w-8 h-8" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#121e6c] leading-5">{popTotal} Material PoP</p>
                    </div>
                    <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                )}
                {!hasItems && (
                  <p className="text-sm text-[#969696] text-center py-6">Sin artículos registrados.</p>
                )}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[rgba(247,248,251,0.9)] backdrop-blur-sm flex flex-col gap-2 px-[72px] py-5">
        <button
          onClick={handleCancel}
          className="h-10 bg-white rounded-[32px] flex items-center justify-center text-sm font-medium text-[#ff2947]"
        >
          Cancelar asignación
        </button>
      </div>
    </div>
  )
}
