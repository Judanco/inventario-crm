import type { Order } from './types'

export type ExpirationAction =
  | { type: 'autoConfirmAll' }
  | { type: 'returnToOwner'; ownerId: string }
  | { type: 'autoConfirmRemaining'; ownerId: string }

function hasAnyConfirmed(order: Order): boolean {
  return order.lines.some(
    (line) =>
      (line.isSerializable && line.confirmedSerials.length > 0) ||
      (!line.isSerializable && line.confirmedQty > 0),
  )
}

export function evaluateExpiredOrder(order: Order): ExpirationAction {
  if (order.originType === 'provider') {
    return { type: 'autoConfirmAll' }
  }

  if (!hasAnyConfirmed(order)) {
    return { type: 'returnToOwner', ownerId: order.originHolderId }
  }

  return { type: 'autoConfirmRemaining', ownerId: order.originHolderId }
}
