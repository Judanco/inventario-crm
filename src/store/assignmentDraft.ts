import { create } from 'zustand'

interface DraftSerialLine {
  categoryId: string
  serials: string[]
}

interface DraftPopLine {
  categoryId: string
  quantity: number
}

interface AssignmentDraftState {
  destinationEmail: string
  destinationHolderId: string
  serialLines: DraftSerialLine[]
  popLines: DraftPopLine[]
  toast: string | null

  setDestination: (id: string, email: string) => void
  addSerial: (categoryId: string, serial: string) => void
  removeSerial: (categoryId: string, serial: string) => void
  setPopQty: (categoryId: string, qty: number) => void
  setToast: (msg: string) => void
  clearToast: () => void
  reset: () => void
}

const empty = {
  destinationEmail: '',
  destinationHolderId: '',
  serialLines: [] as DraftSerialLine[],
  popLines: [] as DraftPopLine[],
  toast: null as string | null,
}

export const useAssignmentDraft = create<AssignmentDraftState>((set) => ({
  ...empty,

  setDestination: (id, email) =>
    set({ destinationHolderId: id, destinationEmail: email }),

  addSerial: (categoryId, serial) =>
    set((s) => {
      const existing = s.serialLines.find((l) => l.categoryId === categoryId)
      if (existing) {
        return {
          serialLines: s.serialLines.map((l) =>
            l.categoryId === categoryId
              ? { ...l, serials: [...new Set([...l.serials, serial])] }
              : l,
          ),
        }
      }
      return { serialLines: [...s.serialLines, { categoryId, serials: [serial] }] }
    }),

  removeSerial: (categoryId, serial) =>
    set((s) => ({
      serialLines: s.serialLines
        .map((l) =>
          l.categoryId === categoryId
            ? { ...l, serials: l.serials.filter((sr) => sr !== serial) }
            : l,
        )
        .filter((l) => l.serials.length > 0),
    })),

  setPopQty: (categoryId, qty) =>
    set((s) => {
      if (qty <= 0) {
        return { popLines: s.popLines.filter((l) => l.categoryId !== categoryId) }
      }
      const existing = s.popLines.find((l) => l.categoryId === categoryId)
      if (existing) {
        return {
          popLines: s.popLines.map((l) =>
            l.categoryId === categoryId ? { ...l, quantity: qty } : l,
          ),
        }
      }
      return { popLines: [...s.popLines, { categoryId, quantity: qty }] }
    }),

  setToast: (msg) => set({ toast: msg }),
  clearToast: () => set({ toast: null }),
  reset: () => set(empty),
}))
