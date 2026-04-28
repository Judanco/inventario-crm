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

  return { byCategory }
}
