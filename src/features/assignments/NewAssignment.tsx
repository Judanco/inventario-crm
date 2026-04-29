import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAssignmentDraft } from '../../store/assignmentDraft'

export function NewAssignment() {
  const navigate = useNavigate()
  const { destinationEmail, toast, clearToast } = useAssignmentDraft()
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (toast) {
      setShowToast(true)
      const t = setTimeout(() => { setShowToast(false); clearToast() }, 3000)
      return () => clearTimeout(t)
    }
  }, [toast, clearToast])

  return (
    <div className="min-h-screen bg-[#f7f8fb] flex flex-col">
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
          Asignación de inventario
        </h1>
        <div className="w-[102px]" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 px-4 pt-10 pb-32 flex flex-col gap-10">

        {/* Destino */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[#121e6c] leading-5">Destino</h2>
          <div className="bg-white rounded-2xl p-3 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <p className="flex-1 text-[12px] text-[#969696] leading-4">Ejecutivo</p>
              {destinationEmail ? (
                <span className="bg-[#e8f5e9] rounded-full px-2 py-1 text-[12px] text-[#2e7d32] leading-4 max-w-[160px] truncate">
                  {destinationEmail}
                </span>
              ) : (
                <span className="bg-[#f3f3f3] rounded-full px-2 py-1 text-[12px] text-[#1e1e1e] leading-4">
                  Pendiente
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/inventario/asignaciones/nueva/destino')}
              className="w-full h-10 bg-[#f1f2f6] rounded-xl flex items-center justify-center text-sm font-bold text-[#121e6c]"
            >
              {destinationEmail ? 'Editar datos' : 'Agregar datos'}
            </button>
          </div>
        </div>

        {/* Artículos PoP */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[#121e6c] leading-5">Artículos PoP</h2>
          <div className="bg-white rounded-2xl p-3 flex items-center gap-3">
            <p className="flex-1 text-[12px] text-[#6c759f] leading-4">Agregar productos PoP</p>
            <button
              onClick={() => {}}
              className="w-10 h-10 bg-[#ff2947] rounded-[32px] flex items-center justify-center shrink-0"
              aria-label="Agregar PoP"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Artículos con serial */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-[#121e6c] leading-5">Artículos con serial</h2>
          <div className="bg-white rounded-2xl p-3 flex items-center gap-3">
            <p className="flex-1 text-[12px] text-[#6c759f] leading-4">Agregar productos con serial</p>
            <button
              onClick={() => {}}
              className="w-10 h-10 bg-[#ff2947] rounded-[32px] flex items-center justify-center shrink-0"
              aria-label="Agregar serial"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-[88px] left-4 right-4 bg-[#3f3f3f] rounded-2xl px-4 py-3 flex items-center gap-2 text-white text-sm z-20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
            <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {toast}
        </div>
      )}

      {/* Bottom actions — fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-[rgba(247,248,251,0.9)] backdrop-blur-sm px-[72px] py-5">
        <button
          onClick={() => navigate(-1)}
          className="w-full h-10 bg-white rounded-[32px] border border-[#f1f2f6] flex items-center justify-center text-sm font-medium text-[#ff2947]"
        >
          Volver
        </button>
      </div>
    </div>
  )
}
