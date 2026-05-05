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
  { id: 'exec-001', name: 'Restaurante Andrés P', email: 'andres.p@bold.co',    role: 'executive' },
  { id: 'exec-002', name: 'María Torres',         email: 'maria.t@bold.co',     role: 'executive' },
  { id: 'exec-003', name: 'Carlos Mendez',        email: 'carlos.m@bold.co',    role: 'executive' },
  { id: 'exec-004', name: 'Laura Gómez',          email: 'laura.g@bold.co',     role: 'executive' },
  { id: 'exec-005', name: 'Felipe Rojas',         email: 'felipe.r@bold.co',    role: 'executive' },
  { id: 'exec-006', name: 'Valentina Cruz',       email: 'valentina.c@bold.co', role: 'executive' },
  { id: 'exec-007', name: 'Sebastián Herrera',    email: 'sebastian.h@bold.co', role: 'executive' },
  { id: 'exec-008', name: 'Camila Vargas',        email: 'camila.v@bold.co',    role: 'executive' },
  { id: 'exec-009', name: 'Andrés Morales',       email: 'andres.m@bold.co',    role: 'executive' },
  { id: 'exec-010', name: 'Diana Castillo',       email: 'diana.c@bold.co',     role: 'executive' },
  { id: 'exec-011', name: 'Mateo Jiménez',        email: 'mateo.j@bold.co',     role: 'executive' },
  { id: 'exec-012', name: 'Sofía Ramírez',        email: 'sofia.r@bold.co',     role: 'executive' },
  { id: 'exec-013', name: 'Nicolás Peña',         email: 'nicolas.p@bold.co',   role: 'executive' },
  { id: 'exec-014', name: 'Isabella Mora',        email: 'isabella.m@bold.co',  role: 'executive' },
  { id: 'exec-015', name: 'Tomás Guerrero',       email: 'tomas.g@bold.co',     role: 'executive' },
  { id: 'exec-016', name: 'Daniela Ríos',         email: 'daniela.r@bold.co',   role: 'executive' },
  { id: 'exec-017', name: 'Santiago Ortiz',       email: 'santiago.o@bold.co',  role: 'executive' },
  { id: 'exec-018', name: 'Mariana Silva',        email: 'mariana.s@bold.co',   role: 'executive' },
  { id: 'exec-019', name: 'Julián Medina',        email: 'julian.m@bold.co',    role: 'executive' },
  { id: 'exec-020', name: 'Alejandra Ruiz',       email: 'alejandra.r@bold.co', role: 'executive' },
  { id: 'exec-021', name: 'Miguel Ángel Suárez',  email: 'miguel.s@bold.co',    role: 'executive' },
  { id: 'exec-022', name: 'Gabriela Flores',      email: 'gabriela.f@bold.co',  role: 'executive' },
  { id: 'exec-023', name: 'Esteban Cárdenas',     email: 'esteban.c@bold.co',   role: 'executive' },
  { id: 'exec-024', name: 'Natalia Bermúdez',     email: 'natalia.b@bold.co',   role: 'executive' },
  { id: 'exec-025', name: 'Mauricio León',        email: 'mauricio.l@bold.co',  role: 'executive' },
  { id: 'exec-026', name: 'Paola Aguilar',        email: 'paola.a@bold.co',     role: 'executive' },
  { id: 'exec-027', name: 'Rodrigo Salazar',      email: 'rodrigo.s@bold.co',   role: 'executive' },
  { id: 'exec-028', name: 'Carolina Pizarro',     email: 'carolina.p@bold.co',  role: 'executive' },
  { id: 'exec-029', name: 'Cristian Vega',        email: 'cristian.v@bold.co',  role: 'executive' },
  { id: 'exec-030', name: 'Lucía Montoya',        email: 'lucia.m@bold.co',     role: 'executive' },
  { id: 'exec-031', name: 'Pablo Acosta',         email: 'pablo.a@bold.co',     role: 'executive' },
  { id: 'exec-032', name: 'Verónica Espinosa',    email: 'veronica.e@bold.co',  role: 'executive' },
  { id: 'exec-033', name: 'Ricardo Palacios',     email: 'ricardo.p@bold.co',   role: 'executive' },
  { id: 'tl-001',   name: 'Team Lead HUB',        email: 'hub@bold.co',         role: 'teamlead'  },
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
    isSerializable: true,
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
  {
    id: 'estuches',
    name: 'Estuches',
    isSerializable: false,
    unit: 'unidad',
    iconPath: '/assets/icons/material-pop.png',
    lowStockThreshold: 5,
  },
  {
    id: 'sombrillas',
    name: 'Sombrillas',
    isSerializable: false,
    unit: 'unidad',
    iconPath: '/assets/icons/material-pop.png',
    lowStockThreshold: 5,
  },
  {
    id: 'rollos-impresion',
    name: 'Rollos de impresión',
    isSerializable: false,
    unit: 'rollo',
    iconPath: '/assets/icons/material-pop.png',
    lowStockThreshold: 5,
  },
  {
    id: 'rollos',
    name: 'Rollos de papel',
    isSerializable: false,
    unit: 'rollo',
    iconPath: '/assets/icons/material-pop.png',
    lowStockThreshold: 5,
  },
  {
    id: 'bolsas',
    name: 'Bolsas de empaque',
    isSerializable: false,
    unit: 'bolsa',
    iconPath: '/assets/icons/tarjetas.png',
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
  { id: 'si-14', serial: 'TX001', categoryId: 'tarjeta',   status: 'disponible',   holderId: 'exec-001' },
  { id: 'si-15', serial: 'TX002', categoryId: 'tarjeta',   status: 'disponible',   holderId: 'exec-001' },
  { id: 'si-16', serial: 'TX003', categoryId: 'tarjeta',   status: 'disponible',   holderId: 'exec-001' },
  { id: 'si-17', serial: '38203', categoryId: 'neo',       status: 'disponible',   holderId: 'exec-001' },
  { id: 'si-18', serial: '38204', categoryId: 'neo',       status: 'disponible',   holderId: 'exec-001' },
  { id: 'si-19', serial: '38301', categoryId: 'plus',      status: 'disponible',   holderId: 'exec-001' },
  { id: 'si-20', serial: '39004', categoryId: 'smart',     status: 'disponible',   holderId: 'exec-001' },
  { id: 'si-21', serial: '40003', categoryId: 'smart-pro', status: 'disponible',   holderId: 'exec-001' },
]

