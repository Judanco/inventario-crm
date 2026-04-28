import { create } from 'zustand'

interface PopProgress {
  lineId: string
  pendingQty: number
}

interface ConfirmationSessionState {
  orderId: string | null
  popProgress: Record<string, PopProgress>
  isDirty: boolean
  popToast: string | null

  startSession: (orderId: string) => void
  setPendingPop: (lineId: string, qty: number) => void
  clearPendingPop: (lineId: string) => void
  endSession: () => void
  setPopToast: (msg: string) => void
  clearPopToast: () => void
}

export const useConfirmationSession = create<ConfirmationSessionState>((set) => ({
  orderId: null,
  popProgress: {},
  isDirty: false,
  popToast: null,

  startSession: (orderId) =>
    set({ orderId, popProgress: {}, isDirty: false }),

  setPendingPop: (lineId, qty) =>
    set((s) => {
      const next = { ...s.popProgress, [lineId]: { lineId, pendingQty: qty } }
      return {
        popProgress: next,
        isDirty: Object.values(next).some((p) => p.pendingQty > 0),
      }
    }),

  clearPendingPop: (lineId) =>
    set((s) => {
      const next = { ...s.popProgress }
      delete next[lineId]
      return { popProgress: next, isDirty: Object.keys(next).length > 0 }
    }),

  endSession: () => set({ orderId: null, popProgress: {}, isDirty: false }),

  setPopToast: (msg) => set({ popToast: msg }),
  clearPopToast: () => set({ popToast: null }),
}))
