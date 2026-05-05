import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { OrderLine, ProductCategory } from '../../domain/types'
import { useOrder, useCategories, useConfirmSerialMutation, useConfirmPopMutation } from './hooks/useOrders'
import { useConfirmationSession } from '../../store/confirmationSession'
import { DropdownMenu } from '../../components/DropdownMenu'
import { orderStats } from './utils/orderStats'

function truncateSerial(serial: string): string {
  return serial.slice(-6)
}

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 bg-white rounded-2xl flex flex-col gap-0.5 items-center justify-center p-3">
      <span className="text-2xl font-semibold text-black leading-7">{value}</span>
      <span className="text-[12px] text-black leading-4 text-center">{label}</span>
    </div>
  )
}

// ─── Serializable section ────────────────────────────────────────────────────

interface ConfirmManualTarget {
  serial: string
  categoryName: string
}

function ConfirmManualModal({
  target,
  orderId,
  lineId,
  onSuccess,
  onCancel,
}: {
  target: ConfirmManualTarget
  orderId: string
  lineId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const confirmSerial = useConfirmSerialMutation()

  const handleConfirm = async () => {
    await confirmSerial.mutateAsync({ orderId, lineId, serial: target.serial })
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center px-8">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative z-10 bg-white rounded-3xl w-full max-w-[280px] pb-8 pt-14 px-4 flex flex-col gap-6 shadow-xl">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-gray-400"
          aria-label="Cerrar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex flex-col gap-4 items-center">
          <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v5M12 16h.01" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-base font-semibold text-[#1e1e1e] text-center leading-5">
            ¿Quieres confirmar este serial manualmente?
          </p>
          <p className="text-base font-normal text-[#1e1e1e] text-center leading-5">
            Aceptarás que recibiste este serial y será tu responsabilidad desde este punto en adelante.
          </p>
          <p className="text-[12px] font-bold text-[#606060] text-center leading-4">
            Serial: {target.categoryName} - {target.serial.slice(-5)}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleConfirm}
            disabled={confirmSerial.isPending}
            className="w-full h-10 bg-[#ff2947] rounded-[32px] flex items-center justify-center text-sm font-medium text-white disabled:opacity-50"
          >
            {confirmSerial.isPending ? 'Confirmando…' : 'Entendido'}
          </button>
          <button
            onClick={onCancel}
            className="w-full h-10 bg-white border border-[#ff2947] rounded-[32px] flex items-center justify-center text-sm font-medium text-[#ff2947]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

function SerializableSection({
  orderId,
  line,
  category,
  onShowToast,
}: {
  orderId: string
  line: OrderLine
  category: ProductCategory | undefined
  onShowToast: (msg: string) => void
}) {
  const [input, setInput] = useState('')
  const [, setError] = useState<string | null>(null)
  const [openMenuSerial, setOpenMenuSerial] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<ConfirmManualTarget | null>(null)
  const confirmSerial = useConfirmSerialMutation()

  const pendingSerials = line.expectedSerials.filter(
    (s) => !line.confirmedSerials.includes(s),
  )

  const _handleAdd = async () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setError(null)
    try {
      await confirmSerial.mutateAsync({ orderId, lineId: line.id, serial: trimmed })
      setInput('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      setError(msg === 'SERIAL_NOT_IN_ORDER' ? 'Serial no pertenece a esta orden.' : 'Error al confirmar.')
    }
  }

  if (pendingSerials.length === 0) return null

  const name = category?.name ?? line.categoryId
  const confirmed = line.confirmedSerials.length
  const total = line.expectedSerials.length

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-[#121e6c] leading-5">
        {name} — {confirmed}/{total}
      </h3>

      {/* TODO: input de serial + botón Agregar — comentado temporalmente
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(null) }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Ingresar serial"
          className="flex-1 bg-white rounded-xl px-3 py-2 text-sm text-[#1e1e1e] outline-none border border-[#f1f2f6] focus:border-[#121e6c] placeholder:text-gray-400"
        />
        <button
          onClick={handleAdd}
          disabled={confirmSerial.isPending || !input.trim()}
          className="shrink-0 bg-[#121e6c] text-white text-sm font-medium rounded-xl px-4 py-2 disabled:opacity-40"
        >
          {confirmSerial.isPending ? '…' : 'Agregar'}
        </button>
      </div>
      {error && <p className="text-[12px] text-[#ff2947] leading-4">{error}</p>}
      */}

      <div className="flex flex-col gap-3">
        {pendingSerials.map((serial) => (
          <div key={serial} className="relative">
            {/* Card */}
            <div className="bg-white rounded-[16px] pl-3 pr-2 py-3 flex gap-3 items-start">
              <div className="shrink-0 w-10 h-10 overflow-clip">
                {category && <img src={category.iconPath} alt={name} className="w-full h-full object-contain" />}
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <p className="text-sm font-bold text-[#121e6c] leading-5">{truncateSerial(serial)}</p>
                <div className="flex items-center gap-0.5">
                  <span className="w-6 h-6 flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                  </span>
                  <span className="text-[12px] text-[#1e1e1e] leading-4">Sin confirmar</span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setOpenMenuSerial((prev) => prev === serial ? null : serial) }}
                className="shrink-0 size-[20px] flex flex-col items-center justify-center gap-[3px]"
                aria-label="Opciones"
              >
                {[0, 1, 2].map((i) => <span key={i} className="w-[3px] h-[3px] rounded-full bg-[#1e1e1e]" />)}
              </button>
            </div>

            {openMenuSerial === serial && (
              <DropdownMenu
                className="absolute right-3 top-9 z-20"
                onClose={() => setOpenMenuSerial(null)}
                items={[
                  { label: 'Confirmar manualmente', onClick: () => setConfirmTarget({ serial, categoryName: name }) },
                  { label: 'Reportar novedad', onClick: () => {} },
                ]}
              />
            )}
          </div>
        ))}

      </div>

      {/* Confirm manual modal */}
      {confirmTarget && (
        <ConfirmManualModal
          target={confirmTarget}
          orderId={orderId}
          lineId={line.id}
          onSuccess={() => {
            setConfirmTarget(null)
            onShowToast('Confirmaste manualmente un serial de la órden')
          }}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  )
}

// ─── PoP section ─────────────────────────────────────────────────────────────

interface ConfirmAllTarget {
  lineId: string
  categoryName: string
  remainingQty: number
}

function PopSection({
  orderId,
  line,
  category,
  openMenu,
  onToggleMenu,
  onRequestConfirmAll,
}: {
  orderId: string
  line: OrderLine
  category: ProductCategory | undefined
  openMenu: boolean
  onToggleMenu: () => void
  onRequestConfirmAll: (target: ConfirmAllTarget) => void
}) {
  const navigate = useNavigate()
  const name = category?.name ?? line.categoryId
  const remaining = line.expectedQty - line.confirmedQty

  const goToPartial = () =>
    navigate(`/inventario/ordenes/${orderId}/confirmar/${line.id}/parcial`)

  return (
    <div className="relative">
      <div
        role="button"
        onClick={goToPartial}
        className="w-full bg-white rounded-[16px] pl-3 pr-2 py-3 flex gap-3 items-start cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="shrink-0 w-[68px] h-[68px] bg-[#f1f2f6] rounded-xl flex items-center justify-center overflow-hidden">
          {category && (
            <img src={category.iconPath} alt={name} className="w-full h-full object-contain p-2" />
          )}
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <p className="text-sm font-semibold text-[#1e1e1e] leading-5">{name}</p>
          <p className="text-[12px] text-[#1e1e1e] leading-4">
            <span className="font-bold">Cantidad esperada</span>{' '}{line.expectedQty}
          </p>
          <p className="text-sm text-[#1e1e1e] leading-5">
            <span className="font-bold">Confirmados</span>{' '}
            <span className="font-normal">{line.confirmedQty}</span>
          </p>
        </div>

        {/* 3-dot button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleMenu() }}
          className="shrink-0 size-[20px] flex flex-col items-center justify-center gap-[3px]"
          aria-label="Opciones"
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className="w-[3px] h-[3px] rounded-full bg-[#1e1e1e]" />
          ))}
        </button>
      </div>

      {openMenu && (
        <DropdownMenu
          className="absolute right-3 top-9 z-20"
          onClose={onToggleMenu}
          items={[
            { label: 'Confirmar todo', onClick: () => onRequestConfirmAll({ lineId: line.id, categoryName: name, remainingQty: remaining }) },
            { label: 'Confirmar parcialmente', onClick: goToPartial },
            { label: 'Reportar novedad', onClick: () => {} },
          ]}
        />
      )}
    </div>
  )
}

// ─── Modal "Confirmar todo" ───────────────────────────────────────────────────

function ConfirmAllModal({
  target,
  onConfirm,
  onCancel,
  isPending,
}: {
  target: ConfirmAllTarget
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center px-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />

      {/* Modal card */}
      <div className="relative z-10 bg-white rounded-3xl w-full max-w-[280px] pb-8 pt-14 px-4 flex flex-col gap-6 shadow-xl">
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-gray-400"
          aria-label="Cerrar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex flex-col gap-4 items-center">
          {/* Warning icon */}
          <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v5M12 16h.01" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <p className="text-base font-semibold text-[#1e1e1e] text-center leading-5">
            ¿Quieres confirmar todo este material PoP?
          </p>
          <p className="text-base font-normal text-[#1e1e1e] text-center leading-5">
            Aceptarás que recibiste la totalidad de estos artículos y serán tu responsabilidad desde este punto en adelante.
          </p>
          <p className="text-[12px] font-bold text-[#606060] text-center leading-4">
            Artículo: {target.categoryName}<br />
            Cantidad: {target.remainingQty}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="w-full h-10 bg-[#ff2947] rounded-[32px] flex items-center justify-center text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? 'Confirmando…' : 'Entendido'}
          </button>
          <button
            onClick={onCancel}
            className="w-full h-10 bg-white border border-[#ff2947] rounded-[32px] flex items-center justify-center text-sm font-medium text-[#ff2947]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading, isError } = useOrder(orderId)
  const { data: categories } = useCategories()
  const confirmPop = useConfirmPopMutation()
  const { startSession, endSession, popToast, clearPopToast } = useConfirmationSession()

  const [openMenuLineId, setOpenMenuLineId] = useState<string | null>(null)
  const [confirmAllTarget, setConfirmAllTarget] = useState<ConfirmAllTarget | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const sinConfirmarReactive = useMemo(
    () => (order ? orderStats(order).sinConfirmar : -1),
    [order],
  )

  // Reset scroll on enter
  useEffect(() => { window.scrollTo(0, 0) }, [])

  // Start/end confirmation session
  useEffect(() => {
    if (orderId) startSession(orderId)
    return () => endSession()
  }, [orderId])

  // Redirect back to detail when all items are confirmed
  useEffect(() => {
    if (sinConfirmarReactive !== 0) return
    const t = setTimeout(() => navigate(`/inventario/ordenes/${orderId}`), 800)
    return () => clearTimeout(t)
  }, [sinConfirmarReactive])

  // Show toast from partial confirmation page
  useEffect(() => {
    if (popToast) {
      showToast(popToast)
      clearPopToast()
    }
  }, [popToast])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 3000)
    return () => clearTimeout(t)
  }, [toastMsg])

  const showToast = (msg: string) => setToastMsg(msg)

  const handleConfirmAll = async () => {
    if (!confirmAllTarget || !orderId) return
    await confirmPop.mutateAsync({
      orderId,
      lineId: confirmAllTarget.lineId,
      qty: confirmAllTarget.remainingQty,
    })
    setConfirmAllTarget(null)
    showToast('Conteo confirmado exitosamente')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fb] flex items-center justify-center text-sm text-gray-400">
        Cargando…
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-[#f7f8fb] flex items-center justify-center text-sm text-[#ff2947]">
        Error al cargar la orden.
      </div>
    )
  }

  const { sinConfirmar, confirmados, novedades } = orderStats(order)
  const categoryMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c]))

  const pendingPopLines = order.lines.filter((l) => !l.isSerializable && l.confirmedQty < l.expectedQty)
  const serialLines     = order.lines.filter((l) => l.isSerializable)
  const hasPendingSerials = serialLines.some(
    (l) => l.expectedSerials.length > l.confirmedSerials.length,
  )

  return (
    <div className="min-h-screen bg-[#f7f8fb] flex flex-col">
      {/* Processing overlay — shown while waiting to redirect after full confirmation */}
      {sinConfirmarReactive === 0 && (
        <div className="fixed inset-0 z-50 bg-[#f7f8fb] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-[#121e6c] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#121e6c]">Procesando confirmación…</p>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-green-500 text-white text-sm font-medium rounded-xl p-3 text-center shadow-lg transition-opacity">
          {toastMsg}
        </div>
      )}

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#f7f8fb] flex flex-col">
        <div className="flex items-center justify-between px-3 py-4">
          <button onClick={() => navigate(-1)} className="w-[102px] flex items-center" aria-label="Volver">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="flex-1 text-base font-bold text-[#121e6c] leading-5 text-center">
            Confirmación de la órden
          </h1>
          <div className="w-[102px] flex justify-end pr-1">
            <button
              aria-label="Escanear"
              onClick={hasPendingSerials ? () => navigate(`/inventario/ordenes/${orderId}/confirmar/escanear`) : undefined}
              className={`w-6 h-6 flex items-center justify-center transition-opacity ${!hasPendingSerials ? 'opacity-50' : ''}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="5" height="5" rx="1" stroke="#121e6c" strokeWidth="1.5" />
                <rect x="16" y="3" width="5" height="5" rx="1" stroke="#121e6c" strokeWidth="1.5" />
                <rect x="3" y="16" width="5" height="5" rx="1" stroke="#121e6c" strokeWidth="1.5" />
                <path d="M16 16h5v5M16 21h5" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 12h18" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="bg-[#f7f8fb] px-4 pb-6 flex gap-2">
          <StatPill value={sinConfirmar} label="Sin confirmar" />
          <StatPill value={confirmados}  label="Confirmados"   />
          <StatPill value={novedades}    label="Novedades"     />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 px-4 pb-32 flex flex-col gap-8">
        {pendingPopLines.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-[#121e6c] leading-5">Material PoP</h2>
            <div className="flex flex-col gap-3">
              {pendingPopLines.map((line) => (
                <PopSection
                  key={line.id}
                  orderId={order.id}
                  line={line}
                  category={categoryMap[line.categoryId]}
                  openMenu={openMenuLineId === line.id}
                  onToggleMenu={() =>
                    setOpenMenuLineId((prev) => (prev === line.id ? null : line.id))
                  }
                  onRequestConfirmAll={(target) => setConfirmAllTarget(target)}
                />
              ))}
            </div>
          </div>
        )}

        {serialLines.map((line) => (
          <SerializableSection
            key={line.id}
            orderId={order.id}
            line={line}
            category={categoryMap[line.categoryId]}
            onShowToast={showToast}
          />
        ))}
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-[rgba(247,248,251,0.9)] backdrop-blur-sm flex flex-col gap-2 px-[72px] py-5">
        <button className="h-10 flex items-center justify-center text-sm font-medium text-[#121e6c]">
          Reportar novedad general
        </button>
        <button
          onClick={() => navigate(-1)}
          className="h-10 bg-white rounded-[32px] border border-[#f1f2f6] flex items-center justify-center text-sm font-medium text-[#ff2947]"
        >
          Volver
        </button>
      </div>

      {/* Modal "Confirmar todo" */}
      {confirmAllTarget && (
        <ConfirmAllModal
          target={confirmAllTarget}
          onConfirm={handleConfirmAll}
          onCancel={() => setConfirmAllTarget(null)}
          isPending={confirmPop.isPending}
        />
      )}
    </div>
  )
}
