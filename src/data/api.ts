import {
  categories,
  serializedItems,
  batches,
  orders,
  assignments,
  movements,
  holders,
  CURRENT_USER_ID,
} from './fixtures'
import type { Order, OrderLine } from '../domain/types'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

// ─── Inventory ────────────────────────────────────────────────────────────────

export async function fetchCategories() {
  await delay()
  return [...categories]
}

export async function fetchSerializedItems(holderId = CURRENT_USER_ID) {
  await delay()
  return serializedItems.filter((i) => i.holderId === holderId)
}

export async function fetchBatches(holderId = CURRENT_USER_ID) {
  await delay()
  return batches.filter((b) => b.holderId === holderId)
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function fetchOrders(holderId = CURRENT_USER_ID) {
  await delay()
  return orders.filter((o) => o.destinationHolderId === holderId)
}

export async function fetchOrder(orderId: string) {
  await delay()
  return orders.find((o) => o.id === orderId) ?? null
}

export async function confirmSerial(orderId: string, lineId: string, serial: string) {
  await delay(100)
  const order = orders.find((o) => o.id === orderId)
  const line = order?.lines.find((l) => l.id === lineId)
  if (!line) throw new Error('Line not found')
  if (!line.expectedSerials.includes(serial)) {
    throw new Error('SERIAL_NOT_IN_ORDER')
  }
  if (!line.confirmedSerials.includes(serial)) {
    line.confirmedSerials.push(serial)
  }
  return { ...line }
}

export async function confirmPopCount(orderId: string, lineId: string, qty: number) {
  await delay(100)
  const order = orders.find((o) => o.id === orderId)
  const line = order?.lines.find((l) => l.id === lineId)
  if (!line) throw new Error('Line not found')
  line.confirmedQty = Math.min(line.confirmedQty + qty, line.expectedQty)
  return { ...line }
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  await delay(100)
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Order not found')
  order.status = status
  return { ...order }
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export async function fetchAssignments(holderId = CURRENT_USER_ID) {
  await delay()
  return assignments.filter((a) => a.originHolderId === holderId)
}

export async function fetchHolders() {
  await delay()
  return holders.filter((h) => h.id !== CURRENT_USER_ID)
}

// ─── Movements ────────────────────────────────────────────────────────────────

export async function fetchMovements(holderId = CURRENT_USER_ID) {
  await delay()
  return movements.filter((m) => {
    const order = orders.find((o) => o.id === m.entityId)
    const asgn = assignments.find((a) => a.id === m.entityId)
    return (
      order?.destinationHolderId === holderId ||
      asgn?.originHolderId === holderId ||
      m.actorId === holderId
    )
  })
}
