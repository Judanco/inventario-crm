import { useNavigate } from 'react-router-dom'
import type { Order } from '../../domain/types'
import { useOrderList } from './hooks/useOrders'
import { deriveOrderStatus } from './utils/orderStats'

const ORDER_TYPE_LABELS: Record<string, string> = {
  AbastecimientoHUB:     'Abastecimiento HUB',
  InboundDelivery:       'Inbound Delivery',
  InboundCashOnDelivery: 'Cash on Delivery',
  Reasignacion:          'Reasignación',
}

const DERIVED_STATUS_CONFIG: Record<string, { label: string; dotColor: string }> = {
  sinConfirmar:        { label: 'Sin confirmar',        dotColor: 'bg-[#0a53a5]' },
  confirmacionParcial: { label: 'Confirmación parcial', dotColor: 'bg-amber-500'  },
  confirmado:          { label: 'Confirmado',            dotColor: 'bg-green-600'  },
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} - ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function orderTotalItems(order: Order): number {
  return order.lines.reduce(
    (sum, l) => sum + (l.isSerializable ? l.expectedSerials.length : l.expectedQty),
    0,
  )
}

function GlobeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#121e6c" strokeWidth="1.5" />
      <path d="M3 12h18M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9" stroke="#121e6c" strokeWidth="1.5" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 18L15 12L9 6" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 4v8M5 10l3 3 3-3" stroke="#969696" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate()
  const total = orderTotalItems(order)
  const derived = deriveOrderStatus(order)
  const statusCfg = DERIVED_STATUS_CONFIG[derived]

  return (
    <button
      onClick={() => navigate(`/inventario/ordenes/${order.id}`)}
      className="w-full bg-white rounded-2xl pl-3 pr-2 py-3 flex gap-4 items-start text-left"
    >
      <div className="shrink-0 w-6 h-6 mt-0.5">
        <GlobeIcon />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <p className="text-sm font-medium text-black leading-5">
          {ORDER_TYPE_LABELS[order.type] ?? order.type}
        </p>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm text-black leading-5">
            {order.originType === 'provider' ? 'Proveedor logístico' : order.originEmail}
          </p>
          <p className="text-sm text-black leading-5">
            {total} {total === 1 ? 'ítem' : 'ítems'}
          </p>
          <p className="text-sm text-black leading-5">
            Vencimiento: {formatDate(order.expirationDate)}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusCfg.dotColor}`} />
          <span className="text-[12px] text-[#1e1e1e] leading-4">
            {statusCfg.label}
          </span>
        </div>

        <p className="text-[12px] text-[#969696] leading-4">
          Recepción: {formatDate(order.receptionDate)}
        </p>
      </div>

      <div className="shrink-0 w-6 h-6 self-center">
        <ChevronRightIcon />
      </div>
    </button>
  )
}

export function OrderList() {
  const { data: orders, isLoading, isError } = useOrderList()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        Cargando órdenes…
      </div>
    )
  }

  if (isError || !orders) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[#ff2947]">
        Error al cargar las órdenes.
      </div>
    )
  }

  const activeOrders = orders.filter((o) => deriveOrderStatus(o) !== 'confirmado')

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-bold text-[#121e6c] leading-5">Órdenes</h2>
        {activeOrders.length > 0 && (
          <div className="flex items-center gap-2">
            <p className="text-[12px] text-[#969696] leading-4">
              Ordenado por <span className="font-bold">fecha de recepción</span>
            </p>
            <SortIcon />
          </div>
        )}
      </div>

      {activeOrders.length === 0 ? (
        <div className="flex flex-col items-center gap-6 pt-8">
          <img
            src="/assets/illustrations/ill-time-out.svg"
            alt=""
            className="w-24 h-24 object-contain"
          />
          <p className="text-sm text-[#1f2a74] text-center leading-5 px-0">
            No tienes ordenes pendientes de confirmación o en tránsito.
            Si necesitas reabastecer inventario genera una solicitud.
          </p>
          <button
            onClick={() => {}}
            className="bg-white rounded-[32px] px-5 h-10 text-sm font-medium text-[#ff2947] shadow-sm"
          >
            Generar solicitud
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
