import { Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="min-h-full bg-[#f7f8fb]">
      <Outlet />
    </div>
  )
}
