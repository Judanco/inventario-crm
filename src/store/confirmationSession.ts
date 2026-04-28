import { create } from 'zustand'

interface PopProgress {
  lineId: string
  pendingQty: number  // qty entered but not yet sent to backend
}

interface ConfirmationSessionState {
  orderId: string | null
  popProgress: Record<string, PopProgress>
  isDirty: boolean

  startSession: (orderId: string) => void
  setPendingPop: (lineId: string, qty: number) => void
  clearPendingPop: (lineId: string) => void
  endSession: () => void
}

export const useConfirmationSession = create<ConfirmationSessionState>((set) => ({
  orderId: null,
  popProgress: {},
  isDirty: false,

  startSession: (orderId) =>
    set({ orderId, popProgress: {}, isDirty: false }),

  setPendingPop: (lineId, qty) =>
    set((s) => ({
      popProgress: { ...s.popProgress, [lineId]: { lineId, pendingQty: qty } },
      isDirty: qty > 0,
    })),

  clearPendingPop: (lineId) =>
    set((s) => {
      const next = { ...s.popProgress }
      delete next[lineId]
      return { popProgress: next, isDirty: Object.keys(next).length > 0 }
    }),

  endSession: () => set({ orderId: null, popProgress: {}, isDirty: false }),
}))
