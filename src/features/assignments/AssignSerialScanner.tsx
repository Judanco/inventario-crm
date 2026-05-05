import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { useQuery } from '@tanstack/react-query'
import { fetchSerializedItems } from '../../data/api'
import { useAssignmentDraft } from '../../store/assignmentDraft'

function ScannerPill({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex-1 bg-white rounded-2xl flex flex-col gap-0.5 items-center justify-center p-3">
      <span className={`text-2xl font-semibold leading-7 ${color}`}>{value}</span>
      <span className="text-[12px] text-black leading-4 text-center">{label}</span>
    </div>
  )
}

export function AssignSerialScanner() {
  const navigate = useNavigate()
  const { addSerial, serialLines } = useAssignmentDraft()

  const { data: allItems = [] } = useQuery({
    queryKey: ['serializedItems'],
    queryFn: () => fetchSerializedItems(),
  })

  const serialToCategoryId = useMemo(
    () =>
      Object.fromEntries(
        allItems.filter((i) => i.status === 'disponible').map((i) => [i.serial, i.categoryId]),
      ),
    [allItems],
  )

  const availableSerials = useMemo(() => Object.keys(serialToCategoryId), [serialToCategoryId])

  // Serials already persisted in the store from previous scanner visits
  const savedSerials = useMemo(() => serialLines.flatMap((l) => l.serials), [serialLines])

  const isMounted = useRef(true)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const recentlyScanned = useRef(new Set<string>())

  // Refs kept in sync each render for use inside callbacks/timeouts
  const availableSerialsRef = useRef<string[]>([])
  const pendingSerialsRef = useRef<string[]>([])
  const addedSerialsRef = useRef<string[]>([])
  const savedSerialsRef = useRef<string[]>([])
  const serialToCategoryIdRef = useRef<Record<string, string>>({})

  // Scanned but not yet sent (in the 200 ms window)
  const [pendingSerials, setPendingSerials] = useState<string[]>([])
  // Sent to store after the 200 ms delay
  const [addedSerials, setAddedSerials] = useState<string[]>([])
  const [errorCount, setErrorCount] = useState(0)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  availableSerialsRef.current = availableSerials
  pendingSerialsRef.current = pendingSerials
  addedSerialsRef.current = addedSerials
  savedSerialsRef.current = savedSerials
  serialToCategoryIdRef.current = serialToCategoryId

  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 3000)
    return () => clearTimeout(t)
  }, [toastMsg])

  const handleScan = useCallback((text: string) => {
    if (!isMounted.current) return
    if (recentlyScanned.current.has(text)) return
    recentlyScanned.current.add(text)
    setTimeout(() => recentlyScanned.current.delete(text), 1500)

    const isAvailable = availableSerialsRef.current.includes(text)
    const alreadyPending = pendingSerialsRef.current.includes(text)
    const alreadyAdded = addedSerialsRef.current.includes(text)
    const alreadySaved = savedSerialsRef.current.includes(text)

    if (isAvailable && !alreadyPending && !alreadyAdded && !alreadySaved) {
      setPendingSerials((prev) => [...prev, text])
      setToastMsg('Serial escaneado exitosamente.')

      // Simulate backend queue: after 200 ms move to "Agregados" and persist
      setTimeout(() => {
        if (!isMounted.current) return
        setPendingSerials((prev) => prev.filter((s) => s !== text))
        setAddedSerials((prev) => [...prev, text])
        const categoryId = serialToCategoryIdRef.current[text]
        if (categoryId) addSerial(categoryId, text)
      }, 200)
    } else {
      setErrorCount((n) => n + 1)
    }
  }, [addSerial])

  useEffect(() => {
    isMounted.current = true
    const video = videoRef.current
    if (!video) return

    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    const start = async () => {
      await new Promise((resolve) => setTimeout(resolve, 150))
      if (!isMounted.current) return

      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      } catch {
        return
      }

      if (!isMounted.current) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }

      streamRef.current = stream
      video.srcObject = stream
      await video.play()

      reader.decodeFromVideoElement(video, (result) => {
        if (!isMounted.current) return
        if (result) handleScan(result.getText())
      })
    }

    start()

    return () => {
      isMounted.current = false
      if (readerRef.current && typeof readerRef.current.reset === 'function') {
        readerRef.current.reset()
      }
      readerRef.current = null
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const devRemaining = availableSerials.filter(
    (s) => !pendingSerials.includes(s) && !addedSerials.includes(s) && !savedSerials.includes(s),
  )

  return (
    <div className="min-h-screen bg-[#f7f8fb] flex flex-col">
      {toastMsg && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-green-500 text-white text-sm font-medium rounded-xl p-3 flex items-center gap-2 shadow-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f7f8fb] py-4 px-3 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="w-[102px] flex items-center"
          aria-label="Volver"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#121e6c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="flex-1 text-base font-bold text-[#121e6c] text-center leading-5">
          Agregar serial
        </h1>
        <div className="w-[102px]" />
      </div>

      {/* Pills */}
      <div className="px-4 pb-6 flex gap-2">
        <ScannerPill value={pendingSerials.length} label="Escaneados" color="text-[#1e1e1e]" />
        <ScannerPill value={addedSerials.length}   label="Agregados"  color="text-[#1e1e1e]" />
        <ScannerPill value={errorCount}            label="Errores"    color="text-[#ff2947]" />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-40 flex flex-col gap-6">
        <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
          />
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 300 300"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fillRule="evenodd" d="M0 0h300v300H0z M80 80h140v140H80z" fill="rgba(0,0,0,0.55)" />
            <path d="M80 100V80h20" stroke="#ff2947" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M220 80h-20M220 80v20" stroke="#ff2947" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M80 200v20h20" stroke="#ff2947" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M220 200v20h-20" stroke="#ff2947" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        <p className="text-sm text-[#1e1e1e] text-center leading-5">
          Escanea los seriales que deseas incluir en la asignación.
        </p>

        {import.meta.env.DEV && (
          <button
            onClick={() =>
              handleScan(
                devRemaining.length > 0
                  ? devRemaining[Math.floor(Math.random() * devRemaining.length)]
                  : '__invalid__',
              )
            }
            className="self-center px-4 py-2 rounded-xl border border-dashed border-gray-400 text-[12px] text-gray-500"
          >
            Simular escaneo
          </button>
        )}
      </div>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[rgba(247,248,251,0.9)] backdrop-blur-sm flex flex-col gap-2 px-[72px] py-5">
        <button
          onClick={() => navigate('/inventario/asignaciones/nueva')}
          className="h-10 bg-[#ff2947] rounded-[32px] flex items-center justify-center text-sm font-medium text-white"
        >
          Guardar seriales
        </button>
      </div>
    </div>
  )
}
