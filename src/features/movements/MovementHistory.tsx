import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchOrders, fetchAssignments } from '../../data/api'
import { deriveOrderStatus } from '../orders/utils/orderStats'
import type { Order, Assignment } from '../../domain/types'

const ORDER_TYPE_LABELS: Record<string, string> = {
  AbastecimientoHUB:     'Abastecimiento HUB',
  InboundDelivery:       'Inbound Delivery',
  InboundCashOnDelivery: 'Cash on Delivery',
  Reasignacion:          'Reasignación',
}

const ASSIGNMENT_STATUS_CONFIG: Record<string, { label: string; dotColor: string }> = {
  recibido: { label: 'Recibido',  dotColor: 'bg-green-500'    },
  devuelto: { label: 'Devuelto',  dotColor: 'bg-amber-500'    },
  cancelada:{ label: 'Cancelada', dotColor: 'bg-[#ff2947]'    },
}

type HistoryItem =
  | { kind: 'order';      data: Order;      updatedAt: string }
  | { kind: 'assignment'; data: Assignment; updatedAt: string }

function formatDate(iso: string) {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} - ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function SortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 4v8M5 10l3 3 3-3" stroke="#969696" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowDownIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 13l7 7 7-7" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 19V5M5 11l7-7 7 7" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function OrderHistoryCard({ order, updatedAt, onPress }: { order: Order; updatedAt: string; onPress: () => void }) {
  const totalItems = order.lines.reduce(
    (sum, l) => sum + (l.isSerializable ? l.expectedSerials.length : l.expectedQty), 0,
  )
  const originLabel = order.originType === 'provider' ? 'Proveedor logístico' : order.originEmail

  return (
    <button onClick={onPress} className="w-full text-left bg-white rounded-2xl pl-3 pr-2 py-3 flex gap-4 items-start">
      <div className="shrink-0 w-6 h-6 flex items-center justify-center mt-0.5">
        <ArrowDownIcon />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <p className="text-sm font-medium text-black leading-5">
          {ORDER_TYPE_LABELS[order.type] ?? order.type}
        </p>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm text-black leading-5">{originLabel}</p>
          <p className="text-sm text-black leading-5">
            {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}
          </p>
          <p className="text-sm text-black leading-5">
            Vencimiento: {formatDate(order.expirationDate)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
          <span className="text-[12px] text-[#1e1e1e] leading-4">Confirmado</span>
        </div>
        <p className="text-[12px] text-[#969696] leading-4">
          Fecha de actualización: {formatDate(updatedAt)}
        </p>
      </div>
      <div className="shrink-0 w-6 h-6 flex items-center justify-center mt-0.5">
        <ChevronRight />
      </div>
    </button>
  )
}

function AssignmentHistoryCard({ asgn, updatedAt, onPress }: { asgn: Assignment; updatedAt: string; onPress: () => void }) {
  const totalItems = asgn.lines.reduce(
    (sum, l) => sum + (l.serials?.length ?? 0) + (l.quantity ?? 0), 0,
  )
  const statusCfg = ASSIGNMENT_STATUS_CONFIG[asgn.status] ?? { label: asgn.status, dotColor: 'bg-gray-400' }

  return (
    <button onClick={onPress} className="w-full text-left bg-white rounded-2xl pl-3 pr-2 py-3 flex gap-4 items-start">
      <div className="shrink-0 w-6 h-6 flex items-center justify-center mt-0.5">
        <ArrowUpIcon />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <p className="text-sm font-medium text-black leading-5">Asignación</p>
        <div className="flex flex-col gap-0.5">
          {asgn.destinationEmail && (
            <p className="text-sm text-black leading-5">{asgn.destinationEmail}</p>
          )}
          <p className="text-sm text-black leading-5">
            {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}
          </p>
          {asgn.expirationDate && (
            <p className="text-sm text-black leading-5">
              Vencimiento: {formatDate(asgn.expirationDate)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded-full shrink-0 ${statusCfg.dotColor}`} />
          <span className="text-[12px] text-[#1e1e1e] leading-4">{statusCfg.label}</span>
        </div>
        <p className="text-[12px] text-[#969696] leading-4">
          Fecha de actualización: {formatDate(updatedAt)}
        </p>
      </div>
      <div className="shrink-0 w-6 h-6 flex items-center justify-center mt-0.5">
        <ChevronRight />
      </div>
    </button>
  )
}

export function MovementHistory() {
  const navigate = useNavigate()
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchOrders(),
  })
  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => fetchAssignments(),
  })

  const historyItems = useMemo((): HistoryItem[] => {
    const items: HistoryItem[] = []

    for (const order of orders) {
      if (deriveOrderStatus(order) === 'confirmado') {
        items.push({
          kind: 'order',
          data: order,
          updatedAt: order.updatedAt ?? order.receptionDate,
        })
      }
    }

    for (const asgn of assignments) {
      if (asgn.status === 'cancelada') {
        items.push({
          kind: 'assignment',
          data: asgn,
          updatedAt: asgn.updatedAt ?? asgn.createdAt,
        })
      }
    }

    return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [orders, assignments])

  if (loadingOrders || loadingAssignments) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        Cargando historial…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {historyItems.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-bold text-[#121e6c] leading-5">Historial</h2>
          <div className="flex items-center gap-2">
            <p className="text-[12px] text-[#969696] leading-4">
              Ordenado por <span className="font-bold">fecha de actualización</span>
            </p>
            <SortIcon />
          </div>
        </div>
      )}

      {historyItems.length === 0 ? (
        <div className="flex flex-col items-center pt-16 gap-6">
          <div className="flex flex-col gap-3 items-center text-center w-full">
            <p className="text-base font-semibold text-[#121e6c] leading-5">
              Aún no hay movimientos en tu historial
            </p>
            <p className="text-sm font-normal text-[#1e1e1e] leading-5">
              Aquí aparecerán las órdenes y asignaciones finalizadas.
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
          {historyItems.map((item) =>
            item.kind === 'order'
              ? <OrderHistoryCard
                  key={`order-${item.data.id}`}
                  order={item.data}
                  updatedAt={item.updatedAt}
                  onPress={() => navigate(`/inventario/historial/orden/${item.data.id}`)}
                />
              : <AssignmentHistoryCard
                  key={`asgn-${item.data.id}`}
                  asgn={item.data}
                  updatedAt={item.updatedAt}
                  onPress={() => navigate(`/inventario/historial/asignacion/${item.data.id}`)}
                />
          )}
        </div>
      )}
    </div>
  )
}
