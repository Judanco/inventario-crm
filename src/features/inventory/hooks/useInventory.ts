import { useQuery } from '@tanstack/react-query'
import { fetchCategories, fetchSerializedItems, fetchBatches } from '../../../data/api'
import { computeInventoryOverview } from '../../../domain/inventorySummary'

export function useInventoryOverview() {
  const categories = useQuery({ queryKey: ['categories'],     queryFn: fetchCategories     })
  const serialized  = useQuery({ queryKey: ['serializedItems'], queryFn: () => fetchSerializedItems() })
  const batchesQ    = useQuery({ queryKey: ['batches'],        queryFn: () => fetchBatches()        })

  const isLoading = categories.isLoading || serialized.isLoading || batchesQ.isLoading
  const isError   = categories.isError   || serialized.isError   || batchesQ.isError

  const overview =
    categories.data && serialized.data && batchesQ.data
      ? computeInventoryOverview(categories.data, serialized.data, batchesQ.data)
      : null

  return { overview, isLoading, isError }
}