// ─── PoP batches ─────────────────────────────────────────────────────────────

export const batches: InventoryBatch[] = [
  { id: 'bt-1', categoryId: 'tarjeta', quantity: 30, status: 'disponible',   holderId: 'exec-001' },
  { id: 'bt-2', categoryId: 'tarjeta', quantity: 15, status: 'sinConfirmar', holderId: 'exec-001', orderId: 'ORD-001' },
  { id: 'bt-3', categoryId: 'pop',              quantity: 6,  status: 'disponible',   holderId: 'exec-001' },
  { id: 'bt-4', categoryId: 'pop',              quantity: 10, status: 'sinConfirmar', holderId: 'exec-001', orderId: 'ORD-001' },
  { id: 'bt-5', categoryId: 'rollos',           quantity: 8,  status: 'sinConfirmar', holderId: 'exec-001', orderId: 'ORD-003' },
  { id: 'bt-6', categoryId: 'bolsas',           quantity: 12, status: 'sinConfirmar', holderId: 'exec-001', orderId: 'ORD-003' },
  { id: 'bt-7', categoryId: 'estuches',          quantity: 10, status: 'disponible',   holderId: 'exec-001' },
  { id: 'bt-8', categoryId: 'sombrillas',        quantity: 2,  status: 'disponible',   holderId: 'exec-001' },
  { id: 'bt-9', categoryId: 'rollos-impresion',  quantity: 3,  status: 'disponible',   holderId: 'exec-001' },
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
  {
    id: 'ORD-003',
    type: 'InboundDelivery',
    originType: 'provider',
    originHolderId: 'tl-001',
    originEmail: 'proveedor@bold.co',
    destinationHolderId: 'exec-001',
    destinationEmail: 'andres.p@bold.co',
    destinationHubName: 'HUB Norte',
    expirationDate: '2026-04-15T17:00:00',
    receptionDate: '2026-04-10T10:00:00',
    status: 'sinConfirmar',
    orderNumber: 'IND00391',
    lines: [
      {
        id: 'ol-6', categoryId: 'rollos', isSerializable: false,
        expectedSerials: [], confirmedSerials: [],
        expectedQty: 8, confirmedQty: 0,
      },
      {
        id: 'ol-7', categoryId: 'bolsas', isSerializable: false,
        expectedSerials: [], confirmedSerials: [],
        expectedQty: 12, confirmedQty: 0,
      },
    ],
    novelties: [],
  },
]

// ─── Assignments ──────────────────────────────────────────────────────────────

export const assignments: Assignment[] = []

// ─── Movements ────────────────────────────────────────────────────────────────

export const movements: Movement[] = [
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
