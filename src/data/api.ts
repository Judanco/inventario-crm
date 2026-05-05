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
import type { Order, Assignment, AssignmentLine } from '../domain/types'

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
  const order = orders.find((o) => o.id === orderId)
  return order ? structuredClone(order) : null
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
    const item = serializedItems.find((i) => i.serial === serial)
    if (item) item.status = 'confirmado'
  }
  if (order) order.updatedAt = new Date().toISOString()
  return { ...line }
}

export async function confirmPopCount(orderId: string, lineId: string, qty: number) {
  await delay(100)
  const order = orders.find((o) => o.id === orderId)
  const line = order?.lines.find((l) => l.id === lineId)
  if (!line) throw new Error('Line not found')
  const actualQty = Math.min(qty, line.expectedQty - line.confirmedQty)
  line.confirmedQty = Math.min(line.confirmedQty + qty, line.expectedQty)
  const batch = batches.find(
    (b) => b.orderId === orderId && b.categoryId === line.categoryId && b.status === 'sinConfirmar',
  )
  if (batch) batch.quantity = Math.max(0, batch.quantity - actualQty)
  if (order) order.updatedAt = new Date().toISOString()
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

const ASSIGNMENTS_KEY = 'assignments-data'

function syncAssignments() {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments))
}

export async function fetchAssignments(holderId = CURRENT_USER_ID) {
  await delay()
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY)
    if (raw) assignments.splice(0, assignments.length, ...JSON.parse(raw))
  } catch {}
  return assignments.filter((a) => a.originHolderId === holderId)
}

export function findDraftAssignment(holderId = CURRENT_USER_ID) {
  return assignments.find(
    (a) => a.originHolderId === holderId && a.status === 'enBorrador',
  ) ?? null
}

export async function createDraftAssignment(holderId = CURRENT_USER_ID) {
  await delay(100)
  const draft = {
    id: `ASGN-${Date.now()}`,
    originHolderId: holderId,
    destinationHolderId: null,
    destinationEmail: null,
    lines: [],
    status: 'enBorrador' as const,
    createdAt: new Date().toISOString(),
    expirationDate: null,
  }
  assignments.push(draft)
  syncAssignments()
  return { ...draft }
}

export async function deleteDraftAssignment(id: string) {
  await delay(100)
  const idx = assignments.findIndex((a) => a.id === id)
  if (idx !== -1) assignments.splice(idx, 1)
  syncAssignments()
}

export async function updateAssignmentStatus(id: string, status: Assignment['status']) {
  await delay(100)
  const asgn = assignments.find((a) => a.id === id)
  if (!asgn) throw new Error('Assignment not found')
  asgn.status = status
  asgn.updatedAt = new Date().toISOString()
  syncAssignments()
  return { ...asgn }
}

export async function confirmDraft(
  id: string,
  destinationHolderId: string | null,
  destinationEmail: string | null,
  lines: AssignmentLine[] = [],
  holderId = CURRENT_USER_ID,
) {
  await delay(100)
  const existing = assignments.find((a) => a.id === id)
  if (existing) {
    existing.status = 'pendiente'
    existing.destinationHolderId = destinationHolderId
    existing.destinationEmail = destinationEmail
    existing.lines = lines
  } else {
    assignments.push({
      id,
      originHolderId: holderId,
      destinationHolderId,
      destinationEmail,
      lines,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      expirationDate: null,
    })
  }
  syncAssignments()
  return assignments.find((a) => a.id === id)!
}

export async function fetchAssignment(id: string) {
  await delay()
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY)
    if (raw) assignments.splice(0, assignments.length, ...JSON.parse(raw))
  } catch {}
  return assignments.find((a) => a.id === id) ?? null
}

export async function updateAssignmentDestination(id: string, holderId: string, email: string) {
  await delay(100)
  const asgn = assignments.find((a) => a.id === id)
  if (!asgn) throw new Error('Assignment not found')
  asgn.destinationHolderId = holderId
  asgn.destinationEmail = email
  syncAssignments()
  return { ...asgn }
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

export async function fetchEntityMovements(entityId: string) {
  await delay()
  return movements
    .filter((m) => m.entityId === entityId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}
