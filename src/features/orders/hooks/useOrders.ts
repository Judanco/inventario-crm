import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchOrders,
  fetchOrder,
  fetchCategories,
  confirmSerial,
  confirmPopCount,
} from '../../../data/api'

export function useOrderList() {
  return useQuery({ queryKey: ['orders'], queryFn: () => fetchOrders() })
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => fetchOrder(orderId!),
    enabled: !!orderId,
  })
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
}

export function useConfirmSerialMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, lineId, serial }: { orderId: string; lineId: string; serial: string }) =>
      confirmSerial(orderId, lineId, serial),
    onSuccess: (_data, { orderId }) => {
      qc.invalidateQueries({ queryKey: ['orders', orderId] })
      qc.invalidateQueries({ queryKey: ['serializedItems'] })
    },
  })
}

export function useConfirmPopMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, lineId, qty }: { orderId: string; lineId: string; qty: number }) =>
      confirmPopCount(orderId, lineId, qty),
    onSuccess: (_data, { orderId }) => {
      qc.invalidateQueries({ queryKey: ['orders', orderId] })
      qc.invalidateQueries({ queryKey: ['batches'] })
    },
  })
}

export function useConfirmSerialsMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      orderId,
      serials,
    }: { orderId: string; serials: Array<{ lineId: string; serial: string }> }) => {
      for (const { lineId, serial } of serials) {
        await confirmSerial(orderId, lineId, serial)
      }
    },
    onSuccess: (_data, { orderId }) => {
      qc.invalidateQueries({ queryKey: ['orders', orderId] })
      qc.invalidateQueries({ queryKey: ['serializedItems'] })
    },
  })
}
