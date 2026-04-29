import type {
  ProductCategory,
  SerializedItem,
  InventoryBatch,
  CategoryInventorySummary,
  InventoryOverviewSummary,
} from './types'

export function computeInventoryOverview(
  categories: ProductCategory[],
  serializedItems: SerializedItem[],
  batches: InventoryBatch[],
): InventoryOverviewSummary {
  const byCategory: CategoryInventorySummary[] = categories.map((cat) => {
    let confirmedTotal = 0
    let sinConfirmar = 0

    if (cat.isSerializable) {
      const items = serializedItems.filter((i) => i.categoryId === cat.id)
      sinConfirmar = items.filter((i) => i.status === 'sinConfirmar').length
      confirmedTotal = items.length - sinConfirmar
    } else {
      const catBatches = batches.filter((b) => b.categoryId === cat.id)
      for (const b of catBatches) {
        if (b.status === 'sinConfirmar') sinConfirmar += b.quantity
        else confirmedTotal += b.quantity
      }
    }

    const isLowStock =
      cat.lowStockThreshold !== undefined && confirmedTotal < cat.lowStockThreshold

    return { category: cat, confirmedTotal, sinConfirmar, isLowStock }
  })

  const serializable = byCategory.filter((s) => s.category.isSerializable)
  const popEntries   = byCategory.filter((s) => !s.category.isSerializable)

  if (popEntries.length === 0) return { byCategory: serializable }

  const popRepresentative = categories.find((c) => c.id === 'pop') ?? popEntries[0].category
  const popGrouped: CategoryInventorySummary = {
    category: popRepresentative,
    confirmedTotal: popEntries.reduce((sum, s) => sum + s.confirmedTotal, 0),
    sinConfirmar:   popEntries.reduce((sum, s) => sum + s.sinConfirmar,   0),
    isLowStock: false,
  }

  return { byCategory: [...serializable, popGrouped] }
}
