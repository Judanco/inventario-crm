import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { useOrder } from './hooks/useOrders'
import { useConfirmSerialsMutation } from './hooks/useOrders'
import { useConfirmationSession } from '../../store/confirmationSession'

function ScannerPill({
  value,
  label,
  color,
}: {
  value: number
  label: string
  color: string
}) {
  return (
    <div className="flex-1 bg-white rounded-2xl flex flex-col gap-0.5 items-center justify-center p-3">
      <span className={`text-2xl font-semibold leading-7 ${color}`}>{value}</span>
      <span className="text-[12px] text-black leading-4 text-center">{label}</span>
    </div>
  )
}

export function SerialScannerScreen() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading } = useOrder(orderId)
  const confirmSerials = useConfirmSerialsMutation()
  const { setPopToast } = useConfirmationSession()

  const isMounted = useRef(true)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const recentlyScanned = useRef(new Set<string>())

  const [scannedQueue, setScannedQueue] = useState<string[]>([])
  const [errorCount, setErrorCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 3000)
    return () => clearTimeout(t)
  }, [toastMsg])

  const allPendingSerials = useMemo(
    () =>
      order?.lines
        .filter((l) => l.isSerializable)
        .flatMap((l) => l.expectedSerials.filter((s) => !l.confirmedSerials.includes(s))) ?? [],
    [order],
  )

  const serialToLineId = useMemo(
    () =>
      Object.fromEntries(
        (order?.lines ?? [])
          .filter((l) => l.isSerializable)
          .flatMap((l) => l.expectedSerials.map((s) => [s, l.id])),
      ),
    [order],
  )

  const pendingSerialsRef = useRef<string[]>([])
  const scannedQueueRef = useRef<string[]>([])
  pendingSerialsRef.current = allPendingSerials
  scannedQueueRef.current = scannedQueue

  const handleScan = useCallback((text: string) => {
    if (!isMounted.current) return
    if (recentlyScanned.current.has(text)) return
    recentlyScanned.current.add(text)
    setTimeout(() => recentlyScanned.current.delete(text), 1500)

    if (
      pendingSerialsRef.current.includes(text) &&
      !scannedQueueRef.current.includes(text)
    ) {
      setScannedQueue((prev) => [...prev, text])
      setToastMsg('Escaneaste este serial exitosamente.')
    } else {
      setErrorCount((n) => n + 1)
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    const video = videoRef.current
    if (!video) return

    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    const start = async () => {
      // Delay lets StrictMode's first-mount cleanup finish before we request
      // the camera, avoiding a race where two streams open simultaneously.
      await new Promise((resolve) => setTimeout(resolve, 150))
      if (!isMounted.current) return

      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
      } catch {
        return // permission denied or no camera — fail silently in prototype
      }

      // Component may have unmounted while getUserMedia was pending
      if (!isMounted.current) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }

      streamRef.current = stream
      video.srcObject = stream
      await video.play()

      // Decode from the already-active video element — we own the stream
      reader.decodeFromVideoElement(video, (result) => {
        if (!isMounted.current) return
        if (result) handleScan(result.getText())
      })
    }

    start()

    return () => {
      isMounted.current = false

      if (readerRef.current && typeof (readerRef.current as unknown as Record<string, unknown>).reset === 'function') {
        (readerRef.current as unknown as { reset: () => void }).reset()
      }
      readerRef.current = null

      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sinConfirmar = allPendingSerials.length - scannedQueue.length

  const handleFinish = async () => {
    if (scannedQueue.length === 0) {
      navigate(-1)
      return
    }
    setIsProcessing(true)
    const items = scannedQueue.map((s) => ({ lineId: serialToLineId[s], serial: s }))
    await confirmSerials.mutateAsync({ orderId: orderId!, serials: items })
    setPopToast(`${scannedQueue.length} serial(es) confirmados exitosamente`)
    navigate(-1)
  }

  // When all serials are scanned, wait 1 s (so the user sees the toast) then finish.
  useEffect(() => {
    if (sinConfirmar !== 0 || scannedQueue.length === 0) return
    const t = setTimeout(handleFinish, 1000)
    return () => clearTimeout(t)
  }, [sinConfirmar]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#f7f8fb] flex flex-col">
      {/* Loading overlay — <video> stays in the DOM so useEffect([]) always finds it */}
      {isLoading && (
        <div className="fixed inset-0 z-40 bg-[#f7f8fb] flex items-center justify-center text-sm text-gray-400">
          Cargando…
        </div>
      )}

      {/* Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-[#f7f8fb] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-[#121e6c] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#121e6c]">Procesando seriales…</p>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-green-500 text-white text-sm font-medium rounded-xl p-3 flex items-center gap-2 shadow-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {toastMsg}
        </div>
      )}

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#f7f8fb] py-4 px-3 flex items-center">
        <button
          onClick={handleFinish}
          className="w-[102px] flex items-center"
          aria-label="Volver"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="#121e6c"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="flex-1 text-base font-bold text-[#121e6c] text-center leading-5">
          Confirmación seriales
        </h1>
        <div className="w-[102px]" />
      </div>

      {/* Pills */}
      <div className="px-4 pb-6 flex gap-2">
        <ScannerPill value={sinConfirmar} label="Sin confirmar" color="text-[#0a53a5]" />
        <ScannerPill value={scannedQueue.length} label="Confirmados" color="text-green-700" />
        <ScannerPill value={errorCount} label="Error" color="text-[#ff2947]" />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-40 flex flex-col gap-6">
        {/* Camera viewfinder */}
        <div className={`relative w-full aspect-square bg-black rounded-2xl overflow-hidden transition-opacity ${sinConfirmar === 0 ? 'opacity-50' : ''}`}>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
          />
          {/* Semi-opaque mask with rectangular cutout + corner guides */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 300 300"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M0 0h300v300H0z M80 80h140v140H80z"
              fill="rgba(0,0,0,0.55)"
            />
            <path d="M80 100V80h20" stroke="#ff2947" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M220 80h-20M220 80v20" stroke="#ff2947" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M80 200v20h20" stroke="#ff2947" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M220 200v20h-20" stroke="#ff2947" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {sinConfirmar === 0 ? (
          <div className="flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-green-500 shrink-0">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm font-medium text-green-700">Todos los seriales han sido confirmados.</p>
          </div>
        ) : (
          <p className="text-sm text-[#1e1e1e] text-center leading-5">
            Escanea los seriales que necesites para confirmarlos.
          </p>
        )}

        {import.meta.env.DEV && (
          <button
            onClick={() => {
              const remaining = allPendingSerials.filter((s) => !scannedQueue.includes(s))
              handleScan(remaining.length > 0 ? remaining[Math.floor(Math.random() * remaining.length)] : '__invalid__')
            }}
            className="self-center px-4 py-2 rounded-xl border border-dashed border-gray-400 text-[12px] text-gray-500"
          >
            Simular escaneo
          </button>
        )}
      </div>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[rgba(247,248,251,0.9)] backdrop-blur-sm flex flex-col gap-2 px-[72px] py-5">
        <button
          onClick={handleFinish}
          disabled={confirmSerials.isPending}
          className="h-10 bg-[#ff2947] rounded-[32px] flex items-center justify-center text-sm font-medium text-white disabled:opacity-50"
        >
          Terminar escaneo
        </button>
      </div>
    </div>
  )
}
