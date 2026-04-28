import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useOrder, useCategories, useConfirmPopMutation } from './hooks/useOrders'

export function PopPartialConfirmation() {
  const { orderId, lineId } = useParams<{ orderId: string; lineId: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading } = useOrder(orderId)
  const { data: categories } = useCategories()
  const confirmPop = useConfirmPopMutation()
  const [qty, setQty] = useState(0)

  const line = order?.lines.find((l) => l.id === lineId)
  const category = categories?.find((c) => c.id === line?.categoryId)

  const handleCancel = () => {
    if (qty > 0 && !window.confirm('Tienes una cantidad ingresada. ¿Cancelar de todas formas?')) return
    navigate(-1)
  }

  const handleConfirm = async () => {
    if (!orderId || !lineId || qty <= 0) return
    await confirmPop.mutateAsync({ orderId, lineId, qty })
    navigate(-1)
  }

  if (isLoading || !line) {
    return (
      <div className="min-h-screen bg-[#f7f8fb] flex items-center justify-center text-sm text-gray-400">
        Cargando…
      </div>
    )
  }

  const name = category?.name ?? line.categoryId

  return (
    <div className="min-h-screen bg-[#f7f8fb] flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#f7f8fb] py-4 px-3 flex items-center">
        <button
          onClick={handleCancel}
          className="w-[102px] flex items-center"
          aria-label="Volver"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="flex-1 text-base font-bold text-[#121e6c] text-center leading-5">
          Confirmación parcial
        </h1>
        <div className="w-[102px]" />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-10 pb-40 flex flex-col gap-10">
        {/* Cantidad esperada — read-only */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#121e6c] leading-5">
            Cantidad esperada
          </label>
          <div className="bg-white rounded-xl px-3 h-10 flex items-center opacity-50">
            <span className="text-sm font-medium text-[#1e1e1e]">{line.expectedQty}</span>
          </div>
        </div>

        {/* Cantidad recibida — stepper */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#121e6c] leading-5">
            Cantidad recibida
            <span className="text-[#ff2947] ml-0.5">*</span>
          </label>
          <div className="flex justify-center">
            <div className="bg-white rounded-full flex items-center gap-7 px-6 py-2">
              <button
                onClick={() => setQty((q) => Math.max(0, q - 1))}
                className="w-6 h-6 flex items-center justify-center text-[#121e6c]"
                aria-label="Decrementar"
              >
                <svg width="16" height="2" viewBox="0 0 16 2" fill="none">
                  <path d="M1 1h14" stroke="#121e6c" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <span className="w-12 text-center text-2xl font-normal text-[#121e6c] leading-7">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-6 h-6 flex items-center justify-center text-[#121e6c]"
                aria-label="Incrementar"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1v14M1 8h14" stroke="#121e6c" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Warning banner */}
        <div className="bg-amber-50 border border-amber-400 rounded-2xl flex gap-3 items-center p-3">
          <div className="shrink-0 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v5M12 16h.01" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[12px] text-[#1e1e1e] leading-4 flex-1">
            Recibir una cantidad mayor o menor a la esperada debe ser considerada una novedad.
          </p>
        </div>
      </div>

      {/* Bottom actions — fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-[rgba(247,248,251,0.9)] backdrop-blur-sm flex flex-col gap-2 px-[72px] py-5">
        {qty > 0 && (
          <button
            onClick={handleConfirm}
            disabled={confirmPop.isPending}
            className="h-10 bg-[#ff2947] rounded-[32px] flex items-center justify-center text-sm font-medium text-white disabled:opacity-50"
          >
            {confirmPop.isPending ? 'Confirmando…' : 'Confirmar conteo'}
          </button>
        )}
        <button
          onClick={handleCancel}
          className="h-10 bg-white rounded-[32px] border border-[#f1f2f6] flex items-center justify-center text-sm font-medium text-[#ff2947]"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
