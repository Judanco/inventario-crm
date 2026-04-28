import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from './components/layout/AppShell'
import { InventoryOverview } from './features/inventory/InventoryOverview'
import { OrderList } from './features/orders/OrderList'
import { OrderDetail } from './features/orders/OrderDetail'
import { OrderConfirmation } from './features/orders/OrderConfirmation'
import { PopPartialConfirmation } from './features/orders/PopPartialConfirmation'
import { AssignmentList } from './features/assignments/AssignmentList'
import { MovementHistory } from './features/movements/MovementHistory'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/inventario" replace />} />

            <Route path="/inventario" element={<InventoryOverview />}>
              <Route path="ordenes"      element={<OrderList />} />
              <Route path="asignaciones" element={<AssignmentList />} />
              <Route path="historial"    element={<MovementHistory />} />
            </Route>

            <Route path="/inventario/ordenes/:orderId"            element={<OrderDetail />} />
            <Route path="/inventario/ordenes/:orderId/confirmar"  element={<OrderConfirmation />} />
            <Route path="/inventario/ordenes/:orderId/confirmar/:lineId/parcial" element={<PopPartialConfirmation />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
