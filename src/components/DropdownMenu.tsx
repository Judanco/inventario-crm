import { useEffect, useRef } from 'react'

export interface DropdownItem {
  label: string
  onClick: () => void
}

interface DropdownMenuProps {
  items: DropdownItem[]
  onClose: () => void
  className?: string
}

export function DropdownMenu({ items, onClose, className = '' }: DropdownMenuProps) {
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  // Close on any outside click
  useEffect(() => {
    const handler = () => onCloseRef.current()
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  return (
    <div
      className={`bg-white rounded-[12px] shadow-[0px_8px_20px_rgba(18,30,108,0.08)] flex flex-col gap-2.5 p-3 min-w-[200px] ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => { onCloseRef.current(); item.onClick() }}
          className="w-full h-10 px-3 py-2 rounded-[8px] text-right text-sm text-[#121e6c] hover:bg-[#f7f8fb]"
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
