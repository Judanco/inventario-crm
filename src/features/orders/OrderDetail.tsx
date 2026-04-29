import { useNavigate, useParams } from 'react-router-dom'
import type { Order, OrderLine, ProductCategory } from '../../domain/types'
import { useOrder, useCategories } from './hooks/useOrders'

const ORDER_TYPE_LABELS: Record<string, string> = {
  AbastecimientoHUB:     'Abastecimiento HUB',
  InboundDelivery:       'Inbound Delivery',
  InboundCashOnDelivery: 'Cash on Delivery',
  Reasignacion:          'Reasignación',
}

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  sinConfirmar: { label: 'Sin confirmar', color: 'text-[#0a53a5]' },
  enProgreso:   { label: 'En progreso',   color: 'text-amber-600'  },
  confirmado:   { label: 'Confirmado',    color: 'text-green-700'  },
  conNovedad:   { label: 'Con novedad',   color: 'text-amber-700'  },
  devuelto:     { label: 'Devuelto',      color: 'text-purple-700' },
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} - ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function orderStats(order: Order) {
  let sinConfirmar = 0
  let confirmados = 0
  for (const line of order.lines) {
    if (line.isSerializable) {
      confirmados  += line.confirmedSerials.length
      sinConfirmar += line.expectedSerials.length - line.confirmedSerials.length
    } else {
      confirmados  += line.confirmedQty
      sinConfirmar += line.expectedQty - line.confirmedQty
    }
  }
  return { sinConfirmar, confirmados, novedades: order.novelties.length }
}


function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 bg-white rounded-2xl flex flex-col gap-0.5 items-center justify-center p-3">
      <span className="text-2xl font-semibold text-black leading-7">{value}</span>
      <span className="text-[12px] text-black leading-4 text-center">{label}</span>
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12px] font-semibold text-[#121e6c] leading-4">{label}</p>
      <p className="text-[12px] text-[#1e1e1e] leading-4">{value}</p>
    </div>
  )
}

function LineCard({
  line,
  category,
}: {
  line: OrderLine
  category: ProductCategory | undefined
}) {
  const confirmed = line.isSerializable
    ? line.confirmedSerials.length
    : line.confirmedQty
  const total = line.isSerializable ? line.expectedSerials.length : line.expectedQty
  const name = category?.name ?? line.categoryId

  return (
    <div className="bg-white rounded-2xl pl-3 pr-2 py-3 flex gap-3 items-center">
      <div className="shrink-0 w-8 h-8">
        {category && (
          <img
            src={category.iconPath}
            alt={name}
            className="w-full h-full object-contain"
          />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className="text-sm font-bold text-[#121e6c] leading-5">
          {total} {name}
        </p>
        <p className="text-[12px] text-[#1e1e1e] leading-4">
          {confirmed}/{total} confirmados
        </p>
      </div>
      <div className="shrink-0 w-6 h-6 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

export function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading, isError } = useOrder(orderId)
  const { data: categories } = useCategories()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fb] flex items-center justify-center text-sm text-gray-400">
        Cargando orden…
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-[#f7f8fb] flex items-center justify-center text-sm text-[#ff2947]">
        Error al cargar la orden.
      </div>
    )
  }

  const { sinConfirmar, confirmados, novedades } = orderStats(order)
  const statusCfg = ORDER_STATUS_CONFIG[order.status] ?? { label: order.status, color: 'text-gray-600' }
  const categoryMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c]))

  const originLabel =
    order.originType === 'provider'
      ? `Proveedor logístico / ${order.originEmail}`
      : order.originEmail

  const destLabel = order.destinationHubName
    ? `${order.destinationEmail} / ${order.destinationHubName}`
    : order.destinationEmail

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
            {ORDER_TYPE_LABELS[order.type] ?? order.type}
          </h1>
          <span className={`shrink-0 bg-white rounded-lg px-2 py-1 text-[12px] font-normal leading-4 ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-10 pb-32 flex flex-col gap-10">
        {/* Stats row */}
        <div className="flex gap-2">
          <StatPill value={sinConfirmar} label="Sin confirmar" />
          <StatPill value={confirmados}  label="Confirmados"   />
          <StatPill value={novedades}    label="Novedades"     />
        </div>

        {/* Warning banner */}
        <div className="bg-amber-50 border border-amber-400 rounded-2xl flex gap-3 items-center p-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0 text-amber-500">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-[12px] text-[#1e1e1e] leading-4 flex-1">
            Una vez cumplida la fecha de vencimiento se asumirá que la orden se recibió sin novedades.
          </p>
        </div>

        {/* Datos de la orden */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[#121e6c] leading-5">Datos de la orden</h2>
          <div className="bg-white rounded-2xl p-3 flex flex-col gap-4">
            <DataRow label="Tipo"                 value={ORDER_TYPE_LABELS[order.type] ?? order.type} />
            <hr className="border-t border-[#f1f2f6]" />
            <DataRow label="Origen"               value={originLabel} />
            <hr className="border-t border-[#f1f2f6]" />
            <DataRow label="Destino"              value={destLabel} />
            <hr className="border-t border-[#f1f2f6]" />
            <DataRow label="Vencimiento"     value={formatDate(order.expirationDate)} />
            <hr className="border-t border-[#f1f2f6]" />
            <DataRow label="Número de orden" value={order.orderNumber} />
          </div>
        </div>

        {/* Artículos */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[#121e6c] leading-5">Artículos</h2>
          <div className="flex flex-col gap-3">
            {order.lines.map((line) => (
              <LineCard key={line.id} line={line} category={categoryMap[line.categoryId]} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom actions — fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-[rgba(247,248,251,0.9)] backdrop-blur-sm flex flex-col gap-2 px-[72px] py-5">
        <button className="h-10 flex items-center justify-center text-sm font-medium text-[#121e6c]">
          Reportar novedad
        </button>
        <button
          onClick={() => navigate(`/inventario/ordenes/${order.id}/confirmar`)}
          className="h-10 bg-[#ff2947] rounded-[32px] flex items-center justify-center text-sm font-medium text-white"
        >
          Iniciar confirmación
        </button>
      </div>
    </div>
  )
}
