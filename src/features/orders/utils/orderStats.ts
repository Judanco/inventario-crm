import type { Order } from '../../../domain/types'

export function orderStats(order: Order) {
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

export type DerivedOrderStatus = 'sinConfirmar' | 'confirmacionParcial' | 'confirmado'

export function deriveOrderStatus(order: Order): DerivedOrderStatus {
  const { sinConfirmar, confirmados } = orderStats(order)
  if (sinConfirmar === 0) return 'confirmado'
  if (confirmados === 0) return 'sinConfirmar'
  return 'confirmacionParcial'
}
