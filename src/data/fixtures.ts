import type {
  ProductCategory,
  SerializedItem,
  InventoryBatch,
  Order,
  Assignment,
  Movement,
  Holder,
} from '../domain/types'

export const CURRENT_USER_ID = 'exec-001'

// ─── Holders ─────────────────────────────────────────────────────────────────

export const holders: Holder[] = [
  { id: 'exec-001', name: 'Restaurante Andrés P', email: 'andres.p@bold.co', role: 'executive' },
  { id: 'exec-002', name: 'María Torres',         email: 'maria.t@bold.co',  role: 'executive' },
  { id: 'exec-003', name: 'Carlos Mendez',        email: 'carlos.m@bold.co', role: 'executive' },
  { id: 'tl-001',   name: 'Team Lead HUB',        email: 'hub@bold.co',      role: 'teamlead'  },
]

// ─── Product categories (data-driven — adding a new one here is enough) ───────

export const categories: ProductCategory[] = [
  {
    id: 'neo',
    name: 'Neo',
    isSerializable: true,
    unit: 'unidad',
    iconPath: '/assets/icons/neo.png',
    lowStockThreshold: 3,
  },
  {
    id: 'plus',
    name: 'Plus',
    isSerializable: true,
    unit: 'unidad',
    iconPath: '/assets/icons/plus.png',
    lowStockThreshold: 3,
  },
  {
    id: 'smart',
    name: 'Smart',
    isSerializable: true,
    unit: 'unidad',
    iconPath: '/assets/icons/smart.png',
    lowStockThreshold: 3,
  },
  {
    id: 'smart-pro',
    name: 'Smart Pro',
    isSerializable: true,
    unit: 'unidad',
    iconPath: '/assets/icons/smart-pro.png',
    lowStockThreshold: 3,
  },
  {
    id: 'sonoqr',
    name: 'SonoQR',
    isSerializable: true,
    unit: 'unidad',
    iconPath: '/assets/icons/sonoqr.png',
    lowStockThreshold: 3,
  },
  {
    id: 'tarjeta',
    name: 'Tarjetas',
    isSerializable: false,
    unit: 'unidad',
    iconPath: '/assets/icons/tarjetas.png',
    lowStockThreshold: 50,
  },
  {
    id: 'pop',
    name: 'Material PoP',
    isSerializable: false,
    unit: 'unidad',
    iconPath: '/assets/icons/material-pop.png',
    lowStockThreshold: 10,
  },
]

// ─── Serialized items ─────────────────────────────────────────────────────────

export const serializedItems: SerializedItem[] = [
  { id: 'si-1',  serial: '37489', categoryId: 'neo',       status: 'sinConfirmar', holderId: 'exec-001', orderId: 'ORD-001' },
  { id: 'si-2',  serial: '37443', categoryId: 'neo',       status: 'sinConfirmar', holderId: 'exec-001', orderId: 'ORD-001' },
  { id: 'si-3',  serial: '38201', categoryId: 'neo',       status: 'disponible',   holderId: 'exec-001' },
  { id: 'si-4',  serial: '38202', categoryId: 'plus',      status: 'disponible',   holderId: 'exec-001' },
  { id: 'si-5',  serial: '38990', categoryId: 'plus',      status: 'enTransito',   holderId: 'exec-001', assignmentId: 'ASGN-001' },
  { id: 'si-6',  serial: '39001', categoryId: 'smart',     status: 'disponible',   holderId: 'exec-001' },
  { id: 'si-7',  serial: '39002', categoryId: 'smart',     status: 'disponible',   holderId: 'exec-001' },
  { id: 'si-8',  serial: '39003', categoryId: 'smart',     status: 'confirmado',   holderId: 'exec-001' },
  { id: 'si-9',  serial: '40001', categoryId: 'smart-pro', status: 'disponible',   holderId: 'exec-001' },
  { id: 'si-10', serial: '40002', categoryId: 'smart-pro', status: 'enTransito',   holderId: 'exec-001' },
  { id: 'si-11', serial: '41001', categoryId: 'sonoqr',    status: 'disponible',   holderId: 'exec-001' },
  { id: 'si-12', serial: '41002', categoryId: 'sonoqr',    status: 'disponible',   holderId: 'exec-001' },
  { id: 'si-13', serial: '41003', categoryId: 'sonoqr',    status: 'conNovedad',   holderId: 'exec-001' },
]

