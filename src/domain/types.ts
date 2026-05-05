// ─── Catalogue ───────────────────────────────────────────────────────────────

export interface ProductCategory {
  id: string
  name: string
  isSerializable: boolean
  unit: string
  iconPath: string          // path dentro de /assets/icons/
  lowStockThreshold?: number
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export type ItemStatus =
  | 'sinConfirmar'
  | 'confirmado'
  | 'disponible'
  | 'enTransito'
  | 'conNovedad'
  | 'devuelto'

export interface SerializedItem {
  id: string
  serial: string
  categoryId: string
  status: ItemStatus
  holderId: string
  orderId?: string
  assignmentId?: string
}

export interface InventoryBatch {
  id: string
  categoryId: string
  quantity: number
  status: ItemStatus
  holderId: string
  orderId?: string
  assignmentId?: string
}

// ─── Orders (inbound) ────────────────────────────────────────────────────────

export type OrderType =
  | 'AbastecimientoHUB'
  | 'InboundDelivery'
  | 'InboundCashOnDelivery'
  | 'Reasignacion'

export type OriginType = 'provider' | 'executive' | 'teamlead'

export type OrderStatus = 'sinConfirmar' | 'enProgreso' | 'confirmado' | 'conNovedad' | 'devuelto'

export interface OrderLine {
  id: string
  categoryId: string
  isSerializable: boolean
  expectedSerials: string[]
  confirmedSerials: string[]
  expectedQty: number
  confirmedQty: number
}

export interface Novelty {
  id: string
  description: string
  createdAt: string
}

export interface Order {
  id: string
  type: OrderType
  originType: OriginType
  originHolderId: string
  originEmail: string
  destinationHolderId: string
  destinationEmail: string
  destinationHubName?: string
  expirationDate: string
  receptionDate: string
  status: OrderStatus
  orderNumber: string
  lines: OrderLine[]
  novelties: Novelty[]
}

// ─── Assignments (outbound) ───────────────────────────────────────────────────

export type AssignmentStatus = 'enBorrador' | 'pendiente' | 'enTransito' | 'recibido' | 'devuelto'

export interface AssignmentLine {
  categoryId: string
  isSerializable: boolean
  serials?: string[]
  quantity?: number
}

export interface Assignment {
  id: string
  originHolderId: string
  destinationHolderId: string | null
  destinationEmail: string | null
  lines: AssignmentLine[]
  status: AssignmentStatus
  createdAt: string
  expirationDate?: string | null
}

// ─── Movements ───────────────────────────────────────────────────────────────

export interface Movement {
  id: string
  entityType: 'order' | 'assignment' | 'item' | 'batch'
  entityId: string
  timestamp: string
  actorId: string
  eventType: string
  payload: Record<string, unknown>
}

// ─── Holders ─────────────────────────────────────────────────────────────────

export interface Holder {
  id: string
  name: string
  email: string
  role: 'executive' | 'teamlead'
}

// ─── Computed summaries ───────────────────────────────────────────────────────

export interface CategoryInventorySummary {
  category: ProductCategory
  confirmedTotal: number   // all statuses except sinConfirmar
  sinConfirmar: number
  isLowStock: boolean
}

export interface InventoryOverviewSummary {
  byCategory: CategoryInventorySummary[]
}
