import { NavLink, useLocation } from 'react-router-dom'

const TABS = [
  {
    to: '/inventario',
    label: 'General',
    imgSelected: '/assets/tabs/general-selected.png',
    imgUnselected: '/assets/tabs/general-unselected.png',
    end: true,
  },
  {
    to: '/inventario/ordenes',
    label: 'Ordenes',
    imgSelected: '/assets/tabs/ordenes.png',
    imgUnselected: '/assets/tabs/ordenes.png',
    end: false,
  },
  {
    to: '/inventario/asignaciones',
    label: 'Asignaciones',
    imgSelected: '/assets/tabs/asignaciones.png',
    imgUnselected: '/assets/tabs/asignaciones.png',
    end: false,
  },
  {
    to: '/inventario/historial',
    label: 'Historial',
    imgSelected: '/assets/tabs/general-unselected.png',
    imgUnselected: '/assets/tabs/general-unselected.png',
    end: false,
  },
]

export function NavTabs() {
  const { pathname } = useLocation()

  return (
    <div className="flex gap-2 overflow-x-auto overflow-y-hidden no-scrollbar pr-4">
      {TABS.map((tab) => {
        const isActive = tab.end
          ? pathname === tab.to
          : pathname.startsWith(tab.to)

        return (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className="shrink-0">
            <div
              className="relative flex flex-col items-center justify-center gap-0.5 min-w-[86px] p-2 rounded-xl transition-all"
              style={{
                background: isActive ? '#eef0fc' : 'white',
                boxShadow: isActive ? 'inset 0 0 0 1.5px #121e6c33' : 'none',
              }}
            >
              {/* Glow effect — only on the active tab */}
              {isActive && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: -109,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 180,
                    height: 180,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      maskImage: "url('/assets/tabs/efecto-mask.png')",
                      maskSize: '86px 90px',
                      maskPosition: '48px 109px',
                      maskRepeat: 'no-repeat',
                    }}
                  >
                    <img
                      src="/assets/tabs/efecto-glow.png"
                      alt=""
                      style={{
                        position: 'absolute',
                        top: '-92.83%',
                        left: '-92.83%',
                        width: '285.66%',
                        height: '285.66%',
                      }}
                    />
                  </div>
                </div>
              )}

              <img
                src={isActive ? tab.imgSelected : tab.imgUnselected}
                alt={tab.label}
                className="relative z-10 w-14 h-14 object-contain"
              />
              <span
                className={`relative z-10 text-[12px] leading-4 whitespace-nowrap ${
                  isActive ? 'font-bold text-[#121e6c]' : 'font-normal text-[#121e6c]'
                }`}
              >
                {tab.label}
              </span>
            </div>
          </NavLink>
        )
      })}
    </div>
  )
}