// ─── PoP batches ─────────────────────────────────────────────────────────────

export const batches: InventoryBatch[] = [
  { id: 'bt-1', categoryId: 'tarjeta', quantity: 30, status: 'disponible',   holderId: 'exec-001' },
  { id: 'bt-2', categoryId: 'tarjeta', quantity: 15, status: 'sinConfirmar', holderId: 'exec-001', orderId: 'ORD-001' },
  { id: 'bt-3', categoryId: 'pop',     quantity: 6,  status: 'disponible',   holderId: 'exec-001' },
  { id: 'bt-4', categoryId: 'pop',     quantity: 10, status: 'sinConfirmar', holderId: 'exec-001', orderId: 'ORD-001' },
]

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders: Order[] = [
  {
    id: 'ORD-001',
    type: 'AbastecimientoHUB',
    originType: 'provider',
    originHolderId: 'tl-001',
    originEmail: 'proveedor@bold.co',
    destinationHolderId: 'exec-001',
    destinationEmail: 'andres.p@bold.co',
    destinationHubName: 'HUB Norte',
    expirationDate: '2026-04-11T13:30:00',
    receptionDate: '2026-04-09T13:30:00',
    status: 'sinConfirmar',
    orderNumber: 'ABC19200',
    lines: [
      {
        id: 'ol-1', categoryId: 'neo', isSerializable: true,
        expectedSerials: ['37489', '37443'], confirmedSerials: [],
        expectedQty: 0, confirmedQty: 0,
      },
      {
        id: 'ol-2', categoryId: 'plus', isSerializable: true,
        expectedSerials: ['38990'], confirmedSerials: [],
        expectedQty: 0, confirmedQty: 0,
      },
      {
        id: 'ol-3', categoryId: 'tarjeta', isSerializable: false,
        expectedSerials: [], confirmedSerials: [],
        expectedQty: 15, confirmedQty: 0,
      },
      {
        id: 'ol-4', categoryId: 'pop', isSerializable: false,
        expectedSerials: [], confirmedSerials: [],
        expectedQty: 10, confirmedQty: 0,
      },
    ],
    novelties: [],
  },
  {
    id: 'ORD-002',
    type: 'Reasignacion',
    originType: 'executive',
    originHolderId: 'exec-002',
    originEmail: 'maria.t@bold.co',
    destinationHolderId: 'exec-001',
    destinationEmail: 'andres.p@bold.co',
    expirationDate: '2026-04-11T13:30:00',
    receptionDate: '2026-04-09T13:30:00',
    status: 'sinConfirmar',
    orderNumber: 'RSG00423',
    lines: [
      {
        id: 'ol-5', categoryId: 'smart', isSerializable: true,
        expectedSerials: ['39001'], confirmedSerials: [],
        expectedQty: 0, confirmedQty: 0,
      },
    ],
    novelties: [],
  },
]

// ─── Assignments ──────────────────────────────────────────────────────────────

export const assignments: Assignment[] = [
  {
    id: 'ASGN-001',
    originHolderId: 'exec-001',
    destinationHolderId: 'exec-003',
    destinationEmail: 'carlos.m@bold.co',
    lines: [
      { categoryId: 'plus', isSerializable: true,  serials: ['38990'] },
    ],
    status: 'enTransito',
    createdAt: '2026-04-27T09:00:00',
    expirationDate: '2026-04-30T23:59:59',
  },
]

// ─── Movements ────────────────────────────────────────────────────────────────

export const movements: Movement[] = [
  {
    id: 'mv-1',
    entityType: 'assignment',
    entityId: 'ASGN-001',
    timestamp: '2026-04-27T09:00:00',
    actorId: 'exec-001',
    eventType: 'assigned',
    payload: { destinationEmail: 'carlos.m@bold.co', itemCount: 1 },
  },
  {
    id: 'mv-2',
    entityType: 'order',
    entityId: 'ORD-002',
    timestamp: '2026-04-27T08:30:00',
    actorId: 'exec-002',
    eventType: 'created',
    payload: { orderNumber: 'RSG00423' },
  },
]
