import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchOrder, fetchAssignment, fetchEntityMovements } from '../../data/api'
import type { Movement } from '../../domain/types'

const ORDER_TYPE_LABELS: Record<string, string> = {
  AbastecimientoHUB:     'Abastecimiento HUB',
  InboundDelivery:       'Inbound Delivery',
  InboundCashOnDelivery: 'Cash on Delivery',
  Reasignacion:          'Reasignación',
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  confirmado:   'Confirmado',
  conNovedad:   'Con novedad',
  devuelto:     'Devuelto',
  sinConfirmar: 'Sin confirmar',
  enProgreso:   'En progreso',
}

const ASGN_STATUS_LABELS: Record<string, string> = {
  recibido:  'Recibido',
  devuelto:  'Devuelto',
  cancelada: 'Cancelada',
  pendiente: 'Pendiente',
  enTransito:'En tránsito',
  enBorrador:'En borrador',
}

type EventConfig = {
  label: string
  dotColor: string
  isStart?: boolean
}

const EVENT_CONFIG: Record<string, EventConfig> = {
  vencimiento:  { label: 'Vencimiento',     dotColor: '#f59e0b' },
  confirmacion: { label: 'Confirmación',     dotColor: '#22c55e' },
  novedad:      { label: 'Reporte novedad',  dotColor: '#3b82f6' },
  enviado:      { label: 'Enviado',          dotColor: '#3b82f6' },
  recibido:     { label: 'Recibido',         dotColor: '#22c55e' },
  cancelada:    { label: 'Cancelada',        dotColor: '#ff2947' },
  devuelto:     { label: 'Devuelto',         dotColor: '#f59e0b' },
  recepcion:    { label: 'Recepción',        dotColor: '#969696', isStart: true },
  creacion:     { label: 'Creación',         dotColor: '#969696', isStart: true },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  const h = d.getHours()
  const ampm = h >= 12 ? 'p.m.' : 'a.m.'
  const h12 = h % 12 || 12
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} - ${p(h12)}:${p(d.getMinutes())}:${p(d.getSeconds())} ${ampm}`
}

function buildDescription(evt: Movement): string {
  const p = evt.payload as Record<string, unknown>
  if (evt.eventType === 'confirmacion') {
    const actor = evt.actorId ?? ''
    if (p.serial) {
      const label = p.categoryLabel ? `${p.categoryLabel} - ` : ''
      return `${actor}\n\nSerial: ${label}${p.serial}`
    }
    if (p.qty) {
      const label = p.categoryLabel ? ` (${p.categoryLabel})` : ''
      return `${actor}\n\nCantidad: ${p.qty}${label}`
    }
    return actor
  }
  if (evt.eventType === 'vencimiento') {
    return p.autoConfirmed
      ? 'Inventario confirmado automáticamente.'
      : 'Orden devuelta al origen.'
  }
  if (evt.eventType === 'enviado') {
    return p.destination ? `Enviado a ${p.destination}` : ''
  }
  return evt.actorId ?? ''
}

function StepIndicator({ color, isStart, hasConnector }: { color: string; isStart?: boolean; hasConnector: boolean }) {
  return (
    <div className="flex flex-col items-center w-6 self-stretch shrink-0">
      {isStart ? (
        <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
      ) : (
        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: color }}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        </div>
      )}
      {hasConnector && (
        <div className="flex-1 w-px mt-1" style={{ backgroundColor: '#e5e7eb' }} />
      )}
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold text-[#121e6c] leading-4">{label}</span>
      <span className="text-[12px] text-[#1e1e1e] leading-4">{value}</span>
    </div>
  )
}

export function HistorialDetail() {
  const navigate = useNavigate()
  const { entityType, entityId } = useParams<{ entityType: string; entityId: string }>()

  const { data: order, isLoading: loadingOrder } = useQuery({
    queryKey: ['order', entityId],
    queryFn: () => fetchOrder(entityId!),
    enabled: entityType === 'orden',
  })

  const { data: asgn, isLoading: loadingAsgn } = useQuery({
    queryKey: ['assignment', entityId],
    queryFn: () => fetchAssignment(entityId!),
    enabled: entityType === 'asignacion',
  })

  const { data: evts = [], isLoading: loadingEvts } = useQuery({
    queryKey: ['movements', entityId],
    queryFn: () => fetchEntityMovements(entityId!),
  })

  const isLoading = loadingOrder || loadingAsgn || loadingEvts

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fb] flex items-center justify-center">
        <div className="text-sm text-gray-400">Cargando…</div>
      </div>
    )
  }

  // ── Order view ─────────────────────────────────────────────────────────────
  if (entityType === 'orden' && order) {
    const confirmedTotal = order.lines.reduce(
      (sum, l) => sum + l.confirmedSerials.length + l.confirmedQty, 0,
    )
    const novedades = order.novelties.length
    const title = ORDER_TYPE_LABELS[order.type] ?? order.type
    const statusLabel = ORDER_STATUS_LABELS[order.status] ?? order.status
    const origenLabel = order.originType === 'provider'
      ? `Proveedor logístico / ${order.originEmail}`
      : order.originEmail
    const destinoLabel = order.destinationHubName
      ? `${order.destinationEmail} / ${order.destinationHubName}`
      : order.destinationEmail

    return (
      <DetailLayout
        title={title}
        statusLabel={statusLabel}
        confirmedTotal={confirmedTotal}
        novedades={novedades}
        dataRows={[
          { label: 'Tipo',             value: ORDER_TYPE_LABELS[order.type] ?? order.type },
          { label: 'Origen',           value: origenLabel },
          { label: 'Destino',          value: destinoLabel },
          { label: 'Número de orden',  value: order.orderNumber },
        ]}
        events={evts}
        onBack={() => navigate(-1)}
      />
    )
  }

  // ── Assignment view ────────────────────────────────────────────────────────
  if (entityType === 'asignacion' && asgn) {
    const confirmedTotal = asgn.lines.reduce(
      (sum, l) => sum + (l.serials?.length ?? 0) + (l.quantity ?? 0), 0,
    )
    const statusLabel = ASGN_STATUS_LABELS[asgn.status] ?? asgn.status

    return (
      <DetailLayout
        title="Asignación"
        statusLabel={statusLabel}
        confirmedTotal={confirmedTotal}
        novedades={0}
        dataRows={[
          { label: 'Tipo',    value: 'Asignación' },
          { label: 'Origen',  value: asgn.originHolderId },
          { label: 'Destino', value: asgn.destinationEmail ?? '—' },
          { label: 'ID',      value: asgn.id },
        ]}
        events={evts}
        onBack={() => navigate(-1)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fb] flex items-center justify-center">
      <p className="text-sm text-gray-400">Registro no encontrado.</p>
    </div>
  )
}

// ── Shared layout ─────────────────────────────────────────────────────────────

type DataRowData = { label: string; value: string }

function DetailLayout({
  title,
  statusLabel,
  confirmedTotal,
  novedades,
  dataRows,
  events,
  onBack,
}: {
  title: string
  statusLabel: string
  confirmedTotal: number
  novedades: number
  dataRows: DataRowData[]
  events: Movement[]
  onBack: () => void
}) {
  return (
    <div className="min-h-screen bg-[#f7f8fb] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f7f8fb] py-4 px-3 flex items-center gap-2">
        <button onClick={onBack} className="shrink-0" aria-label="Volver">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-4 pt-2 pb-10 flex flex-col gap-10">
        {/* Title + badge */}
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold text-[#121e6c] leading-6 flex-1 min-w-0">{title}</h1>
          <div className="bg-white rounded-lg px-2 py-1 shrink-0">
            <span className="text-[12px] font-normal text-[#0a53a5] leading-4">{statusLabel}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-2">
          <div className="flex-1 bg-white rounded-2xl p-3 flex flex-col items-center gap-0.5">
            <span className="text-2xl font-semibold text-black leading-7">{confirmedTotal}</span>
            <span className="text-[12px] text-black text-center leading-4">Confirmados</span>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-3 flex flex-col items-center gap-0.5">
            <span className="text-2xl font-semibold text-black leading-7">{novedades}</span>
            <span className="text-[12px] text-black text-center leading-4">Novedades</span>
          </div>
        </div>

        {/* Data card */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[#121e6c] leading-5">Datos de la orden</h2>
          <div className="bg-white rounded-2xl p-3 flex flex-col gap-4">
            {dataRows.map((row, i) => (
              <div key={row.label}>
                <DataRow label={row.label} value={row.value} />
                {i < dataRows.length - 1 && (
                  <div className="mt-4 border-t border-[#f1f2f6]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {events.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-[#121e6c] leading-5">Historial</h2>
            <div className="flex flex-col">
              {events.map((evt, i) => {
                const cfg = EVENT_CONFIG[evt.eventType] ?? { label: evt.eventType, dotColor: '#969696' }
                const isLast = i === events.length - 1
                const description = buildDescription(evt)
                return (
                  <div key={evt.id} className="flex gap-3 items-start">
                    <StepIndicator
                      color={cfg.dotColor}
                      isStart={cfg.isStart}
                      hasConnector={!isLast}
                    />
                    <div className="flex-1 min-w-0 flex flex-col gap-3 pb-6">
                      <div className="flex items-center justify-between gap-2 h-6">
                        <span className="text-sm font-semibold text-[#6c759f] leading-5 truncate">
                          {cfg.label}
                        </span>
                        <span className="text-[12px] text-[#606060] leading-4 whitespace-nowrap shrink-0">
                          {formatDate(evt.timestamp)}
                        </span>
                      </div>
                      {description && (
                        <p className="text-[12px] text-[#1e1e1e] leading-4 whitespace-pre-line">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
